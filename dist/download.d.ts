import { ActionInputs, DownloadResult } from './types';
/**
 * Main download function - tries presigned URLs first, falls back to direct download
 */
export declare function downloadArtifacts(inputs: ActionInputs): Promise<DownloadResult>;
