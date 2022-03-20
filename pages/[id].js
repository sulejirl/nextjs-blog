import Layout from "../components/layout";
import Date from "../components/date";
import Head from "next/head";
import utilStyles from "../styles/utils.module.css";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import TextEditor from "../components/TextEditor/text-editor";
import { Backdrop, CircularProgress } from "@mui/material";

const GetPostByUserId = gql`
  query getPostByUserId($userId: ID!) {
    getPostByUserId(userId: $userId) {
      title
      body
      createdAt
      updatedAt
    }
  }
`;

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  console.log(id)
  const { data, loading, error } = useQuery(GetPostByUserId, { variables: { userId: id } });
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
  console.log(data)
  return (
    <Layout>
      <Head>
        {/* <title>{data.getPost.title}</title> */}
      </Head>
        <>asdasd</>
    </Layout>
  );
}
