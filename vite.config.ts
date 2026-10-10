import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { analyticsTag, buildHeadTags, homePageMeta, type HeadTag } from './src/lib/head-tags';
import { siteMetadata } from './src/lib/site-metadata';

const notFoundTitle = `Page not found — ${siteMetadata.author}`;
const notFoundDescription =
  'This page does not exist on primor.me. Return to the homepage.';

function toHead(tags: readonly HeadTag[]): HtmlTagDescriptor[] {
  return tags.map((tag) => ({ ...tag, injectTo: 'head' as const }));
}

function siteMetaPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');
  const cfWebAnalyticsToken = env.VITE_CF_WEB_ANALYTICS_TOKEN?.trim();
  const analyticsTags = cfWebAnalyticsToken ? [analyticsTag(cfWebAnalyticsToken)] : [];

  return {
    name: 'site-meta',
    transformIndexHtml(_html, ctx) {
      if (ctx.path.startsWith('/services')) return;

      if (ctx.filename.endsWith('404.html')) {
        return toHead([
          { tag: 'title', children: notFoundTitle },
          { tag: 'meta', attrs: { name: 'description', content: notFoundDescription } },
          { tag: 'meta', attrs: { name: 'robots', content: 'noindex' } },
          ...analyticsTags,
        ]);
      }

      return toHead([...buildHeadTags(homePageMeta), ...analyticsTags]);
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
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/')
          ) {
            return 'react-vendor';
          }
        },
      },
    },
  },
}));
