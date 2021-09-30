import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import FormSucursal from './FormSucursal'

export default function NewSucursal({name= "user", id}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Tooltip title="Añadir Sucursal" placement="right" arrow>
        <Fab color="primary" aria-label="add" onClick={handleClickOpen}>
          <AddIcon />
        </Fab>
      </Tooltip>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Nueva sucursal para {name}</DialogTitle>
        <FormSucursal idSucursal={id} handleClose={handleClose}/>
      </Dialog>
    </div>
  );
}