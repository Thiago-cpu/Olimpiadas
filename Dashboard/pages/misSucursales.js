import * as React from "react";
import Table from "@mui/material/Table";
import {
  Avatar,
  Box,
  CircularProgress,
  Container,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { gql, useQuery, useMutation } from "@apollo/client";
import Search from "../components/Search";
import CreateRow from "../components/rowUpdateSucursal";

const GET_MY_SUCURSALES = gql`
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

const UPDATE_SUCURSAL = gql`
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

export default function UsersTable() {
  const { data, loading, error } = useQuery(GET_MY_SUCURSALES);
  const [updateMySucursal] = useMutation(UPDATE_SUCURSAL);
  const arrRows = data?.me?.data.sucursales;
  const [rows, setRows] = React.useState(arrRows);
  const [rowsEdits, setRowsEdits] = React.useState([]);

  React.useEffect(() => {
    setRows(data?.me?.data.sucursales);
  }, [data, setRows]);
  if (loading) return <CircularProgress />;
  if (error) return <p>{error.message}</p>;

  const handleSearchChange = (data) => {
    const newRows = arrRows.filter((row) =>
      row.name.toLowerCase().startsWith(data.toLowerCase())
    );
    setRows(newRows);
  };

  const makeRowEditable = (id) => {
    setRowsEdits((prevRowsEdits) => {
      prevRowsEdits.push(id);
      return [...prevRowsEdits];
    });
  };

  const handleSubmit = (sucursal) => {
    setRowsEdits((prevRowsEdits) => {
      const index = prevRowsEdits.indexOf(sucursal.id);
      if (index > -1) {
        prevRowsEdits.splice(index, 1);
      }
      return [...prevRowsEdits];
    });
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Search onChange={handleSearchChange} label="Buscar sucursal" />
      <TableContainer sx={{ maxWidth: 900, marginTop: 1 }} component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Editar</TableCell>
              <TableCell align="center">N°</TableCell>
              <TableCell align="center">Nombre</TableCell>
              <TableCell align="center">
                capacidad
                <br /> Máxima
              </TableCell>
              <TableCell align="center">Localización</TableCell>
              <TableCell align="center">
                Añadir
                <br />
                sensor
              </TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Metricas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.length ? (
              rows.map((row, i) => (
                <CreateRow
                  handleParentSubmit={handleSubmit}
                  key={row.id}
                  row={row}
                  i={i}
                  rowsEdits={rowsEdits}
                  makeRowEditable={makeRowEditable}
                  updateSucursal={updateMySucursal}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <p style={{ textAlign: "center" }}>Sucursal no encontrada.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
