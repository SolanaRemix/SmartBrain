'use strict';

/**
 * @fileoverview Orval DB - Main Entry Point
 *
 * Provides the Orval DB virtual memory system for SmartBrain's AI brain.
 * Exports MemoryStore, VirtualBrain, and Persistence classes.
 *
 * @module orval-db
 */

const MemoryStore = require('./memory-store');
const VirtualBrain = require('./virtual-brain');
const Persistence = require('./persistence');

/**
 * Creates and returns a fully configured Orval DB instance.
 * @param {object} [options={}] - Configuration for MemoryStore, VirtualBrain, and Persistence.
 * @param {object} [options.store] - Options passed to MemoryStore.
 * @param {object} [options.brain] - Options passed to VirtualBrain.
 * @param {object} [options.persistence] - Options passed to Persistence.
 * @returns {{ brain: VirtualBrain, persistence: Persistence }} Configured DB instance.
 */
function createOrvalDb(options = {}) {
  const store = new MemoryStore(options.store || {});
  const brain = new VirtualBrain(Object.assign({}, options.brain || {}, { store }));
  const persistence = new Persistence(options.persistence || {});
  return { brain, persistence, store };
}

// CLI --status entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--status')) {
    const { brain } = createOrvalDb();
    const status = brain.status();
    console.log('\n=== Orval DB Status ===');
    console.log(JSON.stringify(status, null, 2));
  } else {
    console.log('Usage: node src/orval-db/index.js --status');
  }
}

module.exports = {
  MemoryStore,
  VirtualBrain,
  Persistence,
  createOrvalDb
};
