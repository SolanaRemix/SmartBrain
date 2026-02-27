'use strict';

/**
 * @fileoverview Smart Functions - Auto Analyzer
 *
 * Auto-analyzes smart contracts for patterns, complexity metrics,
 * and optimization opportunities.
 *
 * @module smart-functions/auto-analyze
 */

/**
 * Represents the result of a contract analysis.
 * @typedef {object} AnalysisResult
 * @property {string} status - 'ok' or 'error'
 * @property {object} data - Analysis data payload
 * @property {object} metadata - Run metadata
 */

/**
 * AutoAnalyzer class.
 * Analyzes smart contract source code for complexity, patterns, and optimization opportunities.
 */
class AutoAnalyzer {
  /**
   * Creates a new AutoAnalyzer instance.
   * @param {object} [options={}] - Configuration options.
   * @param {string[]} [options.patterns=['reentrancy','overflow','access-control']] - Patterns to check.
   */
  constructor(options = {}) {
    this.options = Object.assign(
      {
        patterns: [
          'reentrancy',
          'overflow',
          'access-control',
          'unchecked-call',
          'timestamp-dependence'
        ]
      },
      options
    );
  }

  /**
   * Validates that the input is a non-empty string.
   * @param {*} source - Input to validate.
   * @throws {Error} When source is not a non-empty string.
   */
  _validateSource(source) {
    if (typeof source !== 'string' || source.trim().length === 0) {
      throw new Error('source must be a non-empty string');
    }
  }

  /**
   * Counts the number of functions in the source code (heuristic).
   * @param {string} source - Smart contract source code.
   * @returns {number} Estimated function count.
   */
  _countFunctions(source) {
    const matches = source.match(/\bfunction\s+\w+/g);
    return matches ? matches.length : 0;
  }

  /**
   * Computes a cyclomatic complexity score (simplified).
   * @param {string} source - Smart contract source code.
   * @returns {number} Complexity score.
   */
  _computeComplexity(source) {
    const decisionPoints = (source.match(/\b(if|else|for|while|require|revert|&&|\|\|)\b/g) || [])
      .length;
    return 1 + decisionPoints;
  }

  /**
   * Checks for known vulnerability patterns.
   * @param {string} source - Smart contract source code.
   * @returns {object[]} Array of detected pattern objects.
   */
  _detectPatterns(source) {
    const detectedPatterns = [];

    const rules = [
      {
        id: 'reentrancy',
        description: 'Potential reentrancy vulnerability',
        regex: /\.call\s*\(/
      },
      {
        id: 'overflow',
        description: 'Unchecked arithmetic (potential overflow)',
        regex: /\+\+|--|\+=|-=/
      },
      {
        id: 'timestamp-dependence',
        description: 'Timestamp dependence detected',
        regex: /block\.timestamp|now\b/
      },
      {
        id: 'unchecked-call',
        description: 'Return value of low-level call not checked',
        regex: /\.call\{[^}]*\}\s*\(/
      },
      {
        id: 'access-control',
        description: 'Missing access control modifier',
        regex: /function\s+\w+\s*\([^)]*\)\s*(public|external)\s*(?!.*onlyOwner)/
      }
    ];

    for (const rule of rules) {
      if (this.options.patterns.includes(rule.id) && rule.regex.test(source)) {
        detectedPatterns.push({
          id: rule.id,
          description: rule.description,
          severity: rule.id === 'reentrancy' ? 'high' : 'medium'
        });
      }
    }

    return detectedPatterns;
  }

  /**
   * Analyzes a smart contract source string.
   * @param {string} source - Smart contract source code.
   * @param {string} [name='unknown'] - Optional contract name for the report.
   * @returns {AnalysisResult} Analysis result object.
   */
  analyze(source, name = 'unknown') {
    try {
      this._validateSource(source);
      const functionCount = this._countFunctions(source);
      const complexity = this._computeComplexity(source);
      const patterns = this._detectPatterns(source);
      const lineCount = source.split('\n').length;
      const optimizationScore = Math.max(
        0,
        100 - patterns.length * 15 - Math.max(0, complexity - 10) * 2
      );

      return {
        status: 'ok',
        data: {
          contract: name,
          lineCount,
          functionCount,
          complexity,
          optimizationScore,
          detectedPatterns: patterns,
          recommendations: patterns.map(p => `Review ${p.id}: ${p.description}`)
        },
        metadata: {
          analyzedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };
    } catch (err) {
      return {
        status: 'error',
        data: null,
        metadata: {
          error: err.message,
          analyzedAt: new Date().toISOString()
        }
      };
    }
  }
}

// CLI entry point
if (require.main === module) {
  const analyzer = new AutoAnalyzer();
  const sample = `
    pragma solidity ^0.8.0;
    contract Sample {
      function withdraw() public {
        payable(msg.sender).call{value: address(this).balance}("");
      }
    }
  `;
  const result = analyzer.analyze(sample, 'Sample');
  console.log(JSON.stringify(result, null, 2));
}

module.exports = AutoAnalyzer;
