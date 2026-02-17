import * as core from '@actions/core';
import { getInputs } from './inputs';
import { downloadArtifacts } from './download';
import { writeSummary } from './summary';

async function run(): Promise<void> {
  try {
    const inputs = getInputs();

    core.info(`API URL: ${inputs.apiUrl}`);
    core.info(`Repository: ${inputs.repository}`);
    core.info(`Source Path: ${inputs.sourcePath}`);
    core.info(`Output Path: ${inputs.outputPath}`);
    if (inputs.alias) core.info(`Alias: ${inputs.alias}`);
    if (inputs.commitSha) core.info(`Commit SHA: ${inputs.commitSha}`);
    if (inputs.branch) core.info(`Branch: ${inputs.branch}`);
    core.info(`Overwrite: ${inputs.overwrite}`);

    // Download artifacts
    const result = await downloadArtifacts(inputs);

    // Set outputs
    core.setOutput('file-count', String(result.fileCount));
    core.setOutput('total-size', String(result.totalSize));
    core.setOutput('commit-sha', result.commitSha);
    core.setOutput('files', JSON.stringify(result.files));

    core.info(`Download complete!`);
    core.info(`Commit SHA: ${result.commitSha}`);
    core.info(`Files: ${result.fileCount}`);
    core.info(`Total size: ${result.totalSize} bytes`);

    // Write summary
    await writeSummary(inputs, result);
  } catch (error) {
    core.setFailed(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

run();
