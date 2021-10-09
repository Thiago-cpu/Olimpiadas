import gql from "graphql-tag";

export const REGISTER = gql`
mutation Register($registerData: userInput!) {
  register(data: $registerData) {
    errors {
      field
      message
    }
    data {
      name
    }
  }
}
`;