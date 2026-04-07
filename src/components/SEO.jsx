import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

export default function SEO({ title, description, noindex, image, jsonLd }) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | NomadBalance` : "NomadBalance — Focus, Fuel, Move, Plan";
  const canonicalUrl = `https://nomadbalance.app${pathname.replace(/\/+$/, "") || "/"}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:url" content={canonicalUrl} />
      {image && <meta property="og:image" content={image} />}
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
