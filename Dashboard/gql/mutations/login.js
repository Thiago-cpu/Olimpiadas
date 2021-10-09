import gql from "graphql-tag";

export const LOGIN_MUTATION = gql`
  mutation Login($loginData: userInput!) {
    login(data: $loginData) {
      authToken
      data {
        id
        name
        role
        sucursales {
          name
          id
        }
      }
      errors {
        field
        message
      }
    }
  }
`;