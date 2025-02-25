const { PHASE_DEVELOPMENT_SERVER } = require("next/constants")

const { i18n } = require("./next-i18next.config")

const LIMIT_CPUS = Number(process.env.LIMIT_CPUS ?? 2)

const experimental = LIMIT_CPUS
  ? {
      // This option could be enabled in the future when flagged as stable, to speed up builds
      // (see https://nextjs.org/docs/pages/building-your-application/configuring/mdx#using-the-rust-based-mdx-compiler-experimental)
      // mdxRs: true,

      // Reduce the number of cpus and disable parallel threads in prod envs to consume less memory
      workerThreads: false,
      cpus: LIMIT_CPUS,
    }
  : {}

/** @type {import('next').NextConfig} */
module.exports = (phase, { defaultConfig }) => {
  let nextConfig = {
    ...defaultConfig,
    reactStrictMode: true,
    webpack: (config) => {
      config.module.rules.push({
        test: /\.ya?ml$/,
        use: "yaml-loader",
      })
      config.module.rules.push({
        test: /\.svg$/,
        use: "@svgr/webpack",
      })

      return config
    },
    i18n,
    trailingSlash: true,
    images: {
      deviceSizes: [640, 750, 828, 1080, 1200, 1504, 1920],
    },
  }

  if (phase !== PHASE_DEVELOPMENT_SERVER) {
    nextConfig = {
      ...nextConfig,
      experimental: {
        ...experimental,
        outputFileTracingExcludes: {
          "*": [
            /**
             * Exclude these paths from the trace output to avoid bloating the
             * Netlify functions bundle.
             *
             * @see https://github.com/orgs/vercel/discussions/103#discussioncomment-5427097
             * @see https://nextjs.org/docs/app/api-reference/next-config-js/output#automatically-copying-traced-files
             */
            "node_modules/@swc/core-linux-x64-gnu",
            "node_modules/@swc/core-linux-x64-musl",
            "node_modules/@esbuild/linux-x64",
            "public/**/*.png",
            "public/**/*.gif",
            "src/data",
          ],
        },
      },
    }
  }

  return nextConfig
}
