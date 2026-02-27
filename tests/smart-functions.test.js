'use strict';

/**
 * Tests for Smart Functions modules.
 */

const AutoAnalyzer = require('../src/smart-functions/auto-analyze');
const AutoFixer = require('../src/smart-functions/auto-fix');
const AutoTestGenerator = require('../src/smart-functions/auto-test');
const AutoSync = require('../src/smart-functions/auto-sync');
const SmartSuggest = require('../src/smart-functions/smart-suggest');
const smartFunctions = require('../src/smart-functions/index');

const SAMPLE_CONTRACT = `
pragma solidity ^0.8.0;
contract Sample {
  address public owner;
  function withdraw() public {
    payable(msg.sender).call{value: address(this).balance}("");
    for (uint i = 0; i < 10; i++) {}
  }
}
`;

const SAMPLE_ABI = [
  {
    type: 'function',
    name: 'withdraw',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  }
];

// === AutoAnalyzer ===

describe('AutoAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new AutoAnalyzer();
  });

  it('exports the AutoAnalyzer class', () => {
    expect(typeof AutoAnalyzer).toBe('function');
  });

  it('analyzes valid source and returns ok status', () => {
    const result = analyzer.analyze(SAMPLE_CONTRACT, 'Sample');
    expect(result.status).toBe('ok');
    expect(result.data).toBeDefined();
    expect(result.data.contract).toBe('Sample');
  });

  it('returns function count > 0 for contract with functions', () => {
    const result = analyzer.analyze(SAMPLE_CONTRACT);
    expect(result.data.functionCount).toBeGreaterThan(0);
  });

  it('detects patterns in vulnerable contract', () => {
    const result = analyzer.analyze(SAMPLE_CONTRACT);
    expect(Array.isArray(result.data.detectedPatterns)).toBe(true);
  });

  it('returns error status for invalid input', () => {
    const result = analyzer.analyze('');
    expect(result.status).toBe('error');
  });

  it('returns error for non-string input', () => {
    const result = analyzer.analyze(null);
    expect(result.status).toBe('error');
  });

  it('returns complexity >= 1', () => {
    const result = analyzer.analyze(SAMPLE_CONTRACT);
    expect(result.data.complexity).toBeGreaterThanOrEqual(1);
  });

  it('includes metadata with analyzedAt', () => {
    const result = analyzer.analyze(SAMPLE_CONTRACT);
    expect(result.metadata.analyzedAt).toBeDefined();
  });
});

// === AutoFixer ===

describe('AutoFixer', () => {
  let fixer;

  beforeEach(() => {
    fixer = new AutoFixer({ dryRun: true });
  });

  it('exports the AutoFixer class', () => {
    expect(typeof AutoFixer).toBe('function');
  });

  it('returns ok status for valid source', () => {
    const result = fixer.suggestFixes(SAMPLE_CONTRACT, 'Sample');
    expect(result.status).toBe('ok');
  });

  it('returns suggestions array', () => {
    const result = fixer.suggestFixes(SAMPLE_CONTRACT);
    expect(Array.isArray(result.data.suggestions)).toBe(true);
  });

  it('returns error for empty source', () => {
    const result = fixer.suggestFixes('');
    expect(result.status).toBe('error');
  });

  it('applyFixes adds SPDX license header when missing', () => {
    const source = 'pragma solidity ^0.8.0;';
    const result = fixer.applyFixes(source);
    expect(result.status).toBe('ok');
    expect(result.data.patched).toContain('SPDX-License-Identifier');
  });

  it('applyFixes does not duplicate SPDX header if already present', () => {
    const source = '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;';
    const result = fixer.applyFixes(source);
    const count = (result.data.patched.match(/SPDX-License-Identifier/g) || []).length;
    expect(count).toBe(1);
  });

  it('returns error for null source in applyFixes', () => {
    const result = fixer.applyFixes(null);
    expect(result.status).toBe('error');
  });
});

// === AutoTestGenerator ===

