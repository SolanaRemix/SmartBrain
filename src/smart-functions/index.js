'use strict';

/**
 * @fileoverview Smart Functions - Main Entry Point
 *
 * Exports all smart function modules for the SmartBrain platform.
 *
 * @module smart-functions
 */

const AutoAnalyzer = require('./auto-analyze');
const AutoFixer = require('./auto-fix');
const AutoTestGenerator = require('./auto-test');
const AutoSync = require('./auto-sync');
const SmartSuggest = require('./smart-suggest');

module.exports = {
  AutoAnalyzer,
  AutoFixer,
  AutoTestGenerator,
  AutoSync,
  SmartSuggest
};
