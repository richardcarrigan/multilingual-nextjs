import Container from '@/app/_components/container';
import HeroPost from '@/app/_components/hero-post';
import Intro from '@/app/_components/intro';
import MoreStories from '@/app/_components/more-stories';
import { getAllPosts } from '@/lib/api';
import LanguageSelect from '../_components/language-picker';

export default function Index({params}) {
  const allPosts = getAllPosts(params.lang);

  const heroPost = allPosts[0];

  const morePosts = allPosts.slice(1);

  return (
    <main>
      <Container>
        <LanguageSelect lang={params.lang} />
        <Intro />
        <HeroPost
          title={heroPost.title}
          coverImage={heroPost.coverImage}
          date={heroPost.date}
          author={heroPost.author}
          slug={heroPost.slug}
          excerpt={heroPost.excerpt}
          lang={params.lang}
        />
        {morePosts.length > 0 && <MoreStories posts={morePosts} lang={params.lang} />}
      </Container>
    </main>
  );
}