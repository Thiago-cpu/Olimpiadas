import gql from "graphql-tag";

export const SUCURSALES = gql`
query Sucursales {
  sucursales {
    errors {
      message
      field
    }
    data {
      id
      name
      capacidadMaxima
      localizacion
      encargado {
        id
        name
      }
    }
  }
}`