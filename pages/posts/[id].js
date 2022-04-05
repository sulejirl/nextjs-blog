import Layout from "../../components/layout";
import Date from "../../components/date";
import Head from "next/head";
import utilStyles from "../../styles/utils.module.css";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import TextEditor from "../../components/TextEditor/text-editor";
import { Backdrop, CircularProgress } from "@mui/material";

const GetPost = gql`
  query getPost($id: ID!) {
    getPost(id: $id) {
      title
      body
      createdAt
      updatedAt
    }
  }
`;

export default function Post() {
  const router = useRouter();
  const { id } = router.query;
  const { data, loading, error } = useQuery(GetPost, { variables: { id: id } });
  if (loading) {
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }
  if (error) return <p>Error...</p>;
  return (
    <Layout>
      <Head>
        <title>{data.getPost.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{data.getPost.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={data.getPost.createdAt} />
        </div>
        <TextEditor data={data.getPost.body} readOnly/>
      </article>
    </Layout>
  );
}
