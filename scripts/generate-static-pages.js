/**
 * generate-static-pages.js
 *
 * Runs AFTER `vite build`. For each public route, generates an HTML file
 * with proper <title>, <meta>, OG tags, and — critically — the actual
 * article body text extracted from the JSX source. This is what Google's
 * crawler and AdSense reviewers see instead of an empty <div id="root">.
 *
 * Key for SEO: every page includes internal <a href> links so Google can
 * discover and crawl all content pages. Blog index lists all articles,
 * each article links to related posts, landing page links to guides/blog.
 *
 * Usage: node scripts/generate-static-pages.js
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "../src/lib/jsonLd.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SRC = path.join(ROOT, "src");
const SITE_URL = "https://nomadbalance.app";

// ---------------------------------------------------------------------------
// 1. Parse blog data from source
// ---------------------------------------------------------------------------
function parseBlogData() {
  const src = fs.readFileSync(path.join(SRC, "pages/blog/blogData.js"), "utf-8");
  const posts = [];
  const re = /\{[^}]*slug:\s*"([^"]+)"[^}]*title:\s*"([^"]+)"[^}]*description:\s*"([^"]+)"[^}]*category:\s*"([^"]+)"[^}]*/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const block = m[0];
    const readTime = (block.match(/readTime:\s*"([^"]+)"/) || [])[1] || "";
    const date = (block.match(/date:\s*"([^"]+)"/) || [])[1] || "";
    posts.push({ slug: m[1], title: m[2], description: m[3], category: m[4], readTime, date });
  }
  console.log(`  Parsed ${posts.length} blog posts`);
  return posts;
}

// ---------------------------------------------------------------------------
// 2. Extract slug → component-file mapping from blogRoutes.js
//    Format: "slug": lazy(() => import("./FileName")),
// ---------------------------------------------------------------------------
function buildSlugToFileMap() {
  const routesSrc = fs.readFileSync(path.join(SRC, "pages/blog/blogRoutes.js"), "utf-8");
  const map = {};

  const re = /"([^"]+)":\s*lazy\(\(\)\s*=>\s*import\("\.\/(\w+)"\)\)/g;
  let m;
  while ((m = re.exec(routesSrc)) !== null) {
    map[m[1]] = path.join(SRC, "pages/blog", m[2] + ".jsx");
  }

  return map;
}

// ---------------------------------------------------------------------------
// 3. Extract readable text content from a JSX file
// ---------------------------------------------------------------------------
function extractArticleContent(jsxPath) {
  if (!fs.existsSync(jsxPath)) return "";
  const src = fs.readFileSync(jsxPath, "utf-8");

  const returnIdx = src.indexOf("return (");
  if (returnIdx === -1) return "";
  const jsx = src.slice(returnIdx);

  let html = jsx
    .replace(/\{[^{}]*\}/g, "")
    .replace(/<[A-Z]\w*\s*[^>]*\/>/g, "")
    .replace(/<Link[^>]*>/g, "").replace(/<\/Link>/g, "")
    .replace(/<Button[^>]*>/g, "").replace(/<\/Button>/g, "")
    .replace(/\s(className|style|onClick|onMouseDown|onTouchStart|aria-\w+|role|initial|animate|whileInView|viewport|transition|variants|key|id|htmlFor|dangerouslySetInnerHTML)="[^"]*"/g, "")
    .replace(/\s(className|style)=\{[^}]*\}/g, "")
    .replace(/<motion\.\w+/g, "<div").replace(/<\/motion\.\w+>/g, "</div>")
    .replace(/<nav[\s\S]*?<\/nav>/g, "")
    .replace(/<Footer\s*\/>/g, "")
    .replace(/<RelatedArticles\s*\/>/g, "")
    .replace(/<AuthorBio\s*\/>/g, "");

  const textParts = [];
  const tagRe = /<(h[1-6]|p|li|blockquote|strong|em|span)[^>]*>([\s\S]*?)<\/\1>/g;
  let tm;
  while ((tm = tagRe.exec(html)) !== null) {
    const tag = tm[1];
    let text = tm[2]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length > 10) {
      if (tag.startsWith("h")) {
        textParts.push(`<${tag}>${escapeHtml(text)}</${tag}>`);
      } else if (tag === "li") {
        textParts.push(`<li>${escapeHtml(text)}</li>`);
      } else {
        textParts.push(`<p>${escapeHtml(text)}</p>`);
      }
    }
  }

  return textParts.join("\n");
}

