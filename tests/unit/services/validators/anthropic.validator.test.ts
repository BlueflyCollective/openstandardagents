/**
 * Anthropic Validator Tests
 */

import { describe, it, expect } from '@jest/globals';
import { AnthropicValidator } from '../../../../src/services/validators/anthropic.validator.js';

describe('AnthropicValidator', () => {
  const validator = new AnthropicValidator();

  it('should validate valid Anthropic extension', () => {
    const manifest = {
      extensions: {
        anthropic: {
          enabled: true,
          model: 'claude-3-5-sonnet-20241022',
          system: 'You are a helpful assistant.',
        },
      },
    };

    const result = validator.validate(manifest);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate all valid Claude models', () => {
    const validModels = [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];

    validModels.forEach((model) => {
      const manifest = {
        extensions: {
          anthropic: {
            enabled: true,
            model: model,
          },
        },
      };

      const result = validator.validate(manifest);
      expect(result.valid).toBe(true);
    });
  });

  it('should reject invalid model', () => {
    const manifest = {
      extensions: {
        anthropic: {
          enabled: true,
          model: 'invalid-model',
        },
      },
    };

    const result = validator.validate(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should validate max_tokens range', () => {
    const manifest = {
      extensions: {
        anthropic: {
          enabled: true,
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
        },
      },
    };

    const result = validator.validate(manifest);
    expect(result.valid).toBe(true);
  });

  it('should reject max_tokens out of range', () => {
    const manifest = {
      extensions: {
        anthropic: {
          enabled: true,
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 5000,
        },
      },
    };

    const result = validator.validate(manifest);
    expect(result.valid).toBe(false);
  });

  it('should validate temperature range', () => {
    const manifest = {
      extensions: {
        anthropic: {
          enabled: true,
          model: 'claude-3-5-sonnet-20241022',
          temperature: 0.7,
        },
      },
    };

    const result = validator.validate(manifest);
    expect(result.valid).toBe(true);
  });

  it('should reject temperature out of range', () => {
    const manifest = {
      extensions: {
        anthropic: {
          enabled: true,
          model: 'claude-3-5-sonnet-20241022',
          temperature: 1.5,
        },
      },
    };

    const result = validator.validate(manifest);
    expect(result.valid).toBe(false);
  });

  it('should validate tool_choice', () => {
    const validChoices = ['auto', 'any', 'none'];

    validChoices.forEach((choice) => {
      const manifest = {
        extensions: {
          anthropic: {
            enabled: true,
            model: 'claude-3-5-sonnet-20241022',
            tool_choice: choice,
          },
        },
      };

      const result = validator.validate(manifest);
      expect(result.valid).toBe(true);
    });
  });

  it('should return warnings for missing system prompt', () => {
    const manifest = {
      extensions: {
        anthropic: {
          enabled: true,
          model: 'claude-3-5-sonnet-20241022',
        },
      },
    };

    const result = validator.validate(manifest);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
