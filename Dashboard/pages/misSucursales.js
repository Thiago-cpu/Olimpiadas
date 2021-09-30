import * as React from 'react';
import Table from '@mui/material/Table';
import {
  Avatar,
  Box,
  CircularProgress,
  Container,
  Fab,
  FormControl,
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
} from '@mui/material'
import Link from "next/link"
import EditIcon from '@mui/icons-material/Edit';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { gql, useQuery, useMutation } from '@apollo/client';
import Search from '../components/Search';
import NewSensor from '../components/NewSensor.modal';
import { useFormik } from "formik";
import * as Yup from "yup";
import AlertContext from '../context/alertContext';


const GET_MY_SUCURSALES = gql`
query MySucursals {
  me {
    data {
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

function CreateRow({row, i, rowsEdits, makeRowEditable, updateSucursal, handleParentSubmit}){
  const {setAlert} = React.useContext(AlertContext)
  const {
    handleSubmit,
    handleBlur,
    handleChange,
    values,
    errors,
    touched,
    isSubmitting,
  } = useFormik({
    initialValues: {
      name: row.name,
      capacidadMaxima: row.capacidadMaxima,
      localizacion: row.localizacion
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Requerido")
        .min(3, "Mínimo 3 caracteres")
        .max(30, "Máximo 30 caracteres"),
      capacidadMaxima: Yup.number()
        .required("Requerido")
        .positive("Debería de ser un numero postivo")
        .integer("Debería de ser un entero"),
      localizacion: Yup.string()
        .required("Requerido")
        .min(10, "Mínimo 10 caracteres")
        .max(255, "Máximo 255 caracteres"),
    }),
    onSubmit: async (values) => {
      try{
          const { data } = await updateSucursal({
              variables: {
                updateMySucursalSucursalId: row.id,
                updateMySucursalData: {
                      ...values
                  },
              },
          })
          const {updateMySucursal} = data
          const {errors, data:sucursal} = updateMySucursal
          if(errors){
            setAlert({
              severity: "error",
              text: errors[0].message
            })
          } else {
            setAlert({
              severity: "success",
              text: `La sucursal ${sucursal.name} fue actualizada correctamente`
            })
            handleParentSubmit(sucursal)
          }
      }
      catch(e){
          console.log(e)
      }
  }
  });
  return (
    <TableRow
    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
    <TableCell sx={{width: 50}} align="center" component="th" scope="row">
      {!rowsEdits.includes(row.id)?
      <Tooltip title="Editar" placement="left">
        <Fab onClick={()=>makeRowEditable(row.id)} color="secondary" aria-label="edit">
          <EditIcon />
        </Fab>
      </Tooltip>
      :
      <Tooltip title="Guardar" placement="left">
        <Fab onClick={handleSubmit} color="secondary" aria-label="edit">
          <DoneAllIcon />
        </Fab>
      </Tooltip>
      }
    </TableCell>
    <TableCell sx={{width: 50}} align="center">
      {i+1}
    </TableCell>
    {!rowsEdits.includes(row.id)?
    <>
    <TableCell align="center" sx={{width: 150}}>
        {row.name}
    </TableCell>
    <TableCell sx={{ width: 125 }} align="center">
      {row.capacidadMaxima}
    </TableCell>
    <TableCell sx={{ width: 125 }} align="center">
      {row.localizacion}
    </TableCell>
    </>
    :
    <>
    <TableCell align="center" sx={{width: 150}}>
      <TextField
      variant="standard"
      name="name"
      value={values.name}
      onChange={handleChange}
      disabled={isSubmitting}
      error={touched.name && Boolean(errors.name)}
      onBlur={handleBlur}
      helperText={touched.name && errors.name}
      />
    </TableCell>
    <TableCell sx={{ width: 125 }} align="center">
      <TextField
      variant="standard"
      type="number"
      name="capacidadMaxima"
      value={values.capacidadMaxima}
      onChange={handleChange}
      disabled={isSubmitting}
      error={touched.capacidadMaxima && Boolean(errors.capacidadMaxima)}
      helperText={touched.capacidadMaxima && errors.capacidadMaxima}
      onBlur={handleBlur}
      />
    </TableCell>
    <TableCell sx={{ width: 125 }} align="center">
      <TextField
      variant="standard"
      name="localizacion"
      value={values.localizacion}
      onChange={handleChange}
      disabled={isSubmitting}
      error={touched.localizacion && Boolean(errors.localizacion)}
      onBlur={handleBlur}
      helperText={touched.localizacion && errors.localizacion}
      />
    </TableCell>

    </>
    }
    <TableCell align="center">
      <NewSensor sucursalName={row.name} id={row.id}/>
    </TableCell>
    <TableCell align="center">
      <Link href={`/sucursal/${row.id}`}>
        <Tooltip title="Estado actual" placement="right">
        <Fab color="primary">
          <StorefrontIcon/>
        </Fab>
        </Tooltip>
      </Link>
    </TableCell>
  </TableRow>
  )
}

const UPDATE_SUCURSAL = gql`
  mutation UpdateMySucursal($updateMySucursalSucursalId: String!, $updateMySucursalData: updateSucursalInput!) {
    updateMySucursal(sucursalId: $updateMySucursalSucursalId, data: $updateMySucursalData) {
      data {
        name
        capacidadMaxima
        localizacion
        id
      },
      errors {
        message
      }
    }
  }
`

export default function UsersTable() {
  const {data, loading, error} = useQuery(GET_MY_SUCURSALES)
  const [updateMySucursal] = useMutation(UPDATE_SUCURSAL)
  const arrRows = data?.me?.data.sucursales
  const [rows, setRows] = React.useState(arrRows)
  const [rowsEdits, setRowsEdits] = React.useState([])
  
  React.useEffect(()=>{
    setRows(data?.me?.data.sucursales)
  }, [data,setRows])
  if(loading) return <CircularProgress />
  if(error) return <p>{error.message}</p>

  const handleSearchChange = (data) => {
    const newRows = arrRows.filter((row) => row.name.toLowerCase().startsWith(data.toLowerCase()))
    setRows(newRows)
  }

  const makeRowEditable = (id) => {
    setRowsEdits(prevRowsEdits => {
      prevRowsEdits.push(id)
      return [...prevRowsEdits]
    })
  }

  const handleSubmit = (sucursal) => {
    setRowsEdits(prevRowsEdits => {
      const index = prevRowsEdits.indexOf(sucursal.id);
      if (index > -1) {
        prevRowsEdits.splice(index, 1);
      }  
      return [...prevRowsEdits]
    })
  }
  
  return (
    <Container sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
    <Search onChange={handleSearchChange} label="Buscar sucursal"/>
    <TableContainer sx={{maxWidth: 800, marginTop: 1}} component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center">Editar</TableCell>
            <TableCell align="center">N°</TableCell>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">capacidad<br/> Máxima</TableCell>
            <TableCell align="center">Localización</TableCell>
            <TableCell align="center">Añadir<br/>sensor</TableCell>
            <TableCell align="center">Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows?.length?
          rows.map((row, i) => (
            <CreateRow handleParentSubmit={handleSubmit} key={row.id} row={row} i={i} rowsEdits = {rowsEdits} makeRowEditable={makeRowEditable} updateSucursal={updateMySucursal}/>
          ))
          :
          <TableRow>
            <TableCell colSpan={5}>
              <p style={{textAlign: "center"}}>Sucursal no encontrada.</p>
            </TableCell >
          </TableRow>
        }
        </TableBody>
      </Table>
    </TableContainer>
    </Container>
  );
}

