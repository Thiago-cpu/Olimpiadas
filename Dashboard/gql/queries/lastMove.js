import gql from "graphql-tag";

export const LAST_MOVE = gql`
query lastMove($lastMoveSucursalId: String!) {
  lastMove(sucursalId: $lastMoveSucursalId) {
    data {
      sucursal {
        capacidadMaxima
      }
      cantidadActual
    }
    errors {
      message
    }
  }
}
`;