/**
 * generate-static-pages.js
 *
 * Runs AFTER `vite build`. Reads the built dist/index.html as a template,
 * then generates route-specific HTML files with proper <title>, <meta>,
 * OG tags, canonical URL, and a minimal content preview inside <div id="root">
 * so that crawlers (Google, AdSense) see real content without executing JS.
 *
 * Usage: node scripts/generate-static-pages.js
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE_URL = "https://nomadbalance.app";

// ---------------------------------------------------------------------------
// 1. Parse blog data from source (pure string extraction, no eval)
// ---------------------------------------------------------------------------
function parseBlogData() {
  const src = fs.readFileSync(
    path.join(ROOT, "src/pages/blog/blogData.js"),
    "utf-8"
  );

  const posts = [];
  // Match each object block inside the array
  const objectRegex = /\{[^}]*slug:\s*"([^"]+)"[^}]*title:\s*"([^"]+)"[^}]*description:\s*"([^"]+)"[^}]*category:\s*"([^"]+)"[^}]*/g;
  let match;
  while ((match = objectRegex.exec(src)) !== null) {
    posts.push({
      slug: match[1],
      title: match[2],
      description: match[3],
      category: match[4],
    });
  }

  if (posts.length === 0) {
    console.warn("WARNING: No blog posts parsed from blogData.js");
  } else {
    console.log(`  Parsed ${posts.length} blog posts from blogData.js`);
  }

  return posts;
}

// ---------------------------------------------------------------------------
// 2. Static page metadata
// ---------------------------------------------------------------------------
const STATIC_PAGES = [
  {
    route: "/",
    title: "Remote Work Productivity App — Focus, Nutrition, Movement & Planning | NomadBalance",
    description:
      "NomadBalance is a free productivity app for remote workers. Focus timer with binaural audio, intermittent fasting tracker, guided desk exercises, and daily task planner — all in one PWA.",
    ogType: "website",
  },
  {
    route: "/about",
    title: "About NomadBalance | NomadBalance",
    description:
      "NomadBalance helps remote workers stay focused, healthy, and productive. Built for digital nomads and remote professionals worldwide.",
    ogType: "website",
  },
  {
    route: "/contact",
    title: "Contact Us | NomadBalance",
    description:
      "Get in touch with the NomadBalance team. We'd love to hear your feedback, suggestions, or questions about the app.",
    ogType: "website",
  },
  {
    route: "/blog",
    title: "Blog: Remote Work Productivity, Focus, Health & Planning | NomadBalance",
    description:
      "Expert articles on remote work productivity, focus techniques, nutrition, desk exercises, and daily planning for digital nomads and remote professionals.",
    ogType: "website",
  },
  {
    route: "/privacy",
    title: "Privacy Policy | NomadBalance",
    description:
      "NomadBalance privacy policy. Learn how we collect, use, and protect your personal data.",
    ogType: "website",
  },
  {
    route: "/cookies",
    title: "Cookie Policy | NomadBalance",
    description:
      "NomadBalance cookie policy. Understand how we use cookies and similar technologies on our site.",
    ogType: "website",
  },
  {
    route: "/terms",
    title: "Terms of Service | NomadBalance",
    description:
      "NomadBalance terms of service. Read the terms and conditions for using our productivity and wellness app.",
    ogType: "website",
  },
  // Guide pages
  {
    route: "/guide/pomodoro-focus-timer",
    title: "Pomodoro Technique Guide: Focus Timer for Productivity | NomadBalance",
    description:
      "Master the Pomodoro focus timer technique to boost your productivity. Learn how timed work sessions with breaks can transform your remote work routine.",
    ogType: "article",
  },
  {
    route: "/guide/intermittent-fasting-for-professionals",
    title: "Intermittent Fasting Guide for Professionals | NomadBalance",
    description:
      "A practical guide to intermittent fasting for busy professionals. Learn how strategic meal timing can boost your energy and focus throughout the workday.",
    ogType: "article",
  },
  {
    route: "/guide/desk-exercises-remote-workers",
    title: "Desk Exercises for Remote Workers: Stay Active at Your Desk | NomadBalance",
    description:
      "Quick desk exercises and stretches designed for remote workers. Combat sitting disease and boost productivity with movements you can do at your workstation.",
    ogType: "article",
  },
];

// ---------------------------------------------------------------------------
// 3. HTML generation helpers
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generateHtml(template, { title, description, canonicalUrl, ogType, contentPreview }) {
  let html = template;

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(title)}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
  );

  // Replace OG tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${escapeHtml(ogType)}" />`
  );

  // Insert minimal content preview inside <div id="root">
  // React will replace this entirely on hydration/mount
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${contentPreview}</div>`
  );

  return html;
}

function mkdirp(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writePage(template, routeDir, meta) {
  const canonicalUrl = `${SITE_URL}${meta.route === "/" ? "" : meta.route}`;
  const ogType = meta.ogType || "website";

  // Build a minimal content preview: heading + description paragraph
  const previewTitle = meta.title.replace(/ \| NomadBalance$/, "");
  const contentPreview = `<h1>${escapeHtml(previewTitle)}</h1><p>${escapeHtml(meta.description)}</p>`;

  const html = generateHtml(template, {
    title: meta.title,
    description: meta.description,
    canonicalUrl,
    ogType,
    contentPreview,
  });

  const outDir = path.join(DIST, routeDir);
  mkdirp(outDir);

  const outFile = path.join(outDir, "index.html");
  fs.writeFileSync(outFile, html, "utf-8");
}

// ---------------------------------------------------------------------------
// 4. Main
// ---------------------------------------------------------------------------
function main() {
  console.log("\n[generate-static-pages] Starting...\n");

  const templatePath = path.join(DIST, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error(`ERROR: ${templatePath} not found. Run "vite build" first.`);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf-8");

  // --- Static pages ---
  console.log("  Generating static pages...");
  for (const page of STATIC_PAGES) {
    const routeDir = page.route === "/" ? "" : page.route.slice(1); // remove leading /
    if (routeDir === "") {
      // Landing page: overwrite dist/index.html in-place
      const canonicalUrl = SITE_URL;
      const previewTitle = page.title.replace(/ \| NomadBalance$/, "");
      const contentPreview = `<h1>${escapeHtml(previewTitle)}</h1><p>${escapeHtml(page.description)}</p>`;
      const html = generateHtml(template, {
        title: page.title,
        description: page.description,
        canonicalUrl,
        ogType: page.ogType,
        contentPreview,
      });
      fs.writeFileSync(templatePath, html, "utf-8");
      console.log(`    / (index.html updated)`);
    } else {
      writePage(template, routeDir, page);
      console.log(`    /${routeDir}/index.html`);
    }
  }

  // --- Blog posts ---
  console.log("  Generating blog article pages...");
  const blogPosts = parseBlogData();
  for (const post of blogPosts) {
    const meta = {
      route: `/blog/${post.slug}`,
      title: `${post.title} | NomadBalance`,
      description: post.description,
      ogType: "article",
    };
    writePage(template, `blog/${post.slug}`, meta);
    console.log(`    /blog/${post.slug}/index.html`);
  }

  // Count total
  const total = STATIC_PAGES.length + blogPosts.length;
  console.log(`\n[generate-static-pages] Done! Generated ${total} pages.\n`);
}

main();
