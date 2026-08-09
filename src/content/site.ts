/**
 * Single place for brand + contact + legal + help constants used across the
 * marketing site and the app. Edit here, not inline.
 */
export const BRAND_NAME = 'Veilguard';
export const SITE_URL = 'https://veilguard.dev';

/** Where non-technical users reach a human. */
export const SUPPORT_EMAIL = 'support@veilguard.dev';
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=Veilguard%20help`;

/** Help / docs (placeholder until real docs exist). */
export const HELP_URL = `${SITE_URL}/help`;
export const HELP_GITHUB_URL = `${SITE_URL}/help/connect-github`;
export const HELP_SUPABASE_URL = `${SITE_URL}/help/connect-supabase`;

/** Legal pages (already rendered under the marketing group). */
export const LEGAL = {
  privacy: '/privacy',
  terms: '/terms',
  refund: '/refund',
} as const;
