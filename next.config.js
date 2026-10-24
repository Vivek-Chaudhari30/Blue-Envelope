const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We detected a parent-directory lockfile; pin tracing to this repo.
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;
