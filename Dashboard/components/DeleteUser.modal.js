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
import AlertContext from '../context/alertContext';
import {GET_USERS} from '../pages/users'

const REMOVE_USER = gql`
  mutation DeleteUserMutation($deleteUserId: String!) {
  deleteUser(id: $deleteUserId)
}
`



export default function USure({onClick, user}) {
  if(!user) return "user is necessary"
  const {setAlert} = React.useContext(AlertContext)
  const [open, setOpen] = React.useState(false);
  const [removeUser, { loading: removeLoading }] = useMutation(REMOVE_USER, {
    refetchQueries: [
      GET_USERS,
      'allUser'
    ],
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAgree = async() => {
    const {data, errors} = await removeUser({ variables: { deleteUserId: user.id } })
    if(errors || !data.deleteUser){
      setAlert({
        severity: "error",
        text: "Algo ha ido mal"
      })
    } else {
      setAlert({
        severity: "success",
        text: `${user.name} ha sido eliminado correctamente`
      })
    }
    onClick(user.id)
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
          ¿Estás seguro de querer eliminar a {user.name}?
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