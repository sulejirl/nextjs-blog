import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../apollo/client";
import { ProvideAuth } from "../contexts/firebaseContext";
import Script from "next/script";
import "../styles/global.css";
import "../styles/firebaseui-styling.global.css";

export default function App({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <>
      <Script
        id="cloudinary-upload-widget"
        src="https://upload-widget.cloudinary.com/global/all.js"
      />
      <ProvideAuth>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
      </ProvideAuth>
    </>
  );
}
