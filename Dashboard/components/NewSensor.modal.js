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

const ADD_SENSOR = gql`
  mutation AddSensor(
    $addSensorData: sensorInput!
    $addSensorSucursalId: String!
  ) {
    addSensor(data: $addSensorData, sucursalId: $addSensorSucursalId) {
      data {
        type
      }
    }
  }
`;

export default function NewSensor({ sucursalName = "Sucursal", id = "" }) {
  const [open, setOpen] = React.useState(false);
  const [addSensor] = useMutation(ADD_SENSOR);
  const [macAddress, setMacAddress] = React.useState("");
  const [selectValue, setSelectValue] = React.useState("Ingreso");

  const handleSelectChange = (e) => {
    setSelectValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      macAddress.length < 10 ||
      macAddress.length > 100 ||
      (selectValue !== "Ingreso" && selectValue !== "Egreso")
    ) {
      return false;
    }
    addSensor({
      variables: {
        addSensorData: {
          macAdress: macAddress,
          type: selectValue,
        },
        addSensorSucursalId: id,
      },
    });
    handleClose();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleMacChange = (e) => {
    setMacAddress(e.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleScan = (data) => {
    setMacAddress(data);
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
              id="select"
              value={selectValue}
              label="Tipo"
              onChange={handleSelectChange}
            >
              <MenuItem value={"Ingreso"}>Ingreso</MenuItem>
              <MenuItem value={"Egreso"}>Egreso</MenuItem>
            </Select>
            <Grid style={{ marginTop: 1 }} container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  id="inpMacAdress"
                  label="MacAddress"
                  variant="outlined"
                  value={macAddress}
                  onChange={handleMacChange}
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
          <Button onClick={handleSubmit}>Nuevo Sensor</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
