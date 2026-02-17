# BFFLESS Download Artifact

GitHub Action to download build artifacts from a BFFLESS static asset hosting platform.

This is the counterpart to [bffless/upload-artifact](https://github.com/bffless/upload-artifact) - use upload-artifact to deploy files, and download-artifact to retrieve them.

## Usage

### Download by alias (recommended)

```yaml
- uses: bffless/download-artifact@v1
  with:
    api-url: ${{ vars.ASSET_HOST_URL }}
    api-key: ${{ secrets.ASSET_HOST_KEY }}
    source-path: ./dist
    alias: production
```

### Download by commit SHA

```yaml
- uses: bffless/download-artifact@v1
  with:
    api-url: ${{ vars.ASSET_HOST_URL }}
    api-key: ${{ secrets.ASSET_HOST_KEY }}
    source-path: ./dist
    commit-sha: abc123def456
```

### Download to custom location

```yaml
- uses: bffless/download-artifact@v1
  with:
    api-url: ${{ vars.ASSET_HOST_URL }}
    api-key: ${{ secrets.ASSET_HOST_KEY }}
    source-path: ./dist
    alias: production
    output-path: ./production-build
```

### Download from another repository

```yaml
- uses: bffless/download-artifact@v1
  with:
    api-url: ${{ vars.ASSET_HOST_URL }}
    api-key: ${{ secrets.ASSET_HOST_KEY }}
    repository: myorg/shared-components
    source-path: ./dist
    alias: latest
    output-path: ./node_modules/@myorg/components/dist
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api-url` | Yes | - | Base URL of the BFFLESS hosting platform |
| `api-key` | Yes | - | API key for authentication |
| `source-path` | Yes | - | Path of files to download (e.g., `./dist`, `apps/frontend/dist`) |
| `alias` | * | - | Deployment alias to download from (e.g., `production`, `preview`) |
| `commit-sha` | * | - | Specific commit SHA to download from |
| `branch` | * | - | Branch to download from (gets latest deployment) |
| `output-path` | No | `{source-path}` | Where to save downloaded files |
| `repository` | No | Current repo | Repository in `owner/repo` format |
| `overwrite` | No | `false` | Overwrite existing files at output-path |
| `summary` | No | `true` | Write a GitHub Step Summary |

\* One of `alias`, `commit-sha`, or `branch` is required.

## Outputs

| Output | Description |
|--------|-------------|
| `file-count` | Number of files downloaded |
| `total-size` | Total bytes downloaded |
| `commit-sha` | Commit SHA of downloaded deployment |
| `files` | JSON array of downloaded file paths |

## Examples

### E2E testing against production build

```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: bffless/download-artifact@v1
        with:
          api-url: ${{ vars.ASSET_HOST_URL }}
          api-key: ${{ secrets.ASSET_HOST_KEY }}
          source-path: apps/frontend/dist
          alias: production
          output-path: ./production-build

      - name: Run E2E tests against production build
        run: npx playwright test --config=e2e.config.ts
        env:
          SERVE_DIR: ./production-build
```

### Compare current build with production

```yaml
- uses: bffless/download-artifact@v1
  with:
    api-url: ${{ vars.ASSET_HOST_URL }}
    api-key: ${{ secrets.ASSET_HOST_KEY }}
    source-path: ./dist
    alias: production
    output-path: ./dist-production

- name: Build current
  run: npm run build

- name: Compare bundles
  run: npx bundle-diff ./dist-production ./dist
```

### Rollback verification

```yaml
- uses: bffless/download-artifact@v1
  id: download
  with:
    api-url: ${{ vars.ASSET_HOST_URL }}
    api-key: ${{ secrets.ASSET_HOST_KEY }}
    source-path: ./dist
    commit-sha: ${{ github.event.inputs.rollback_sha }}
    output-path: ./rollback-build

- name: Verify rollback files
  run: |
    echo "Downloaded ${{ steps.download.outputs.file-count }} files"
    echo "Total size: ${{ steps.download.outputs.total-size }} bytes"
    ls -la ./rollback-build
```

## How It Works

1. The action requests a download manifest from the BFFLESS API
2. The API resolves the deployment (by alias, commit SHA, or branch)
3. For bucket storage (S3, GCS, MinIO), presigned URLs are generated for direct download
4. For local storage, files are streamed through the API
5. Files are downloaded in parallel (10 concurrent, with retries)
6. Files are written to the output directory, preserving structure

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Format
npm run format
```

## License

See [LICENSE.md](LICENSE.md)
