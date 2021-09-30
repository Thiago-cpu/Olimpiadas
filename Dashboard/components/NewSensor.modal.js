import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Fab,
  Tooltip,
  TextField,
  Grid,
} from "@mui/material";
import SensorsIcon from "@mui/icons-material/Sensors";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useMutation, gql } from "@apollo/client";
import QrScanner from "./QrScanner.modal";
import { useFormik } from "formik";
import * as Yup from "yup";

const ADD_SENSOR = gql`
  mutation AddSensor(
    $addSensorData: sensorInput!
    $addSensorSucursalId: String!
  ) {
    addSensor(data: $addSensorData, sucursalId: $addSensorSucursalId) {
      data {
        type
      }
      errors{
        field
        message
      }
    }
  }
`;

export default function NewSensor({ sucursalName = "Sucursal", id = "" }) {
  const [open, setOpen] = React.useState(false);
  const [addSensor] = useMutation(ADD_SENSOR);

  const {
    handleSubmit,
    setValues,
    handleBlur,
    handleChange,
    values,
    errors,
    touched,
    isSubmitting,
  } = useFormik({
    initialValues: {
      macAddress: "",
      type: "Ingreso",
    },
    validationSchema: Yup.object({
      macAddress: Yup.string()
        .required("Requerido")
        .min(10, "Mínimo 10 caracteres")
        .max(100, "Máximo 100 caracteres"),
      type: Yup.mixed().oneOf(['Ingreso', 'Egreso'])
        .required("Requerido")
    }),
    onSubmit: async() => {
      const {data, errors} = await addSensor({
        variables: {
          addSensorData: {
            macAdress: values.macAddress,
            type: values.type,
          },
          addSensorSucursalId: id,
        },
      })
      const {addSensor: sensorData} = data
      if(errors || sensorData.errors){
        if(sensorData.errors[0].field === "macAddress"){
          alert("El sensor ya está registrado")
        } else {
          alert("Algo fue mal")
        }
      } else {
        alert("Listo")
      }
    },
  });


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleScan = (data) => {
    setValues(prevValues => {
      prevValues.macAddress = data
      return {...prevValues}
    })
  };

  return (
    <div>
      <Tooltip title="Añadir Sensor" placement="right" arrow>
        <Fab color="primary" aria-label="add" onClick={handleClickOpen}>
          <SensorsIcon />
        </Fab>
      </Tooltip>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Nuevo Sensor para {sucursalName}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ marginTop: 1 }}>
            <InputLabel id="SelectType">Tipo</InputLabel>
            <Select
              labelId="SelectType"
              name="type"
              label="Tipo"
              value={values.type}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              error={touched.type && Boolean(errors.type)}
              // helperText={touched.type && errors.type}
            >
              <MenuItem value={"Ingreso"}>Ingreso</MenuItem>
              <MenuItem value={"Egreso"}>Egreso</MenuItem>
            </Select>
            <Grid style={{ marginTop: 1 }} container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  name="macAddress"
                  label="MacAddress"
                  variant="outlined"
                  disabled={isSubmitting}
                  value={values.macAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.macAddress && Boolean(errors.macAddress)}
                  helperText={touched.macAddress && errors.macAddress}
                />
              </Grid>
              <Grid item xs={1} alignSelf="center">
                <span>o</span>
              </Grid>
              <Grid item xs={3}>
                <QrScanner handleParentScan={handleScan} />
              </Grid>
            </Grid>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button disabled={isSubmitting} onClick={handleSubmit}>Nuevo Sensor</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