// ---------------------------------------------------------------------------
// 4. Generate blog index HTML with all articles linked
// ---------------------------------------------------------------------------
function generateBlogIndexContent(blogPosts) {
  const categories = {};
  for (const post of blogPosts) {
    if (!categories[post.category]) categories[post.category] = [];
    categories[post.category].push(post);
  }

  const categoryOrder = ["Focus", "Nutrition", "Movement", "Planning"];
  const categoryDescriptions = {
    Focus: "Techniques and strategies to achieve deep focus, manage distractions, and enter flow state while working remotely.",
    Nutrition: "Evidence-based nutrition guides for remote workers — meal timing, fasting, hydration, and brain-boosting foods.",
    Movement: "Desk exercises, ergonomic setups, and movement routines designed for people who sit at a computer all day.",
    Planning: "Daily planning methods, routines, and mental health strategies for productive and balanced remote work.",
  };

  let html = `<h1>Blog: Remote Work Productivity, Focus, Health &amp; Planning</h1>
<p>Expert articles on remote work productivity, focus techniques, nutrition, desk exercises, and daily planning for digital nomads and remote professionals. ${blogPosts.length} in-depth guides to help you work better from anywhere.</p>
<nav>
<p><a href="/">Home</a> · <a href="/about">About</a> · <a href="/guide/pomodoro-focus-timer">Pomodoro Guide</a> · <a href="/guide/intermittent-fasting-for-professionals">Fasting Guide</a> · <a href="/guide/desk-exercises-remote-workers">Exercise Guide</a></p>
</nav>`;

  for (const cat of categoryOrder) {
    const posts = categories[cat];
    if (!posts?.length) continue;

    html += `\n<h2>${escapeHtml(cat)} (${posts.length} articles)</h2>`;
    html += `\n<p>${escapeHtml(categoryDescriptions[cat] || "")}</p>`;
    html += "\n<ul>";
    for (const post of posts) {
      html += `\n<li><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a> — ${escapeHtml(post.description)}</li>`;
    }
    html += "\n</ul>";
  }

  return html;
}

// ---------------------------------------------------------------------------
// 5. Generate related articles HTML for a blog post
// ---------------------------------------------------------------------------
function generateRelatedArticles(currentSlug, currentCategory, blogPosts) {
  // Pick the related set by ROTATING through the list starting just past the
  // current article, rather than always taking the first few.
  //
  // With the old fixed slice every article in a category pointed at the same
  // three neighbours, so a handful of posts collected ~50 inbound internal
  // links while the median article had exactly one (from the blog index).
  // Rotating spreads inbound links evenly across all 47 articles.
  const globalIndex = Math.max(0, blogPosts.findIndex(p => p.slug === currentSlug));

  const rotate = (pool, count, offset) => {
    const candidates = pool.filter(p => p.slug !== currentSlug);
    if (!candidates.length) return [];
    const out = [];
    for (let i = 0; i < candidates.length && out.length < count; i++) {
      out.push(candidates[(offset + i) % candidates.length]);
    }
    return out;
  };

  const sameCat = blogPosts.filter(p => p.category === currentCategory);
  const otherCat = blogPosts.filter(p => p.category !== currentCategory);
  const related = [
    ...rotate(sameCat, 4, globalIndex + 1),
    ...rotate(otherCat, 2, globalIndex + 1),
  ];

  if (!related.length) return "";

  let html = `\n<hr>\n<h2>Related Articles</h2>\n<ul>`;
  for (const post of related) {
    html += `\n<li><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a> — ${escapeHtml(post.description)}</li>`;
  }
  html += `\n</ul>`;
  html += `\n<p><a href="/blog">View all ${blogPosts.length} articles</a></p>`;
  return html;
}

// ---------------------------------------------------------------------------
// 6. Generate landing page footer with links to guides and recent articles
// ---------------------------------------------------------------------------
function generateLandingFooterLinks(blogPosts) {
  const recentPosts = blogPosts.slice(0, 12);

  let html = `\n<hr>
<h2>In-Depth Guides</h2>
<ul>
<li><a href="/guide/pomodoro-focus-timer">Pomodoro Technique Guide: Focus Timer for Productivity</a> — Master timed work sessions with breaks to transform your remote work routine.</li>
<li><a href="/guide/intermittent-fasting-for-professionals">Intermittent Fasting Guide for Professionals</a> — Learn how strategic meal timing can boost your energy and focus throughout the workday.</li>
<li><a href="/guide/desk-exercises-remote-workers">Desk Exercises for Remote Workers</a> — Quick exercises and stretches designed for remote workers to combat sitting and boost productivity.</li>
</ul>

<h2>Latest Articles</h2>
<ul>`;
  for (const post of recentPosts) {
    html += `\n<li><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a> — ${escapeHtml(post.description)}</li>`;
  }
  html += `\n</ul>
<p><a href="/blog">Browse all ${blogPosts.length} articles</a></p>

<h2>Explore NomadBalance</h2>
<ul>
<li><a href="/about">About NomadBalance</a> — Our mission to help remote workers stay focused, healthy, and productive.</li>
<li><a href="/blog">Blog</a> — ${blogPosts.length} expert articles on remote work productivity, health, and wellness.</li>
<li><a href="/contact">Contact Us</a> — Get in touch with questions, feedback, or suggestions.</li>
</ul>`;

  return html;
}

