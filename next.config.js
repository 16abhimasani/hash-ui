const withTM = require('next-transpile-modules')([
  '@hash/sketch-utils',
  '@hash/protocol',
  '@hash/types',
  '@hash/seasons',
  '@hash/firebase-utils',
]);

module.exports = withTM({
  swcMinify: true,
  compiler: {
    // ssr and displayName are configured by default
    styledComponents: true,
    removeConsole: true,
  },
  images: {
    domains: ['preview.pob.vercel.app', 'pbs.twimg.com'],
  },
  webpack: (config) => {
    // Need this locally or else react-spring gets mad on hot reloads
    config.module.rules.push({ test: /react-spring/, sideEffects: true });
    return config;
  },
});
