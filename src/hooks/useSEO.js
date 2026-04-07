import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://nomadbalance.app";
const DEFAULT_DESCRIPTION = "NomadBalance is a free productivity app for remote workers. Focus timer, intermittent fasting tracker, desk exercises, and daily task planner.";
const DEFAULT_IMAGE = `${SITE_URL}/icons/icon-512.png`;

function setMeta(attr, attrValue, content) {
  let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(data) {
  // Remove any existing JSON-LD scripts we previously added
  document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());

  const items = Array.isArray(data) ? data : [data];
  items.forEach(item => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-jsonld", "true");
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
}

/**
 * Directly manipulates <head> meta tags for SEO.
 * Works reliably in SPAs — no dependency on react-helmet-async.
 *
 * @param {Object} opts
 * @param {string} opts.title - Page title (will be appended with " | NomadBalance")
 * @param {string} [opts.description] - Meta description
 * @param {string} [opts.ogType] - "website" or "article"
 * @param {string} [opts.image] - OG image URL
 * @param {Object|Object[]} [opts.jsonLd] - JSON-LD structured data
 */
export default function useSEO({ title, description, ogType, image, jsonLd } = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} | NomadBalance` : "NomadBalance — Focus, Fuel, Move, Plan";
    const canonicalUrl = `${SITE_URL}${pathname.replace(/\/+$/, "") || "/"}`;
    const desc = description || DEFAULT_DESCRIPTION;
    const type = ogType || "website";
    const img = image || DEFAULT_IMAGE;

    // Title
    document.title = fullTitle;

    // Canonical
    setLink("canonical", canonicalUrl);

    // Standard meta
    setMeta("name", "description", desc);

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", "NomadBalance");
    setMeta("property", "og:image", img);

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);

    // JSON-LD
    if (jsonLd) {
      setJsonLd(jsonLd);
    }

    // Cleanup JSON-LD on unmount
    return () => {
      document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());
    };
  }, [title, description, ogType, image, jsonLd, pathname]);
}
