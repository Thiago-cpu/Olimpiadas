import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { gql, useSubscription } from '@apollo/client';
import { initializeApollo, addApolloState } from '../../lib/apolloClient'

const SUBSCRIPTION = gql`
  subscription actualPeople($actualPeopleSucursalId: String!) {
    actualPeople(sucursalId: $actualPeopleSucursalId) {
      cant
      maxCant
    }
  }
`


export default function Ingreso({id, initialData}) {
  const { data, loading } = useSubscription(
    SUBSCRIPTION,
    {
    variables: { actualPeopleSucursalId: id }
    }
  );
  let cantidadDePersonas, maximaCantidadDePersonas;
  if(loading) {
    cantidadDePersonas = initialData.lastMove.data.cantidadActual
    maximaCantidadDePersonas = initialData.lastMove.data.sucursal.capacidadMaxima
  } else {
    cantidadDePersonas = data.actualPeople.cant
    maximaCantidadDePersonas = data.actualPeople.maxCant
  }

  const puedeIngresar = cantidadDePersonas < maximaCantidadDePersonas;
  const personasAretirarse = cantidadDePersonas-maximaCantidadDePersonas+1
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
      { puedeIngresar ? `Hay ${maximaCantidadDePersonas - cantidadDePersonas} espacios restantes.` : `Deberás esperar a que se retire${personasAretirarse>1?`n ${personasAretirarse} personas`:` 1 persona`}`}
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

const GET_INITIAL_DATA = gql`
  query lastMove($lastMoveSucursalId: String!) {
    lastMove(sucursalId: $lastMoveSucursalId) {
      data {
        sucursal {
          capacidadMaxima
        }
        cantidadActual
      }
    }
  }
`

export async function getServerSideProps({params}){
  const {id} = params

  const client = initializeApollo()
  const { data: initialData } = await client.query({
    query:GET_INITIAL_DATA,
    variables: {
      lastMoveSucursalId: id
    }
  });
  console.log(initialData)
  return addApolloState(client, {
    props: {
      id,
      initialData
    },
  })
}