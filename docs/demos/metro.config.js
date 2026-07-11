const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '../..');
const libRoot = path.resolve(repoRoot, 'lib');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [projectRoot, libRoot];

config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];
config.resolver.extraNodeModules = {
  'react-native-canvas-kit': path.resolve(libRoot, 'module'),
};

module.exports = config;