describe('AutoTestGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new AutoTestGenerator({ framework: 'jest' });
  });

  it('exports the AutoTestGenerator class', () => {
    expect(typeof AutoTestGenerator).toBe('function');
  });

  it('generates tests for a valid ABI', () => {
    const result = generator.generateTests(SAMPLE_ABI, 'Sample');
    expect(result.status).toBe('ok');
    expect(result.data.testCode).toContain('Sample');
  });

  it('generates one test block per function', () => {
    const result = generator.generateTests(SAMPLE_ABI, 'Sample');
    expect(result.data.functionCount).toBe(2);
  });

  it('returns error for empty ABI', () => {
    const result = generator.generateTests([]);
    expect(result.status).toBe('error');
  });

  it('returns error for non-array ABI', () => {
    const result = generator.generateTests('not-an-array');
    expect(result.status).toBe('error');
  });

  it('test code contains describe block', () => {
    const result = generator.generateTests(SAMPLE_ABI, 'MyContract');
    expect(result.data.testCode).toContain("describe('MyContract'");
  });

  it('includes metadata with generatedAt', () => {
    const result = generator.generateTests(SAMPLE_ABI);
    expect(result.metadata.generatedAt).toBeDefined();
  });
});

// === AutoSync ===

describe('AutoSync', () => {
  let syncer;

  beforeEach(() => {
    syncer = new AutoSync({ rootDir: process.cwd() });
  });

  it('exports the AutoSync class', () => {
    expect(typeof AutoSync).toBe('function');
  });

  it('returns ok status', () => {
    const result = syncer.sync();
    expect(result.status).toBe('ok');
  });

  it('returns summary for each sync target', () => {
    const result = syncer.sync();
    expect(result.data.summary).toBeDefined();
    expect(typeof result.data.summary).toBe('object');
  });

  it('includes syncedAt in metadata', () => {
    const result = syncer.sync();
    expect(result.metadata.syncedAt).toBeDefined();
  });

  it('handles non-existent directories gracefully', () => {
    const s = new AutoSync({ rootDir: process.cwd(), syncTargets: ['nonexistent-dir-xyz'] });
    const result = s.sync();
    expect(result.status).toBe('ok');
    expect(result.data.summary['nonexistent-dir-xyz'].exists).toBe(false);
  });
});

// === SmartSuggest ===

describe('SmartSuggest', () => {
  let suggestor;

  beforeEach(() => {
    suggestor = new SmartSuggest();
  });

  it('exports the SmartSuggest class', () => {
    expect(typeof SmartSuggest).toBe('function');
  });

  it('returns ok status for valid source', () => {
    const result = suggestor.suggest(SAMPLE_CONTRACT);
    expect(result.status).toBe('ok');
  });

  it('returns suggestions array', () => {
    const result = suggestor.suggest(SAMPLE_CONTRACT);
    expect(Array.isArray(result.data.suggestions)).toBe(true);
  });

  it('respects maxSuggestions option', () => {
    const s = new SmartSuggest({ maxSuggestions: 2 });
    const result = s.suggest(SAMPLE_CONTRACT);
    expect(result.data.suggestions.length).toBeLessThanOrEqual(2);
  });

  it('returns error for empty string', () => {
    const result = suggestor.suggest('');
    expect(result.status).toBe('error');
  });

  it('returns error for non-string', () => {
    const result = suggestor.suggest(123);
    expect(result.status).toBe('error');
  });

  it('each suggestion has id, suggestion, category, confidence', () => {
    const result = suggestor.suggest(SAMPLE_CONTRACT);
    for (const s of result.data.suggestions) {
      expect(s.id).toBeDefined();
      expect(s.suggestion).toBeDefined();
      expect(s.category).toBeDefined();
      expect(typeof s.confidence).toBe('number');
    }
  });
});

// === Index exports ===

describe('smart-functions/index', () => {
  it('exports AutoAnalyzer', () => {
    expect(smartFunctions.AutoAnalyzer).toBe(AutoAnalyzer);
  });

  it('exports AutoFixer', () => {
    expect(smartFunctions.AutoFixer).toBe(AutoFixer);
  });

  it('exports AutoTestGenerator', () => {
    expect(smartFunctions.AutoTestGenerator).toBe(AutoTestGenerator);
  });

  it('exports AutoSync', () => {
    expect(smartFunctions.AutoSync).toBe(AutoSync);
  });

  it('exports SmartSuggest', () => {
    expect(smartFunctions.SmartSuggest).toBe(SmartSuggest);
  });
});
