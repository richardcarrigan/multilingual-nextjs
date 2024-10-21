import fs from "fs";
import { DomUtils, parseDocument } from "htmlparser2";
import serialize from 'dom-serializer';
import { join } from "path";

const defaultLocale = 'en-US';

export function getPostSlugs(language) {
  let selectedLocale = language || defaultLocale;
  const postsDirectory = join(
    process.cwd(),
    `_posts/${selectedLocale.toLowerCase()}`
  );
  return fs.readdirSync(postsDirectory);
}
  
export function getPostBySlug(language, slug) {
  let selectedLocale = language || defaultLocale;
  const postsDirectory = join(
    process.cwd(),
    `_posts/${selectedLocale.toLowerCase()}`
  );
  const realSlug = slug.replace(/\.html$/, '');
  const fullPath = join(postsDirectory, `${realSlug}.html`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const document = parseDocument(fileContents);

  const head = DomUtils.findOne(el => el.tagName === 'head', document.children);
  const body = DomUtils.findOne(el => el.tagName = 'body', document.children);

  const metaTags = DomUtils.findAll(el => el.tagName === 'meta', head.children);
  const data = {};
  metaTags.forEach(tag => {
    const name = tag.attribs.name;
    const content = tag.attribs.content;
    if (name && content) {
      if(name === 'author' || name === 'author_picture') {
        data.author = { name: '', picture: '' };
        if(name === 'author') {
          data.author.name = content;
        } else {
          data.author.picture = content;
        }
      } else {
        data[name] = content;
      }
    }
  });

  const content = serialize(body);

  return { ...data, slug: realSlug, content };
}
  
export function getAllPosts(language) {
  const slugs = getPostSlugs(language);
  const posts = slugs
    .map((slug) => getPostBySlug(language, slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
