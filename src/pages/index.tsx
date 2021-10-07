import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
import Link from 'next/link';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from "react-icons/fi";

import { Main } from 'next/document';
import { useState } from 'react';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(posts: HomeProps) {
  const { next_page, results } = posts.postsPagination;
  const [postsData, setPostsData] = useState(results);
  const [nextPost, setNextPost] = useState(next_page);
  async function handlePagination() {
    await fetch(nextPost)
      .then((data) => data.json())
      .then((data) => {
        setNextPost(data.next_page);
        const posts = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR }),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author
            }
          }
        })
        setPostsData([
          ...postsData,
          ...posts
        ])
      })
  }

  return (
    <>
      <Head>
        <title>
          Space Traveling | Home
        </title>
      </Head>
      <main className={styles.container}>
        <Header />
        <div className={styles.post}>
          {postsData.map(post => (
            <Link href={`/post/${post.uid}`}>
              <a key={post.uid}>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <div>
                    <FiCalendar />  <time>  {format(new Date(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })}</time>
                  </div>
                  <div>
                    <FiUser /> <span>  {post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          {nextPost &&
            <div>
              <button onClick={handlePagination} >
                Carregar mais posts
              </button>
            </div>
          }
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 1,
  });


  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })
  //console.log(JSON.stringify(postsResponse, null, 2))

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    }
  }
};