// ---------------------------------------------------------------------------
// 7. Generate guide page footer with related blog links
// ---------------------------------------------------------------------------
function generateGuideFooterLinks(guideCategory, blogPosts) {
  const catMap = {
    "pomodoro-focus-timer": "Focus",
    "intermittent-fasting-for-professionals": "Nutrition",
    "desk-exercises-remote-workers": "Movement",
  };
  const category = catMap[guideCategory] || "Focus";
  // Link EVERY article in the category, not the first five. The three guides
  // are among the pages Google actually indexes, so using them as category
  // hubs gives each article an inbound link from an indexed page.
  const related = blogPosts.filter(p => p.category === category);

  let html = `\n<hr>\n<h2>Related Blog Articles</h2>\n<ul>`;
  for (const post of related) {
    html += `\n<li><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a> — ${escapeHtml(post.description)}</li>`;
  }
  html += `\n</ul>`;
  html += `\n<p><a href="/blog">Browse all ${blogPosts.length} articles</a> · <a href="/">Back to home</a></p>`;
  return html;
}

// ---------------------------------------------------------------------------
// 8. Static page metadata with source file paths
// ---------------------------------------------------------------------------
const STATIC_PAGES = [
  {
    route: "/",
    title: "Remote Work Productivity App — Focus, Nutrition, Movement & Planning | NomadBalance",
    description: "NomadBalance is a free productivity app for remote workers. Focus timer with binaural audio, intermittent fasting tracker, guided desk exercises, and daily task planner — all in one PWA.",
    ogType: "website",
    srcFile: path.join(SRC, "pages/LandingPage.jsx"),
  },
  {
    route: "/about",
    title: "About NomadBalance | NomadBalance",
    description: "NomadBalance helps remote workers stay focused, healthy, and productive. Built for digital nomads and remote professionals worldwide.",
    ogType: "website",
    srcFile: path.join(SRC, "pages/AboutPage.jsx"),
  },
  {
    route: "/contact",
    title: "Contact Us | NomadBalance",
    description: "Get in touch with the NomadBalance team. We'd love to hear your feedback, suggestions, or questions about the app.",
    ogType: "website",
    srcFile: path.join(SRC, "pages/ContactPage.jsx"),
  },
  {
    route: "/blog",
    title: "Blog: Remote Work Productivity, Focus, Health & Planning | NomadBalance",
    description: "Expert articles on remote work productivity, focus techniques, nutrition, desk exercises, and daily planning for digital nomads and remote professionals.",
    ogType: "website",
  },
  {
    route: "/privacy",
    title: "Privacy Policy | NomadBalance",
    description: "NomadBalance privacy policy. Learn how we collect, use, and protect your personal data.",
    ogType: "website",
    srcFile: path.join(SRC, "pages/PrivacyPolicy.jsx"),
  },
  {
    route: "/cookies",
    title: "Cookie Policy | NomadBalance",
    description: "NomadBalance cookie policy. Understand how we use cookies and similar technologies on our site.",
    ogType: "website",
    srcFile: path.join(SRC, "pages/CookiePolicy.jsx"),
  },
  {
    route: "/terms",
    title: "Terms of Service | NomadBalance",
    description: "NomadBalance terms of service. Read the terms and conditions for using our productivity and wellness app.",
    ogType: "website",
    srcFile: path.join(SRC, "pages/TermsOfService.jsx"),
  },
  {
    route: "/guide/pomodoro-focus-timer",
    title: "Pomodoro Technique Guide: Focus Timer for Productivity | NomadBalance",
    description: "Master the Pomodoro focus timer technique to boost your productivity. Learn how timed work sessions with breaks can transform your remote work routine.",
    ogType: "article",
    srcFile: path.join(SRC, "pages/guides/PomodoroGuide.jsx"),
  },
  {
    route: "/guide/intermittent-fasting-for-professionals",
    title: "Intermittent Fasting Guide for Professionals | NomadBalance",
    description: "A practical guide to intermittent fasting for busy professionals. Learn how strategic meal timing can boost your energy and focus throughout the workday.",
    ogType: "article",
    srcFile: path.join(SRC, "pages/guides/FastingGuide.jsx"),
  },
  {
    route: "/guide/desk-exercises-remote-workers",
    title: "Desk Exercises for Remote Workers: Stay Active at Your Desk | NomadBalance",
    description: "Quick desk exercises and stretches designed for remote workers. Combat sitting disease and boost productivity with movements you can do at your workstation.",
    ogType: "article",
    srcFile: path.join(SRC, "pages/guides/DeskExercisesGuide.jsx"),
  },
];

