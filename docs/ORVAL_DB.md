# Orval DB — Virtual Memory System

Orval DB is SmartBrain's virtual in-memory database layer, providing AI brain memory for smart contract analysis, pattern learning, audit tracking, and knowledge graph management.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [API Reference](#api-reference)
   - [MemoryStore](#memorystore)
   - [VirtualBrain](#virtualbrain)
   - [Persistence](#persistence)
   - [createOrvalDb](#createorvaldb)
4. [Usage Examples](#usage-examples)
5. [Configuration Options](#configuration-options)
6. [Best Practices](#best-practices)

---

## Architecture Overview

```
┌──────────────────────────────────────┐
│            Orval DB                  │
├──────────────────────────────────────┤
│                                      │
│  ┌─────────────┐  ┌───────────────┐  │
│  │ VirtualBrain│  │  Persistence  │  │
│  │             │  │               │  │
│  │ • Patterns  │  │ • Save/Load   │  │
│  │ • Contracts │  │ • Auto-save   │  │
│  │ • Audits    │  │ • Backup      │  │
│  │ • Graph     │  │ • Recovery    │  │
│  └──────┬──────┘  └───────────────┘  │
│         │                            │
│  ┌──────▼──────────────────────────┐ │
│  │          MemoryStore            │ │
│  │                                 │ │
│  │ • Namespace-aware key-value     │ │
│  │ • TTL / memory decay support    │ │
│  │ • Event emitter                 │ │
│  │ • Snapshot / restore            │ │
│  │ • Usage statistics              │ │
│  └─────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

### Namespaces

Orval DB organizes memory into the following internal namespaces:

| Namespace         | Contents                                |
| ----------------- | --------------------------------------- |
| `patterns`        | Learned vulnerability and code patterns |
| `contracts`       | Registered contract metadata            |
| `audit-results`   | Historical audit results                |
| `knowledge-graph` | Contract relationship graph             |

---

## Quick Start

```javascript
const { createOrvalDb } = require('./src/orval-db');

// Create an Orval DB instance
const { brain, persistence, store } = createOrvalDb();

// Teach the brain a pattern
brain.learnPattern('reentrancy', { type: 'security', severity: 'high' });

// Register a contract
brain.registerContract('0xABC123', { name: 'MyToken', chain: 'ethereum' });

// Record an audit
brain.recordAudit('audit-001', { contract: '0xABC123', score: 78, findings: 3 });

// Query relevant memories
const results = brain.retrieveRelevant('reentrancy', 5);

// Check status
const status = brain.status();
console.log(status);
```

---

## API Reference

### MemoryStore

**Class:** `src/orval-db/memory-store.js`

A namespace-aware, TTL-capable in-memory key-value store that extends `EventEmitter`.

#### Constructor

```javascript
const store = new MemoryStore(options);
```

| Option         | Type     | Default | Description                                 |
| -------------- | -------- | ------- | ------------------------------------------- |
| `defaultTtlMs` | `number` | `0`     | Default TTL in milliseconds (0 = no expiry) |

#### Methods

| Method                                | Description                                       |
| ------------------------------------- | ------------------------------------------------- |
| `set(namespace, key, value, [ttlMs])` | Stores a value. Emits `'set'` or `'update'`.      |
| `get(namespace, key)`                 | Returns value or `undefined` if missing/expired.  |
| `has(namespace, key)`                 | Returns `true` if key exists and is not expired.  |
| `delete(namespace, key)`              | Removes a key. Returns `true` if deleted.         |
| `keys(namespace)`                     | Returns all non-expired keys in a namespace.      |
| `clearNamespace(namespace)`           | Removes all entries in a namespace.               |
| `stats()`                             | Returns operation counts and store size.          |
| `snapshot()`                          | Returns a serializable plain object of the store. |
| `restore(snap)`                       | Restores store state from a snapshot.             |

#### Events

| Event     | Payload                     | Description                      |
| --------- | --------------------------- | -------------------------------- |
| `set`     | `{ namespace, key, value }` | New key was set                  |
| `update`  | `{ namespace, key, value }` | Existing key was updated         |
| `delete`  | `{ namespace, key }`        | Key was deleted                  |
| `expire`  | `{ namespace, key }`        | Key expired on access            |
| `clear`   | `{ namespace }`             | Namespace was cleared            |
| `restore` | `{ namespaces }`            | Store was restored from snapshot |

---

### VirtualBrain

**Class:** `src/orval-db/virtual-brain.js`

The AI brain memory manager. Manages patterns, contracts, audits, and context-aware retrieval.

#### Constructor

```javascript
const brain = new VirtualBrain(options);
```

| Option          | Type          | Default      | Description                           |
| --------------- | ------------- | ------------ | ------------------------------------- |
| `memoryDecayMs` | `number`      | `0`          | TTL for memories in ms (0 = no decay) |
| `maxPatterns`   | `number`      | `1000`       | Maximum number of patterns to store   |
| `store`         | `MemoryStore` | new instance | Custom MemoryStore to use             |

#### Methods

| Method                                 | Description                                          |
| -------------------------------------- | ---------------------------------------------------- |
| `learnPattern(patternId, patternData)` | Stores or merges a learned pattern                   |
| `getPatterns()`                        | Returns all known patterns                           |
| `registerContract(address, metadata)`  | Records contract in the knowledge graph              |
| `getContract(address)`                 | Retrieves contract metadata                          |
| `recordAudit(auditId, auditData)`      | Records an audit result                              |
| `getAuditHistory()`                    | Returns all audit results                            |
| `retrieveRelevant(query, [limit])`     | Returns most relevant memories for a query           |
| `consolidate()`                        | Merges related patterns; returns consolidation count |
| `status()`                             | Returns a status summary object                      |
| `snapshot()`                           | Serializes brain memory                              |
| `restore(snap)`                        | Restores brain memory from snapshot                  |

---

### Persistence

**Class:** `src/orval-db/persistence.js`

File-based persistence layer that saves/loads memory state and provides backup recovery.

#### Constructor

```javascript
const persistence = new Persistence(options);
```

| Option               | Type     | Default                | Description                             |
| -------------------- | -------- | ---------------------- | --------------------------------------- |
| `filePath`           | `string` | `orval-db.json`        | Main persistence file                   |
| `backupPath`         | `string` | `orval-db.backup.json` | Backup file path                        |
| `autoSaveIntervalMs` | `number` | `0`                    | Auto-save interval in ms (0 = disabled) |

#### Methods

| Method                         | Description                                              |
| ------------------------------ | -------------------------------------------------------- |
| `save(snapshot)`               | Saves snapshot to disk. Creates backup of previous file. |
| `load()`                       | Loads snapshot. Falls back to backup on corruption.      |
| `startAutoSave(getSnapshotFn)` | Starts periodic auto-save.                               |
| `stopAutoSave()`               | Stops the auto-save timer.                               |

#### Return Status Values

| Status  | Meaning                                 |
| ------- | --------------------------------------- |
| `ok`    | Operation succeeded                     |
| `empty` | No persistence file found (fresh start) |
| `error` | Operation failed (see `metadata.error`) |

---

### createOrvalDb

**Function:** `src/orval-db/index.js`

Factory function that creates a fully configured Orval DB instance.

```javascript
const { brain, persistence, store } = createOrvalDb(options);
```

| Option key    | Type     | Description              |
| ------------- | -------- | ------------------------ |
| `store`       | `object` | Options for MemoryStore  |
| `brain`       | `object` | Options for VirtualBrain |
| `persistence` | `object` | Options for Persistence  |

---

## Usage Examples

### Store and retrieve learned patterns

```javascript
const { createOrvalDb } = require('./src/orval-db');
const { brain } = createOrvalDb();

brain.learnPattern('integer-overflow', { type: 'security', severity: 'high' });
brain.learnPattern('integer-overflow', { type: 'security', severity: 'high' }); // frequency++

const patterns = brain.getPatterns();
// [{ id: 'integer-overflow', type: 'security', severity: 'high', frequency: 2, lastSeen: '...' }]
```

---

### Persist memory across restarts

```javascript
const { createOrvalDb } = require('./src/orval-db');
const path = require('path');

const { brain, persistence } = createOrvalDb({
  persistence: {
    filePath: path.join(__dirname, 'brain-memory.json'),
    autoSaveIntervalMs: 60000 // auto-save every minute
  }
});

// Load saved state on startup
const loaded = persistence.load();
if (loaded.status === 'ok' && loaded.data) {
  brain.restore(loaded.data);
  console.log('Brain memory loaded.');
}

// Save on shutdown
process.on('SIGTERM', () => {
  const result = persistence.save(brain.snapshot());
  console.log('Brain memory saved:', result.status);
  process.exit(0);
});

// Start auto-save
persistence.startAutoSave(() => brain.snapshot());
```

---

### Query relevant memories

```javascript
brain.learnPattern('reentrancy', { type: 'security', description: 'Cross-function reentrancy' });
brain.recordAudit('audit-2025-001', { contract: '0xFoo', findings: ['reentrancy'] });

const relevant = brain.retrieveRelevant('reentrancy', 3);
// Returns patterns and audits that mention 'reentrancy'
```

---

### Consolidate redundant patterns

```javascript
brain.learnPattern('reentrant-v1', { type: 'reentrancy' });
brain.learnPattern('reentrant-v2', { type: 'reentrancy' });
const reduced = brain.consolidate();
console.log(`Consolidated ${reduced} redundant patterns`);
```

---

## Configuration Options

| Setting              | Where                    | Description                         |
| -------------------- | ------------------------ | ----------------------------------- |
| `memoryDecayMs`      | VirtualBrain constructor | Set TTL for automatic memory expiry |
| `maxPatterns`        | VirtualBrain constructor | Cap the number of stored patterns   |
| `defaultTtlMs`       | MemoryStore constructor  | Default TTL for all entries         |
| `filePath`           | Persistence constructor  | Where to save the memory state      |
| `autoSaveIntervalMs` | Persistence constructor  | How often to auto-save (ms)         |

---

## Best Practices

1. **Load on startup** — Always call `persistence.load()` and `brain.restore()` at application start to preserve learned knowledge.
2. **Save on shutdown** — Register `SIGTERM`/`SIGINT` handlers to save state before the process exits.
3. **Enable auto-save** — Use `autoSaveIntervalMs` to reduce risk of data loss.
4. **Consolidate regularly** — Call `brain.consolidate()` periodically to prevent unbounded growth.
5. **Use memory decay** — Set `memoryDecayMs` for patterns that should expire over time.
6. **Namespace isolation** — Use separate `MemoryStore` instances for unrelated contexts.

---

_See also: [Self-Updating Docs](SELF_UPDATING_DOCS.md) | [FAQ](FAQ.md) | [Troubleshooting](TROUBLESHOOTING.md)_
