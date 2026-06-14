/**
 * Sea Life Planet static site builder.
 * Reads Markdown + YAML frontmatter from _build/content/** and renders
 * static <slug>/index.html files into the repo root using Handlebars
 * templates from _build/templates/**.
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');
const Handlebars = require('handlebars');
const { marked } = require('marked');

const BUILD = __dirname;
const ROOT = path.join(BUILD, '..');
const TEMPLATES = path.join(BUILD, 'templates');
const CONTENT = path.join(BUILD, 'content');
const DATA = path.join(BUILD, 'data');

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const site = yaml.load(fs.readFileSync(path.join(DATA, 'site.yaml'), 'utf8'));
const authors = yaml.load(fs.readFileSync(path.join(DATA, 'authors.yaml'), 'utf8'));
const currentYear = new Date().getFullYear();

// ---------------------------------------------------------------------------
// Handlebars setup
// ---------------------------------------------------------------------------
Handlebars.registerHelper('eq', (a, b) => a === b);

const ICONS = {
  facebook: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3H13v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>',
  instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5zM17.5 6a1 1 0 1 0 1 1 1 1 0 0 0-1-1z"/></svg>',
  youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2s-.21-1.5-.87-2.16c-.83-.87-1.76-.87-2.18-.92C15.6 4 12 4 12 4h-.01s-3.6 0-6.55.12c-.42.05-1.35.05-2.18.92-.66.66-.87 2.16-.87 2.16S2.18 9 2.18 10.8v1.39C2.18 13.99 2.4 15.79 2.4 15.79s.21 1.5.87 2.16c.83.87 1.92.84 2.4.93 1.74.17 7.33.22 7.33.22s3.6-.01 6.55-.13c.42-.05 1.35-.05 2.18-.92.66-.66.87-2.16.87-2.16s.22-1.8.22-3.6v-1.39c0-1.8-.22-3.6-.22-3.6zM9.96 14.98v-5.7l5.4 2.86-5.4 2.84z"/></svg>',
  pinterest: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.6 7.86 6.3 9.36-.09-.8-.16-2.02.03-2.89.18-.78 1.16-4.95 1.16-4.95s-.3-.59-.3-1.46c0-1.37.79-2.39 1.78-2.39.84 0 1.24.63 1.24 1.38 0 .84-.54 2.1-.81 3.27-.23.98.49 1.78 1.46 1.78 1.75 0 3.1-1.85 3.1-4.5 0-2.35-1.69-4-4.1-4-2.79 0-4.43 2.09-4.43 4.26 0 .84.32 1.74.72 2.23.08.1.09.18.07.28-.08.31-.25 1-.28 1.14-.04.18-.15.22-.34.13-1.26-.59-2.05-2.43-2.05-3.91 0-3.18 2.31-6.11 6.67-6.11 3.5 0 6.22 2.49 6.22 5.83 0 3.48-2.19 6.28-5.24 6.28-1.02 0-1.98-.53-2.31-1.16 0 0-.5 1.93-.63 2.4-.23.86-.84 1.94-1.25 2.6.94.29 1.94.45 2.98.45 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  fish: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12c2.5-4 6.5-6 10-6 4.5 0 8 2.5 10 6-2 3.5-5.5 6-10 6-3.5 0-7.5-2-10-6z"/><circle cx="15" cy="10.5" r="0.8" fill="currentColor"/><path d="M2 12c1.3-1 2.5-1.6 3.5-2M2 12c1.3 1 2.5 1.6 3.5 2"/></svg>',
  droplet: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/></svg>',
  cart: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none"/><path d="M2.5 3h2l2.6 12.6a1.8 1.8 0 0 0 1.8 1.4h9.2a1.8 1.8 0 0 0 1.76-1.43L21.5 7H6"/></svg>',
  book: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H12v18H5.5A1.5 1.5 0 0 1 4 19.5v-15z"/><path d="M20 4.5A1.5 1.5 0 0 0 18.5 3H12v18h6.5a1.5 1.5 0 0 0 1.5-1.5v-15z"/></svg>',
  leaf: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4c-7 0-13 4-15 11 2 1 5 2 8 1 6-1.5 9-6.5 9-12 0 0-1-0.1-2 0z"/><path d="M5 19c2-4 5-6.5 9-8"/></svg>',
};
Handlebars.registerHelper('icon', (name) => new Handlebars.SafeString(ICONS[name] || ''));

const partialsDir = path.join(TEMPLATES, 'partials');
for (const file of fs.readdirSync(partialsDir)) {
  if (!file.endsWith('.hbs') || file === 'icon.hbs') continue;
  Handlebars.registerPartial(file.replace(/\.hbs$/, ''), fs.readFileSync(path.join(partialsDir, file), 'utf8'));
}

const layoutsDir = path.join(TEMPLATES, 'layouts');
const layouts = {};
for (const file of fs.readdirSync(layoutsDir)) {
  if (!file.endsWith('.hbs')) continue;
  layouts[file.replace(/\.hbs$/, '')] = Handlebars.compile(fs.readFileSync(path.join(layoutsDir, file), 'utf8'));
}

// ---------------------------------------------------------------------------
// Markdown rendering with heading slugs / TOC capture
// ---------------------------------------------------------------------------
let currentHeadings = [];
let slugCounts = {};

function slugify(str) {
  return str.toLowerCase().trim()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z0-9#]+;/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

marked.use({
  renderer: {
    heading(token) {
      const text = this.parser.parseInline(token.tokens);
      const plain = text.replace(/<[^>]+>/g, '');
      let slug = slugify(plain);
      if (slugCounts[slug] !== undefined) {
        slugCounts[slug] += 1;
        slug = `${slug}-${slugCounts[slug]}`;
      } else {
        slugCounts[slug] = 0;
      }
      if (token.depth === 2) {
        currentHeadings.push({ id: slug, text: plain });
      }
      return `<h${token.depth} id="${slug}">${text}</h${token.depth}>\n`;
    },
  },
});

function renderMarkdown(md) {
  currentHeadings = [];
  slugCounts = {};
  const html = marked.parse(md || '');
  return { html, headings: currentHeadings.slice() };
}

function stripMd(str) {
  return String(str || '')
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getOutputUrl(slug) {
  if (slug === '' || slug === 'home') return '/';
  return `/${slug}/`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function readingTime(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function readContentFiles(subdir) {
  const dir = path.join(CONTENT, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const parsed = matter(raw);
      return { file: f, data: parsed.data, content: parsed.content };
    });
}

// ---------------------------------------------------------------------------
// Pass 1: build an index of all articles for related-content lookups
// ---------------------------------------------------------------------------
const articleFiles = readContentFiles('articles');
const articleIndex = {};
for (const { data } of articleFiles) {
  articleIndex[data.slug] = {
    title: data.title,
    url: getOutputUrl(data.slug),
    image: data.image || '/assets/img/placeholder.svg',
    imageAlt: data.imageAlt || data.title,
    excerpt: data.excerpt || data.description,
    tag: data.categoryLabel,
  };
}

function resolveRelated(slugs) {
  return (slugs || [])
    .map((slug) => articleIndex[slug])
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Schema.org JSON-LD
// ---------------------------------------------------------------------------
function buildSchemaGraph(data, ctx) {
  const graph = [];

  graph.push({
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    url: `${site.url}/`,
    logo: `${site.url}/assets/img/favicon.svg`,
    sameAs: site.social.map((s) => s.url),
  });

  graph.push({
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: `${site.url}/`,
    name: site.name,
    description: site.description,
    publisher: { '@id': `${site.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${site.url}/?s={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });

  if (data.type !== 'home') {
    const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` }];
    (ctx.breadcrumbs || []).forEach((b, i) => {
      items.push({
        '@type': 'ListItem',
        position: i + 2,
        name: b.label,
        item: `${site.url}${b.url || ctx.url}`,
      });
    });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: items });
  }

  if (data.type === 'article') {
    graph.push({
      '@type': 'Article',
      '@id': `${site.url}${ctx.url}#article`,
      headline: data.title,
      description: data.description,
      image: data.image ? `${site.url}${data.image}` : undefined,
      datePublished: data.datePublished,
      dateModified: data.dateModified || data.datePublished,
      author: {
        '@type': 'Person',
        name: ctx.author ? ctx.author.name : undefined,
        description: ctx.author ? ctx.author.bio : undefined,
        url: `${site.url}/about/`,
      },
      publisher: { '@id': `${site.url}/#organization` },
      mainEntityOfPage: `${site.url}${ctx.url}`,
    });
  }

  if (data.type === 'hub') {
    graph.push({
      '@type': 'CollectionPage',
      '@id': `${site.url}${ctx.url}#collection`,
      name: data.title,
      description: data.description,
      url: `${site.url}${ctx.url}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: (ctx.allListed || []).map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${site.url}${a.url}`,
          name: a.title,
        })),
      },
    });
  }

  if (ctx.faq && ctx.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: ctx.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.aPlain },
      })),
    });
  }

  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, (k, v) => (v === undefined ? undefined : v), 2);
  return json.replace(/<\/script>/g, '<\\/script>');
}

// ---------------------------------------------------------------------------
// Page rendering
// ---------------------------------------------------------------------------
const sitemapEntries = [];
let totalPages = 0;

function writeOutput(outPath, html) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
}

function buildBreadcrumbs(data) {
  const crumbs = [];
  if (data.type === 'article' && data.categoryLabel) {
    crumbs.push({ label: data.categoryLabel, url: data.categoryUrl });
  }
  crumbs.push({ label: data.title });
  return crumbs;
}

function renderPage({ data, content, layout }) {
  const url = getOutputUrl(data.slug);
  const { html: contentHtml, headings } = renderMarkdown(content);

  const ctx = {
    site,
    currentYear,
    title: data.title,
    description: data.description,
    url,
    image: data.image,
    ogType: data.type === 'article' ? 'article' : 'website',
    robots: data.robots,
    contentHtml,
    breadcrumbs: buildBreadcrumbs(data),
  };

  if (data.type === 'article') {
    const author = authors[data.author] || Object.values(authors)[0];
    ctx.author = author;
    ctx.categoryLabel = data.categoryLabel;
    ctx.categoryUrl = data.categoryUrl;
    ctx.datePublished = data.datePublished;
    ctx.dateModified = data.dateModified;
    ctx.datePublishedDisplay = formatDate(data.datePublished);
    ctx.dateModifiedDisplay = data.dateModified ? formatDate(data.dateModified) : '';
    ctx.readingTime = readingTime(content);
    ctx.heroImage = data.image
      ? {
          src: data.image,
          alt: data.imageAlt || data.title,
          width: data.imageWidth || 1200,
          height: data.imageHeight || 800,
          caption: data.imageCaption,
        }
      : null;
    ctx.quickFacts = data.quickFacts;
    if (data.showToc !== false && headings.length > 1) {
      ctx.toc = headings;
    }
    ctx.affiliateProducts = (data.affiliateProducts || []).map((p) => ({ ...p, amazonTag: site.amazonTag }));
    ctx.sources = data.sources;
    ctx.related = resolveRelated(data.related);
  }

  if (data.type === 'hub') {
    ctx.intro = data.intro;
    ctx.groups = (data.groups || []).map((g) => ({
      title: g.title,
      articles: resolveRelated(g.slugs),
    }));
    ctx.allListed = ctx.groups.flatMap((g) => g.articles);
  }

  if (data.type === 'home') {
    ctx.hero = data.hero;
    ctx.categories = data.categories;
    ctx.featured = {
      heading: data.featured.heading,
      subheading: data.featured.subheading,
      items: resolveRelated(data.featured.items),
    };
  }

  if (data.faq) {
    ctx.faq = data.faq.map((f) => ({
      q: f.q,
      aHtml: `<p>${marked.parseInline(f.a)}</p>`,
      aPlain: stripMd(f.a),
    }));
  }

  ctx.schemaJson = buildSchemaGraph(data, ctx);

  const html = layouts[layout](ctx);

  let outPath;
  if (data.slug === '404') {
    outPath = path.join(ROOT, '404.html');
  } else if (url === '/') {
    outPath = path.join(ROOT, 'index.html');
  } else {
    outPath = path.join(ROOT, data.slug, 'index.html');
  }
  writeOutput(outPath, html);
  totalPages++;

  if (data.robots !== 'noindex') {
    sitemapEntries.push({ url, lastmod: data.dateModified || data.datePublished || null });
  }
}

// ---------------------------------------------------------------------------
// Build all content
// ---------------------------------------------------------------------------
for (const { data, content } of readContentFiles('pages')) {
  renderPage({ data, content, layout: data.type === 'home' ? 'home' : 'page' });
}
for (const { data, content } of readContentFiles('hubs')) {
  renderPage({ data, content, layout: 'hub' });
}
for (const { data, content } of articleFiles) {
  renderPage({ data, content, layout: 'article' });
}

// ---------------------------------------------------------------------------
// sitemap.xml
// ---------------------------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries
  .map((e) => `  <url>\n    <loc>${site.url}${e.url}</loc>\n    <lastmod>${e.lastmod || today}</lastmod>\n  </url>`)
  .join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml);

console.log(`Built ${totalPages} pages (${sitemapEntries.length} in sitemap.xml).`);
