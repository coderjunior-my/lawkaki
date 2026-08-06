// Shared SEO constants — used by layout.tsx, robots.ts, sitemap.ts, and
// opengraph-image.tsx so the production URL logic lives in one place.
//
// VERCEL_PROJECT_PRODUCTION_URL is set automatically by Vercel at build
// time to the project's production domain — no manual config needed there.
// NEXT_PUBLIC_SITE_URL lets that be overridden (e.g. once a custom domain
// is set up). The hardcoded fallback only fires outside Vercel (local dev
// without either var set).
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://lawkaki.vercel.app"); // TODO: confirm real production domain

export const siteName = "Law Kaki";
export const siteTitle = "Law Kaki — Conveyancing signing coverage for Malaysian law firms";
export const siteDescription =
  "Post a signing you can't make and a trusted lawyer nearby picks it up. Law Kaki connects law firms and lawyers for conveyancing signings across Malaysia.";
