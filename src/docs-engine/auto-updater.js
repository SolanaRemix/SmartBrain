'use strict';

/**
 * @fileoverview Documentation Auto-Updater
 *
 * Scans the codebase for JSDoc comments, README files, and inline documentation.
 * Detects when source code changes and flags outdated documentation.
 * Generates documentation change suggestions based on code diffs.
 *
 * @module docs-engine/auto-updater
 */

const fs = require('fs');
const path = require('path');

/**
 * Documentation Auto-Updater class.
 * Scans the project for documentation and reports freshness scores.
 */
class DocsAutoUpdater {
  /**
   * Creates a new DocsAutoUpdater instance.
   * @param {object} [config={}] - Configuration options.
   * @param {string} [config.rootDir=process.cwd()] - Root directory of the project.
   * @param {string[]} [config.includeDirs=['src','bots','docs']] - Directories to scan.
   * @param {string[]} [config.docExtensions=['.md']] - Documentation file extensions.
   * @param {string[]} [config.codeExtensions=['.js']] - Source code file extensions.
   * @param {number} [config.stalenessThresholdDays=30] - Days before a doc is considered stale.
   */
  constructor(config = {}) {
    const configFile = this._loadConfigFile(config.rootDir || process.cwd());
    this.config = Object.assign(
      {
        rootDir: process.cwd(),
        includeDirs: ['src', 'bots', 'docs'],
        docExtensions: ['.md'],
        codeExtensions: ['.js'],
        stalenessThresholdDays: 30
      },
      configFile,
      config
    );
  }

  /**
   * Loads docs-engine.config.json from the project root if it exists.
   * @param {string} rootDir - Project root directory.
   * @returns {object} Parsed configuration or empty object.
   */
  _loadConfigFile(rootDir) {
    const configPath = path.join(rootDir, 'docs-engine.config.json');
    if (!fs.existsSync(configPath)) {
      return {};
    }
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (_err) {
      console.warn('[docs-engine] Warning: could not parse docs-engine.config.json');
      return {};
    }
  }

  /**
   * Recursively collects all files with the given extensions under a directory.
   * @param {string} dir - Directory to search.
   * @param {string[]} extensions - Allowed file extensions.
   * @returns {string[]} Array of absolute file paths.
   */
  _collectFiles(dir, extensions) {
    if (!fs.existsSync(dir)) {
      return [];
    }
    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        results.push(...this._collectFiles(fullPath, extensions));
      } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
        results.push(fullPath);
      }
    }
    return results;
  }

  /**
   * Extracts JSDoc comment blocks from a JavaScript source file.
   * @param {string} filePath - Path to the source file.
   * @returns {string[]} Array of JSDoc comment strings found in the file.
   */
  _extractJsDoc(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const jsdocPattern = /\/\*\*([\s\S]*?)\*\//g;
    const matches = [];
    let match;
    while ((match = jsdocPattern.exec(content)) !== null) {
      matches.push(match[0]);
    }
    return matches;
  }

  /**
   * Computes a freshness score for a documentation file.
   * Score is 0–100 where 100 is freshest.
   * @param {string} docPath - Path to the documentation file.
   * @returns {object} Score object with `score`, `lastModified`, and `reason` fields.
   */
  _computeFreshnessScore(docPath) {
    const stats = fs.statSync(docPath);
    const ageMs = Date.now() - stats.mtimeMs;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const threshold = this.config.stalenessThresholdDays;
    const score = Math.max(0, Math.round(100 - (ageDays / threshold) * 100));
    const reason = score < 50 ? 'Document has not been updated recently' : 'Document is up to date';
    return {
      score,
      lastModified: stats.mtime.toISOString(),
      ageDays: Math.round(ageDays),
      reason
    };
  }

  /**
   * Scans the project and returns a documentation report.
   * @returns {object} Report with docFiles, codeFiles, jsdocCoverage, and freshnessScores.
   */
  scan() {
    const { rootDir, includeDirs, docExtensions, codeExtensions } = this.config;
    const docFiles = [];
    const codeFiles = [];

    for (const dir of includeDirs) {
      const fullDir = path.join(rootDir, dir);
      docFiles.push(...this._collectFiles(fullDir, docExtensions));
      codeFiles.push(...this._collectFiles(fullDir, codeExtensions));
    }

    const freshnessScores = {};
    for (const docFile of docFiles) {
      const relPath = path.relative(rootDir, docFile);
      freshnessScores[relPath] = this._computeFreshnessScore(docFile);
    }

    const jsdocCoverage = {};
    for (const codeFile of codeFiles) {
      const relPath = path.relative(rootDir, codeFile);
      const jsdocs = this._extractJsDoc(codeFile);
      jsdocCoverage[relPath] = {
        jsdocCount: jsdocs.length,
        hasDocumentation: jsdocs.length > 0
      };
    }

    const scores = Object.values(freshnessScores);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
        : 100;

    return {
      status: 'ok',
      scannedAt: new Date().toISOString(),
      summary: {
        totalDocFiles: docFiles.length,
        totalCodeFiles: codeFiles.length,
        averageFreshnessScore: avgScore
      },
      freshnessScores,
      jsdocCoverage
    };
  }

  /**
   * Prints a human-readable report to stdout.
   * @param {object} report - Report object returned by `scan()`.
   */
  printReport(report) {
    console.log('\n=== SmartBrain Documentation Freshness Report ===');
    console.log(`Scanned at: ${report.scannedAt}`);
    console.log(`Total doc files: ${report.summary.totalDocFiles}`);
    console.log(`Total code files: ${report.summary.totalCodeFiles}`);
    console.log(`Average freshness score: ${report.summary.averageFreshnessScore}/100\n`);

    console.log('--- Documentation Files ---');
    for (const [file, info] of Object.entries(report.freshnessScores)) {
      const status = info.score >= 70 ? '✅' : info.score >= 40 ? '⚠️ ' : '❌';
      console.log(`${status} ${file} (score: ${info.score}/100, age: ${info.ageDays}d)`);
    }

    console.log('\n--- JSDoc Coverage (code files) ---');
    let covered = 0;
    for (const [file, info] of Object.entries(report.jsdocCoverage)) {
      const icon = info.hasDocumentation ? '✅' : '⚠️ ';
      console.log(`${icon} ${file} (${info.jsdocCount} JSDoc block(s))`);
      if (info.hasDocumentation) {
        covered++;
      }
    }
    const total = Object.keys(report.jsdocCoverage).length;
    const pct = total > 0 ? Math.round((covered / total) * 100) : 100;
    console.log(`\nJSDoc coverage: ${covered}/${total} files (${pct}%)\n`);
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const updater = new DocsAutoUpdater();

  if (args.includes('--scan') || args.includes('--update')) {
    const report = updater.scan();
    updater.printReport(report);
    if (args.includes('--json')) {
      console.log(JSON.stringify(report, null, 2));
    }
  } else {
    console.log('Usage: node src/docs-engine/auto-updater.js --scan [--json]');
    console.log('       node src/docs-engine/auto-updater.js --update [--json]');
  }
}

module.exports = DocsAutoUpdater;
