import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';


export default function Ingreso() {
  const [cantidadDePersonas, setCantidadDePersonas] = useState(50);
  const [maximaCantidadDePersonas, setMaximaCantidadDePersonas] = useState(50)

  const puedeIngresar = cantidadDePersonas < maximaCantidadDePersonas;
  const colorDeFondo = puedeIngresar ? '#BAF56E' : '#E37B5A';
  
  return (
    <>
    <Box
        sx={{
          width: '100%',
          height: '100vh',
          bgcolor: colorDeFondo,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
    >
     
      <Typography variant="h1" gutterBottom component="div">
          { puedeIngresar ? 'Puedes ingresar' : 'No puedes ingresar'}
      </Typography>
      
      <Typography variant="h4" gutterBottom component="div">
      { puedeIngresar ? `Hay ${maximaCantidadDePersonas - cantidadDePersonas} espacios restantes.` : 'Deberás esperar a que alguien se retire.'}
      </Typography>
    
    </Box>
    <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </>
  )
}