import gql from "graphql-tag";

export const MOVIMIENTOS = gql`
  query movesByDate($movesDia: DateTime!, $sucursalId: String!) {
    moves(dia: $movesDia, sucursalId: $sucursalId) {
      data {
        id
        createdAt
        cantidadActual
      }
    }
  }
`;