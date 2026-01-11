# Models

This directory contains the ML model registry, metadata, and versioning infrastructure for SmartBrain.

## Structure

```
/models
  /registry          # Model registry and versioning
  /metadata          # Model metadata schemas
```

## Overview

The models directory manages:
- Model versioning and lifecycle
- Model metadata and schemas
- Model registry for tracking trained models
- Model performance metrics

## Model Registry

The registry subdirectory contains the infrastructure for tracking and managing different model versions across the SmartBrain ecosystem.

## Model Metadata

The metadata subdirectory contains JSON schemas and validation rules for model metadata, ensuring consistent model documentation and tracking.

## Usage

Models are registered with metadata including:
- Model name and version
- Framework (TensorFlow, PyTorch, etc.)
- Task type (classification, generation, etc.)
- Performance metrics
- Training information
- Dependencies

## Integration

Models in this registry integrate with:
- Inference engine (`/inference`)
- Training pipeline (`/training`)
- Dataset validation (`/datasets`)
