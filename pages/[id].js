import Layout from "../components/layout";
import Date from "../components/date";
import Head from "next/head";
import utilStyles from "../styles/utils.module.css";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import PostCard from "../components/PostCard";
import { Backdrop, CircularProgress } from "@mui/material";

const GetPostByUserId = gql`
  query getPostByUserId($userId: ID!) {
    getPostByUserId(userId: $userId) {
      title
      body
      thumbnail
      createdAt
      updatedAt
    }
  }
`;

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const { data, loading, error } = useQuery(GetPostByUserId, { variables: { userId: id } });
  const posts = data?.getPostByUserId || null;
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
        {/* <title>{data.getPost.title}</title> */}
      </Head>
        {posts.map((post) => (<PostCard key={post._id} post={post} />))}
    </Layout>
  );
}
