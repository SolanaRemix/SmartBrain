# SmartBrain Documentation

Welcome to the SmartBrain documentation. This comprehensive guide covers all aspects of the SmartBrain AI/ML Engine for the CyberAi Ecosystem.

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Model Lifecycle](#model-lifecycle)
4. [Model Versioning](#model-versioning)
5. [Dataset Requirements](#dataset-requirements)
6. [Inference Usage Guide](#inference-usage-guide)
7. [Training Pipeline Guide](#training-pipeline-guide)
8. [Terminal Command Integration](#terminal-command-integration)
9. [Ecosystem Integration](#ecosystem-integration)
10. [API Reference](#api-reference)
11. [Best Practices](#best-practices)

## Introduction

SmartBrain is an AI/ML engine designed specifically for smart contract automation and blockchain development within the CyberAi ecosystem. It provides:

- Model registry and versioning
- Training pipeline infrastructure
- Inference engine with CLI and API
- Dataset validation and management
- Integration with GitHub Copilot agents

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      SmartBrain Core                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   Models    │  │  Training   │  │    Inference     │   │
│  │             │  │             │  │                  │   │
│  │ • Registry  │  │ • Pipeline  │  │ • Engine         │   │
│  │ • Metadata  │  │ • Configs   │  │ • CLI            │   │
│  │ • Versions  │  │ • Jobs      │  │ • API            │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Datasets   │  │    Tools    │  │     Scripts      │   │
│  │             │  │             │  │                  │   │
│  │ • Validation│  │ • ML Helpers│  │ • Bootstrap      │   │
│  │ • Schemas   │  │ • Utilities │  │ • Audit          │   │
│  │ • Storage   │  │ • Debuggers │  │ • Validation     │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Integration Points

- **GitHub Copilot**: Agent integration via `.github/copilot/agent.yaml`
- **GitHub Actions**: CI/CD workflows for training, validation, and deployment
- **SmartContract Bots**: Integration with deployment and audit bots
- **CyberAi Ecosystem**: Part of the broader CyberAi infrastructure

## Model Lifecycle

### 1. Model Development

```bash
# Generate training configuration
node training/cli/index.js config --output training/configs/my-model.json

# Edit configuration
vim training/configs/my-model.json
```

### 2. Model Training

```bash
# Train model
node training/cli/index.js train \
  --config training/configs/my-model.json \
  --output models/my-model \
  --epochs 10
```

### 3. Model Validation

```bash
# Validate model files and metadata
./scripts/validate-model.sh models/my-model
```

### 4. Model Registration

Place model in `/models` directory with proper metadata:

```json
{
  "name": "smart-contract-classifier",
  "version": "1.0.0",
  "framework": "tensorflow",
  "task": "classification",
  "description": "Classifies smart contract vulnerabilities",
  "author": "SmartBrain Team",
  "created_at": "2025-01-11T00:00:00Z",
  "metrics": {
    "accuracy": 0.95,
    "precision": 0.93,
    "recall": 0.94,
    "f1_score": 0.935
  }
}
```

### 5. Model Deployment

```bash
# Run inference
node inference/cli/index.js predict \
  --model models/my-model \
  --input data/input.json
```

## Model Versioning

SmartBrain uses semantic versioning (SemVer) for models:

- **MAJOR.MINOR.PATCH** (e.g., 2.1.3)
  - **MAJOR**: Incompatible API changes
  - **MINOR**: Backward-compatible functionality additions
  - **PATCH**: Backward-compatible bug fixes

### Version Management

```
/models
  /smart-contract-classifier
    /1.0.0
      model.h5
      metadata.json
      README.md
    /1.1.0
      model.h5
      metadata.json
      README.md
    /2.0.0
      model.pb
      metadata.json
      README.md
```

### Version Selection

```javascript
// Load specific version
const model = loadModel('smart-contract-classifier', '1.1.0');

// Load latest version
const model = loadModel('smart-contract-classifier', 'latest');
```

## Dataset Requirements

### Dataset Structure

Datasets should follow this structure:

```json
{
  "metadata": {
    "name": "smart-contract-vulnerabilities",
    "version": "1.0.0",
    "description": "Dataset of smart contract code samples",
    "size": 10000,
    "split": {
      "train": 0.7,
      "validation": 0.15,
      "test": 0.15
    }
  },
  "data": [
    {
      "id": "sample-001",
      "input": "contract code here",
      "label": "reentrancy",
      "metadata": {
        "source": "etherscan",
        "date": "2024-01-01"
      }
    }
  ]
}
```

### Dataset Validation

```bash
# Validate dataset
node datasets/validation/validate.js \
  --dataset data/my-dataset.json \
  --schema models/metadata/schema.json \
  --verbose
```

### Dataset Best Practices

1. **Quality**: Ensure high-quality, clean data
2. **Balance**: Balance class distributions
3. **Splits**: Maintain consistent train/val/test splits
4. **Documentation**: Document data sources and processing
5. **Versioning**: Version datasets alongside models

## Inference Usage Guide

### Command-Line Inference

```bash
# Single prediction
node inference/cli/index.js predict \
  --model models/vulnerability-detector \
  --input contract.json \
  --output result.json

# Batch inference
node inference/cli/index.js batch \
  --model models/vulnerability-detector \
  --input contracts.json \
  --output results.json \
  --batch-size 32

# Model information
node inference/cli/index.js info \
  --model models/vulnerability-detector
```

### API Inference

```javascript
const express = require('express');
const { InferenceEngine } = require('./inference/engine');

const app = express();
const engine = new InferenceEngine('models/my-model');

app.post('/predict', async (req, res) => {
  const prediction = await engine.predict(req.body);
  res.json(prediction);
});

app.listen(3000);
```

### Batch Processing

```bash
# Process large dataset
node inference/cli/index.js batch \
  --model models/my-model \
  --input large-dataset.json \
  --output predictions.json \
  --batch-size 64
```

## Training Pipeline Guide

### Configuration

Create a training configuration:

```yaml
model:
  name: vulnerability-detector
  architecture: transformer
  parameters:
    layers: 12
    hidden_size: 768
    num_heads: 12
    dropout: 0.1

training:
  batch_size: 32
  learning_rate: 2e-5
  epochs: 10
  optimizer: adamw
  scheduler: linear_warmup

data:
  train_path: datasets/train.json
  validation_path: datasets/validation.json
  test_path: datasets/test.json
  max_length: 512

output:
  model_dir: models/vulnerability-detector
  checkpoint_dir: models/vulnerability-detector/checkpoints
  save_frequency: 5
```

### Training Execution

```bash
# Start training
node training/cli/index.js train \
  --config training/configs/vulnerability-detector.yaml \
  --output models/vulnerability-detector

# Resume from checkpoint
node training/cli/index.js resume \
  --checkpoint models/vulnerability-detector/checkpoints/epoch-5 \
  --config training/configs/vulnerability-detector.yaml
```

### Monitoring Training

Training logs and metrics are saved to the model directory:

```
models/vulnerability-detector/
  ├── training.log
  ├── metrics.json
  ├── checkpoints/
  │   ├── epoch-1/
  │   ├── epoch-5/
  │   └── epoch-10/
  └── metadata.json
```

## Terminal Command Integration

SmartBrain integrates with GitHub Copilot terminal commands:

### Available Commands

```bash
# Check SmartBrain status
/terminal SmartBrain.status

# Validate models and configurations
/terminal SmartBrain.validate

# Run inference
/terminal SmartBrain.inference --model my-model --input data.json

# Run training
/terminal SmartBrain.train --config training/configs/my-config.json

# List and manage models
/terminal SmartBrain.models

# Auto-fix common issues
/terminal SmartBrain.fix
```

### Command Examples

```bash
# Get system status
$ /terminal SmartBrain.status
✓ Models: 5 registered
✓ Training jobs: 2 running
✓ Inference engine: Ready
✓ Datasets: 10 validated

# Validate everything
$ /terminal SmartBrain.validate
Validating models... ✓
Validating datasets... ✓
Validating configurations... ✓

# List models
$ /terminal SmartBrain.models
Available models:
  - vulnerability-detector (v2.1.0)
  - gas-optimizer (v1.5.0)
  - code-classifier (v3.0.0)
```

## Ecosystem Integration

### CyberAi Ecosystem

SmartBrain is part of the CyberAi ecosystem:

```
CyberAi Ecosystem
├── SmartBrain (AI/ML Engine)
├── SmartContractDeploy Bot
├── SmartContractAudit Bot
└── Additional Components
```

### Bot Integration

SmartBrain provides ML capabilities to other bots:

```javascript
// In SmartContractAudit bot
const { InferenceEngine } = require('@smartbrain/inference');

const vulnerabilityDetector = new InferenceEngine(
  'models/vulnerability-detector'
);

async function auditContract(code) {
  const prediction = await vulnerabilityDetector.predict({
    code: code
  });
  
  return {
    vulnerabilities: prediction.vulnerabilities,
    confidence: prediction.confidence,
    recommendations: prediction.recommendations
  };
}
```

### Workflow Integration

GitHub Actions workflows can trigger SmartBrain operations:

```yaml
- name: Run Model Validation
  run: |
    ./scripts/validate-model.sh models/my-model

- name: Run Inference
  run: |
    node inference/cli/index.js predict \
      --model models/my-model \
      --input data/input.json
```

## API Reference

### Inference API

```javascript
// Load model
const engine = new InferenceEngine('models/my-model');

// Single prediction
const result = await engine.predict(inputData);

// Batch prediction
const results = await engine.predictBatch(inputDataArray);

// Get model info
const info = engine.getModelInfo();
```

### Training API

```javascript
// Create trainer
const trainer = new ModelTrainer(config);

// Start training
await trainer.train();

// Resume from checkpoint
await trainer.resume(checkpointPath);

// Evaluate model
const metrics = await trainer.evaluate(testData);
```

### Dataset API

```javascript
// Validate dataset
const validator = new DatasetValidator(schema);
const isValid = validator.validate(dataset);

// Get validation errors
const errors = validator.getErrors();

// Calculate statistics
const stats = validator.getStatistics();
```

## Best Practices

### Model Development

1. **Version Control**: Always version models using semantic versioning
2. **Metadata**: Include comprehensive metadata with every model
3. **Documentation**: Document model architecture, training, and usage
4. **Validation**: Validate models before deployment
5. **Testing**: Test models on diverse datasets

### Training

1. **Configuration**: Use configuration files for reproducibility
2. **Checkpoints**: Save checkpoints regularly
3. **Monitoring**: Monitor training metrics continuously
4. **Validation**: Validate on held-out data during training
5. **Experimentation**: Track experiments with metadata

### Inference

1. **Input Validation**: Validate all inputs before inference
2. **Error Handling**: Handle inference errors gracefully
3. **Performance**: Optimize for latency and throughput
4. **Monitoring**: Monitor inference performance
5. **Versioning**: Use specific model versions in production

### Security

1. **Model Integrity**: Validate model checksums
2. **Access Control**: Restrict access to sensitive models
3. **Input Sanitization**: Sanitize all user inputs
4. **Secrets**: Never commit secrets or credentials
5. **Updates**: Keep dependencies updated

### Deployment

1. **Testing**: Test thoroughly before deployment
2. **Rollback**: Have rollback procedures ready
3. **Monitoring**: Set up monitoring and alerts
4. **Documentation**: Update documentation
5. **Communication**: Communicate changes to users

## Support and Resources

- **GitHub Issues**: Report bugs and request features
- **Documentation**: This guide and inline code documentation
- **Examples**: Check `/examples` directory for usage examples
- **Community**: Join discussions on GitHub Discussions

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to SmartBrain.

## License

SmartBrain is licensed under the Apache License 2.0. See [LICENSE](../LICENSE) for details.
