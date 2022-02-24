#!/usr/bin/env node

import { argv } from 'process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { uploadEmberSourceMapsToBugsnag } from '../lib/index.js';

const OPTIONS = {
  apiKey: {
    description: 'Bugsnag API key',
    type: 'string',
  },
  appVersion: {
    description: 'Version of the app',
    type: 'string',
  },
  bundleHost: {
    description: 'Bugsnag bundle host',
    type: 'string',
  },
  keepSourceMaps: {
    default: false,
    description: 'Keep source maps after uploading',
    type: 'boolean',
  },
};

const args = yargs(hideBin(argv)).options(OPTIONS).argv;

uploadEmberSourceMapsToBugsnag(args);
