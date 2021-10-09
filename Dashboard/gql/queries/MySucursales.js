import gql from "graphql-tag";

export const GET_MY_SUCURSALES = gql`
  query MySucursals {
    me {
      data {
        id
        sucursales {
          id
          name
          capacidadMaxima
          localizacion
        }
      }
    }
  }
`;