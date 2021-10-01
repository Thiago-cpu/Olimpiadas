import { useMemo } from 'react'
import { ApolloClient, ApolloLink, split, HttpLink, InMemoryCache } from '@apollo/client'
import { concatPagination, getMainDefinition } from '@apollo/client/utilities'
import merge from 'deepmerge'
import isEqual from 'lodash/isEqual'
import { WebSocketLink } from '@apollo/client/link/ws';
import {parseCookies} from 'nookies'
import {setContext} from '@apollo/client/link/context'

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'
const wsUrl = `${process.env.NEXT_PUBLIC_WSS_DOMAIN || 'ws://localhost:4000'}`
console.log({wsUrl})
const wsLink = process.browser ? new WebSocketLink({
  uri: `${wsUrl}/graphql`,
  options: {
    reconnect: true,
  }
}) : null;

const httpLink = new HttpLink({
  uri: `${process.env.NEXT_PUBLIC_HTTP_DOMAIN || 'http://localhost:4000'}/graphql`,
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

const authLink = setContext((request) => {
  const { token } = parseCookies()
  console.log({token}, "token")

  return {
    headers: {
      authorization: token ? `Bearer ${token}` : null,
    }
}
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
