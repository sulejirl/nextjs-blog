import Head from "next/head";
import Image from "next/image";
import styles from "./layout.module.css";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import Firebase from "./FirebaseAuth";
import Modal from "./Modal";
import ProfileMenu from "./ProfileMenu";
import { useAuth } from "../contexts/firebaseContext";
import { Divider, Typography } from "@mui/material";
import { useRouter } from "next/router";

const name = "Ahmet Sayarlioglu";
export const siteTitle = "Scoutsland";

export default function Layout({ children, home }) {
  const { user } = useAuth();
  const router = useRouter();
  const displayName = user?.multiFactor?.user?.displayName || "";
  const photoURL = user?.multiFactor?.user?.photoURL || "";
  const uid = user?.multiFactor?.user?.uid || "";

  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Scoutsland" />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <header className={styles.header}>
        <Typography
          sx={{ cursor: "pointer" }}
          variant="h4"
          onClick={() => router.push("/")}
        >
          Scoutsland
        </Typography>
        <>
        {user ? (
          <ProfileMenu displayName={displayName} photoURL={photoURL} uid={uid} />
        ) : (
          <Modal buttonText="Sign In">
            <Firebase />
          </Modal>
        )}
        </>
      </header>
      <Divider />
      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">
            <a>← Back to home</a>
          </Link>
        </div>
      )}
    </div>
  );
}
