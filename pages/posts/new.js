import Head from "next/head";
import Layout, { siteTitle } from "../../components/layout";
import TextEditor from "../../components/TextEditor/text-editor";
import { Backdrop, CircularProgress } from "@mui/material";
import { useAuth } from "../../contexts/firebaseContext";
import { gql ,useMutation} from "@apollo/client";

const CREATE_POST = gql`
mutation newPost($input: PostInput) {
  newPost(input: $input) {
    title
    body
    thumbnail
    _id
    draft
    userId
  }
}`

export default function NewPost() {
  const [createPost, { data, loading, error }] = useMutation(CREATE_POST);
  const { user } = useAuth();
  const handleOnSave = (post) => {
    const userId = user?.multiFactor?.user?.uid || "";
    post.userId = userId;
    createPost({ variables: { input: post} });
  }

  if (false) {
    return (
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        <TextEditor onSave={handleOnSave}/>
      </section>
    </Layout>
  );
}
