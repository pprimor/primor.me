import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { absoluteUrl, siteMetadata } from './src/lib/site-metadata';

function siteMetaPlugin(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml() {
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
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), siteMetaPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
