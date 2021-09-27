import { useMemo } from 'react'
import { ApolloClient, ApolloLink, split, HttpLink, InMemoryCache } from '@apollo/client'
import { concatPagination, getMainDefinition } from '@apollo/client/utilities'
import merge from 'deepmerge'
import isEqual from 'lodash/isEqual'
import { WebSocketLink } from '@apollo/client/link/ws';
import {parseCookies} from 'nookies'

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

const wsLink = process.browser ? new WebSocketLink({
  uri: `ws://${process.env.DOMAIN || 'localhost'}:4000/graphql`,
  options: {
    reconnect: true,
  }
}) : null;

const httpLink = new HttpLink({
  uri: `http://${process.env.DOMAIN || 'localhost'}:4000/graphql`,
  credentials: 'same-origin'
});

const splitLink = process.browser ? split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
): httpLink;

const authLink = new ApolloLink((operation, forward) => {
  const { token } = parseCookies()
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : null,
    }
  });
  return forward(operation);
});
let apolloClient

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: authLink.concat(splitLink),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            allPosts: concatPagination(),
          },
        },
      },
    }),
  })
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient()

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    })

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data)
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

export function addApolloState(client, pageProps) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
  }

  return pageProps
}

export function useApollo(pageProps) {
  const state = pageProps[APOLLO_STATE_PROP_NAME]
  const store = useMemo(() => initializeApollo(state), [state])
  return store
}
