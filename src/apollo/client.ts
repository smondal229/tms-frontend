import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../auth/AuthProvider';
import { REFRESH_TOKEN } from '../graphql/auth/mutations';
import type { RefreshTokenRequest, RefreshTokenResponse } from '../graphql/auth/types';

export function navigateToLogin() {
  window.location.href = `${window.location.origin}/login`;
}

const refreshClient = new ApolloClient({
  link: new HttpLink({ uri: 'https://tms-twilight-water-7299.fly.dev/graphql' }),
  cache: new InMemoryCache()
});

const httpLink = new HttpLink({
  uri: 'https://tms-twilight-water-7299.fly.dev/graphql'
});

const errorLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    let subscription: any;

    const handle = () => {
      subscription = forward(operation).subscribe({
        next: (result) => observer.next(result),
        error: async (error) => {
          const { graphQLErrors } = error as any;

          if (graphQLErrors) {
            for (const err of graphQLErrors) {
              if (err.extensions?.code === 'UNAUTHENTICATED') {
                try {
                  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
                  if (!refreshToken) throw new Error('No refresh token found');

                  // Execute the REFRESH_TOKEN mutation
                  const { data } = await refreshClient.mutate<
                    RefreshTokenResponse,
                    RefreshTokenRequest
                  >({
                    mutation: REFRESH_TOKEN,
                    variables: { refreshToken }
                  });

                  const newToken = data?.refreshToken?.accessToken;
                  if (!newToken) throw new Error('Failed to refresh token');

                  // Save the new access token
                  localStorage.setItem(ACCESS_TOKEN_KEY, newToken);

                  // Retry the original operation with new token
                  const oldHeaders = operation.getContext().headers || {};
                  operation.setContext({
                    headers: {
                      ...oldHeaders,
                      Authorization: `Bearer ${newToken}`
                    }
                  });

                  subscription = forward(operation).subscribe(observer);
                  return;
                } catch (e) {
                  localStorage.removeItem(ACCESS_TOKEN_KEY);
                  localStorage.removeItem(REFRESH_TOKEN_KEY);

                  navigateToLogin();
                  observer.error(e);
                  return;
                }
              }
            }
          }

          // Pass any other errors
          observer.error(error);
        },
        complete: () => observer.complete()
      });
    };

    handle();

    return () => subscription?.unsubscribe();
  });
});

const authLink = new SetContextLink((prevContext, operation) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  return {
    headers: {
      ...prevContext.headers,
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
});

const link = errorLink.concat(authLink).concat(httpLink);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getShipments: {
            keyArgs: ['sort', 'filters'],
            merge(existing = {}, incoming) {
              return {
                ...incoming,
                shipments: [...(existing.shipments || []), ...incoming.shipments]
              };
            }
          }
        }
      }
    }
  })
});

export default client;
