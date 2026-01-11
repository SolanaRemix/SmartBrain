# Scripts

This directory contains utility scripts for bootstrapping, auditing, and validating SmartBrain infrastructure.

## Available Scripts

### bootstrap.sh
Bootstraps the SmartBrain infrastructure by:
- Checking dependencies
- Setting up directories
- Installing required packages
- Configuring environment
- Validating setup

Usage:
```bash
./scripts/bootstrap.sh
```

### audit.sh
Audits the SmartBrain setup and configurations:
- Validates directory structure
- Checks file permissions
- Verifies configurations
- Tests integrations
- Generates audit report

Usage:
```bash
./scripts/audit.sh
```

### validate-model.sh
Validates model files and metadata:
- Checks model format
- Validates metadata schema
- Verifies model integrity
- Tests model loading
- Checks dependencies

Usage:
```bash
./scripts/validate-model.sh path/to/model
```

## Usage Guidelines

1. Make scripts executable:
   ```bash
   chmod +x scripts/*.sh
   ```

2. Run bootstrap first on new setups:
   ```bash
   ./scripts/bootstrap.sh
   ```

3. Run audit to verify setup:
   ```bash
   ./scripts/audit.sh
   ```

4. Validate models before deployment:
   ```bash
   ./scripts/validate-model.sh models/my-model
   ```

## Integration

Scripts integrate with:
- GitHub Actions workflows
- CI/CD pipelines
- Local development environment
- Model deployment process

## Best Practices

- Run bootstrap.sh on initial setup
- Run audit.sh regularly to verify integrity
- Validate all models before deployment
- Review audit reports
- Keep scripts updated
