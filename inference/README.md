# Inference

This directory contains the inference engine, CLI commands, and API endpoints for running model predictions in SmartBrain.

## Structure

```
/inference
  /engine            # Inference engine core
  /cli               # CLI commands for inference
  /api               # API endpoints for inference
```

## Overview

The inference directory provides:
- High-performance inference engine
- Command-line interface for running predictions
- REST API endpoints for model serving
- Batch and real-time inference support

## Inference Engine

The engine subdirectory contains the core inference logic, model loading, and prediction execution.

## CLI Interface

The CLI subdirectory provides command-line tools for:
- Running single predictions
- Batch inference
- Model benchmarking
- Performance profiling

Example:
```bash
node inference/cli/index.js predict --model my-model --input data.json
```

## API Endpoints

The API subdirectory contains REST API endpoints for:
- Real-time predictions
- Batch processing
- Model health checks
- Performance monitoring

## Integration

Inference components integrate with:
- Model registry (`/models`)
- Training outputs (`/training`)
- Validation datasets (`/datasets`)

## Performance

The inference engine is optimized for:
- Low latency predictions
- High throughput batch processing
- Efficient memory usage
- Multi-model serving
