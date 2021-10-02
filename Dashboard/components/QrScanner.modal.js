import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Fab,
  Tooltip,
} from "@mui/material";
import { QrReader } from "@blackbox-vision/react-qr-reader";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

export default function QrScanner({ handleParentScan }) {
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleResult = (scanResult, err) => {
    if (!!scanResult) {
      setResult(scanResult?.text);
      handleParentScan(scanResult?.text);
      handleClose();
    }
  };
  return (
    <div>
      <Tooltip title="Scanear QR" placement="right" arrow>
        <Fab color="primary" aria-label="add" onClick={handleClickOpen}>
          <QrCodeScannerIcon />
        </Fab>
      </Tooltip>
      <Dialog fullWidth maxWidth="xs" onClose={handleClose} open={open}>
        <DialogTitle>Escaneando QR</DialogTitle>
        <DialogContent>
          <div>
            <QrReader
              onResult={handleResult}
              style={{ width: "100%" }}
              constraints={{ facingMode: "environment" }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
