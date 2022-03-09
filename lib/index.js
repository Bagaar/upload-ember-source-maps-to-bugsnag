import { browser } from '@bugsnag/source-maps';
import { config as readEnvFile } from 'dotenv';
import { bool, cleanEnv, str } from 'envalid';
import { existsSync, readdirSync, readFileSync, unlinkSync } from 'fs';
import kleur from 'kleur';
import { parse } from 'node-html-parser';
import { join } from 'path';
import { cwd, env } from 'process';

readEnvFile();

const ENV = cleanEnv(env, {
  BUGSNAG_API_KEY: str({ default: '' }),
  BUGSNAG_BUNDLE_HOST: str({ default: '' }),
  BUGSNAG_ENABLED: bool({ default: true }),
  CI: bool({ default: false }),
});

const ERROR_CODE = {
  DUPLICATE: 1,
};

export async function uploadEmberSourceMapsToBugsnag(args) {
  if (!ENV.CI && args.ci) {
    return warning('"CI" is "false", skipping uploading source maps.');
  }

  if (!ENV.BUGSNAG_ENABLED) {
    return warning(
      '"BUGSNAG_ENABLED" is "false", skipping uploading source maps.'
    );
  }

  const apiKey = args.apiKey || ENV.BUGSNAG_API_KEY;

  if (!apiKey) {
    return error('Bugsnag API key is not provided.');
  }

  const appVersion = args.appVersion || getAppVersionFromIndexHtml();

  if (!appVersion) {
    return error('App version is not provided.');
  }

  const bundleHost = args.bundleHost || ENV.BUGSNAG_BUNDLE_HOST;

  if (!bundleHost) {
    return error('Bugsnag bundle host is not provided.');
  }

  if (!existsSync(assetPath())) {
    return warning('No source maps found.');
  }

  const assets = readdirSync(assetPath());
  const sourceMaps = assets.filter((asset) => asset.endsWith('.map'));

  if (!sourceMaps.length) {
    return warning('No source maps found.');
  }

  for (let i = 0; i < sourceMaps.length; i++) {
    const sourceMap = sourceMaps[i];

    try {
      await browser.uploadOne({
        apiKey,
        bundleUrl: `${bundleHost}assets/${sourceMap.replace('.map', '.js')}`,
        sourceMap: assetPath(sourceMap),
      });

      success(`Uploaded source map: "${sourceMap}"`);

      if (!args.keepSourceMaps) {
        unlinkSync(assetPath(sourceMap));
        info(`Deleted source map: "${sourceMap}"`);
      }
    } catch (exception) {
      if (exception.code === ERROR_CODE.DUPLICATE) {
        warning(`Already uploaded source map: "${sourceMap}"`);
      } else {
        error(`Could not upload source map: "${sourceMap}"`);
        error(exception);
      }
    }
  }
}

function assetPath() {
  return distPath('assets', ...arguments);
}

function distPath() {
  return join(cwd(), 'dist', ...arguments);
}

function getAppVersionFromIndexHtml() {
  if (!existsSync(distPath('index.html'))) {
    return null;
  }

  const indexHtml = readFileSync(distPath('index.html'), { encoding: 'utf-8' });
  const parsed = parse(indexHtml);
  const configTag = parsed.querySelector('meta[name$=/config/environment]');

  if (!configTag) {
    return null;
  }

  try {
    const configTagContent = decodeURIComponent(configTag.attributes.content);
    const config = JSON.parse(configTagContent);

    return config.APP.version;
  } catch {
    return null;
  }
}

function error() {
  log(kleur.red, ...arguments);
}

function info() {
  log(kleur.blue, ...arguments);
}

function success() {
  log(kleur.green, ...arguments);
}

function warning() {
  log(kleur.yellow, ...arguments);
}

function log(color, ...parts) {
  console.log(
    color(`[upload-ember-source-maps-to-bugsnag] ${parts.join(' ')}`)
  );
}
