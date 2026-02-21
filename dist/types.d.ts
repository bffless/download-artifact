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
export interface DownloadResult {
    commitSha: string;
    fileCount: number;
    totalSize: number;
    files: string[];
}
