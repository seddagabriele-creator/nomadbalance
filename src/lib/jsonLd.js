const SITE_URL = "https://nomadbalance.app";
const ORG_NAME = "NomadBalance";
const LOGO_URL = `${SITE_URL}/icons/icon-512.png`;

const AUTHOR = {
  "@type": "Organization",
  name: ORG_NAME,
};

export function articleJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  readTime,
  category,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${SITE_URL}/blog/${slug}`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: AUTHOR,
    publisher: {
      "@type": "Organization",
      name: ORG_NAME,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
    ...(category && { articleSection: category }),
    ...(readTime && { timeRequired: `PT${parseInt(readTime, 10)}M` }),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
