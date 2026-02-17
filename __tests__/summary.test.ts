import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSummary = vi.hoisted(() => ({
  addRaw: vi.fn().mockReturnThis(),
  write: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@actions/core', () => ({
  summary: mockSummary,
  info: vi.fn(),
}));

import { writeSummary } from '../src/summary';
import { ActionInputs, DownloadResult } from '../src/types';

describe('writeSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseInputs: ActionInputs = {
    apiUrl: 'https://assets.example.com',
    apiKey: 'test-key',
    sourcePath: './dist',
    outputPath: './dist',
    repository: 'test-owner/test-repo',
    overwrite: false,
    summary: true,
  };

  const baseResult: DownloadResult = {
    commitSha: 'abc123def456',
    fileCount: 10,
    totalSize: 50000,
    files: ['index.html', 'app.js'],
  };

  it('should write summary when enabled', async () => {
    await writeSummary(baseInputs, baseResult);

    expect(mockSummary.addRaw).toHaveBeenCalled();
    expect(mockSummary.write).toHaveBeenCalled();

    const summaryContent = mockSummary.addRaw.mock.calls[0][0];
    expect(summaryContent).toContain('Download Summary');
    expect(summaryContent).toContain('test-owner/test-repo');
    expect(summaryContent).toContain('./dist');
    expect(summaryContent).toContain('abc123def456');
    expect(summaryContent).toContain('10');
  });

  it('should not write summary when disabled', async () => {
    const inputs = { ...baseInputs, summary: false };

    await writeSummary(inputs, baseResult);

    expect(mockSummary.addRaw).not.toHaveBeenCalled();
    expect(mockSummary.write).not.toHaveBeenCalled();
  });

  it('should include alias when provided', async () => {
    const inputs = { ...baseInputs, alias: 'production' };

    await writeSummary(inputs, baseResult);

    const summaryContent = mockSummary.addRaw.mock.calls[0][0];
    expect(summaryContent).toContain('production');
  });

  it('should include branch when provided', async () => {
    const inputs = { ...baseInputs, branch: 'main' };

    await writeSummary(inputs, baseResult);

    const summaryContent = mockSummary.addRaw.mock.calls[0][0];
    expect(summaryContent).toContain('main');
  });

  it('should format bytes correctly', async () => {
    const result = { ...baseResult, totalSize: 1024 * 1024 * 5 }; // 5 MB

    await writeSummary(baseInputs, result);

    const summaryContent = mockSummary.addRaw.mock.calls[0][0];
    expect(summaryContent).toContain('5');
    expect(summaryContent).toContain('MB');
  });
});
