import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Allah-Hu-Autos';
export const SITE_URL = 'https://allahhuautos.online';
const DEFAULT_IMAGE = `${SITE_URL}/logo.webp`;

type JsonLd = Record<string, unknown> | Record<string, unknown>[];

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string | null;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  jsonLd?: JsonLd;
}

const absoluteUrl = (value?: string | null) => {
  if (!value) return DEFAULT_IMAGE;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value));
};

const upsertLink = (rel: string, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const upsertJsonLd = (jsonLd?: JsonLd) => {
  const id = 'page-json-ld';
  let element = document.getElementById(id) as HTMLScriptElement | null;
  if (!jsonLd) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(jsonLd);
};

export const buildTitle = (title: string) => (
  title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
);

const SEO = ({
  title,
  description,
  canonicalPath,
  image,
  type = 'website',
  noindex = false,
  jsonLd,
}: SEOProps) => {
  const location = useLocation();
  const canonical = `${SITE_URL}${canonicalPath || location.pathname}`;
  const pageTitle = buildTitle(title);
  const imageUrl = absoluteUrl(image);

  useEffect(() => {
    document.title = pageTitle;

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type === 'product' ? 'product' : type });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
    upsertLink('canonical', canonical);
    upsertJsonLd(jsonLd);
  }, [canonical, description, imageUrl, jsonLd, noindex, pageTitle, type]);

  return null;
};

export default SEO;
