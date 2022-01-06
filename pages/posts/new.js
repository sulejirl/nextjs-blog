import Head from "next/head";
import Layout, { siteTitle } from "../../components/layout";
import TextEditor from "../../components/TextEditor/text-editor";
import { Backdrop } from '@mui/material';

export default function NewPost() {
  if(false) return <Backdrop/>
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
        <p>
          (This is a sample website - you’ll be building a site like this on{" "}
          <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
        </p>
        <section>
          <TextEditor />
        </section>
    </Layout>
  );
}
