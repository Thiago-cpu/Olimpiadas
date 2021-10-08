import * as React from 'react';
import Table from '@mui/material/Table';
import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
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
import { gql, useQuery, useMutation } from '@apollo/client';
import NewSucursal from '../components/NewSucursal.modal';
import Search from '../components/Search';
import AlertContext from '../context/alertContext';
import { initializeApollo } from '../lib/apolloClient';
import DeleteUser from '../components/DeleteUser';

const CHANGE_ROLE = gql`
  mutation ChangeRoleMutation($changeRoleData: changeRoleInput!) {
    changeRole(data: $changeRoleData) {
      data {
        id
      }
      errors{
        field,
        message
      }
    }
  }
`
export const GET_USERS = gql`
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

export default function UsersTable() {
  const {data, loading, error} = useQuery(GET_USERS)
  const arrRows = data?.allUser?.data
  const {setAlert} = React.useContext(AlertContext)
  const [rows, setRows] = React.useState(arrRows)
  const [changeRole, { loading: changeRoleLoading }] = useMutation(CHANGE_ROLE)

  const handleChangeSelect = async(e, user) => {
    const {data, errors} = await changeRole({
      variables: {
        changeRoleData:{
          userId: user.id,
          role: e.target.value
        }
      }
    })
    if(errors || data.changeRole.errors){
      setAlert({
        severity: "error",
        text: "Algo ha ido mal"
      })
    } else {
      initializeApollo().writeFragment({
        id: initializeApollo().cache.identify(user),
        fragment: gql`
          fragment MyUser on User {
            role
          }
        `,
        data: {
          role: e.target.value,
        },
      });
    }
  }
  
  React.useEffect(()=>{
    setRows(data?.allUser?.data)
  }, [data,setRows])

  if(loading) return <CircularProgress />
  if (error) return <p>{error.message}</p>
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
      alignItems: "center",
    }}>
    <Search styles={{}} onChange={handleSearchChange} label="Buscar usuario"/>
    <TableContainer sx={{maxWidth: 600, marginTop: 1}} component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center">Borrar</TableCell>
            <TableCell align="center">N°</TableCell>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Rol</TableCell>
            <TableCell align="center">Añadir<br/>Sucursal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows?.length?
          rows.map((row, i) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell sx={{width: 50}} align="center" component="th" scope="row">
                <DeleteUser onClick={removeRow} user={row} />
              </TableCell>
              <TableCell sx={{width: 50}} align="center">
                {i+1}
              </TableCell>
              <TableCell align="center" sx={{width: 100, textAlign: "-webkit-center"}}>
                  <Avatar alt={row.name} sx={row.name[0] > 'k'? { bgcolor: deepOrange[500]}: { bgcolor: deepPurple[500] }} src='.'/>
                  {row.name}
              </TableCell>
              <TableCell sx={{ width: 125 }} align="center">
                <Box>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Rol</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      disabled={changeRoleLoading}
                      value={row.role}
                      label="Role"
                      onChange={(e) => {handleChangeSelect(e, row)}}
                    >
                      <MenuItem value={'Admin'}>Admin</MenuItem>
                      <MenuItem value={'Encargado'}>Encargado</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </TableCell>
              <TableCell align="center">
                <NewSucursal name={row.name} id={row.id}/>
              </TableCell>
            </TableRow>
          ))
          :
          <TableRow>
            <TableCell colSpan={5}>
              <p style={{textAlign: "center"}}>Usuario no encontrado.</p>
            </TableCell >
          </TableRow>
        }
        </TableBody>
      </Table>
    </TableContainer>
    </Container>
  );
}

