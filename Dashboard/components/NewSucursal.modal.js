import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import FormSucursal from './FormSucursal'
import { useMutation, gql } from '@apollo/client';

const ADD_SUCURSAL = gql`
  mutation AddSucursalMutation($addSucursalData: sucursalInput!) {
    addSucursal(data: $addSucursalData) {
      data {
        encargado {
          id
        }
      }
    }
  }
`

export default function NewSucursal({name= "user", id}) {
  const [open, setOpen] = React.useState(false);
  const [addSucursal] = useMutation(ADD_SUCURSAL)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = (sucursalData) => {
    addSucursal({variables: {
      addSucursalData: {
        ...sucursalData,
        encargadoId: id
      }
    }})
    handleClose()
  }

  return (
    <div>
      <Tooltip title="Añadir Sucursal" placement="right" arrow>
        <Fab color="primary" aria-label="add" onClick={handleClickOpen}>
          <AddIcon />
        </Fab>
      </Tooltip>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Nueva sucursal para {name}</DialogTitle>
        <DialogContent>
          <FormSucursal onSubmit={onSubmit}/>
        </DialogContent>
      </Dialog>
    </div>
  );
}