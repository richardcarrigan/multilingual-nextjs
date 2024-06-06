import fs from "fs";
import matter from "gray-matter";
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
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

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
