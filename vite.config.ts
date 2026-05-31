import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { absoluteUrl, siteMetadata } from './src/lib/site-metadata';

const notFoundTitle = `Page not found — ${siteMetadata.author}`;
const notFoundDescription =
  'This page does not exist on primor.me. Return to the homepage.';

function analyticsBeacon(cfWebAnalyticsToken: string) {
  return {
    tag: 'script' as const,
    attrs: {
      defer: true,
      src: 'https://static.cloudflareinsights.com/beacon.min.js',
      'data-cf-beacon': JSON.stringify({ token: cfWebAnalyticsToken }),
    },
    injectTo: 'head' as const,
  };
}

function siteMetaPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');
  const cfWebAnalyticsToken = env.VITE_CF_WEB_ANALYTICS_TOKEN?.trim();

  return {
    name: 'site-meta',
    transformIndexHtml(_html, ctx) {
      const isNotFoundPage = ctx.filename.endsWith('404.html');
      const analyticsTags = cfWebAnalyticsToken
        ? [analyticsBeacon(cfWebAnalyticsToken)]
        : [];

      if (isNotFoundPage) {
        return [
          {
            tag: 'title',
            children: notFoundTitle,
            injectTo: 'head',
          },
          {
            tag: 'meta',
            attrs: { name: 'description', content: notFoundDescription },
            injectTo: 'head',
          },
          {
            tag: 'meta',
            attrs: { name: 'robots', content: 'noindex' },
            injectTo: 'head',
          },
          ...analyticsTags,
        ];
      }

      const ogImage = absoluteUrl(siteMetadata.ogImagePath);
      const canonical = siteMetadata.siteUrl + '/';

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: siteMetadata.author,
        url: siteMetadata.siteUrl,
        jobTitle: siteMetadata.jobTitle,
        description: siteMetadata.description,
        image: ogImage,
        worksFor: {
          '@type': 'Organization',
          name: siteMetadata.worksFor.name,
          url: siteMetadata.worksFor.url,
        },
        sameAs: siteMetadata.sameAs,
      };

      return [
        {
          tag: 'title',
          children: siteMetadata.title,
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { name: 'description', content: siteMetadata.description },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { name: 'author', content: siteMetadata.author },
          injectTo: 'head',
        },
        {
          tag: 'link',
          attrs: { rel: 'canonical', href: canonical },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { property: 'og:title', content: siteMetadata.title },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { property: 'og:description', content: siteMetadata.description },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { property: 'og:url', content: canonical },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { property: 'og:type', content: 'website' },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { property: 'og:locale', content: siteMetadata.locale },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: ogImage },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:alt', content: siteMetadata.ogImageAlt },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:card', content: 'summary_large_image' },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:title', content: siteMetadata.title },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:description', content: siteMetadata.description },
          injectTo: 'head',
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image', content: ogImage },
          injectTo: 'head',
        },
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify(jsonLd),
          injectTo: 'head',
        },
        ...analyticsTags,
      ];
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), siteMetaPlugin(mode)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        notFound: path.resolve(__dirname, '404.html'),
      },
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          ) {
            return "react-vendor";
          }
          if (id.includes("node_modules/framer-motion")) {
            return "motion";
          }
          if (id.includes("node_modules/react-hot-toast")) {
            return "toast";
          }
        },
      },
    },
  },
}));
