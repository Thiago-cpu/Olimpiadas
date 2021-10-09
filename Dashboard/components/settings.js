import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Tooltip,
  Icon,
  IconButton,
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
import AlertContext from '../context/alertContext';
import UserContext from "../context/userContext";
import DeleteSucursal from "./DeleteSucursal";
import UpdateSucursal from "./UpdateSucursal.modal";

export default function Settings({ sx = {}, sucursal }) {
  if(!sucursal) return "se necesita sucursal"
  const {setAlert} = useContext(AlertContext)
  const {user} = useContext(UserContext)
  const [open, setOpen] = useState(false);

  const settingsRef = useRef(null);

  const handleMenuListToggle = () => {
    setOpen(true);
  };

  const handleMenuListClose = () => {
    setOpen(false);
  };

  const deleteSucursalRender = () => 
  user.role === 'Admin'
  ? <Divider /> &&<DeleteSucursal sucursal={sucursal} onClick={handleMenuListClose}/>
  :null;

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
                    <MenuItem>
                      Métricas
                    </MenuItem>
                  </Link>
                  <UpdateSucursal sucursal={sucursal}>
                    <MenuItem>
                      Editar
                    </MenuItem>
                  </UpdateSucursal>
                  {deleteSucursalRender()}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
