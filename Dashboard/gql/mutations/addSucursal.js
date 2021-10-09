import gql from "graphql-tag";

export const ADD_SUCURSAL = gql`
  mutation AddSucursalMutation($addSucursalData: sucursalInput!) {
    addSucursal(data: $addSucursalData) {
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
      errors{
        field
        message
      }
    }
  }
`;