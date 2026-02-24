import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://tms-twilight-water-7299.fly.dev/graphql'
  }),
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
