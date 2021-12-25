import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getSortedPostsData } from "../lib/posts";
import Link from "next/link";
import Date from "../components/date";
import { gql, useQuery } from "@apollo/client";

const GetPosts = gql`
  query getPosts {
    getPosts {
      _id
      title
      createdAt
      updatedAt
    }
  }
`;

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
  const { data, loading, error } = useQuery(GetPosts)
  if(loading) return <p>Loading...</p>
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>[Your Self Introduction]</p>
        <p>
          (This is a sample website - you’ll be building a site like this on{" "}
          <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {data.getPosts.map(({ _id, createdAt, title }) => (
            <li className={utilStyles.listItem} key={_id}>
              <Link href={`/posts/${_id}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={createdAt} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
