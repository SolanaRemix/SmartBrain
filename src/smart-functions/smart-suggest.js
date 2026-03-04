'use strict';

/**
 * @fileoverview Smart Functions - Smart Suggest
 *
 * AI-powered code suggestion engine that provides contextual recommendations
 * for smart contract development.
 *
 * @module smart-functions/smart-suggest
 */

/**
 * SmartSuggest class.
 * Provides contextual code recommendations based on input source code patterns.
 */
class SmartSuggest {
  /**
   * Creates a new SmartSuggest instance.
   * @param {object} [options={}] - Configuration options.
   * @param {number} [options.maxSuggestions=5] - Maximum number of suggestions to return.
   * @param {string} [options.language='solidity'] - Target language ('solidity', 'rust', 'vyper').
   */
  constructor(options = {}) {
    this.options = Object.assign(
      {
        maxSuggestions: 5,
        language: 'solidity'
      },
      options
    );

    this._rules = this._buildRules();
  }

  /**
   * Builds the rule database for suggestions.
   * @returns {object[]} Array of rule objects.
   */
  _buildRules() {
    return [
      {
        id: 'use-safemath',
        trigger: /\+\+|--|\+=|-=/,
        suggestion:
          'Consider using SafeMath or Solidity 0.8+ checked arithmetic to prevent overflow',
        category: 'security',
        confidence: 0.8
      },
      {
        id: 'emit-events',
        trigger: /function\s+\w+\s*\([^)]*\)\s*(public|external)/,
        suggestion: 'Emit events for state-changing functions to improve observability',
        category: 'best-practice',
        confidence: 0.7
      },
      {
        id: 'checks-effects-interactions',
        trigger: /\.call\s*\(/,
        suggestion: 'Follow the Checks-Effects-Interactions pattern to prevent reentrancy',
        category: 'security',
        confidence: 0.9
      },
      {
        id: 'use-custom-errors',
        trigger: /require\s*\(/,
        suggestion: 'Replace require() with custom errors (Solidity 0.8+) to save gas',
        category: 'gas',
        confidence: 0.6
      },
      {
        id: 'natspec-comments',
        trigger: /function\s+\w+/,
        suggestion: 'Add NatSpec comments (@notice, @param, @return) to public functions',
        category: 'documentation',
        confidence: 0.5
      },
      {
        id: 'immutable-variables',
        trigger: /\baddress\s+public\b/,
        suggestion: 'Use immutable for variables set only in the constructor to save gas',
        category: 'gas',
        confidence: 0.65
      }
    ];
  }

  /**
   * Validates source input.
   * @param {*} source - Input to validate.
   * @throws {Error} When source is not a non-empty string.
   */
  _validateSource(source) {
    if (typeof source !== 'string' || source.trim().length === 0) {
      throw new Error('source must be a non-empty string');
    }
  }

  /**
   * Returns context-aware suggestions for the given source code.
   * @param {string} source - Smart contract source code.
   * @param {object} [context={}] - Optional context (e.g., { contractName, lineNumber }).
   * @returns {object} Suggestion result with status, data, and metadata.
   */
  suggest(source, context = {}) {
    try {
      this._validateSource(source);

      const matched = this._rules
        .filter(rule => rule.trigger.test(source))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, this.options.maxSuggestions)
        .map(rule => ({
          id: rule.id,
          suggestion: rule.suggestion,
          category: rule.category,
          confidence: rule.confidence
        }));

      return {
        status: 'ok',
        data: {
          suggestionCount: matched.length,
          suggestions: matched,
          context
        },
        metadata: {
          language: this.options.language,
          suggestedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };
    } catch (err) {
      return {
        status: 'error',
        data: null,
        metadata: {
          error: err.message,
          suggestedAt: new Date().toISOString()
        }
      };
    }
  }
}

module.exports = SmartSuggest;
