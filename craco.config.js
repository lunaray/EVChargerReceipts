const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add polyfills for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "fs": false,
        "path": false,
        "crypto": false,
        "stream": false,
        "buffer": false,
        "util": false,
        "assert": false,
        "http": false,
        "https": false,
        "os": false,
        "url": false,
        "zlib": false
      };

      // Add plugins
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];

      return webpackConfig;
    },
  },
};