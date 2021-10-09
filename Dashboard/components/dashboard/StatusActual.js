import { useSubscription } from "@apollo/client";
import { Button, Box, Card, CardActions, CardContent, CardHeader, List, ListItem, Typography } from "@mui/material";
import { ENTRIES_BY_DATE } from "../../gql/queries/entriesByDate";
import { MOVIMIENTOS } from "../../gql/queries/movesByDate";
import { SUBSCRIPTION } from "../../gql/subscriptions/actualMoves";
import { gql } from "@apollo/client";
import Link from 'next/link'

export default function StatusActual({id, initialData, handleCapacidadMaxima, capacidadMaxima}) {
  const { data: subData } = useSubscription(SUBSCRIPTION, {
    variables: { actualPeopleSucursalId: id },
    onSubscriptionData: ({client, subscriptionData}) => {
      if(subscriptionData.data.errors) return
      const move = subscriptionData.data.actualPeople

      const newMove = {
        __typename: 'Movimiento',
        id: move.id,
        cantidadActual: move.cantidadActual,
        createdAt: move.createdAt,
      }
      
      const date = new Date(move.createdAt)
      date.setHours(0,0,0,0)
      client.writeQuery({
        query: MOVIMIENTOS,
        variables: {
          movesDia: date.toISOString(),
          sucursalId: move.sucursal.id
        },
        data:{
          moves: {
            data: [newMove]
          }
        }
      })
      if(move.type === 'Ingreso'){
        const { entriesByDate } = client.readQuery({
          query: ENTRIES_BY_DATE,
          variables: {
            sucursalId: move.sucursal.id,
            movesDia: date.toISOString()
          }
        })
        if(entriesByDate.data[0].fecha === date.toISOString()){

          const entryFrag = gql`
            fragment myEntry on entriesOfDate{
              id
              entries
              fecha
            }
          `

          const entry = client.readFragment({
            id: `${entriesByDate.data[0].__typename}:${entriesByDate.data[0].id}`,
            fragment: entryFrag
          })

          const newEntry = {...entry}
          newEntry.entries = newEntry.entries + 1

          client.writeFragment({
            id: `${entriesByDate.data[0].__typename}:${entriesByDate.data[0].id}`,
            fragment: entryFrag,
            data: newEntry
          })
        }
      }
    }
  });

  const cantActual = subData
  ? subData.actualPeople.cantidadActual
  : initialData.data.cantidadActual

  if(subData) handleCapacidadMaxima(subData.actualPeople?.sucursal?.capacidadMaxima)

  return (
    <Card sx={{ flexBasis: "16rem", flexGrow: 1, height: "fit-content" }}>
      <CardHeader
        title="Concurrencia actual"
        subheader={`${new Intl.DateTimeFormat("es-AR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date())}`}
      />

      <CardContent sx={{ padding: "0" }}>
        <List>
          <ListItem>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "inherit",
              }}
            >
              <Typography variant="subtitle2">Clientes en el local</Typography>
              <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                {cantActual}
              </Typography>
            </Box>
          </ListItem>
          <ListItem>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "inherit",
              }}
            >
              <Typography variant="subtitle2">Capacidad máxima</Typography>
              <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                {capacidadMaxima}
              </Typography>
            </Box>
          </ListItem>
        </List>
      </CardContent>
      <CardActions>
        <Link href={`/sucursal/${id}`} passHref>
          <Button size="large" component="a">
            Ver pantalla de ingreso
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}