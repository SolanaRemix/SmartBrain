'use strict';

/**
 * Tests for the Docs Engine auto-updater module.
 */

const path = require('path');
const DocsAutoUpdater = require('../src/docs-engine/auto-updater');

const ROOT_DIR = path.resolve(__dirname, '..');

describe('DocsAutoUpdater', () => {
  let updater;

  beforeEach(() => {
    updater = new DocsAutoUpdater({ rootDir: ROOT_DIR });
  });

  it('can be instantiated with default options', () => {
    const u = new DocsAutoUpdater();
    expect(u).toBeInstanceOf(DocsAutoUpdater);
  });

  it('uses custom options', () => {
    const u = new DocsAutoUpdater({ rootDir: ROOT_DIR, stalenessThresholdDays: 60 });
    expect(u.config.stalenessThresholdDays).toBe(60);
  });

  it('scan() returns a result with status ok', () => {
    const result = updater.scan();
    expect(result.status).toBe('ok');
  });

  it('scan() returns scannedAt timestamp', () => {
    const result = updater.scan();
    expect(result.scannedAt).toBeDefined();
    expect(typeof result.scannedAt).toBe('string');
  });

  it('scan() returns summary with totalDocFiles', () => {
    const result = updater.scan();
    expect(typeof result.summary.totalDocFiles).toBe('number');
  });

  it('scan() returns summary with totalCodeFiles', () => {
    const result = updater.scan();
    expect(typeof result.summary.totalCodeFiles).toBe('number');
  });

  it('scan() returns averageFreshnessScore between 0 and 100', () => {
    const result = updater.scan();
    expect(result.summary.averageFreshnessScore).toBeGreaterThanOrEqual(0);
    expect(result.summary.averageFreshnessScore).toBeLessThanOrEqual(100);
  });

  it('scan() finds docs/index.md', () => {
    const result = updater.scan();
    const docKeys = Object.keys(result.freshnessScores);
    const found = docKeys.some(k => k.includes('index.md'));
    expect(found).toBe(true);
  });

  it('scan() returns jsdocCoverage for JS files', () => {
    const result = updater.scan();
    expect(typeof result.jsdocCoverage).toBe('object');
  });

  it('scan() jsdocCoverage entries have jsdocCount and hasDocumentation', () => {
    const result = updater.scan();
    const entries = Object.values(result.jsdocCoverage);
    if (entries.length > 0) {
      expect(typeof entries[0].jsdocCount).toBe('number');
      expect(typeof entries[0].hasDocumentation).toBe('boolean');
    }
  });

  it('_computeFreshnessScore returns a score between 0 and 100', () => {
    const docsIndexPath = path.join(ROOT_DIR, 'docs', 'index.md');
    const score = updater._computeFreshnessScore(docsIndexPath);
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });

  it('_extractJsDoc returns an array', () => {
    const indexPath = path.join(ROOT_DIR, 'src', 'docs-engine', 'auto-updater.js');
    const jsdocs = updater._extractJsDoc(indexPath);
    expect(Array.isArray(jsdocs)).toBe(true);
    expect(jsdocs.length).toBeGreaterThan(0);
  });

  it('_collectFiles returns files with matching extension', () => {
    const docsDir = path.join(ROOT_DIR, 'docs');
    const files = updater._collectFiles(docsDir, ['.md']);
    expect(Array.isArray(files)).toBe(true);
    expect(files.every(f => f.endsWith('.md'))).toBe(true);
  });

  it('_collectFiles returns empty array for non-existent directory', () => {
    const files = updater._collectFiles('/nonexistent-xyz-123', ['.md']);
    expect(files).toEqual([]);
  });

  it('loads config from docs-engine.config.json if present', () => {
    const u = new DocsAutoUpdater({ rootDir: ROOT_DIR });
    expect(u.config).toBeDefined();
  });

  it('printReport does not throw', () => {
    const result = updater.scan();
    expect(() => updater.printReport(result)).not.toThrow();
  });
});
