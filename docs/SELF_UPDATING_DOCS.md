# Self-Updating Documentation System

SmartBrain includes a built-in documentation engine that automatically scans the codebase, reports documentation freshness, and helps keep docs up to date as code evolves.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [CLI Usage](#cli-usage)
5. [Programmatic API](#programmatic-api)
6. [Freshness Scores](#freshness-scores)
7. [JSDoc Coverage](#jsdoc-coverage)
8. [Integration with CI/CD](#integration-with-cicd)

---

## Overview

The docs engine lives in `src/docs-engine/auto-updater.js` and provides:

- **Codebase scanning** — Finds all Markdown documentation and JavaScript source files
- **Freshness scoring** — Reports how recently each doc was updated (0–100 score)
- **JSDoc coverage** — Counts JSDoc comment blocks per source file
- **Configurable** — Driven by `docs-engine.config.json` at the project root
- **CLI and API** — Use from the command line or programmatically

---

## Quick Start

```bash
# Scan documentation freshness
npm run docs:scan

# Run the updater (same as scan, alias for update workflow)
npm run docs:update
```

---

## Configuration

Create a `docs-engine.config.json` file at the project root to customize behavior:

```json
{
  "includeDirs": ["src", "bots", "docs"],
  "docExtensions": [".md"],
  "codeExtensions": [".js"],
  "stalenessThresholdDays": 30
}
```

### Configuration Options

| Option                   | Type       | Default                 | Description                              |
| ------------------------ | ---------- | ----------------------- | ---------------------------------------- |
| `includeDirs`            | `string[]` | `["src","bots","docs"]` | Directories to scan                      |
| `docExtensions`          | `string[]` | `[".md"]`               | File extensions treated as documentation |
| `codeExtensions`         | `string[]` | `[".js"]`               | File extensions treated as source code   |
| `stalenessThresholdDays` | `number`   | `30`                    | Days before a doc is considered stale    |

---

## CLI Usage

```bash
# Scan and print a human-readable report
node src/docs-engine/auto-updater.js --scan

# Output JSON report
node src/docs-engine/auto-updater.js --scan --json

# Run as npm script
npm run docs:scan
npm run docs:update
```

### Sample Output

```
=== SmartBrain Documentation Freshness Report ===
Scanned at: 2025-06-01T12:00:00.000Z
Total doc files: 6
Total code files: 10
Average freshness score: 82/100

--- Documentation Files ---
✅ docs/index.md (score: 95/100, age: 2d)
✅ docs/FAQ.md (score: 90/100, age: 3d)
⚠️  docs/COMPARISON.md (score: 45/100, age: 27d)
✅ docs/TROUBLESHOOTING.md (score: 88/100, age: 4d)

--- JSDoc Coverage (code files) ---
✅ src/docs-engine/auto-updater.js (12 JSDoc block(s))
✅ src/smart-functions/auto-analyze.js (8 JSDoc block(s))
⚠️  src/orval-db/memory-store.js (0 JSDoc block(s))

JSDoc coverage: 2/3 files (67%)
```

---

## Programmatic API

```javascript
const DocsAutoUpdater = require('./src/docs-engine/auto-updater');

// Create with custom options
const updater = new DocsAutoUpdater({
  rootDir: process.cwd(),
  stalenessThresholdDays: 45
});

// Run a scan
const report = updater.scan();

// Print the report
updater.printReport(report);

// Access raw data
console.log(report.summary.averageFreshnessScore);
console.log(report.freshnessScores);
console.log(report.jsdocCoverage);
```

### `scan()` Return Value

```javascript
{
  status: 'ok',
  scannedAt: '2025-06-01T12:00:00.000Z',
  summary: {
    totalDocFiles: 6,
    totalCodeFiles: 10,
    averageFreshnessScore: 82
  },
  freshnessScores: {
    'docs/index.md': {
      score: 95,
      lastModified: '2025-05-30T00:00:00.000Z',
      ageDays: 2,
      reason: 'Document is up to date'
    }
  },
  jsdocCoverage: {
    'src/docs-engine/auto-updater.js': {
      jsdocCount: 12,
      hasDocumentation: true
    }
  }
}
```

---

## Freshness Scores

The freshness score (0–100) is calculated as:

```
score = max(0, 100 - (ageDays / stalenessThresholdDays) * 100)
```

| Score Range | Status               | Icon |
| ----------- | -------------------- | ---- |
| 70–100      | Up to date           | ✅   |
| 40–69       | Getting stale        | ⚠️   |
| 0–39        | Stale — needs update | ❌   |

---

## JSDoc Coverage

The engine scans each JavaScript file for JSDoc comment blocks (`/** ... */`). Files without any JSDoc blocks are flagged as undocumented.

To improve coverage, add JSDoc to your public functions:

```javascript
/**
 * Analyzes a smart contract for vulnerabilities.
 * @param {string} source - Contract source code.
 * @param {string} name - Contract name.
 * @returns {AnalysisResult} Analysis result.
 */
function analyze(source, name) {
  // ...
}
```

---

## Integration with CI/CD

Add a documentation freshness check to your CI workflow:

```yaml
- name: Check documentation freshness
  run: |
    npm run docs:scan
  continue-on-error: true
```

Use `continue-on-error: true` to treat documentation staleness as a warning rather than a blocking failure.

---

_See also: [FAQ](FAQ.md) | [Troubleshooting](TROUBLESHOOTING.md) | [Orval DB](ORVAL_DB.md)_
