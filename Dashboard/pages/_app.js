import { ApolloProvider } from '@apollo/client'
import { useApollo } from '../lib/apolloClient'
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import {purple, green} from '@mui/material/colors'
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps)

  const theme = createTheme({
    palette: {
      primary: {
        main: purple[500],
      }
    },
});

  return (
    <ThemeProvider theme={theme} >
      <ApolloProvider client={apolloClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      </ApolloProvider>
    </ThemeProvider>

  )
}
