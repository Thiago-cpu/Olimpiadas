import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Paper, Typography } from "@mui/material";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";

const columns = [
  {
    field: "fecha",
    type: "date",
    headerName: "Fecha",
    flex:1,
    valueFormatter: (params) => new Intl.DateTimeFormat('es-AR', {day: "2-digit", month: "short"}).format(new Date(params.value)).toLocaleUpperCase()
  },
  {
    field: "entries",
    type: "number",
    headerName: "Clientes",
    flex:1,
    headerAlign: "right",
    align: "right"
  }
];

const ENTRIES_BY_DATE = gql`
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

export default function ServerPaginationGrid({ onDateClick, sucursalId }) {
  const { loading, data, fetchMore } = useQuery(ENTRIES_BY_DATE, {
    variables: {
      skip: 0,
      limit: 5,
      sucursalId,
    },
    notifyOnNetworkStatusChange:true,
  });

  const [page, setPage] = React.useState(0);
  const [rows, setRows] = React.useState([]);

  React.useEffect(async () => {
    if(!loading && data){
      const allRows = data.entriesByDate.data
      if(allRows[(page+1)*5-1]){
        const newRows = allRows.slice(page*5, (page+1)*5)
        onDateClick(newRows[0])
        setRows(newRows)
      } else {
        fetchMore({
          variables: {
            skip: allRows.length,
          }
        })
      }
    }
  }, [page, data]);

  const handleRowClick = (e) => {
    onDateClick(e.row)
  }

  return (
    <Paper style={{ padding: "1em", flexBasis: "25rem", flexGrow: 3 }}>
      <Typography variant="h6">Datos históricos</Typography>
      <div style={{ width: "100%" }}>
        {loading || rows.length > 0 ? (
        <DataGrid
          disableColumnFilter
          disableColumnMenu
          hideFooterSelectedRowCount
          onRowClick={handleRowClick}
          sx={{ height: "100%", alignItems: "center" }}
          rows={rows}
          columns={columns}
          pagination
          pageSize={5}
          rowsPerPageOptions={[5]}
          autoHeight
          rowCount={100}
          paginationMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          page={page}
          loading={loading}
        />
        ) : (
          <Typography variant="h7">No hay datos</Typography>
        )}
      </div>
    </Paper>
  );
}
