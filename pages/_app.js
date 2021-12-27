import { ApolloProvider } from '@apollo/client'
import { useApollo } from '../apollo/client'
import { ProvideAuth } from "../contexts/firebaseContext";
import '../styles/global.css'
import '../styles/firebaseui-styling.global.css'

export default function App({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps.initialApolloState)

  return (
    <ProvideAuth>
      <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
      </ApolloProvider>
    </ProvideAuth>

  )
}