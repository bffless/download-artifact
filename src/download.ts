import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { ActionInputs, DownloadResult } from './types';
import {
  requestPrepareBatchDownload,
  downloadFilesWithPresignedUrls,
  downloadFilesDirect,
} from '@bffless/artifact-client';

/**
 * Main download function - tries presigned URLs first, falls back to direct download
 */
export async function downloadArtifacts(inputs: ActionInputs): Promise<DownloadResult> {
  // Resolve output path
  const outputDir = path.resolve(inputs.outputPath);

  // Check if output directory exists and has content
  if (fs.existsSync(outputDir)) {
    const contents = fs.readdirSync(outputDir);
    if (contents.length > 0 && !inputs.overwrite) {
      throw new Error(
        `Output directory ${outputDir} is not empty. Use overwrite: true to replace existing files.`
      );
    }
    if (contents.length > 0 && inputs.overwrite) {
      core.info(`Clearing existing files in ${outputDir}`);
      fs.rmSync(outputDir, { recursive: true });
    }
  }

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  core.info(`Output directory: ${outputDir}`);

  // Request download manifest
  const prepareResponse = await requestPrepareBatchDownload(
    inputs.apiUrl,
    inputs.apiKey,
    {
      repository: inputs.repository,
      path: inputs.sourcePath,
      alias: inputs.alias,
      commitSha: inputs.commitSha,
      branch: inputs.branch,
    }
  );

  if (prepareResponse.files.length === 0) {
    core.warning('No files found to download');
    return {
      commitSha: prepareResponse.commitSha,
      fileCount: 0,
      totalSize: 0,
      files: [],
    };
  }

  core.info(`Found ${prepareResponse.files.length} files to download`);
  core.info(`Commit SHA: ${prepareResponse.commitSha}`);

  const totalSize = prepareResponse.files.reduce((sum, f) => sum + f.size, 0);

  let downloadResults: { success: string[]; failed: Array<{ path: string; error: string }> };

  if (prepareResponse.presignedUrlsSupported) {
    // Download using presigned URLs (direct from storage)
    core.info('Downloading files directly from storage...');
    downloadResults = await downloadFilesWithPresignedUrls(
      prepareResponse.files,
      outputDir,
      10,
      3
    );
  } else {
    // Fallback to direct download through API
    core.info('Storage does not support presigned URLs, downloading through API...');
    downloadResults = await downloadFilesDirect(
      inputs.apiUrl,
      inputs.apiKey,
      prepareResponse.files,
      outputDir,
      {
        repository: inputs.repository,
        alias: inputs.alias,
        commitSha: inputs.commitSha,
        branch: inputs.branch,
      },
      10,
      3
    );
  }

  if (downloadResults.failed.length > 0) {
    core.warning(
      `${downloadResults.failed.length} files failed to download:\n` +
        downloadResults.failed
          .slice(0, 10)
          .map((f) => `  - ${f.path}: ${f.error}`)
          .join('\n')
    );

    if (downloadResults.failed.length > downloadResults.success.length) {
      throw new Error(
        `Too many download failures: ${downloadResults.failed.length}/${prepareResponse.files.length}`
      );
    }
  }

  core.info(`Successfully downloaded ${downloadResults.success.length} files`);

  return {
    commitSha: prepareResponse.commitSha,
    fileCount: downloadResults.success.length,
    totalSize,
    files: downloadResults.success,
  };
}
