import React, { useState, useContext } from "react";
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
import LoadingButton from "@mui/lab/LoadingButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { gql, useMutation } from "@apollo/client";
import Router from "next/router";
import { setCookie } from "nookies";
import UserContext from "../context/userContext";
import NextLink from "next/link";
import AlertContext from "../context/alertContext";

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
`;

export default function Login() {
  const { setAlert } = useContext(AlertContext);
  const { setUser } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [login] = useMutation(LOGIN_MUTATION);
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
      try {
        const { data } = await login({
          variables: {
            loginData: {
              ...values,
            },
          },
        });
        if (!data.login?.errors?.length) {
          setCookie(null, "token", data.login.authToken, {
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
          });
          const { id, role, name } = data.login.data;
          setUser({
            isLogged: true,
            role,
            name,
          });
          Router.push("/misSucursales");
        } else {
          setAlert({
          severity: "error",
          text: "Las credenciales no coinciden",
        });
        }
      } catch (e) {
        setAlert({
          severity: "error",
          text: "Algo ha ido mal, intentelo nuevamente",
        });
      }
    },
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
          <FormHelperText id="password">
            {touched.password && errors.password}
          </FormHelperText>
        </FormControl>

        <Box sx={{
          display: 'flex', 
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: '0.5em',
          gap: '0.5em',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          width: '100%',
          }}>
        <LoadingButton
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          variant="contained"
          sx={{ height: "42px", flex: '1'}}
        >
          Confirmar
        </LoadingButton>
        
          <NextLink href="/register" passHref>
              <LoadingButton
                component="a"
                variant="outlined"
                sx={{  height: "42px", flex: '1' }}
                disabled={isSubmitting}
              >
                Registrate
              </LoadingButton>
          </NextLink>
        </Box>
      </Container>
    </Box>
  );
}
