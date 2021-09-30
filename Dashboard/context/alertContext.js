import { createContext, useEffect, useState } from "react";
import {
  Alert,
  AlertTitle,
  IconButton,
  Snackbar
} from "@mui/material";


const AlertContext = createContext();

export function AlertContextProvider({ children }) {
  const [open, setOpen] = useState(true);
  const vertical = 'top'
  const horizontal = 'right'
  const [alert, setAlert] = useState({
    severity: "info",
    text: "more text",
  });

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    setOpen((prevOpen) => !prevOpen);
  }, [alert]);

  return (
    <AlertContext.Provider value={{ setAlert }}>
      <Snackbar open={open} anchorOrigin={{ vertical, horizontal }} autoHideDuration={6000} onClose={handleClose}>
        <Alert
        onClose={handleClose}
        severity={alert.severity}
        sx={{ mb: 3 }}
        >
          {alert.text}
        </Alert>
      </Snackbar>
      {children}
    </AlertContext.Provider>
  );
}

export default AlertContext;
