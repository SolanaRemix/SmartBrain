'use strict';

/**
 * @fileoverview Orval DB - Virtual Brain Memory Manager
 *
 * Manages learned patterns from smart contract analysis, maintains a knowledge
 * graph of contract relationships, tracks audit history, and supports
 * context-aware memory retrieval and consolidation.
 *
 * @module orval-db/virtual-brain
 */

const MemoryStore = require('./memory-store');

const NS_PATTERNS = 'patterns';
const NS_CONTRACTS = 'contracts';
const NS_AUDITS = 'audit-results';
const NS_GRAPH = 'knowledge-graph';

/**
 * VirtualBrain class.
 * AI brain memory manager for SmartBrain's analysis and audit system.
 */
class VirtualBrain {
  /**
   * Creates a new VirtualBrain instance.
   * @param {object} [options={}] - Configuration options.
   * @param {number} [options.memoryDecayMs=0] - TTL for memories in ms (0 = no decay).
   * @param {number} [options.maxPatterns=1000] - Max patterns to store.
   * @param {MemoryStore} [options.store] - Custom MemoryStore to use.
   */
  constructor(options = {}) {
    this.options = Object.assign(
      {
        memoryDecayMs: 0,
        maxPatterns: 1000
      },
      options
    );
    this.store = options.store || new MemoryStore({ defaultTtlMs: this.options.memoryDecayMs });
  }

  /**
   * Stores a learned pattern from contract analysis.
   * @param {string} patternId - Unique pattern identifier.
   * @param {object} patternData - Pattern data (type, frequency, severity, etc.).
   * @returns {void}
   */
  learnPattern(patternId, patternData) {
    if (typeof patternId !== 'string' || !patternId) {
      throw new Error('patternId must be a non-empty string');
    }
    if (typeof patternData !== 'object' || patternData === null) {
      throw new Error('patternData must be a non-null object');
    }
    const existing = this.store.get(NS_PATTERNS, patternId);
    const merged = Object.assign({}, existing || {}, patternData, {
      lastSeen: new Date().toISOString(),
      frequency: ((existing && existing.frequency) || 0) + 1
    });
    this.store.set(NS_PATTERNS, patternId, merged, this.options.memoryDecayMs || undefined);
  }

  /**
   * Retrieves all known patterns.
   * @returns {object[]} Array of pattern objects.
   */
  getPatterns() {
    return this.store.keys(NS_PATTERNS).map(id => ({
      id,
      ...this.store.get(NS_PATTERNS, id)
    }));
  }

  /**
   * Records contract metadata in the knowledge graph.
   * @param {string} contractAddress - Contract address or identifier.
   * @param {object} metadata - Contract metadata (name, chain, audited, etc.).
   * @returns {void}
   */
  registerContract(contractAddress, metadata) {
    if (typeof contractAddress !== 'string' || !contractAddress) {
      throw new Error('contractAddress must be a non-empty string');
    }
    this.store.set(
      NS_CONTRACTS,
      contractAddress,
      Object.assign({}, metadata, {
        registeredAt: new Date().toISOString()
      })
    );
    this.store.set(NS_GRAPH, contractAddress, {
      address: contractAddress,
      relationships: metadata.relationships || []
    });
  }

  /**
   * Retrieves metadata for a registered contract.
   * @param {string} contractAddress - Contract address.
   * @returns {object|undefined} Contract metadata or undefined.
   */
  getContract(contractAddress) {
    return this.store.get(NS_CONTRACTS, contractAddress);
  }

  /**
   * Records an audit result.
   * @param {string} auditId - Unique audit identifier.
   * @param {object} auditData - Audit data (contract, findings, score, etc.).
   * @returns {void}
   */
  recordAudit(auditId, auditData) {
    if (typeof auditId !== 'string' || !auditId) {
      throw new Error('auditId must be a non-empty string');
    }
    this.store.set(
      NS_AUDITS,
      auditId,
      Object.assign({}, auditData, {
        auditedAt: new Date().toISOString()
      })
    );
  }

  /**
   * Retrieves audit history.
   * @returns {object[]} Array of audit result objects.
   */
  getAuditHistory() {
    return this.store.keys(NS_AUDITS).map(id => ({
      id,
      ...this.store.get(NS_AUDITS, id)
    }));
  }

  /**
   * Retrieves the most relevant memories for a given query string.
   * Matches patterns and audits whose keys or data contain the query.
   * @param {string} query - Query string to match against.
   * @param {number} [limit=5] - Maximum number of results.
   * @returns {object[]} Array of relevant memory objects.
   */
  retrieveRelevant(query, limit = 5) {
    if (typeof query !== 'string') {
      throw new Error('query must be a string');
    }
    const lq = query.toLowerCase();
    const results = [];

    for (const id of this.store.keys(NS_PATTERNS)) {
      const data = this.store.get(NS_PATTERNS, id);
      if (id.toLowerCase().includes(lq) || JSON.stringify(data).toLowerCase().includes(lq)) {
        results.push({ namespace: NS_PATTERNS, id, data, score: (data && data.frequency) || 1 });
      }
    }

    for (const id of this.store.keys(NS_AUDITS)) {
      const data = this.store.get(NS_AUDITS, id);
      if (id.toLowerCase().includes(lq) || JSON.stringify(data).toLowerCase().includes(lq)) {
        results.push({ namespace: NS_AUDITS, id, data, score: 1 });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Consolidates related patterns by merging entries that share the same type.
   * @returns {number} Number of patterns consolidated.
   */
  consolidate() {
    const patterns = this.getPatterns();
    const byType = {};
    for (const p of patterns) {
      const type = (p.type || p.id).toLowerCase();
      if (!byType[type]) {
        byType[type] = { ...p, frequency: p.frequency || 1 };
      } else {
        byType[type].frequency = (byType[type].frequency || 1) + (p.frequency || 1);
        byType[type].lastSeen = p.lastSeen || byType[type].lastSeen;
      }
    }

    const before = patterns.length;
    this.store.clearNamespace(NS_PATTERNS);
    for (const [type, merged] of Object.entries(byType)) {
      this.store.set(NS_PATTERNS, type, merged);
    }
    return before - Object.keys(byType).length;
  }

  /**
   * Returns a status summary of the brain memory.
   * @returns {object} Status object with counts and stats.
   */
  status() {
    return {
      patterns: this.store.keys(NS_PATTERNS).length,
      contracts: this.store.keys(NS_CONTRACTS).length,
      audits: this.store.keys(NS_AUDITS).length,
      graphNodes: this.store.keys(NS_GRAPH).length,
      storeStats: this.store.stats(),
      statusAt: new Date().toISOString()
    };
  }

  /**
   * Returns a serializable snapshot of the brain memory.
   * @returns {object} Snapshot.
   */
  snapshot() {
    return this.store.snapshot();
  }

  /**
   * Restores the brain memory from a snapshot.
   * @param {object} snap - Snapshot object.
   * @returns {void}
   */
  restore(snap) {
    this.store.restore(snap);
  }
}

module.exports = VirtualBrain;
