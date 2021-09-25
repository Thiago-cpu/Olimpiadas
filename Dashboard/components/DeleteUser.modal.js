import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { gql, useMutation } from '@apollo/client';

const REMOVE_USER = gql`
  mutation DeleteUserMutation($deleteUserId: String!) {
  deleteUser(id: $deleteUserId)
}
`



export default function USure({onClick, name="usuario", id}) {
  if(!id) return "id is necessary"
  const [open, setOpen] = React.useState(false);
  const [removeUser, { loading: removeLoading }] = useMutation(REMOVE_USER);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAgree = () => {
    removeUser({ variables: { deleteUserId: id } })
    onClick()
  }

  return (
    <>
      <Tooltip title="Eliminar" placement="right" arrow>
        <IconButton disabled={removeLoading} onClick={handleClickOpen}>
            <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          ¿Estás seguro de querer eliminar a {name}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            El usuario y sus sucursales se eliminarán permanentemente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleAgree} autoFocus>
            Estoy seguro
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}