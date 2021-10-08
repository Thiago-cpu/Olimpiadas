import { useMutation, gql } from "@apollo/client";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { useContext } from "react";
import AlertContext from "../context/alertContext";
import USure from "./USure.modal"
const REMOVE_USER = gql`
  mutation DeleteUserMutation($userId: String!) {
  deleteUser(id: $userId)
}
`


export default function DeleteUser({user}){

  const {setAlert} = useContext(AlertContext)
  const [removeUser, {loading: removeLoading}] = useMutation(REMOVE_USER, {
    update(cache) {
      cache.modify({
        fields: {
          allUser(existingUsers, {readField}) {
            const incomingUsers = {...existingUsers}
            incomingUsers.data = existingUsers.data.filter((existUser) => readField("id", existUser) !== user.id);
            return incomingUsers
          }
        }
      });
    }
  });
  const handleAgree = async() => {
    const {data, errors} = await removeUser({
      variables: {
        userId: user.id
      }
    })
    if(data.deleteUser){
      setAlert({
        severity: "success",
        text: `${user.name} ha sido eliminado correctamente`
      })
    } else {
      setAlert({
        severity: "error",
        text: "Algo ha ido mal"
      })
    }
  }

  return (
  <USure clave={user.name} handleAgree={handleAgree}>
      <Tooltip title="Eliminar" placement="right" arrow>
        <IconButton disabled={removeLoading}>
            <DeleteIcon />
        </IconButton>
      </Tooltip>
  </USure>)
}