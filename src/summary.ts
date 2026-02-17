import * as core from '@actions/core';
import { ActionInputs, DownloadResult } from './types';

export async function writeSummary(
  inputs: ActionInputs,
  result: DownloadResult
): Promise<void> {
  if (!inputs.summary) {
    return;
  }

  const rows: [string, string][] = [
    ['Repository', inputs.repository],
    ['Source Path', inputs.sourcePath],
    ['Output Path', inputs.outputPath],
    ['Commit SHA', `\`${result.commitSha}\``],
  ];

  if (inputs.alias) {
    rows.push(['Alias', inputs.alias]);
  }
  if (inputs.branch) {
    rows.push(['Branch', inputs.branch]);
  }

  rows.push(['Files', String(result.fileCount)]);
  rows.push(['Total Size', formatBytes(result.totalSize)]);

  const tableMarkdown = rows
    .map(([key, value]) => `| **${key}** | ${value} |`)
    .join('\n');

  const summaryContent = `## Download Summary

| Property | Value |
|----------|-------|
${tableMarkdown}
`;

  await core.summary.addRaw(summaryContent).write();

  core.info('Step summary written');
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
