// next.config.cjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  cleanDistDir: true,
  generateBuildId: async () => {
    const sha = process.env.VERCEL_GIT_COMMIT_SHA || 'local';
    return `${sha}-${Date.now()}`;
  }
};

module.exports = nextConfig;
