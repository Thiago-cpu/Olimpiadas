import {
  Box,
  TextField,
  DialogActions,
  DialogContent,
  Button,
} from "@mui/material";
import AlertContext from "../context/alertContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, gql } from "@apollo/client";
import { useContext } from "react";
import { ADD_SUCURSAL } from "../gql/mutations/addSucursal";

export default function FormSucursal({idSucursal, handleClose }) {
  const {setAlert} = useContext(AlertContext)
  const [addSucursal] = useMutation(ADD_SUCURSAL,{
    update(cache, {data}) {
      if(data.addSucursal.errors) return
      const newSucursalData = data.addSucursal.data
      const newSucursal = cache.writeFragment({
        id: cache.identify(newSucursalData),
        fragment: gql`
          fragment MySucursal on Sucursal{
            id
            name
            capacidadMaxima
            localizacion
            encargado {
              id
              name
            }
          }
        `,
        data: newSucursalData
      })
      cache.modify({
        fields: {
          sucursales(existingSucursales) {
            const incomingSucursales = {...existingSucursales}
            if(newSucursal) incomingSucursales.data = [...existingSucursales.data, newSucursal ]
            return incomingSucursales
          },
        }
      });
      cache.modify({
        id: cache.identify(newSucursalData.encargado),
        fields: {
          sucursales(existingSucursales){
            return [...existingSucursales, newSucursal]
          }
        }
      })
    }
  });
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
      name: "",
      capacidadMaxima: 5,
      localizacion: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Requerido")
        .min(3, "Mínimo 3 caracteres")
        .max(30, "Máximo 30 caracteres"),
      capacidadMaxima: Yup.number()
        .required("Requerido")
        .positive("Debería de ser un numero postivo")
        .integer("Debería de ser un entero"),
      localizacion: Yup.string()
        .required("Requerido")
        .min(10, "Mínimo 10 caracteres")
        .max(255, "Máximo 255 caracteres"),
    }),
    onSubmit: async () => {
      const { data, errors } = await addSucursal({
        variables: {
          addSucursalData: {
            ...values,
            encargadoId: idSucursal,
          },
        },
      });
      const {addSucursal: sucursalData} = data
      if(sucursalData.errors){
        setAlert({
          severity: "error",
          text: sucursalData.errors[0].message,
        })
      }
      if(errors){
        setAlert({
          severity: "error",
          text: "Algo ha salido mal",
        })
      }
      if(sucursalData.data){
        setAlert({
          severity: "success",
          text: `La sucursal ${values.name} fue añadida correctamente`,
        })
        handleClose()
      }
    },
  });
  return (
    <>
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
            label="Localizacion"
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
          Nueva Sucursal
        </Button>
      </DialogActions>
    </>
  );
}