// ---------------------------------------------------------------------------
// 9. HTML helpers
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateHtml(template, { title, description, canonicalUrl, ogType, contentHtml, jsonLd, preloads }) {
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`);
  html = html.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${escapeHtml(ogType)}" />`);

  if (preloads && preloads.length) {
    const links = preloads
      .map(href => `<link rel="modulepreload" crossorigin href="${escapeHtml(href)}">`)
      .join("\n    ");
    html = html.replace("</head>", `    ${links}\n  </head>`);
  }

  // Structured data straight into the served HTML. react-helmet-async already
  // injects the same blocks once React mounts, but that only exists after the
  // page renders; emitting it here means it is there without running any JS.
  if (jsonLd && jsonLd.length) {
    const blocks = jsonLd
      .map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`)
      .join("\n    ");
    html = html.replace("</head>", `    ${blocks}\n  </head>`);
  }

  const wrappedContent = `<div id="root"><article>${contentHtml}</article></div>`;
  html = html.replace('<div id="root"></div>', wrappedContent);

  return html;
}

// ---------------------------------------------------------------------------
// 9a. Module preloads
//
// Every content route is lazy-loaded, so React mounts, empties #root (throwing
// away the prerendered article) and then shows the Suspense fallback until the
// route's chunk arrives. Measured, that leaves the page blank for a moment.
// Telling the browser up front which chunk this page needs lets it fetch it in
// parallel with the main bundle, so the first React render already has the
// article instead of a spinner.
// ---------------------------------------------------------------------------
function loadManifest() {
  const manifestPath = path.join(DIST, ".vite", "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.warn("  (no vite manifest — skipping module preloads)");
    return null;
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

function modulePreloadsFor(manifest, absSrcFile, alreadyInTemplate) {
  if (!manifest || !absSrcFile) return [];
  const key = path.relative(ROOT, absSrcFile).split(path.sep).join("/");
  const entry = manifest[key];
  if (!entry || !entry.isDynamicEntry) return [];

  const files = [entry.file];
  for (const imp of entry.imports || []) {
    const dep = manifest[imp];
    if (dep?.file) files.push(dep.file);
  }
  return [...new Set(files)]
    .map(f => `/${f}`)
    .filter(href => !alreadyInTemplate.has(href));
}

function templatePreloads(template) {
  const set = new Set();
  const re = /<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g;
  let m;
  while ((m = re.exec(template)) !== null) set.add(m[1]);
  // The entry bundle is already loaded by the template's module script.
  const entry = template.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/);
  if (entry) set.add(entry[1]);
  return set;
}

// ---------------------------------------------------------------------------
// 9b. Structured data per page type
// ---------------------------------------------------------------------------
function jsonLdForStaticPage(page, canonicalUrl, blogPosts) {
  const crumbs = [{ name: "Home", url: SITE_URL }];

  if (page.route === "/") {
    return [organizationJsonLd(), websiteJsonLd()];
  }

  if (page.route === "/blog") {
    crumbs.push({ name: "Blog", url: `${SITE_URL}/blog` });
    return [
      organizationJsonLd(),
      websiteJsonLd(),
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${SITE_URL}/blog`,
        name: "NomadBalance Blog",
        description: page.description,
        url: `${SITE_URL}/blog`,
        blogPost: blogPosts.map(post => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          url: `${SITE_URL}/blog/${post.slug}`,
          ...(post.date && { datePublished: post.date }),
          articleSection: post.category,
        })),
      },
      breadcrumbJsonLd(crumbs),
    ];
  }

  if (page.route.startsWith("/guide/")) {
    const slug = page.route.split("/").pop();
    const base = articleJsonLd({
      title: page.title.replace(/ \| NomadBalance$/, ""),
      description: page.description,
      slug,
    });
    crumbs.push({ name: "Guides", url: `${SITE_URL}/blog` });
    return [
      { ...base, url: canonicalUrl, mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl } },
      breadcrumbJsonLd([...crumbs, { name: page.title.replace(/ \| NomadBalance$/, ""), url: canonicalUrl }]),
    ];
  }

  return [breadcrumbJsonLd([...crumbs, { name: page.title.replace(/ \| NomadBalance$/, ""), url: canonicalUrl }])];
}

