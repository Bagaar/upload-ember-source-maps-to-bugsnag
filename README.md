# Upload Ember Source Maps to Bugsnag

[![CI](https://github.com/bagaar/upload-ember-source-maps-to-bugsnag/workflows/CI/badge.svg)](https://github.com/bagaar/upload-ember-source-maps-to-bugsnag/actions?query=workflow%3ACI)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

A small script to upload Ember source maps to Bugsnag during CI, tailored to the
workflow we use at [Bagaar](https://www.bagaar.be/).

## Usage

In the root of the project, run:

```shell
pnpm build
pnpm upload-ember-source-maps-to-bugsnag
```

Make sure that source maps are enabled. More info on enabling source maps can be
found [here](https://cli.emberjs.com/release/advanced-use/asset-compilation/#sourcemaps).

## Options

| Name                 | Description                        | Default Value                              |
| -------------------- | ---------------------------------- | ------------------------------------------ |
| `--api-key` \*       | Bugsnag API key.                   | Defaults to `BUGSNAG_API_KEY` env var.     |
| `--app-version` \*   | Version of the app.                | Parsed from `index.html` if not provided.  |
| `--bundle-host` \*   | Where the bundle is hosted.        | Defaults to `BUGSNAG_BUNDLE_HOST` env var. |
| `--ci`               | Only upload source maps during CI. | `false`                                    |
| `--keep-source-maps` | Keep source maps after uploading.  | `false`                                    |

Options marked with `*` are required.

This script also takes a `BUGSNAG_ENABLED` env var into account. If set to
`false`, uploading source maps will be skipped.
