import gql from "graphql-tag";

export const GET_USERS = gql`
  query allUser {
    allUser {
      data {
      id
      name
      role
      }
    }
  }
`;