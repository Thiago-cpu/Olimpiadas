import { Card, CardContent, CircularProgress, Typography, Button, CardActions, Grid, Box} from '@mui/material'
import Link from 'next/link'
import { useQuery, gql } from '@apollo/client'
import Settings from '../components/settings'
import { useContext } from 'react'
import UserContext from "../context/userContext";
import { SUCURSALES } from '../gql/queries/sucursales'


const IndexPage = () => {
  const { loading, error, data } = useQuery(SUCURSALES)
  const {user} = useContext(UserContext)

  if(loading) return <Box container align="center"><CircularProgress /></Box>
  if(error) return <Typography align="center">Error</Typography>

  const renderSettings = (sucursal) => {
    if(sucursal.name === user.name || user.role === 'Admin'){
      return(
        <Settings 
        sx={{
          position: "absolute",
          top: "0.3em",
          right: "0.3em"
        }} 
        sucursal = {sucursal}/>
        )
    }
    return null
  }

  return (
 <Box>
   <Grid  container spacing={2}>
     {
      data && data.sucursales.data.map(sucursal => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={sucursal.id}>
          <Card >
            <CardContent sx={{
              position: "relative"
            }}>
              <Typography gutterBottom variant="h5" component="div">
                {sucursal.name}
              </Typography>
              
              {renderSettings(sucursal)}

              <Typography variant="body2" color="text.secondary">
                Capacidad máxima: {sucursal.capacidadMaxima} <br/>
                Localización: {sucursal.localizacion} <br/>
                Encargado: {sucursal.encargado.name} <br/>
              </Typography>
            </CardContent>
            <CardActions>
              <Link href={`/sucursal/${sucursal.id}`}>
                <Button component="a" size="small">Visitar</Button>
              </Link>
            </CardActions>
          </Card> 
        </Grid>
          ))
     }
    
  </Grid>
 </Box>
)}

export default IndexPage
