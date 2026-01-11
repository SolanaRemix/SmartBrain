# Contributing to SmartBrain

Thank you for your interest in contributing to SmartBrain! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Model Contribution Guidelines](#model-contribution-guidelines)
- [Commit Guidelines](#commit-guidelines)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/SmartBrain.git`
3. Add upstream remote: `git remote add upstream https://github.com/SolanaRemix/SmartBrain.git`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** and rationale
- **Possible implementation** approach
- **Alternative solutions** considered

### Contributing Code

1. Pick an issue or create one
2. Comment on the issue to let others know you're working on it
3. Fork the repository and create a branch
4. Make your changes
5. Write or update tests
6. Update documentation
7. Submit a pull request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/SmartBrain.git
cd SmartBrain

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your configuration

# Run bootstrap script
./scripts/bootstrap.sh

# Run tests
npm test

# Run linter
npm run lint

# Run audit script
./scripts/audit.sh
```

## Code Style

We follow JavaScript Standard Style with some modifications.

### JavaScript/Node.js

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Use `const` for constants, `let` for variables
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Example

```javascript
/**
 * Validates model metadata against schema
 * @param {Object} metadata - The model metadata
 * @param {Object} schema - The validation schema
 * @returns {boolean} True if valid, false otherwise
 */
function validateMetadata(metadata, schema) {
  if (!metadata || !schema) {
    return false;
  }
  
  // Validation logic
  return true;
}
```

### Configuration Files

- ESLint: `.eslintrc.json`
- Prettier: `.prettierrc`
- EditorConfig: `.editorconfig`

Run linting:
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

## Testing

We use a test-driven development approach.

### Writing Tests

- Write unit tests for new functions
- Write integration tests for new features
- Aim for >80% code coverage
- Use descriptive test names

### Test Structure

```javascript
describe('ModelValidator', () => {
  describe('validateMetadata', () => {
    it('should return true for valid metadata', () => {
      const metadata = { name: 'test', version: '1.0.0' };
      const result = validateMetadata(metadata);
      expect(result).toBe(true);
    });

    it('should return false for invalid metadata', () => {
      const metadata = { name: 'test' }; // missing version
      const result = validateMetadata(metadata);
      expect(result).toBe(false);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Pull Request Process

1. **Update documentation** for any changed functionality
2. **Add or update tests** for your changes
3. **Ensure all tests pass** (`npm test`)
4. **Run linting** (`npm run lint`)
5. **Update CHANGELOG.md** with your changes
6. **Follow commit message conventions** (see below)
7. **Request review** from maintainers

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] Dependent changes merged
- [ ] CHANGELOG.md updated

### PR Title Format

Use conventional commits format:

```
type(scope): description

Examples:
feat(inference): add batch prediction support
fix(training): resolve checkpoint loading issue
docs(readme): update installation instructions
```

## Model Contribution Guidelines

### Adding New Models

When contributing ML models:

1. **Create model directory** in `/models/<model-name>`
2. **Add metadata.json** following the schema in `/models/metadata/schema.json`
3. **Include README.md** with:
   - Model description
   - Training details
   - Usage examples
   - Performance metrics
   - License information

### Model Metadata Requirements

```json
{
  "name": "model-name",
  "version": "1.0.0",
  "description": "Model description",
  "framework": "tensorflow",
  "task": "classification",
  "author": "Your Name",
  "created_at": "2025-01-11T00:00:00Z",
  "metrics": {
    "accuracy": 0.95,
    "f1_score": 0.94
  }
}
```

### Model Validation

Before submitting:

```bash
# Validate model
./scripts/validate-model.sh models/your-model

# Ensure validation passes
```

### Model Size Considerations

- Models >100MB should use Git LFS
- Consider model compression techniques
- Provide download links for large models

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements

### Examples

```
feat(inference): add GPU acceleration support

Implements CUDA-based inference for faster predictions.
Includes automatic fallback to CPU when GPU unavailable.

Closes #123
```

```
fix(training): resolve memory leak in data loader

The data loader was not properly releasing memory after
each epoch. This fix ensures proper cleanup.
```

## Documentation

Update documentation when:

- Adding new features
- Changing APIs
- Modifying configurations
- Adding dependencies

Documentation locations:

- `README.md` - Main project documentation
- `docs/` - Detailed documentation
- Code comments - For complex logic
- JSDoc - For public APIs

## Questions?

- Open a discussion on GitHub Discussions
- Ask in issues with the `question` label
- Contact maintainers

## Recognition

Contributors will be recognized in:

- CHANGELOG.md
- GitHub contributors list
- Project documentation

Thank you for contributing to SmartBrain! 🧠
