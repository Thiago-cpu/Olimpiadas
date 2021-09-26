import * as React from 'react';
import Table from '@mui/material/Table';
import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Avatar,
  Box,
  InputLabel,
  FormControl,
  MenuItem,
  Container,
  Select
} from '@mui/material'

import { deepOrange, deepPurple } from '@mui/material/colors';
import USure from '../components/DeleteUser.modal';
import { gql, useQuery, useMutation } from '@apollo/client';
import { initializeApollo, addApolloState } from '../lib/apolloClient'
import NewSucursal from '../components/NewSucursal.modal';
import Search from '../components/Search';



const headerCell = {
  fontWeight: 'bold',
  backgroundColor: '#1976d2',
  color: '#fff'
}

const CHANGE_ROLE = gql`
  mutation ChangeRoleMutation($changeRoleData: changeRoleInput!) {
    changeRole(data: $changeRoleData) {
      data {
        id
      }
    }
  }
`

export default function Users({data}) {
  const arrRows = data.allUser.data
  const users = arrRows.map(user => {return {label: user.name}})
  const [rows, setRows] = React.useState(arrRows)
  const [changeRole, { loading: changeRoleLoading }] = useMutation(CHANGE_ROLE)

  const handleChangeSelect = (e, id) => {
    changeRole({variables: {changeRoleData:{
      userId: id,
      role: e.target.value
    }}})
  }

  const handleSearchChange = (data) => {
    const newRows = arrRows.filter((row) => row.name.toLowerCase().startsWith(data.toLowerCase()))
    setRows(newRows)
  }

  const removeRow = (id) => {
    setRows(prevRows => {
      const newRows = prevRows.filter(a => a.id !== id)
      return newRows
    })
  }
  return (
    <Container sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
    <Search styles={{}} onChange={handleSearchChange} label="Buscar usuario"/>
    <TableContainer sx={{maxWidth: 600, borderRadius: 8, marginTop: 1}}component={Paper}>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCell} align="left"></TableCell>
            <TableCell sx={headerCell} align="left">N°</TableCell>
            <TableCell sx={headerCell} align="left">Nombre</TableCell>
            <TableCell sx={headerCell} align="left">Rol</TableCell>
            <TableCell sx={headerCell} align="left"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length?
          rows.map((row, i) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell sx={{width: 50}} align="left" component="th" scope="row">
                <USure onClick={() => {removeRow(row.id)}} name={row.name} id={row.id}/>
              </TableCell>
              <TableCell sx={{width: 50}} align="left">
                {i+1}
              </TableCell>
              <TableCell align="left" sx={{width: 150}}>
                  <Avatar alt={row.name} sx={row.name[0] > 'k'? { bgcolor: deepOrange[500] }: { bgcolor: deepPurple[500] }} src='.'/>
                  {row.name}
              </TableCell>
              <TableCell sx={{ width: 125 }} align="left">
                <Box>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Rol</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      disabled={changeRoleLoading}
                      defaultValue={row.role}
                      label="Role"
                      onChange={(e) => {handleChangeSelect(e, row.id)}}
                    >
                      <MenuItem value={'Admin'}>Admin</MenuItem>
                      <MenuItem value={'Encargado'}>Encargado</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </TableCell>
              <TableCell align="left">
                <NewSucursal name={row.name} id={row.id}/>
              </TableCell>
            </TableRow>
          ))
          :
          <TableCell variant="footer" colSpan={5}>
            <p style={{textAlign: "center"}}>Usuario no encontrado.</p>
          </TableCell >
        }
        </TableBody>
      </Table>
    </TableContainer>
    </Container>
  );
}
const GET_USERS = gql`
  query allUser {
    allUser {
      data {
      id
      name
      role
      }
    }
  }
`;
export async function getServerSideProps() {
  const client = initializeApollo()
  const { data } = await client.query({
    query:GET_USERS,
  });

  return addApolloState(client, {
    props: {data},
  })
};

