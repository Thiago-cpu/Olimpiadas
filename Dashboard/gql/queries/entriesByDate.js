import gql from "graphql-tag";

export const ENTRIES_BY_DATE = gql`
  query entriesByDate(
    $limit: Int
    $sucursalId: String!
    $skip: Int
  ) {
    entriesByDate(
      take: $limit
      sucursalId: $sucursalId
      skip: $skip
    ){
      data {
        id
        entries
        fecha
      }
    }
  }
`;