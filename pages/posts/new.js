import Head from "next/head";
import Layout, { siteTitle } from "../../components/layout";
import TextEditor from "../../components/TextEditor/text-editor";
import { Backdrop, CircularProgress } from "@mui/material";

export default function NewPost() {
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
        <TextEditor />
      </section>
    </Layout>
  );
}
