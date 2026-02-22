'use strict';

/**
 * Tests for Orval DB memory system.
 */

const MemoryStore = require('../src/orval-db/memory-store');
const VirtualBrain = require('../src/orval-db/virtual-brain');
const Persistence = require('../src/orval-db/persistence');
const { createOrvalDb } = require('../src/orval-db/index');
const path = require('path');
const fs = require('fs');
const os = require('os');

// === MemoryStore ===

describe('MemoryStore', () => {
  let store;

  beforeEach(() => {
    store = new MemoryStore();
  });

  it('sets and gets a value', () => {
    store.set('ns1', 'key1', 'value1');
    expect(store.get('ns1', 'key1')).toBe('value1');
  });

  it('returns undefined for missing key', () => {
    expect(store.get('ns1', 'missing')).toBeUndefined();
  });

  it('has() returns true for existing key', () => {
    store.set('ns1', 'k', 'v');
    expect(store.has('ns1', 'k')).toBe(true);
  });

  it('has() returns false for missing key', () => {
    expect(store.has('ns1', 'missing')).toBe(false);
  });

  it('deletes a key', () => {
    store.set('ns1', 'k', 'v');
    expect(store.delete('ns1', 'k')).toBe(true);
    expect(store.get('ns1', 'k')).toBeUndefined();
  });

  it('delete returns false for non-existent key', () => {
    expect(store.delete('ns1', 'none')).toBe(false);
  });

  it('keys() returns all non-expired keys', () => {
    store.set('ns1', 'a', 1);
    store.set('ns1', 'b', 2);
    const keys = store.keys('ns1');
    expect(keys).toContain('a');
    expect(keys).toContain('b');
  });

  it('respects TTL and expires entries', async () => {
    store.set('ns1', 'expiring', 'val', 1);
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(store.get('ns1', 'expiring')).toBeUndefined();
  });

  it('clearNamespace removes all entries in a namespace', () => {
    store.set('ns1', 'x', 1);
    store.set('ns1', 'y', 2);
    store.clearNamespace('ns1');
    expect(store.keys('ns1').length).toBe(0);
  });

  it('stats() returns correct counts', () => {
    store.set('ns1', 'k', 'v');
    store.get('ns1', 'k');
    const stats = store.stats();
    expect(stats.sets).toBeGreaterThanOrEqual(1);
    expect(stats.gets).toBeGreaterThanOrEqual(1);
    expect(stats.hits).toBeGreaterThanOrEqual(1);
  });

  it('snapshot() returns a plain object', () => {
    store.set('ns1', 'k', { a: 1 });
    const snap = store.snapshot();
    expect(typeof snap).toBe('object');
    expect(snap.ns1).toBeDefined();
    expect(snap.ns1.k.value).toEqual({ a: 1 });
  });

  it('restore() correctly restores state', () => {
    store.set('ns1', 'k', 'v1');
    const snap = store.snapshot();
    const store2 = new MemoryStore();
    store2.restore(snap);
    expect(store2.get('ns1', 'k')).toBe('v1');
  });

  it('restore() throws for invalid snapshot', () => {
    expect(() => store.restore(null)).toThrow();
    expect(() => store.restore('bad')).toThrow();
  });

  it('emits set event', () => {
    let emitted = false;
    store.on('set', () => {
      emitted = true;
    });
    store.set('ns1', 'k', 'v');
    expect(emitted).toBe(true);
  });

  it('emits delete event', () => {
    let emitted = false;
    store.set('ns1', 'k', 'v');
    store.on('delete', () => {
      emitted = true;
    });
    store.delete('ns1', 'k');
    expect(emitted).toBe(true);
  });

  it('throws for non-string namespace or key in set()', () => {
    expect(() => store.set(123, 'k', 'v')).toThrow();
    expect(() => store.set('ns', 456, 'v')).toThrow();
  });
});

// === VirtualBrain ===

describe('VirtualBrain', () => {
  let brain;

  beforeEach(() => {
    brain = new VirtualBrain();
  });

  it('learnPattern stores a pattern', () => {
    brain.learnPattern('reentrancy', { type: 'security', severity: 'high' });
    const patterns = brain.getPatterns();
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].id).toBe('reentrancy');
  });

  it('learnPattern increments frequency on repeated calls', () => {
    brain.learnPattern('overflow', { type: 'bug' });
    brain.learnPattern('overflow', { type: 'bug' });
    const patterns = brain.getPatterns();
    const p = patterns.find(x => x.id === 'overflow');
    expect(p.frequency).toBeGreaterThanOrEqual(2);
  });

  it('learnPattern throws for empty patternId', () => {
    expect(() => brain.learnPattern('', {})).toThrow();
  });

  it('learnPattern throws for null patternData', () => {
    expect(() => brain.learnPattern('id', null)).toThrow();
  });

  it('registerContract and getContract round-trip', () => {
    brain.registerContract('0xABC', { name: 'Token', chain: 'ethereum' });
    const c = brain.getContract('0xABC');
    expect(c).toBeDefined();
    expect(c.name).toBe('Token');
  });

  it('registerContract throws for empty address', () => {
    expect(() => brain.registerContract('', {})).toThrow();
  });

  it('recordAudit and getAuditHistory', () => {
    brain.recordAudit('audit-001', { contract: '0xABC', score: 85 });
    const history = brain.getAuditHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].id).toBe('audit-001');
  });

  it('recordAudit throws for empty auditId', () => {
    expect(() => brain.recordAudit('', {})).toThrow();
  });

  it('retrieveRelevant returns matching entries', () => {
    brain.learnPattern('reentrancy', { type: 'security' });
    const results = brain.retrieveRelevant('reentrancy');
    expect(results.length).toBeGreaterThan(0);
  });

  it('retrieveRelevant returns empty array when no match', () => {
    const results = brain.retrieveRelevant('nonexistent-xyz-abc');
    expect(results.length).toBe(0);
  });

  it('retrieveRelevant throws for non-string query', () => {
    expect(() => brain.retrieveRelevant(123)).toThrow();
  });

  it('consolidate merges patterns of same type', () => {
    brain.learnPattern('type-a-v1', { type: 'type-a' });
    brain.learnPattern('type-a-v2', { type: 'type-a' });
    brain.consolidate();
    const patterns = brain.getPatterns();
    const typeA = patterns.filter(p => (p.type || p.id).toLowerCase().includes('type-a'));
    expect(typeA.length).toBeLessThan(3);
  });

  it('status() returns expected fields', () => {
    const status = brain.status();
    expect(typeof status.patterns).toBe('number');
    expect(typeof status.contracts).toBe('number');
    expect(typeof status.audits).toBe('number');
    expect(status.statusAt).toBeDefined();
  });

  it('snapshot and restore round-trip', () => {
    brain.learnPattern('p1', { type: 'bug' });
    const snap = brain.snapshot();
    const brain2 = new VirtualBrain();
    brain2.restore(snap);
    const patterns = brain2.getPatterns();
    expect(patterns.find(p => p.id === 'p1')).toBeDefined();
  });
});

