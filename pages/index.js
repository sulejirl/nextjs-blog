import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import Date from "../components/date";
import Firebase from "../components/FirebaseAuth";
import Modal from "../components/Modal";
import ProfileMenu from "../components/ProfileMenu";
import { Backdrop } from '@mui/material';

import { useAuth } from "../contexts/firebaseContext";


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


export default function Home() {
  const { data, loading, error } = useQuery(GetPosts)
  const { user } = useAuth();
  if(loading) return <Backdrop/>
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"></link>
      </Head>
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
