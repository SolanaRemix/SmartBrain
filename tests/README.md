# Tests

This directory contains unit and integration tests for SmartBrain.

## Structure

```
/tests
  /unit              # Unit tests for individual components
  /integration       # Integration tests for system interactions
```

## Overview

The tests directory provides:
- Comprehensive test coverage
- Unit tests for isolated components
- Integration tests for system flows
- Test utilities and fixtures
- Mock data and helpers

## Unit Tests

The unit subdirectory contains:
- Component-level tests
- Function-level tests
- Isolated logic tests
- Mock-based testing

Example:
```javascript
// tests/unit/model-validator.test.js
describe('ModelValidator', () => {
  it('should validate model metadata', () => {
    // test implementation
  });
});
```

## Integration Tests

The integration subdirectory contains:
- End-to-end workflow tests
- API integration tests
- Database integration tests
- Multi-component tests

Example:
```javascript
// tests/integration/inference-pipeline.test.js
describe('Inference Pipeline', () => {
  it('should load model and make predictions', async () => {
    // test implementation
  });
});
```

## Running Tests

Run all tests:
```bash
npm test
```

Run unit tests only:
```bash
npm run test:unit
```

Run integration tests only:
```bash
npm run test:integration
```

Run with coverage:
```bash
npm run test:coverage
```

## Test Structure

Each test file should:
- Import dependencies
- Set up test fixtures
- Define test cases
- Clean up after tests
- Use descriptive test names

## Best Practices

- Write tests for all new code
- Aim for high code coverage (>80%)
- Use descriptive test names
- Keep tests independent
- Use setup/teardown appropriately
- Mock external dependencies
- Test edge cases and error conditions
- Keep tests fast and reliable

## Integration

Tests integrate with:
- CI/CD workflows
- Code coverage tools
- Linting and formatting
- All application components
