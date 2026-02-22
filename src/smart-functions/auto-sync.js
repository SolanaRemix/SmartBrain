'use strict';

/**
 * @fileoverview Smart Functions - Auto Sync
 *
 * Synchronizes model states, configuration, and documentation
 * across the SmartBrain ecosystem.
 *
 * @module smart-functions/auto-sync
 */

const fs = require('fs');
const path = require('path');

/**
 * AutoSync class.
 * Synchronizes configurations, model metadata, and documentation artifacts.
 */
class AutoSync {
  /**
   * Creates a new AutoSync instance.
   * @param {object} [options={}] - Configuration options.
   * @param {string} [options.rootDir=process.cwd()] - Project root directory.
   * @param {string[]} [options.syncTargets=['models','docs','src']] - Directories to sync.
   */
  constructor(options = {}) {
    this.options = Object.assign(
      {
        rootDir: process.cwd(),
        syncTargets: ['models', 'docs', 'src']
      },
      options
    );
  }

  /**
   * Validates that a path exists.
   * @param {string} dirPath - Directory path to check.
   * @returns {boolean} True if exists, false otherwise.
   */
  _dirExists(dirPath) {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  }

  /**
   * Collects a manifest (list of files and their mtimes) for a directory.
   * @param {string} dirPath - Directory to collect manifest from.
   * @returns {object} Map of relative path to last-modified ISO string.
   */
  _collectManifest(dirPath) {
    const manifest = {};
    if (!this._dirExists(dirPath)) {
      return manifest;
    }

    const walk = current => {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules') {
          walk(fullPath);
        } else if (entry.isFile()) {
          const relPath = path.relative(dirPath, fullPath);
          const stats = fs.statSync(fullPath);
          manifest[relPath] = stats.mtime.toISOString();
        }
      }
    };
    walk(dirPath);
    return manifest;
  }

  /**
   * Runs a sync scan across all configured targets.
   * @returns {object} Sync result with status, manifests, and metadata.
   */
  sync() {
    try {
      const manifests = {};
      const summary = {};

      for (const target of this.options.syncTargets) {
        const fullPath = path.join(this.options.rootDir, target);
        const manifest = this._collectManifest(fullPath);
        manifests[target] = manifest;
        summary[target] = {
          exists: this._dirExists(fullPath),
          fileCount: Object.keys(manifest).length
        };
      }

      return {
        status: 'ok',
        data: {
          syncTargets: this.options.syncTargets,
          summary,
          manifests
        },
        metadata: {
          syncedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };
    } catch (err) {
      return {
        status: 'error',
        data: null,
        metadata: {
          error: err.message,
          syncedAt: new Date().toISOString()
        }
      };
    }
  }
}

module.exports = AutoSync;
