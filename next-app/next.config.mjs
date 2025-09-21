// next-app/next.config.mjs
const repo = 'cheeseparty'

/** @type {import('next').NextConfig} */
export default {
  output: 'export',                             // ←静的エクスポート
  basePath: process.env.GITHUB_PAGES ? `/${repo}` : '',
  assetPrefix: process.env.GITHUB_PAGES ? `/${repo}/` : '',
  images: { unoptimized: true },                // next/image を手早く表示
  // trailingSlash: true,                        // 深いURLの404対策をしたい時に
}
