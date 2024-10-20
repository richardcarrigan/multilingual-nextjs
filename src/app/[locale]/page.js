import Container from '@/app/_components/container';
import HeroPost from '@/app/_components/hero-post';
import Intro from '@/app/_components/intro';
import MoreStories from '@/app/_components/more-stories';
import { getAllPosts } from '@/lib/api';
import LanguageSelect from '../_components/language-picker';

export default async function Index({ params }) {
  const allPosts = await getAllPosts(params.locale);

  const heroPost = allPosts[0];

  const morePosts = allPosts.slice(1);

  return (
    <main>
      <Container>
        <LanguageSelect locale={params.locale} />
        <Intro />
        <HeroPost
          title={heroPost.title}
          coverImage={heroPost.coverImage}
          date={heroPost.date}
          author={heroPost.author}
          slug={heroPost.slug}
          excerpt={heroPost.excerpt}
          locale={params.locale}
        />
        {morePosts.length > 0 && <MoreStories posts={morePosts} locale={params.locale} />}
      </Container>
    </main>
  );
}