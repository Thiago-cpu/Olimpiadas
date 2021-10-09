import { useMutation } from "@apollo/client"
import { MenuItem } from "@mui/material"
import { useContext } from "react"
import AlertContext from "../context/alertContext"
import { REMOVE_SUCURSAL } from "../gql/mutations/removeSucursal"
import USure from "./USure.modal"

export default function DeleteSucursal({sucursal, onClick: handleClick}) {
  const [removeSucursal] = useMutation(REMOVE_SUCURSAL,{
    update(cache) {
      cache.modify({
        fields: {
          sucursales(existingSucursales, {readField}) {
            const incomingSucursales = {...existingSucursales}
            incomingSucursales.data = existingSucursales.data.filter((existSucursal) => readField("id", existSucursal) !== sucursal.id);
            return incomingSucursales
          }
        }
      });

      cache.modify({
        id: cache.identify(sucursal.encargado),
        fields: {
          sucursales(existingSucursales, {readField}){
            return existingSucursales.filter(existSucursal => readField("id",existSucursal) !== sucursal.id)
          }
        }
      })
    }
  })
  const {setAlert} = useContext(AlertContext)
  const handleAgree = async() => {
    const {data, errors} = await removeSucursal({variables: {sucursalId: sucursal.id}})
    if(errors || !data.deleteSucursal){
      setAlert({
        severity: "error",
        text: "Algo ha ido mal"
      })
    } else {
      setAlert({
        severity: "success",
        text: `${sucursal.name} ha sido eliminado correctamente`
      })
    }
  }
  return (
    <USure clave={sucursal.name} handleAgree={handleAgree}>
      <MenuItem
        onClick = {handleClick}
        sx={{
          color: "rgb(244, 67, 54)",
        }}
      >
        Borrar
      </MenuItem>
    </USure>
  );
}
