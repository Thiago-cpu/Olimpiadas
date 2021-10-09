import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
} from "@mui/material";
import { Children, cloneElement, isValidElement, useContext, useState } from "react";
import AlertContext from "../context/alertContext";
import useUpdateSucursal from "../hooks/useUpdateSucursal";

export default function UpdateSucursal({ sucursal, children }) {
  const { setAlert } = useContext(AlertContext);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const {
    handleSubmit,
    handleBlur,
    handleChange,
    values,
    errors,
    touched,
    isSubmitting,
  } = useUpdateSucursal(sucursal, handleClose)
  
  const childrenWithClick = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child, { onClick: handleClickOpen });
    }
    return child;
  });

  return (
    <>
      {childrenWithClick}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle sx={{ textAlign: "center" }} id="alert-dialog-title">
          {sucursal.name}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: "100%", maxWidth: 400 }}
            m={"auto"}
          >
            <TextField
              autoFocus
              fullWidth
              id="name"
              label="Nombre de la sucursal"
              type="text"
              variant="standard"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              error={touched.name && Boolean(errors.name)}
              helperText={touched.name && errors.name}
            />
            <TextField
              fullWidth
              id="capacidadMaxima"
              label="Capacidad máxima"
              type="number"
              variant="standard"
              value={values.capacidadMaxima}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              error={touched.capacidadMaxima && Boolean(errors.capacidadMaxima)}
              helperText={touched.capacidadMaxima && errors.capacidadMaxima}
            />
            <TextField
              fullWidth
              id="localizacion"
              label="Localización"
              type="text"
              variant="standard"
              value={values.localizacion}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              error={touched.localizacion && Boolean(errors.localizacion)}
              helperText={touched.localizacion && errors.localizacion}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            Actualizar Sucursal
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}