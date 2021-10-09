import gql from "graphql-tag";

export const SUBSCRIPTION = gql`
  subscription actualPeople($actualPeopleSucursalId: String!) {
    actualPeople(sucursalId: $actualPeopleSucursalId) {
      id
      createdAt
      cantidadActual
      type
      sucursal {
        id
        capacidadMaxima
      }
    }
  }
`;