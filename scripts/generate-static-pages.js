/**
 * generate-static-pages.js
 *
 * Runs AFTER `vite build`. For each public route, generates an HTML file
 * with proper <title>, <meta>, OG tags, and — critically — the actual
 * article body text extracted from the JSX source. This is what Google's
 * crawler and AdSense reviewers see instead of an empty <div id="root">.
 *
 * Usage: node scripts/generate-static-pages.js
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
    posts.push({ slug: m[1], title: m[2], description: m[3], category: m[4] });
  }
  console.log(`  Parsed ${posts.length} blog posts`);
  return posts;
}

// ---------------------------------------------------------------------------
// 2. Extract slug → component-file mapping from App.jsx routes
// ---------------------------------------------------------------------------
function buildSlugToFileMap() {
  const appSrc = fs.readFileSync(path.join(SRC, "App.jsx"), "utf-8");
  const map = {};

  // Extract imports: import CompName from '@/pages/blog/CompName';
  const imports = {};
  const importRe = /import\s+(\w+)\s+from\s+['"]@\/pages\/blog\/(\w+)['"]/g;
  let im;
  while ((im = importRe.exec(appSrc)) !== null) {
    imports[im[1]] = im[2]; // CompName → filename (without .jsx)
  }

  // Extract routes: <Route path="/blog/slug" element={<CompName />} />
  const routeRe = /path="\/blog\/([^"]+)"[^>]*element=\{<(\w+)/g;
  let rm;
  while ((rm = routeRe.exec(appSrc)) !== null) {
    const slug = rm[1];
    const comp = rm[2];
    if (imports[comp]) {
      map[slug] = path.join(SRC, "pages/blog", imports[comp] + ".jsx");
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// 3. Extract readable text content from a JSX file
// ---------------------------------------------------------------------------
function extractArticleContent(jsxPath) {
  if (!fs.existsSync(jsxPath)) return "";
  const src = fs.readFileSync(jsxPath, "utf-8");

  // Find the return ( ... ) block
  const returnIdx = src.indexOf("return (");
  if (returnIdx === -1) return "";
  const jsx = src.slice(returnIdx);

  // Strip JSX-specific syntax to get clean HTML-like content
  let html = jsx
    // Remove JSX expressions: {variable}, {condition && ...}, {`template`}
    .replace(/\{[^{}]*\}/g, "")
    // Remove component self-closing tags: <Brain />, <CheckCircle />, etc.
    .replace(/<[A-Z]\w*\s*[^>]*\/>/g, "")
    // Remove component opening/closing tags: <Link to="...">...</Link>
    .replace(/<Link[^>]*>/g, "").replace(/<\/Link>/g, "")
    .replace(/<Button[^>]*>/g, "").replace(/<\/Button>/g, "")
    // Remove className, style, and other JSX props
    .replace(/\s(className|style|onClick|onMouseDown|onTouchStart|aria-\w+|role|initial|animate|whileInView|viewport|transition|variants|key|id|htmlFor|dangerouslySetInnerHTML)="[^"]*"/g, "")
    .replace(/\s(className|style)=\{[^}]*\}/g, "")
    // Remove motion.div → div
    .replace(/<motion\.\w+/g, "<div").replace(/<\/motion\.\w+>/g, "</div>")
    // Remove nav, footer wrapper components (keep article content)
    .replace(/<nav[\s\S]*?<\/nav>/g, "")
    .replace(/<Footer\s*\/>/g, "")
    .replace(/<RelatedArticles\s*\/>/g, "")
    .replace(/<AuthorBio\s*\/>/g, "");

  // Extract text from remaining HTML-like tags
  const textParts = [];
  // Match heading and paragraph tags with their content
  const tagRe = /<(h[1-6]|p|li|blockquote|strong|em|span)[^>]*>([\s\S]*?)<\/\1>/g;
  let tm;
  while ((tm = tagRe.exec(html)) !== null) {
    const tag = tm[1];
    let text = tm[2]
      .replace(/<[^>]+>/g, "") // strip nested tags
      .replace(/\s+/g, " ")   // normalize whitespace
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
// 4. Extract content from non-blog pages (landing, about, guides, etc.)
// ---------------------------------------------------------------------------
function extractPageContent(pagePath) {
  if (!fs.existsSync(pagePath)) return "";
  return extractArticleContent(pagePath);
}

// ---------------------------------------------------------------------------
// 5. Static page metadata with source file paths
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
    srcFile: path.join(SRC, "pages/blog/BlogIndex.jsx"),
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
// 6. HTML helpers
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateHtml(template, { title, description, canonicalUrl, ogType, contentHtml }) {
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`);
  html = html.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${escapeHtml(ogType)}" />`);

  // Insert article content inside <div id="root"> — React replaces it on mount
  const wrappedContent = `<div id="root"><article>${contentHtml}</article></div>`;
  html = html.replace('<div id="root"></div>', wrappedContent);

  return html;
}

// ---------------------------------------------------------------------------
// 7. Main
// ---------------------------------------------------------------------------
function main() {
  console.log("\n[generate-static-pages] Starting...\n");

  const templatePath = path.join(DIST, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error(`ERROR: ${templatePath} not found. Run "vite build" first.`);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf-8");
  const slugToFile = buildSlugToFileMap();
  let totalContentChars = 0;

  // --- Static pages ---
  console.log("  Generating static pages...");
  for (const page of STATIC_PAGES) {
    const canonicalUrl = `${SITE_URL}${page.route === "/" ? "" : page.route}`;
    let contentHtml = "";

    if (page.srcFile) {
      contentHtml = extractPageContent(page.srcFile);
    }
    if (!contentHtml) {
      const previewTitle = page.title.replace(/ \| NomadBalance$/, "");
      contentHtml = `<h1>${escapeHtml(previewTitle)}</h1><p>${escapeHtml(page.description)}</p>`;
    }

    totalContentChars += contentHtml.length;

    const html = generateHtml(template, {
      title: page.title,
      description: page.description,
      canonicalUrl,
      ogType: page.ogType || "website",
      contentHtml,
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
  const blogPosts = parseBlogData();
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
      // Fallback: at least title + description
      contentHtml = `<h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.description)}</p>`;
    }

    totalContentChars += contentHtml.length;

    const html = generateHtml(template, {
      title: `${post.title} | NomadBalance`,
      description: post.description,
      canonicalUrl,
      ogType: "article",
      contentHtml,
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
