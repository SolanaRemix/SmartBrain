'use strict';

const {
  buildReport,
  findDeprecated,
  findMissingPeerDeps,
  detectHeavyJobs,
  renderMarkdown
} = require('../src/node-audit/index');

describe('NodeAudit', () => {
  describe('findDeprecated', () => {
    it('returns an array', () => {
      const result = findDeprecated();
      expect(Array.isArray(result)).toBe(true);
    });

    it('each entry has name, version, and message', () => {
      const result = findDeprecated();
      for (const item of result) {
        expect(typeof item.name).toBe('string');
        expect(typeof item.version).toBe('string');
        expect(typeof item.message).toBe('string');
      }
    });
  });

  describe('findMissingPeerDeps', () => {
    it('returns an array', () => {
      const result = findMissingPeerDeps();
      expect(Array.isArray(result)).toBe(true);
    });

    it('each entry is a string package name', () => {
      const result = findMissingPeerDeps();
      for (const item of result) {
        expect(typeof item).toBe('string');
      }
    });
  });

  describe('detectHeavyJobs', () => {
    it('returns an array of suggestion strings', () => {
      const result = detectHeavyJobs();
      expect(Array.isArray(result)).toBe(true);
      for (const s of result) {
        expect(typeof s).toBe('string');
      }
    });
  });

  describe('buildReport', () => {
    let report;

    beforeAll(() => {
      report = buildReport();
    }, 30000);

    it('returns a report object with required keys', () => {
      expect(report).toHaveProperty('generatedAt');
      expect(report).toHaveProperty('project');
      expect(report).toHaveProperty('version');
      expect(report).toHaveProperty('lockSync');
      expect(report).toHaveProperty('deprecated');
      expect(report).toHaveProperty('missingPeers');
      expect(report).toHaveProperty('security');
      expect(report).toHaveProperty('optimisations');
      expect(report).toHaveProperty('summary');
    });

    it('lockSync has inSync boolean', () => {
      expect(typeof report.lockSync.inSync).toBe('boolean');
    });

    it('summary has status string', () => {
      expect(['CLEAN', 'NEEDS_ATTENTION']).toContain(report.summary.status);
    });

    it('summary issues is a non-negative number', () => {
      expect(typeof report.summary.issues).toBe('number');
      expect(report.summary.issues).toBeGreaterThanOrEqual(0);
    });

    it('lock file is in sync after proper npm install', () => {
      expect(report.lockSync.inSync).toBe(true);
    });
  });

  describe('renderMarkdown', () => {
    it('produces a non-empty markdown string', () => {
      const report = buildReport();
      const md = renderMarkdown(report);
      expect(typeof md).toBe('string');
      expect(md.length).toBeGreaterThan(0);
      expect(md).toContain('# 🧠 SmartBrain Knowledge Base');
    });

    it('includes status badge', () => {
      const report = buildReport();
      const md = renderMarkdown(report);
      expect(md).toMatch(/Status: (✅ CLEAN|⚠️ NEEDS ATTENTION)/);
    });

    it('includes the skipped upgrades section', () => {
      const report = buildReport();
      const md = renderMarkdown(report);
      expect(md).toContain('Skipped Upgrades');
    });

    it('includes quick fix commands', () => {
      const report = buildReport();
      const md = renderMarkdown(report);
      expect(md).toContain('npm run audit:node');
    });
  });
});
