export interface ActionInputs {
    apiUrl: string;
    apiKey: string;
    sourcePath: string;
    alias?: string;
    commitSha?: string;
    branch?: string;
    outputPath: string;
    repository: string;
    overwrite: boolean;
    summary: boolean;
}
export interface GitContext {
    repository: string;
}
export interface DownloadFileInfo {
    path: string;
    size: number;
    downloadUrl: string;
}
export interface PrepareBatchDownloadRequest {
    repository: string;
    path: string;
    alias?: string;
    commitSha?: string;
    branch?: string;
}
export interface PrepareBatchDownloadResponse {
    presignedUrlsSupported: boolean;
    commitSha: string;
    isPublic: boolean;
    files: DownloadFileInfo[];
}
export interface DownloadResult {
    commitSha: string;
    fileCount: number;
    totalSize: number;
    files: string[];
}
