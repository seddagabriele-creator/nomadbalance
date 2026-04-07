import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

export default function SEO({ title, description, noindex, image, jsonLd, ogType }) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | NomadBalance` : "NomadBalance — Focus, Fuel, Move, Plan";
  const canonicalUrl = `https://nomadbalance.app${pathname.replace(/\/+$/, "") || "/"}`;
  const type = ogType || "website";
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="NomadBalance" />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
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
