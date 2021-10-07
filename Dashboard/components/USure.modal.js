import {useState, Children, cloneElement, isValidElement} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from 'yup'

export default function USure({ clave, handleAgree, children }) {
  if(!handleAgree || !clave || !children) return "faltan parametros"
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('')


  const handleClickOpen = () => {
    setOpen(true);
  };

  const {
    handleSubmit,
    handleBlur,
    handleChange,
    values,
    errors,
    touched,
    isSubmitting,
  } = useFormik({
    initialValues: {
      clave: '',
    },
    validationSchema: Yup.object({
      clave: Yup.string()
        .required('Requerido') //validate if blnum starts with carriercode
        .test("Check startsWith","Incorrecto",(value) => {
          return clave.startsWith(value)
        })
    }),
    onSubmit: async (values) => {
      handleClose()
      await handleAgree(values)
    }
  })

  const handleClose = () => setOpen(false)

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
        <DialogTitle id="alert-dialog-title">¿Estás seguro?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Escriba <strong>{clave}</strong> para continuar
          </DialogContentText>
          <TextField
            margin="dense"
            id="claveInp"
            name="clave"
            label="clave"
            type="text"
            fullWidth
            variant="standard"
            value={values.clave}
            onChange={handleChange}
            disabled={isSubmitting}
            error={touched.clave && Boolean(errors.clave)}
            helperText={touched.clave && errors.clave}
            onBlur={handleBlur}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} autoFocus>
            Continuar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