// === Persistence ===

describe('Persistence', () => {
  let tmpDir;
  let persistence;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orval-test-'));
    persistence = new Persistence({
      filePath: path.join(tmpDir, 'db.json'),
      backupPath: path.join(tmpDir, 'db.backup.json')
    });
  });

  afterEach(() => {
    persistence.stopAutoSave();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('saves a snapshot to disk', () => {
    const result = persistence.save({ ns1: { key: { value: 'v', expiresAt: null } } });
    expect(result.status).toBe('ok');
    expect(fs.existsSync(path.join(tmpDir, 'db.json'))).toBe(true);
  });

  it('loads a saved snapshot', () => {
    const snap = { ns1: { key: { value: 'v', expiresAt: null } } };
    persistence.save(snap);
    const result = persistence.load();
    expect(result.status).toBe('ok');
    expect(result.data.ns1.key.value).toBe('v');
  });

  it('returns empty status when no file exists', () => {
    const result = persistence.load();
    expect(result.status).toBe('empty');
  });

  it('saves a backup before overwriting', () => {
    persistence.save({ a: {} });
    persistence.save({ b: {} });
    expect(fs.existsSync(path.join(tmpDir, 'db.backup.json'))).toBe(true);
  });

  it('recovers from corrupted main file using backup', () => {
    const snap = { ns1: { key: { value: 'safe', expiresAt: null } } };
    persistence.save(snap); // first save: writes db.json (no backup yet)
    persistence.save(snap); // second save: backs up db.json, writes new db.json
    fs.writeFileSync(path.join(tmpDir, 'db.json'), 'CORRUPT{{{', 'utf8');
    const result = persistence.load();
    expect(result.status).toBe('ok');
    expect(result.data.ns1.key.value).toBe('safe');
  });

  it('returns error when both files are corrupt', () => {
    persistence.save({ ns: {} });
    fs.writeFileSync(path.join(tmpDir, 'db.json'), 'CORRUPT', 'utf8');
    fs.writeFileSync(path.join(tmpDir, 'db.backup.json'), 'CORRUPT', 'utf8');
    const result = persistence.load();
    expect(result.status).toBe('error');
  });

  it('returns error for invalid snapshot in save()', () => {
    const result = persistence.save(null);
    expect(result.status).toBe('error');
  });

  it('startAutoSave triggers saves', async () => {
    const p = new Persistence({
      filePath: path.join(tmpDir, 'auto.json'),
      backupPath: path.join(tmpDir, 'auto.backup.json'),
      autoSaveIntervalMs: 20
    });
    let callCount = 0;
    p.startAutoSave(() => {
      callCount++;
      return {};
    });
    await new Promise(resolve => setTimeout(resolve, 80));
    p.stopAutoSave();
    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  it('stopAutoSave prevents further saves', async () => {
    const p = new Persistence({
      filePath: path.join(tmpDir, 'stop.json'),
      backupPath: path.join(tmpDir, 'stop.backup.json'),
      autoSaveIntervalMs: 20
    });
    let callCount = 0;
    p.startAutoSave(() => {
      callCount++;
      return {};
    });
    p.stopAutoSave();
    const countAtStop = callCount;
    await new Promise(resolve => setTimeout(resolve, 60));
    expect(callCount).toBe(countAtStop);
  });
});

// === createOrvalDb ===

describe('createOrvalDb', () => {
  it('returns brain, persistence, and store', () => {
    const db = createOrvalDb();
    expect(db.brain).toBeInstanceOf(VirtualBrain);
    expect(db.persistence).toBeInstanceOf(Persistence);
    expect(db.store).toBeInstanceOf(MemoryStore);
  });

  it('brain uses the provided store', () => {
    const db = createOrvalDb();
    db.brain.learnPattern('test', { type: 'info' });
    const pat = db.brain.getPatterns();
    expect(pat.length).toBeGreaterThan(0);
  });
});
