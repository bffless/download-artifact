import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @actions/core before importing
vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  setSecret: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}));

// Mock @actions/github
vi.mock('@actions/github', () => ({
  context: {
    repo: { owner: 'test-owner', repo: 'test-repo' },
  },
}));

import * as core from '@actions/core';
import { getInputs } from '../src/inputs';

describe('getInputs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse required inputs with alias', () => {
    const mockGetInput = vi.mocked(core.getInput);
    mockGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'api-url': 'https://assets.example.com',
        'api-key': 'test-key-123',
        'source-path': './dist',
        'alias': 'production',
      };
      return inputs[name] || '';
    });

    const result = getInputs();

    expect(result.apiUrl).toBe('https://assets.example.com');
    expect(result.apiKey).toBe('test-key-123');
    expect(result.sourcePath).toBe('./dist');
    expect(result.alias).toBe('production');
    expect(result.repository).toBe('test-owner/test-repo');
    expect(result.outputPath).toBe('./dist'); // defaults to source-path
    expect(result.overwrite).toBe(false);
    expect(result.summary).toBe(true);
  });

  it('should parse inputs with commit-sha', () => {
    const mockGetInput = vi.mocked(core.getInput);
    mockGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'api-url': 'https://assets.example.com',
        'api-key': 'test-key-123',
        'source-path': './dist',
        'commit-sha': 'abc123def456',
      };
      return inputs[name] || '';
    });

    const result = getInputs();

    expect(result.commitSha).toBe('abc123def456');
    expect(result.alias).toBeUndefined();
    expect(result.branch).toBeUndefined();
  });

  it('should parse inputs with branch', () => {
    const mockGetInput = vi.mocked(core.getInput);
    mockGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'api-url': 'https://assets.example.com',
        'api-key': 'test-key-123',
        'source-path': './dist',
        'branch': 'main',
      };
      return inputs[name] || '';
    });

    const result = getInputs();

    expect(result.branch).toBe('main');
    expect(result.alias).toBeUndefined();
    expect(result.commitSha).toBeUndefined();
  });

  it('should throw if no resolution parameter provided', () => {
    const mockGetInput = vi.mocked(core.getInput);
    mockGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'api-url': 'https://assets.example.com',
        'api-key': 'test-key-123',
        'source-path': './dist',
      };
      return inputs[name] || '';
    });

    expect(() => getInputs()).toThrow(
      'One of alias, commit-sha, or branch is required'
    );
  });

  it('should use custom output-path when provided', () => {
    const mockGetInput = vi.mocked(core.getInput);
    mockGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'api-url': 'https://assets.example.com',
        'api-key': 'test-key-123',
        'source-path': './dist',
        'alias': 'production',
        'output-path': './production-build',
      };
      return inputs[name] || '';
    });

    const result = getInputs();

    expect(result.outputPath).toBe('./production-build');
  });

  it('should use custom repository when provided', () => {
    const mockGetInput = vi.mocked(core.getInput);
    mockGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'api-url': 'https://assets.example.com',
        'api-key': 'test-key-123',
        'source-path': './dist',
        'alias': 'production',
        'repository': 'other-org/other-repo',
      };
      return inputs[name] || '';
    });

    const result = getInputs();

    expect(result.repository).toBe('other-org/other-repo');
  });

  it('should parse overwrite flag', () => {
    const mockGetInput = vi.mocked(core.getInput);
    mockGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'api-url': 'https://assets.example.com',
        'api-key': 'test-key-123',
        'source-path': './dist',
        'alias': 'production',
        'overwrite': 'true',
      };
      return inputs[name] || '';
    });

    const result = getInputs();

    expect(result.overwrite).toBe(true);
  });

  it('should parse summary flag as false', () => {
    const mockGetInput = vi.mocked(core.getInput);
    mockGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'api-url': 'https://assets.example.com',
        'api-key': 'test-key-123',
        'source-path': './dist',
        'alias': 'production',
        'summary': 'false',
      };
      return inputs[name] || '';
    });

    const result = getInputs();

    expect(result.summary).toBe(false);
  });
});
