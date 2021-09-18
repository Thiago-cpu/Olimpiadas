import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FilledInput, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, Link, TextField } from '@mui/material';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login() {
        const [values, setValues] = React.useState({
          password: '',
          showPassword: false,
        });
      
        const handleChange = (prop) => (event) => {
          setValues({ ...values, [prop]: event.target.value });
        };
      
        const handleClickShowPassword = () => {
          setValues({
            ...values,
            showPassword: !values.showPassword,
          });
        };
      
        const handleMouseDownPassword = (event) => {
          event.preventDefault();
        };
    return (
        <Box sx={{ width: '100%', maxWidth: 500, marginTop:'3em' }} m={'auto'}>
            <Typography  align={'center'} variant="h3" mb='1em' component="div">
                Iniciar Sesión
            </Typography>
            <Container sx={{  display: 'flex', flexDirection: 'column', alignItems: 'center'}} maxWidth="sm">
                <TextField id="filled-basic" label="Nombre de usuario" variant="filled" fullWidth margin="normal"/>
                <FormControl fullWidth variant="filled" margin="normal">
                    <InputLabel htmlFor="filled-adornment-password">Contraseña</InputLabel>
                    <FilledInput
                        id="filled-adornment-password"
                        type={values.showPassword ? 'text' : 'password'}
                        value={values.password}
                        onChange={handleChange('password')}
                        endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            >
                            {values.showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                        }
                    />
                    <FormHelperText id="outlined-weight-helper-text">De 6 a 8 caractéres</FormHelperText>
                 </FormControl>
                
                <div style={{margin:'0.5em 0', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <Button variant="contained" sx={{width:'155px', height:'42px'}}>Confirmar</Button>
                    <Link href="#" underline="hover" variant="caption" mt='0.2em'>¿Olvidaste la contraseña?</Link>
                </div>
                <Button variant="outlined" sx={{width:'155px', height:'42px'}}>Registrate</Button>
            </Container>
        </Box>
    )

}