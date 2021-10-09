import gql from "graphql-tag";

export const REMOVE_USER = gql`
  mutation DeleteUserMutation($userId: String!) {
  deleteUser(id: $userId)
}
`