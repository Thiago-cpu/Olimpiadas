import { useState, useContext } from "react";
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
import AlertContext from "../context/alertContext";
import NextLink from "next/link";
import Head from "next/head";

const REGISTER = gql`
  mutation Register($registerData: userInput!) {
    register(data: $registerData) {
      errors {
        field
        message
      }
      data {
        name
      }
    }
  }
`;

export default function Register() {
  const { setAlert } = useContext(AlertContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [register] = useMutation(REGISTER);

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
      passwordConfirm: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Requerido")
        .min(3, "Mínimo 3 caracteres")
        .max(20, "Máximo 20 caracteres"),
      password: Yup.string()
        .required("Requerido")
        .max(12, "Máximo 12 caracteres")
        .oneOf([Yup.ref("passwordConfirm"), null], "Las contraseñas no coinciden"),
      passwordConfirm: Yup.string()
        .required("Requerido")
        .max(12, "Máximo 12 caracteres")
        .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden"),
    }),
    onSubmit: async (values) => {
      try {
        const { data, errors } = await register({
          variables: {
            registerData: {
              ...values,
            },
          },
        });
        const { register: registerData } = data;
        if (!registerData.errors && !errors) {
          //usuario registrado correctamente enviar a login
          Router.push("/login");
        } else {
          if (registerData.errors) {
            setAlert({
              severity: "info",
              text: registerData.errors[0].message,
            });
          }
        }
      } catch (e) {
        console.log(e);
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
      <Head>
        <title>Registro</title>
      </Head>
      <Typography align={"center"} variant="h3" mb="1em" component="div">
        Registrate
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
                  aria-label="Toggle password visibility"
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
        
        <FormControl fullWidth variant="filled" margin="normal">
          <InputLabel htmlFor="passwordConfirm">Confirmar contraseña</InputLabel>
          <FilledInput
            type={showConfirmPassword ? "text" : "password"}
            name="passwordConfirm"
            id="passwordConfirm"
            value={values.passwordConfirm}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            error={touched.passwordConfirm && Boolean(errors.passwordConfirm)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="Toggle password visibility"
                  name="showPassword"
                  onClick={()=>setShowConfirmPassword(prevState => !prevState)}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
          <FormHelperText id="passwordConfirm">
            {touched.passwordConfirm && errors.passwordConfirm}
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
          <NextLink href="/login" passHref>
              <LoadingButton
                component="a"
                variant="outlined"
                sx={{  height: "42px", flex: '1' }}
                disabled={isSubmitting}
              >
                Iniciar Sesión
              </LoadingButton>
          </NextLink>
        </Box>
      </Container>
    </Box>
  );
}
