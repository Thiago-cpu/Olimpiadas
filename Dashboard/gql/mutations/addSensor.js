import gql from "graphql-tag";

export const ADD_SENSOR = gql`
  mutation AddSensor(
    $addSensorData: sensorInput!
    $addSensorSucursalId: String!
  ) {
    addSensor(data: $addSensorData, sucursalId: $addSensorSucursalId) {
      data {
        type
      }
      errors{
        field
        message
      }
    }
  }
`;