import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockContext = vi.hoisted(() => ({
  repo: { owner: 'test-owner', repo: 'test-repo' },
}));

vi.mock('@actions/github', () => ({
  context: mockContext,
}));

import { deriveContext } from '../src/context';

describe('deriveContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContext.repo = { owner: 'test-owner', repo: 'test-repo' };
  });

  it('should derive repository from GitHub context', () => {
    const context = deriveContext();

    expect(context.repository).toBe('test-owner/test-repo');
  });

  it('should handle different owner/repo combinations', () => {
    mockContext.repo = { owner: 'acme-corp', repo: 'my-app' };

    const context = deriveContext();

    expect(context.repository).toBe('acme-corp/my-app');
  });
});
