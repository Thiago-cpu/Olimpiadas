import { initializeApollo, addApolloState } from '../lib/apolloClient'
import { Card, CardContent, CardMedia, Typography, Button, CardActions, Grid, Box} from '@mui/material'
import Link from 'next/link'
import { useQuery, gql } from '@apollo/client'

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
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {name}
              </Typography>
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
