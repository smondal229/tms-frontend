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

let isRefreshing = false;
let pendingResolvers: Array<(token: string) => void> = [];

const resolvePending = (token: string) => {
  pendingResolvers.forEach((resolve) => resolve(token));
  pendingResolvers = [];
};

export const logoutAndRedirect = async () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    // Reset Apollo cache to remove user data
    await client.clearStore();
  } catch (e) {
    console.error('Error during logout cleanup', e);
  } finally {
    window.location.replace('/login');
  }
};

export const refreshLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (result) => {
        const unauthorized = result.errors?.some(
          (err) =>
            err.extensions?.code === 'UNAUTHENTICATED' ||
            err.message?.toLowerCase().includes('unauthorized')
        );

        if (!unauthorized) {
          observer.next(result);
          observer.complete();
          return;
        }

        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          logoutAndRedirect();
          observer.error(new Error('No refresh token'));
          return;
        }

        const retry = (newToken: string) => {
          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              Authorization: `Bearer ${newToken}`
            }
          }));

          forward(operation).subscribe(observer);
        };

        if (!isRefreshing) {
          isRefreshing = true;

          refreshClient
            .mutate<RefreshTokenResponse, RefreshTokenRequest>({
              mutation: REFRESH_TOKEN,
              variables: { refreshToken }
            })
            .then(({ data }) => {
              const newAccessToken = data?.refreshToken?.accessToken;
              if (!newAccessToken) throw new Error('Refresh failed');

              localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

              resolvePending(newAccessToken);
              retry(newAccessToken);
            })
            .catch((err) => {
              logoutAndRedirect();
              observer.error(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        } else {
          // queue while refresh in progress
          pendingResolvers.push((newToken: string) => {
            retry(newToken);
          });
        }
      },

      error: (networkError) => {
        observer.error(networkError);
      }
    });

    return () => subscription.unsubscribe();
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

const link = refreshLink.concat(authLink).concat(httpLink);

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
