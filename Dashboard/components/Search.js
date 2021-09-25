import { TextField } from "@mui/material";
import { useState } from "react";

export default function Search({onChange, styles={}, label="buscar"}){
  const [value, setValue] = useState('')

  const handleChange = (e) => {
    setValue(e.target.value)
    onChange(e.target.value)
  }

  return <TextField id="standard-basic" sx={styles} label={label} value={value} onChange={handleChange} variant="standard" />

}