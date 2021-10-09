import gql from "graphql-tag";

export const REMOVE_SUCURSAL = gql`
  mutation DeleteSucursal($sucursalId: String!) {
    deleteSucursal(id: $sucursalId)
  }
`