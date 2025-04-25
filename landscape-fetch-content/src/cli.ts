import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as Cli from '@effect/cli'
import { FileSystem } from '@effect/platform'
import * as PlatformNode from '@effect/platform-node'
import { Array, Effect, Layer, Logger } from 'effect'
import packageJson from '../package.json' with { type: 'json' }
import { fetchRepo } from './fetch-repo.js'
import { repos } from './repos.js'

const targetDirOption = Cli.Options.directory('target-dir')
const overrideTargetDirOption = Cli.Options.boolean('override-target-dir').pipe(
  Cli.Options.withDefault(false),
)

const showFullErrorsOption = Cli.Options.boolean('show-full-errors').pipe(
  Cli.Options.withDefault(false),
)

export const fetchContentCommand = Cli.Command.make(
  'fetch-content',
  {
    targetDir: targetDirOption,
    overrideTargetDir: overrideTargetDirOption,
    showFullErrors: showFullErrorsOption,
  },
  Effect.fn('fetch-content')(function* ({
    targetDir,
    overrideTargetDir,
    showFullErrors,
  }) {
    const fs = yield* FileSystem.FileSystem

    if (!process.env.GITHUB_TOKEN) {
      yield* Effect.logError(
        'GITHUB_TOKEN is not set. You might run into rate limiting issues.',
      )
    }

    console.log('targetDir', targetDir)

    if (
      (yield* fs.exists(targetDir)) &&
      (yield* fs.readDirectory(targetDir).pipe(Effect.map((_) => _.length > 0)))
    ) {
      const confirmed =
        overrideTargetDir ||
        (yield* Cli.Prompt.confirm({
          message:
            'Target directory is not empty. Please confirm you want to overwrite it.',
        }))

      if (confirmed) {
        // Make the target directory writable before removing it
        yield* fs.chmod(targetDir, 0o755)
        yield* fs.remove(targetDir, { recursive: true })
      } else {
        yield* Effect.log('Aborting')
        return
      }

      yield* fs.makeDirectory(targetDir, { recursive: true })
    }

    const repoResults = yield* Effect.forEach(
      repos,
      (repoInfo) =>
        fetchRepo(repoInfo).pipe(
          Effect.catchAll((cause) =>
            showFullErrors
              ? Effect.logWarning(
                  `Skipping repo ${repoInfo.id} (${repoInfo.owner}/${repoInfo.repo}) due to error`,
                  cause,
                )
              : Effect.logWarning(
                  `Skipping repo ${repoInfo.id} (${repoInfo.owner}/${repoInfo.repo}) due to error: ${cause._tag} (Run with --show-full-errors to see the full error)`,
                ),
          ),
        ),
      {
        concurrency: 10,
      },
    ).pipe(Effect.map(Array.filter((result) => result != null)))

    for (const result of repoResults) {
      const dir = path.join(targetDir, result.repoInfo.id)

      yield* fs.makeDirectory(dir, { recursive: true })
      for (const { name, content, lastUpdated } of Object.values(
        result.files,
      )) {
        const filePath = path.join(dir, name)
        if (typeof content === 'string') {
          yield* fs.writeFileString(filePath, content)
        } else {
          yield* fs.writeFile(filePath, content)
        }
        yield* fs.chmod(filePath, 0o444)
        yield* fs.utimes(filePath, lastUpdated, lastUpdated)
      }
    }

    // console.log('repoResults', repoResults)

    const ambientDtsContent = `\
declare module '*.svg' {
  const content: any
  export default content
}

declare module '*.png' {
  const content: any
  export default content
}
`

    yield* fs.writeFileString(
      path.join(targetDir, 'ambient.d.ts'),
      ambientDtsContent,
    )
    yield* fs.chmod(path.join(targetDir, 'ambient.d.ts'), 0o444)

    // Replace all invalid characters with underscores
    const idToVarName = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '_')

    const modFileContent = `\
import { LandscapeSchema } from '@localfirstfm/landscape-schema'
import { Schema } from 'effect'

${repoResults
  .map(
    (repo) =>
      `import ${idToVarName(repo.repoInfo.id)}Json from './${repo.repoInfo.id}/${repo.files.dataJson.name}' with { type: 'json' }`,
  )
  .join('\n')}

${repoResults
  .map(
    (repo) =>
      `import ${idToVarName(repo.repoInfo.id)}LogoLight from './${repo.repoInfo.id}/${repo.files.logoLight.name}'
import ${idToVarName(repo.repoInfo.id)}LogoDark from './${repo.repoInfo.id}/${repo.files.logoDark.name}'`,
  )
  .join('\n')}

${repoResults
  .map(
    (repo) =>
      `const ${idToVarName(repo.repoInfo.id)} = Schema.decodeUnknownSync(LandscapeSchema)(${idToVarName(repo.repoInfo.id)}Json)`,
  )
  .join('\n')}

export const data = [
  ${repoResults
    .map(
      (repo) =>
        `{ ...${idToVarName(repo.repoInfo.id)}, Logo: { Light: ${idToVarName(
          repo.repoInfo.id,
        )}LogoLight, Dark: ${idToVarName(repo.repoInfo.id)}LogoDark } }`,
    )
    .join(',\n  ')}
]
`

    yield* fs.writeFileString(path.join(targetDir, 'mod.ts'), modFileContent)
    yield* fs.chmod(path.join(targetDir, 'mod.ts'), 0o444)

    yield* Effect.log(`Successfully wrote content to ${targetDir}`)
  }),
)

// Check if the module is the main module executed
const isMain = process.argv[1] === fileURLToPath(import.meta.url)

if (isMain) {
  const cli = Cli.Command.run(fetchContentCommand, {
    name: 'Localfirst.fm Landscape CLI',
    version: packageJson.version,
  })

  const layer = Layer.mergeAll(PlatformNode.NodeContext.layer, Logger.pretty)

  cli(process.argv).pipe(
    Effect.annotateLogs({ thread: 'cli-main' }),
    Effect.provide(layer),
    PlatformNode.NodeRuntime.runMain,
  )
}
