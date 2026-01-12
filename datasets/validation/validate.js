#!/usr/bin/env node

/**
 * Dataset Validation Script
 *
 * Validates datasets against defined schemas and performs quality checks.
 *
 * Usage:
 *   node datasets/validation/validate.js --dataset <path> --schema <path>
 */

const fs = require('fs');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    dataset: null,
    schema: null,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dataset' && i + 1 < args.length) {
      config.dataset = args[i + 1];
      i++;
    } else if (args[i] === '--schema' && i + 1 < args.length) {
      config.schema = args[i + 1];
      i++;
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      config.verbose = true;
    }
  }

  return config;
}

// Load JSON file
function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load ${filePath}: ${error.message}`);
  }
}

// Validate dataset structure
function validateStructure(dataset, schema) {
  const errors = [];

  // Check if dataset is an array or object
  if (!Array.isArray(dataset) && typeof dataset !== 'object') {
    errors.push('Dataset must be an array or object');
    return errors;
  }

  // If schema is provided, validate required fields
  if (schema && schema.required) {
    const items = Array.isArray(dataset) ? dataset : [dataset];

    items.forEach((item, index) => {
      schema.required.forEach(field => {
        if (!(field in item)) {
          errors.push(`Missing required field '${field}' at index ${index}`);
        }
      });
    });
  }

  return errors;
}

// Check for missing values
function checkMissingValues(dataset) {
  const warnings = [];
  const items = Array.isArray(dataset) ? dataset : [dataset];

  items.forEach((item, index) => {
    Object.entries(item).forEach(([key, value]) => {
      // Check for various types of missing/placeholder values
      if (value === null || value === undefined || value === '') {
        warnings.push(`Missing or empty value for '${key}' at index ${index}`);
      } else if (typeof value === 'string') {
        const trimmed = value.trim();
        // Check for common placeholder strings
        if (trimmed === '' || trimmed.toLowerCase() === 'n/a' || 
            trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'none' ||
            trimmed === '-' || trimmed === '--') {
          warnings.push(`Placeholder value for '${key}' at index ${index}: "${value}"`);
        }
      }
    });
  });

  return warnings;
}

// Calculate basic statistics
function calculateStats(dataset) {
  const items = Array.isArray(dataset) ? dataset : [dataset];

  return {
    totalRecords: items.length,
    fields: items.length > 0 ? Object.keys(items[0]).length : 0,
    fieldNames: items.length > 0 ? Object.keys(items[0]) : []
  };
}

// Main validation function
function validate(datasetPath, schemaPath, verbose) {
  console.log('========================================');
  console.log('  Dataset Validation');
  console.log('========================================\n');

  console.log(`Dataset: ${datasetPath}`);
  if (schemaPath) {
    console.log(`Schema:  ${schemaPath}`);
  }
  console.log('');

  // Load dataset
  const dataset = loadJSON(datasetPath);

  // Load schema if provided
  let schema = null;
  if (schemaPath) {
    schema = loadJSON(schemaPath);
  }

  // Calculate statistics
  const stats = calculateStats(dataset);
  console.log('Dataset Statistics:');
  console.log(`  Total records: ${stats.totalRecords}`);
  console.log(`  Number of fields: ${stats.fields}`);
  if (verbose && stats.fieldNames.length > 0) {
    console.log(`  Field names: ${stats.fieldNames.join(', ')}`);
  }
  console.log('');

  // Validate structure
  console.log('Validating structure...');
  const structureErrors = validateStructure(dataset, schema);
  if (structureErrors.length === 0) {
    console.log('  ✓ Structure validation passed');
  } else {
    console.log(`  ✗ Found ${structureErrors.length} error(s):`);
    structureErrors.forEach(err => console.log(`    - ${err}`));
  }
  console.log('');

  // Check for missing values
  console.log('Checking for missing values...');
  const missingWarnings = checkMissingValues(dataset);
  if (missingWarnings.length === 0) {
    console.log('  ✓ No missing values found');
  } else {
    console.log(`  ⚠ Found ${missingWarnings.length} missing value(s):`);
    if (verbose) {
      missingWarnings.forEach(warn => console.log(`    - ${warn}`));
    } else {
      console.log('    (use --verbose to see details)');
    }
  }
  console.log('');

  // Summary
  console.log('========================================');
  console.log('  Validation Summary');
  console.log('========================================');
  console.log(`Errors:   ${structureErrors.length}`);
  console.log(`Warnings: ${missingWarnings.length}`);
  console.log('');

  if (structureErrors.length === 0) {
    console.log('✓ Dataset validation passed!');
    process.exit(0);
  } else {
    console.log('✗ Dataset validation failed');
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const config = parseArgs();

  if (!config.dataset) {
    console.error('Error: --dataset argument is required');
    console.log('\nUsage:');
    console.log('  node datasets/validation/validate.js --dataset <path> [--schema <path>] [--verbose]');
    console.log('\nExample:');
    console.log('  node datasets/validation/validate.js --dataset data.json --schema schema.json');
    process.exit(1);
  }

  validate(config.dataset, config.schema, config.verbose);
}

module.exports = { validate, validateStructure, checkMissingValues, calculateStats };
