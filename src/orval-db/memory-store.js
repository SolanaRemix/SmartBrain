'use strict';

/**
 * @fileoverview Orval DB - In-Memory Key-Value Store
 *
 * Provides a namespace-aware, TTL-capable in-memory key-value store
 * with event emission, snapshot/restore, and memory statistics.
 *
 * @module orval-db/memory-store
 */

const EventEmitter = require('events');

/**
 * MemoryStore class.
 * A namespace-aware in-memory key-value store with TTL and event support.
 *
 * @extends EventEmitter
 */
class MemoryStore extends EventEmitter {
  /**
   * Creates a new MemoryStore instance.
   * @param {object} [options={}] - Configuration options.
   * @param {number} [options.defaultTtlMs=0] - Default TTL in milliseconds (0 = no expiry).
   */
  constructor(options = {}) {
    super();
    this.options = Object.assign({ defaultTtlMs: 0 }, options);
    /** @type {Map<string, Map<string, {value: *, expiresAt: number|null}>>} */
    this._store = new Map();
    this._stats = { sets: 0, gets: 0, deletes: 0, hits: 0, misses: 0 };
  }

  /**
   * Returns the internal Map for a namespace, creating it if needed.
   * @param {string} namespace - Namespace identifier.
   * @returns {Map} Namespace store.
   */
  _ns(namespace) {
    if (!this._store.has(namespace)) {
      this._store.set(namespace, new Map());
    }
    return this._store.get(namespace);
  }

  /**
   * Checks if an entry is expired.
   * @param {{value: *, expiresAt: number|null}} entry - Store entry.
   * @returns {boolean} True if expired.
   */
  _isExpired(entry) {
    return entry.expiresAt !== null && Date.now() > entry.expiresAt;
  }

  /**
   * Sets a value in the store.
   * @param {string} namespace - Namespace for the key.
   * @param {string} key - Key to store.
   * @param {*} value - Value to store.
   * @param {number} [ttlMs] - TTL in milliseconds. Uses default if not provided.
   * @returns {void}
   */
  set(namespace, key, value, ttlMs) {
    if (typeof namespace !== 'string' || typeof key !== 'string') {
      throw new Error('namespace and key must be strings');
    }
    const resolvedTtl = ttlMs !== undefined ? ttlMs : this.options.defaultTtlMs;
    const expiresAt = resolvedTtl > 0 ? Date.now() + resolvedTtl : null;
    const ns = this._ns(namespace);
    const isUpdate = ns.has(key);
    ns.set(key, { value, expiresAt });
    this._stats.sets++;
    this.emit(isUpdate ? 'update' : 'set', { namespace, key, value });
  }

  /**
   * Gets a value from the store.
   * @param {string} namespace - Namespace for the key.
   * @param {string} key - Key to retrieve.
   * @returns {*} The stored value or undefined if not found/expired.
   */
  get(namespace, key) {
    this._stats.gets++;
    const ns = this._ns(namespace);
    const entry = ns.get(key);
    if (!entry || this._isExpired(entry)) {
      if (entry && this._isExpired(entry)) {
        ns.delete(key);
        this.emit('expire', { namespace, key });
      }
      this._stats.misses++;
      return undefined;
    }
    this._stats.hits++;
    return entry.value;
  }

  /**
   * Checks if a key exists (and is not expired).
   * @param {string} namespace - Namespace for the key.
   * @param {string} key - Key to check.
   * @returns {boolean} True if key exists and is not expired.
   */
  has(namespace, key) {
    return this.get(namespace, key) !== undefined;
  }

  /**
   * Deletes a key from a namespace.
   * @param {string} namespace - Namespace for the key.
   * @param {string} key - Key to delete.
   * @returns {boolean} True if the key existed and was deleted.
   */
  delete(namespace, key) {
    const ns = this._ns(namespace);
    const existed = ns.has(key);
    if (existed) {
      ns.delete(key);
      this._stats.deletes++;
      this.emit('delete', { namespace, key });
    }
    return existed;
  }

  /**
   * Returns all non-expired keys in a namespace.
   * @param {string} namespace - Namespace to list keys in.
   * @returns {string[]} Array of key strings.
   */
  keys(namespace) {
    const ns = this._ns(namespace);
    const result = [];
    for (const [key, entry] of ns.entries()) {
      if (!this._isExpired(entry)) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Clears all entries in a namespace.
   * @param {string} namespace - Namespace to clear.
   * @returns {void}
   */
  clearNamespace(namespace) {
    this._store.delete(namespace);
    this.emit('clear', { namespace });
  }

  /**
   * Returns memory usage statistics.
   * @returns {object} Stats object with operation counts and store size.
   */
  stats() {
    let totalEntries = 0;
    for (const ns of this._store.values()) {
      totalEntries += ns.size;
    }
    return Object.assign({}, this._stats, {
      namespaces: this._store.size,
      totalEntries
    });
  }

  /**
   * Takes a snapshot of the current store state as a plain object.
   * @returns {object} Serializable snapshot.
   */
  snapshot() {
    const snap = {};
    for (const [ns, nsMap] of this._store.entries()) {
      snap[ns] = {};
      for (const [key, entry] of nsMap.entries()) {
        if (!this._isExpired(entry)) {
          snap[ns][key] = { value: entry.value, expiresAt: entry.expiresAt };
        }
      }
    }
    return snap;
  }

  /**
   * Restores state from a snapshot object.
   * @param {object} snap - Snapshot object produced by `snapshot()`.
   * @returns {void}
   */
  restore(snap) {
    if (typeof snap !== 'object' || snap === null) {
      throw new Error('snap must be a non-null object');
    }
    this._store.clear();
    for (const [ns, entries] of Object.entries(snap)) {
      const nsMap = new Map();
      for (const [key, entry] of Object.entries(entries)) {
        nsMap.set(key, { value: entry.value, expiresAt: entry.expiresAt });
      }
      this._store.set(ns, nsMap);
    }
    this.emit('restore', { namespaces: Object.keys(snap) });
  }
}

module.exports = MemoryStore;
