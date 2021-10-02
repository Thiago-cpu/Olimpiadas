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
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Requerido")
        .min(3, "Mínimo 3 caracteres")
        .max(15, "Máximo 15 caracteres"),
      password: Yup.string()
        .required("Requerido")
        .max(12, "máximo 12 caracteres"),
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

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          variant="contained"
          sx={{ width: "155px", height: "42px" }}
        >
          Confirmar
        </LoadingButton>
        <div
          style={{
            margin: "0.5em 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <NextLink href="/login">
            <Link>
              <LoadingButton
                variant="outlined"
                sx={{ width: "155px", height: "42px" }}
                disabled={isSubmitting}
              >
                Iniciar Sesión
              </LoadingButton>
            </Link>
          </NextLink>
        </div>
      </Container>
    </Box>
  );
}