function jsonLdForPost(post, canonicalUrl) {
  return [
    articleJsonLd({
      title: post.title,
      description: post.description,
      slug: post.slug,
      datePublished: post.date || undefined,
      readTime: post.readTime || undefined,
      category: post.category,
    }),
    breadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: "Blog", url: `${SITE_URL}/blog` },
      { name: post.title, url: canonicalUrl },
    ]),
  ];
}

// ---------------------------------------------------------------------------
// 10. Main
// ---------------------------------------------------------------------------
function main() {
  console.log("\n[generate-static-pages] Starting...\n");

  const templatePath = path.join(DIST, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error(`ERROR: ${templatePath} not found. Run "vite build" first.`);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf-8");
  const manifest = loadManifest();
  const basePreloads = templatePreloads(template);
  const slugToFile = buildSlugToFileMap();
  const blogPosts = parseBlogData();
  let totalContentChars = 0;

  // --- Static pages ---
  console.log("  Generating static pages...");
  for (const page of STATIC_PAGES) {
    const canonicalUrl = `${SITE_URL}${page.route === "/" ? "" : page.route}`;
    let contentHtml = "";

    if (page.route === "/blog") {
      contentHtml = generateBlogIndexContent(blogPosts);
    } else if (page.srcFile) {
      contentHtml = extractArticleContent(page.srcFile);
    }

    if (!contentHtml) {
      const previewTitle = page.title.replace(/ \| NomadBalance$/, "");
      contentHtml = `<h1>${escapeHtml(previewTitle)}</h1><p>${escapeHtml(page.description)}</p>`;
    }

    if (page.route === "/") {
      contentHtml += generateLandingFooterLinks(blogPosts);
    } else if (page.route.startsWith("/guide/")) {
      const guideSlug = page.route.split("/").pop();
      contentHtml += generateGuideFooterLinks(guideSlug, blogPosts);
    }

    totalContentChars += contentHtml.length;

    const html = generateHtml(template, {
      title: page.title,
      description: page.description,
      canonicalUrl,
      ogType: page.ogType || "website",
      contentHtml,
      jsonLd: jsonLdForStaticPage(page, canonicalUrl, blogPosts),
      preloads: modulePreloadsFor(
        manifest,
        page.route === "/blog" ? path.join(SRC, "pages/blog/BlogIndex.jsx") : page.srcFile,
        basePreloads,
      ),
    });

    if (page.route === "/") {
      fs.writeFileSync(templatePath, html, "utf-8");
      console.log(`    / (index.html — ${contentHtml.length} chars)`);
    } else {
      const outDir = path.join(DIST, page.route.slice(1));
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html, "utf-8");
      console.log(`    ${page.route} (${contentHtml.length} chars)`);
    }
  }

  // --- Blog posts ---
  console.log("  Generating blog article pages...");
  let articlesWithContent = 0;

  for (const post of blogPosts) {
    const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
    const jsxFile = slugToFile[post.slug];
    let contentHtml = "";

    if (jsxFile) {
      contentHtml = extractArticleContent(jsxFile);
    }

    if (contentHtml.length > 100) {
      articlesWithContent++;
    } else {
      contentHtml = `<h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.description)}</p>`;
    }

    contentHtml += `\n<nav><p><a href="/">Home</a> · <a href="/blog">Blog</a> · ${escapeHtml(post.category)}</p></nav>`;
    contentHtml += generateRelatedArticles(post.slug, post.category, blogPosts);

    totalContentChars += contentHtml.length;

    const html = generateHtml(template, {
      title: `${post.title} | NomadBalance`,
      description: post.description,
      canonicalUrl,
      ogType: "article",
      contentHtml,
      jsonLd: jsonLdForPost(post, canonicalUrl),
      preloads: modulePreloadsFor(manifest, jsxFile, basePreloads),
    });

    const outDir = path.join(DIST, "blog", post.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html, "utf-8");
  }

  console.log(`  ${articlesWithContent}/${blogPosts.length} articles with extracted body content`);

  const total = STATIC_PAGES.length + blogPosts.length;
  console.log(`\n[generate-static-pages] Done! ${total} pages, ~${Math.round(totalContentChars / 1024)} KB of content.\n`);
}

main();
