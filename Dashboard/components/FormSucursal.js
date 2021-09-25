import {
    Box,
    TextField,
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton'
import { useFormik } from "formik";
import * as Yup from "yup";
export default function FormSucursal({onSubmit = async() =>{console.log("hola")}}){
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
          localizacion: ""
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
        onSubmit: () => {
            onSubmit(values)
        }
        })
    return (
    <Box
    component="form"
    onSubmit={handleSubmit}
    sx={{ width: "100%", maxWidth: 500 }}
    m={"auto"}>
        <TextField
        autoFocus
        fullWidth
        margin="none"
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
        helperText={touched.localizacion && errors.localizacion}/>
        <LoadingButton 
        type="submit"
        variant="contained" 
        align="right"
        sx={{ width: "155px", marginTop: "15px", height: "42px" }}
        loading={isSubmitting}
        disabled={isSubmitting}>
            Confirmar
        </LoadingButton>
  </Box>)
}