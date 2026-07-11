const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');

const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

const entryDir = path.relative(root, __dirname);
const rewriteRequestUrl = config.server && config.server.rewriteRequestUrl;
config.server = {
  ...config.server,
  rewriteRequestUrl(url) {
    const rewritten = rewriteRequestUrl
      ? rewriteRequestUrl.call(this, url)
      : url;
    return rewritten.replace(
      /^(https?:\/\/[^/]+)\/\?/,
      `$1/${entryDir}/index.bundle?`
    );
  },
};

module.exports = config;
