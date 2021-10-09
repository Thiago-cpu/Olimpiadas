import gql from "graphql-tag";

export const CHANGE_ROLE = gql`
  mutation ChangeRoleMutation($changeRoleData: changeRoleInput!) {
    changeRole(data: $changeRoleData) {
      data {
        id
      }
      errors{
        field,
        message
      }
    }
  }
`