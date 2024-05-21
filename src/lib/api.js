import posts from '@/data/posts.json';

export function getPostSlugs() {
  return posts.data.map(post => post.slug);
}

export function getPostBySlug(slug) {
  const post = posts.data.find(post => { return post.slug === slug });
  const { data, content } = post;

  return { ...data, slug, content };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
