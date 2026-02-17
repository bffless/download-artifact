import * as core from '@actions/core';
import { ActionInputs } from './types';
import { deriveContext } from './context';

export function getInputs(): ActionInputs {
  const apiUrl = core.getInput('api-url', { required: true });
  const apiKey = core.getInput('api-key', { required: true });
  core.setSecret(apiKey);

  const sourcePath = core.getInput('source-path', { required: true });

  // Resolution: one of alias, commit-sha, or branch required
  const alias = core.getInput('alias') || undefined;
  const commitSha = core.getInput('commit-sha') || undefined;
  const branch = core.getInput('branch') || undefined;

  if (!alias && !commitSha && !branch) {
    throw new Error(
      'One of alias, commit-sha, or branch is required to identify the deployment'
    );
  }

  const context = deriveContext();
  const repository = core.getInput('repository') || context.repository;

  // Output path defaults to source-path
  const outputPathInput = core.getInput('output-path');
  const outputPath = outputPathInput || sourcePath;

  const overwriteInput = core.getInput('overwrite') || 'false';
  const overwrite = overwriteInput.toLowerCase() === 'true';

  const summaryInput = core.getInput('summary') || 'true';
  const summary = summaryInput.toLowerCase() !== 'false';

  return {
    apiUrl,
    apiKey,
    sourcePath,
    alias,
    commitSha,
    branch,
    outputPath,
    repository,
    overwrite,
    summary,
  };
}
