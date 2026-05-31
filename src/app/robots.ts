import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      // Explicitly allow AI crawlers for Google AI Overviews, Perplexity,
      // ChatGPT, and Claude citations — do not block these.
      {
        userAgent: [
          'GPTBot',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Googlebot',
          'anthropic-ai',
          'CCBot',
          'Omgilibot',
        ],
        allow: '/',
      },
    ],
    sitemap: 'https://veilguard.dev/sitemap.xml',
  };
}
