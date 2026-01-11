# Source Code

This directory contains the core logic and utilities for SmartBrain.

## Structure

```
/src
  /core              # Core business logic
  /utils             # Utility functions and helpers
```

## Overview

The src directory provides:
- Core SmartBrain functionality
- Reusable utility functions
- Common helpers
- Shared components

## Core

The core subdirectory contains:
- Main application logic
- Business rules
- Domain models
- Service implementations
- Integration points

## Utils

The utils subdirectory contains:
- File I/O utilities
- Data transformation helpers
- Logging utilities
- Configuration loaders
- Common validators
- String/array helpers
- Date/time utilities

## Design Principles

- **Modularity**: Components should be loosely coupled
- **Reusability**: Write DRY (Don't Repeat Yourself) code
- **Testability**: All code should be unit testable
- **Documentation**: Document public APIs
- **Error Handling**: Graceful error handling throughout

## Usage

Import core functionality:
```javascript
const { ModelManager } = require('./src/core/model-manager');
const { validateInput } = require('./src/utils/validators');
```

## Integration

Source code integrates with:
- Bots (`/bots`)
- Models (`/models`)
- Inference (`/inference`)
- Training (`/training`)
- All other components

## Best Practices

- Keep functions small and focused
- Write comprehensive tests
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Handle errors appropriately
- Follow project coding standards
