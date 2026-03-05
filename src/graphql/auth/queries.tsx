import { gql } from '@apollo/client';

export const GET_USER_DETAILS = gql`
  query GetUserDetails {
    me {
      id
      username
      role
      verified
      authorities
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      username
      role
      verified
    }
  }
`;

export const GET_USER_BY_IDS = gql`
  query GetByUserIds($userIds: [ID!]!) {
    getByUserIds(userIds: $userIds) {
      id
      username
    }
  }
`;
