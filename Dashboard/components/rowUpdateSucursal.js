import * as React from "react";
import {
  Fab,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from '@mui/icons-material/Save';
import StorefrontIcon from "@mui/icons-material/Storefront";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewSensor from "../components/NewSensor.modal";
import AlertContext from "../context/alertContext";
import useUpdateSucursal from "../hooks/useUpdateSucursal";

export default function CreateRow({row, i, rowsEdits, makeRowEditable, updateSucursal, handleParentSubmit}){
  const {setAlert} = React.useContext(AlertContext)
  const {
    handleSubmit,
    handleBlur,
    handleChange,
    values,
    errors,
    touched,
    isSubmitting,
  } = useUpdateSucursal(row, handleParentSubmit)
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
          <SaveIcon />
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
    <TableCell align="center">
      <Link href={`/dashboard/${row.id}`}>
        <Tooltip title="Metricas" placement="right">
        <Fab color="primary">
          <TrendingUpIcon/>
        </Fab>
        </Tooltip>
      </Link>
    </TableCell>
  </TableRow>
  )
}