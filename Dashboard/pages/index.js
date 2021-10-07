import { Card, CardContent, CircularProgress, Typography, Button, CardActions, Grid, Box} from '@mui/material'
import Link from 'next/link'
import { useQuery, gql } from '@apollo/client'
import Settings from '../components/settings'
import { useContext } from 'react'
import UserContext from "../context/userContext";

const SUCURSALES = gql`
query Sucursales {
  sucursales {
    errors {
      message
      field
    }
    data {
      id
      name
      capacidadMaxima
      localizacion
      encargado {
        name
      }
    }
  }
}`

const IndexPage = () => {
  const { loading, error, data } = useQuery(SUCURSALES)
  const {user} = useContext(UserContext)

  if(loading) return <Box container align="center"><CircularProgress /></Box>
  if(error) return <Typography align="center">Error</Typography>

  const renderSettings = (encargadoName, sucursalName, sucursalId) => {
    if(encargadoName === user.name || user.role === 'Admin'){
      return(
        <Settings 
        sx={{
          position: "absolute",
          top: "0.3em",
          right: "0.3em"
        }} 
        sucursal = {{
          name: sucursalName,
          id: sucursalId
        }}/>
        )
    }
    return null
  }

  return (
 <Box>
   <Grid  container spacing={2}>
     {
      data && data.sucursales.data.map(({
        name,
        capacidadMaxima,
        localizacion,
        encargado: {
          name: encargadoName
        },
        id
      }) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={id}>
          <Card >
            <CardContent sx={{
              position: "relative"
            }}>
              <Typography gutterBottom variant="h5" component="div">
                {name}
              </Typography>
              
              {renderSettings(encargadoName, name, id)}

              <Typography variant="body2" color="text.secondary">
                Capacidad máxima: {capacidadMaxima} <br/>
                Localización: {localizacion} <br/>
                Encargado: {encargadoName} <br/>
              </Typography>
            </CardContent>
            <CardActions>
              <Link href={`/sucursal/${id}`}>
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
