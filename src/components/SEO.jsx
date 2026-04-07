import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const DEFAULT_DESCRIPTION = "NomadBalance is a free productivity app for remote workers. Focus timer, intermittent fasting tracker, desk exercises, and daily task planner.";
const DEFAULT_IMAGE = "https://nomadbalance.app/icons/icon-512.png";

export default function SEO({ title, description, noindex, image, jsonLd, ogType }) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | NomadBalance` : "NomadBalance — Focus, Fuel, Move, Plan";
  const canonicalUrl = `https://nomadbalance.app${pathname.replace(/\/+$/, "") || "/"}`;
  const type = ogType || "website";
  const desc = description || DEFAULT_DESCRIPTION;
  const img = image || DEFAULT_IMAGE;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="NomadBalance" />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {jsonLd && Array.isArray(jsonLd)
        ? jsonLd.map((item, i) => (
            <script key={`ld-${i}`} type="application/ld+json">
              {JSON.stringify(item)}
            </script>
          ))
        : jsonLd && (
            <script type="application/ld+json">
              {JSON.stringify(jsonLd)}
            </script>
          )}
    </Helmet>
  );
}
