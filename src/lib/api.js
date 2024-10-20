import axios from 'axios';
import posts from '@/data/posts.json';

export function getPostSlugs() {
  return posts.data.map(post => post.slug);
}

export async function getPostBySlug(slug, locale) {
  const post = posts.data.find(post => { return post.slug === slug });
  let { data, content } = post;

  data.title = await translate(locale, data.title);
  data.excerpt = await translate(locale, data.excerpt);
  content = await translate(locale, content);

  return { ...data, slug, content };
}

export async function getAllPosts(locale) {
  const slugs = getPostSlugs();
  let posts = await Promise.all(slugs.map(async (slug) => await getPostBySlug(slug, locale)));
  posts = posts
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

  return posts;
}

async function translate(locale, text) {
  const subscriptionKey = process.env.AZURE_SUBSCRIPTION_KEY;
  const endpoint = 'https://api.cognitive.microsofttranslator.com';
  const path = '/translate?api-version=3.0';
  const language = locale.split('-')[0];

  const url = `${endpoint}${path}&to=${language}`;

  const response = await axios({
    method: 'post',
    url,
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Ocp-Apim-Subscription-Region': 'centralus',
      'Content-Type': 'application/json',
    },
    data: [{
      'text': text
    }]
  });

  return response.data[0].translations[0].text;
}
