import gql from "graphql-tag";

export const UPDATE_SUCURSAL = gql`
mutation UpdateMySucursal(
  $updateMySucursalSucursalId: String!
  $updateMySucursalData: updateSucursalInput!
) {
  updateMySucursal(
    sucursalId: $updateMySucursalSucursalId
    data: $updateMySucursalData
  ) {
    data {
      name
      capacidadMaxima
      localizacion
      id
    }
    errors {
      message
    }
  }
}
`;