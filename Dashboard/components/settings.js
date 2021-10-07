import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Tooltip,
  Icon,
  IconButton,
  Box,
  Popper,
  Grow,
  MenuItem,
  MenuList,
  ClickAwayListener,
  Paper,
  Divider,
} from "@mui/material";
import Link from "next/link";
import { useContext, useRef, useState } from "react";
import {gql, useMutation} from '@apollo/client'
import USure from "./USure.modal";
import AlertContext from '../context/alertContext';
import UserContext from "../context/userContext";

const REMOVE_SUCURSAL = gql`
  mutation DeleteSucursal($sucursalId: String!) {
    deleteSucursal(id: $sucursalId)
  }
`

export default function Settings({ sx = {}, sucursal }) {
  if(!sucursal) return "se necesita sucursal"
  const {setAlert} = useContext(AlertContext)
  const {user} = useContext(UserContext)
  const [open, setOpen] = useState(false);
  const [menuItemSelected, setMenuItemSelected] = useState("");
  const [removeSucursal] = useMutation(REMOVE_SUCURSAL,{
    update(cache) {
      cache.modify({
        fields: {
          sucursales(existingSucursales, {readField}) {
            return existingSucursales.data.filter((existSucursal) => readField("id", existSucursal) !== sucursal.id);
          }
        }
      });
    }
  })
  const settingsRef = useRef(null);


  const handleMenuListToggle = () => {
    setOpen(true);
  };

  const handleMenuListClose = () => {
    setOpen(false);
  };

  const handleMenuItemClick = (e) => {
    setMenuItemSelected(e.target.childNodes[0].textContent);
  };

  const handleAgree = async() => {
    handleMenuListClose()
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
    <>
      <Tooltip title="Configuración" arrow placement="top">
        <IconButton onClick={handleMenuListToggle} ref={settingsRef} sx={sx}>
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Popper
        open={open}
        anchorEl={settingsRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleMenuListClose}>
                <MenuList id="split-button-menu">
                  <Link href={`/dashboard/${sucursal.id}`}>
                    <MenuItem
                      selected={"Métricas" === menuItemSelected}
                      onClick={handleMenuItemClick}
                    >
                      Métricas
                    </MenuItem>
                  </Link>
                  {user.role === 'Admin'? <Divider /> &&
                  <USure clave={sucursal.name} handleAgree={handleAgree}>
                    <MenuItem
                      selected={"Borrar" === menuItemSelected}
                      onClick={handleMenuItemClick}
                      sx={{
                        color: "rgb(244, 67, 54)",
                      }}
                    >
                      Borrar
                    </MenuItem>
                  </USure>
                  :null
                  }

                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
