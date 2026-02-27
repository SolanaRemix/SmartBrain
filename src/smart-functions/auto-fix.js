'use strict';

/**
 * @fileoverview Smart Functions - Auto Fix
 *
 * Suggests and applies automated fixes for common smart contract issues
 * including gas optimization, security patches, and best practice enforcement.
 *
 * @module smart-functions/auto-fix
 */

/**
 * AutoFixer class.
 * Applies automated fixes and suggestions to smart contract source code.
 */
class AutoFixer {
  /**
   * Creates a new AutoFixer instance.
   * @param {object} [options={}] - Configuration options.
   * @param {boolean} [options.dryRun=true] - If true, only suggest fixes without applying them.
   * @param {string[]} [options.fixTypes=['gas','security','style']] - Types of fixes to apply.
   */
  constructor(options = {}) {
    this.options = Object.assign(
      {
        dryRun: true,
        fixTypes: ['gas', 'security', 'style']
      },
      options
    );
  }

  /**
   * Validates that the source is a non-empty string.
   * @param {*} source - Input to validate.
   * @throws {Error} When source is invalid.
   */
  _validateSource(source) {
    if (typeof source !== 'string' || source.trim().length === 0) {
      throw new Error('source must be a non-empty string');
    }
  }

  /**
   * Generates gas optimization suggestions for the source.
   * @param {string} source - Smart contract source code.
   * @returns {object[]} Array of suggestion objects.
   */
  _gasOptimizations(source) {
    const suggestions = [];

    if (/\bstring\s+public\b/.test(source)) {
      suggestions.push({
        type: 'gas',
        description: 'Consider using bytes32 instead of string for fixed-length values to save gas',
        severity: 'low'
      });
    }

    if (/\bfor\s*\(/.test(source)) {
      suggestions.push({
        type: 'gas',
        description: 'Cache array length outside loop to save SLOAD gas costs',
        severity: 'medium'
      });
    }

    if (/\.length\s+[><=]/.test(source)) {
      suggestions.push({
        type: 'gas',
        description: 'Use ++i instead of i++ in loops for gas savings',
        severity: 'low'
      });
    }

    return suggestions;
  }

  /**
   * Generates security fix suggestions for the source.
   * @param {string} source - Smart contract source code.
   * @returns {object[]} Array of suggestion objects.
   */
  _securityFixes(source) {
    const suggestions = [];

    if (/\.call\s*\(/.test(source) && !/ReentrancyGuard|nonReentrant/.test(source)) {
      suggestions.push({
        type: 'security',
        description: 'Add ReentrancyGuard to functions using low-level .call()',
        severity: 'high',
        fix: 'Import and use OpenZeppelin ReentrancyGuard'
      });
    }

    if (/block\.timestamp/.test(source)) {
      suggestions.push({
        type: 'security',
        description:
          'Avoid relying on block.timestamp for critical logic; miners can manipulate it slightly',
        severity: 'medium'
      });
    }

    if (!/SPDX-License-Identifier/.test(source)) {
      suggestions.push({
        type: 'style',
        description: 'Add SPDX-License-Identifier comment at the top of the file',
        severity: 'low'
      });
    }

    return suggestions;
  }

  /**
   * Analyzes source and returns a list of fix suggestions.
   * @param {string} source - Smart contract source code.
   * @param {string} [name='unknown'] - Optional contract name.
   * @returns {object} Fix result with status, suggestions, and metadata.
   */
  suggestFixes(source, name = 'unknown') {
    try {
      this._validateSource(source);
      const suggestions = [];

      if (this.options.fixTypes.includes('gas')) {
        suggestions.push(...this._gasOptimizations(source));
      }
      if (this.options.fixTypes.includes('security') || this.options.fixTypes.includes('style')) {
        suggestions.push(...this._securityFixes(source));
      }

      return {
        status: 'ok',
        data: {
          contract: name,
          dryRun: this.options.dryRun,
          suggestionCount: suggestions.length,
          suggestions
        },
        metadata: {
          processedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };
    } catch (err) {
      return {
        status: 'error',
        data: null,
        metadata: {
          error: err.message,
          processedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Applies safe, non-destructive text-level fixes to the source.
   * @param {string} source - Smart contract source code.
   * @returns {object} Result with original, patched source, and applied patches.
   */
  applyFixes(source) {
    try {
      this._validateSource(source);
      const patches = [];
      let patched = source;

      if (!/SPDX-License-Identifier/.test(source)) {
        patched = '// SPDX-License-Identifier: MIT\n' + patched;
        patches.push('Added SPDX-License-Identifier');
      }

      return {
        status: 'ok',
        data: {
          original: source,
          patched,
          appliedPatches: patches
        },
        metadata: {
          patchedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };
    } catch (err) {
      return {
        status: 'error',
        data: null,
        metadata: {
          error: err.message,
          patchedAt: new Date().toISOString()
        }
      };
    }
  }
}

module.exports = AutoFixer;
