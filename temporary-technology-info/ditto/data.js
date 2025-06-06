// @ts-check
import { LandscapeSchema } from '@localfirstfm/landscape-schema'

export const data = LandscapeSchema.make({
  Version: 1,
  Id: 'ditto',
  Name: 'Ditto',
  Description:
    'Real-time, peer-to-peer data synchronization across devices and platforms without relying on the cloud, even in offline or unreliable network conditions.',
  Website: 'https://ditto.live',
  Deployment: ['Hosted', 'Self-hosted'],
  License: 'Proprietary',
  Logo: {
    Light: 'https://path-to-light-logo.png',
    Dark: 'https://path-to-dark-logo.png',
  },
  AppTarget: {
    Platform: {
      data: ['Browser', 'iOS', 'Android', 'macOS', 'WASM'],
    },
    LanguageSDK: {
      data: ['Swift', 'Kotlin', 'JavaScript', 'C#', 'c++', 'Java'],
    },
    FrameworkIntegrations: {
      data: ['React Native', 'Flutter', 'Jetpack Compose', 'SwiftUI'],
    },
  },
  Networking: {
    Protocol: {
      data: ['WiFi LAN', 'Bluetooth', 'P2P WiFi', 'TCP', 'HTTP', 'WebSockets'],
      comment: `We've developed an intelligent sync system that automatically discovers local devices, establishes a connection, and seamlessly switches between active transports when syncing data (Bluetooth, P2P WiFi, LAN, Websockets) so that if one transport goes down, it automatically switches to the next best one, optimizing for speed. "Resilient Networking" in this context means networking that can network in any environment and dynamically "heal" itself if connections break`,
    },
    Topology: {
      data: 'P2P',
    },
  },
  ServerSideData: {
    PersistenceMechanism: {
      data: ['Custom'],
    },
    DataModelParadigm: {
      data: 'Document',
    },
    ExistingDatabaseSupport: {
      data: 'HTTP/Webhooks and real-time via CDC Connectors (Kafka-based)',
    },
    DataSize: {
      data: 'No theoretical limit',
      comment:
        'No theoretical limit, due to cloud scaling, but we offer benchmarking and performance services to validate & scale cloud resources for larger use cases.',
    },
  },
  ClientSideData: {
    QueryAPI: {
      data: ['Async'],
    },
    LocalRefreshLatency: {
      data: '10ms-2s',
      comment:
        'Depends on cardinality, query optimization plan, and local data size.',
    },
    PersistenceMechanism: {
      data: ['SQLite'],
    },
    DataModel: {
      data: 'Document',
      comment: 'Queries are SQL, records are document-oriented.',
    },
    OfflineReads: {
      data: 'Full Support',
    },
    OfflineWrites: {
      data: 'Full local conflict resolution',
    },
    DataSize: {
      data: 'up to the size of the hard drive',
    },
  },
  SynchronizationStrategy: {
    FullOrPartialReplication: {
      data: ['Full Replication', 'Partial Replication'],
    },
    ConflictHandling: {
      data: 'Automatic via CRDT',
    },
    WhereResolutionOccurs: {
      data: 'Client',
    },
    WhatGetsSynced: {
      data: {
        ClientToClient: 'document deltas',
      },
      comment:
        'Ditto has client-to-client deltas, and the server is running the same CRDT as the client, and is not required.',
    },
    Authority: {
      data: 'Decentralized',
      comment: 'Decentralized via authentication servers.',
    },
  },
  AuthIdentity: {
    Encryption: {
      data: 'Built-in e2ee',
    },
    AuthenticationMethod: {
      data: ['JWT Tokens'],
    },
    AuthorizationPermissions: {
      data: 'Custom-mapped ACLs',
    },
  },
  UIRelated: {
    Components: {
      data: ['Presence'],
      comment:
        'SDK provides which peers you are connected to, and over what transports.',
    },
  },
  DevelopmentWorkflowsDX: {
    DebuggingTools: {
      data: ['DevTools', 'Data Inspector', 'Network Inspector'],
      comment: 'Open source debugging and diagnostic tools for developers.',
    },
  },
})
