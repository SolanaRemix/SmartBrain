'use strict';

/**
 * @fileoverview Orval DB - File-Based Persistence Layer
 *
 * Saves memory state to disk as JSON, loads on startup,
 * supports configurable auto-save intervals, and handles
 * corruption recovery using backup files.
 *
 * @module orval-db/persistence
 */

const fs = require('fs');
const path = require('path');

/**
 * Persistence class.
 * File-based persistence layer for Orval DB memory stores.
 */
class Persistence {
  /**
   * Creates a new Persistence instance.
   * @param {object} [options={}] - Configuration options.
   * @param {string} [options.filePath='orval-db.json'] - Path to the persistence file.
   * @param {string} [options.backupPath='orval-db.backup.json'] - Path for backup file.
   * @param {number} [options.autoSaveIntervalMs=0] - Auto-save interval in ms (0 = disabled).
   */
  constructor(options = {}) {
    this.options = Object.assign(
      {
        filePath: path.join(process.cwd(), 'orval-db.json'),
        backupPath: path.join(process.cwd(), 'orval-db.backup.json'),
        autoSaveIntervalMs: 0
      },
      options
    );
    this._timer = null;
  }

  /**
   * Saves a snapshot to disk.
   * @param {object} snapshot - Serializable snapshot object.
   * @returns {object} Result with status and metadata.
   */
  save(snapshot) {
    try {
      if (typeof snapshot !== 'object' || snapshot === null) {
        throw new Error('snapshot must be a non-null object');
      }
      const json = JSON.stringify(snapshot, null, 2);
      // Write backup first if main file exists
      if (fs.existsSync(this.options.filePath)) {
        fs.copyFileSync(this.options.filePath, this.options.backupPath);
      }
      fs.writeFileSync(this.options.filePath, json, 'utf8');
      return {
        status: 'ok',
        data: { savedTo: this.options.filePath, bytes: json.length },
        metadata: { savedAt: new Date().toISOString() }
      };
    } catch (err) {
      return {
        status: 'error',
        data: null,
        metadata: { error: err.message, savedAt: new Date().toISOString() }
      };
    }
  }

  /**
   * Loads a snapshot from disk.
   * Falls back to backup file if main file is corrupted.
   * @returns {object} Result with status, data (snapshot), and metadata.
   */
  load() {
    const tryRead = filePath => {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    };

    // Try main file
    if (fs.existsSync(this.options.filePath)) {
      try {
        const snapshot = tryRead(this.options.filePath);
        return {
          status: 'ok',
          data: snapshot,
          metadata: { loadedFrom: this.options.filePath, loadedAt: new Date().toISOString() }
        };
      } catch (_err) {
        console.warn('[orval-db] Main file corrupted, trying backup...');
      }
    }

    // Try backup
    if (fs.existsSync(this.options.backupPath)) {
      try {
        const snapshot = tryRead(this.options.backupPath);
        return {
          status: 'ok',
          data: snapshot,
          metadata: {
            loadedFrom: this.options.backupPath,
            loadedAt: new Date().toISOString(),
            recovered: true
          }
        };
      } catch (_err) {
        return {
          status: 'error',
          data: null,
          metadata: {
            error: 'Both main and backup files are corrupted',
            loadedAt: new Date().toISOString()
          }
        };
      }
    }

    return {
      status: 'empty',
      data: {},
      metadata: { loadedAt: new Date().toISOString(), reason: 'No persistence file found' }
    };
  }

  /**
   * Starts auto-saving at the configured interval.
   * @param {Function} getSnapshot - Function that returns the current snapshot.
   * @returns {void}
   */
  startAutoSave(getSnapshot) {
    if (this.options.autoSaveIntervalMs <= 0) {
      return;
    }
    if (this._timer) {
      this.stopAutoSave();
    }
    this._timer = setInterval(() => {
      const snap = getSnapshot();
      this.save(snap);
    }, this.options.autoSaveIntervalMs);
  }

  /**
   * Stops the auto-save interval.
   * @returns {void}
   */
  stopAutoSave() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}

module.exports = Persistence;
