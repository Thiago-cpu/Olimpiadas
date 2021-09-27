import React, { useState } from "react";
import {
  Typography,
  Box,
  Container,
  FilledInput,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  TextField,
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton'
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { gql, useMutation} from '@apollo/client'
import Router from 'next/router'

const LOGIN_MUTATION = gql`
    mutation Login($loginData: userInput!) {
  login(data: $loginData) {
    authToken
    data {
      id
      name
      role
      sucursales {
        name
        id
      }
    }
    errors {
      field
      message
    }
  }
}
`

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
const [login] = useMutation(LOGIN_MUTATION)
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
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Requerido")
        .min(3, "Mínimo 3 caracteres")
        .max(15, "Máximo 15 caracteres"),
      password: Yup.string()
        .required("Requerido")
        .max(12, "Máximo 12 caracteres"),
    }),
    onSubmit: async (values) => {
        try{
            const { data } = await login({
                variables: {
                    loginData: {
                        ...values
                    },
                },
            })
            const {login: loginData} = data
            console.log(loginData)
            if(loginData.authToken){
              window.localStorage.setItem("auth", loginData.authToken)
              Router.push("/sucursal/misSucursales")
            }
            if(loginData.errors){
              alert(loginData.errors[0].message)
            }
        }
        catch(e){
            console.log(e)
        }
  }
  });
  

  const handleClickShowPassword = () => {
    setShowPassword((previousShowPassword) => !previousShowPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: "100%", maxWidth: 500, marginTop: "3em" }}
      m={"auto"}
    >
      <Typography align={"center"} variant="h3" mb="1em" component="div">
        Iniciar Sesión
      </Typography>
      <Container
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        maxWidth="sm"
      >
        <TextField
          label="Nombre de usuario"
          variant="filled"
          fullWidth
          margin="normal"
          name="name"
          id="name"
          value={values.name}
          onChange={handleChange}
          disabled={isSubmitting}
          error={touched.name && Boolean(errors.name)}
          helperText={touched.name && errors.name}
          onBlur={handleBlur}
        />
        <FormControl fullWidth variant="filled" margin="normal">
          <InputLabel htmlFor="password">Contraseña</InputLabel>
          <FilledInput
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            error={touched.password && Boolean(errors.password)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  name="showPassword"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
          <FormHelperText id="password">{
            touched.password && errors.password
          }</FormHelperText>
        </FormControl>

        <div
          style={{
            margin: "0.5em 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <LoadingButton 
            type="submit"
            variant="contained" 
            sx={{ width: "155px", height: "42px" }}
            loading={isSubmitting}
            disabled={isSubmitting}
            
        >
            Confirmar
          </LoadingButton>
          <Link href="#" underline="hover" variant="caption" mt="0.2em">
            ¿Olvidaste la contraseña?
          </Link>
        </div>
        <Link href="./register">
          <LoadingButton disabled={isSubmitting} variant="outlined" sx={{ width: "155px", height: "42px" }}>
            Registrate
          </LoadingButton>
        </Link>
      </Container>
    </Box>
  );
}
