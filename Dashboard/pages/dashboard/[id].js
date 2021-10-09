import * as React from "react";
import { initializeApollo, addApolloState } from "../../lib/apolloClient";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  List,
  ListItem,
  Typography,
  CircularProgress
} from "@mui/material";
import { Box } from "@mui/system";
import {
  AreaChart,
  Area,
  ReferenceLine,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { useContext } from "react";
import userContext from "../../context/userContext";
import { useSubscription, gql, useQuery, useLazyQuery } from "@apollo/client";
import EntriesByDate from "../../components/entriesByDate";
import {useRouter} from "next/router";
import { GET_MY_SUCURSALES } from "../../gql/queries/MySucursales";
import { MOVIMIENTOS } from "../../gql/queries/movesByDate";
import { SUBSCRIPTION } from "../../gql/subscriptions/actualMoves";
import { LAST_MOVE } from "../../gql/queries/lastMove";
import { ENTRIES_BY_DATE } from "../../gql/queries/entriesByDate";

export default function DashBoard({ id, initialData }) {
  const router = useRouter();
  const [getMoves, {called,data: moveData, loading,  refetch}] = useLazyQuery(MOVIMIENTOS)
  const {data: sucursalesData, loading: sucursalesLoading, error: sucursalesError} = useQuery(GET_MY_SUCURSALES)
  const [chartData, setChartData] = React.useState([])
  const [dateSelected, setDateSelected] = React.useState()

  if(sucursalesError) {
    router.push("/")
  }
  const sucursalName = sucursalesData?.me?.data?.sucursales.find(sucursal => sucursal.id === id)?.name
  if (initialData.errors) {
    return <p>{initialData.errors[0].message}</p>;
  }
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
  const { user } = useContext(userContext);

  
  React.useEffect(()=>{
    if(moveData && moveData.moves && moveData.moves.data){
      setChartData(() => moveData.moves.data.map(move => {
                          const newMove = {...move}
                          newMove.createdAt = +new Date(move.createdAt)
                          return newMove
                        }))
                        
    }
  },[moveData])

  const onDateClick = (rowSelected) => {
    const fecha = rowSelected.fecha
    setDateSelected(new Intl.DateTimeFormat('es-AR', {dateStyle: "long"}).format(new Date(fecha)))
    if(!called){
      getMoves({variables: {sucursalId: id, movesDia: fecha}})
    }else {
      refetch({sucursalId: id, movesDia: fecha})
    }
  }
  const offset = () => {
    let maxClient = 0
    if(!chartData.length) return maxClient

    chartData.forEach(move => {
      if(move.cantidadActual > maxClient) maxClient = move.cantidadActual
    })
    return (maxClient-capacidadMaxima)/maxClient

  }

  const cantActual = subData
  ? subData.actualPeople.cantidadActual
  : initialData.data.cantidadActual

  const capacidadMaxima = subData
  ? subData.actualPeople.sucursal.capacidadMaxima
  : initialData.data.sucursal.capacidadMaxima

  const off = offset()

  if(sucursalesLoading) return <CircularProgress />
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: "1em",
        rowGap: "1em",
        paddingLeft: "1rem",
        paddingRight: "1rem",
      }}
    >
      <Box sx={{ flexBasis: "100%" }}>
        <Typography variant="h5">Hola, {user.name}</Typography>
        <Typography variant="h6" sx={{ color: "text.secondary" }}>
          Aquí esta la información de {sucursalName}
        </Typography>
      </Box>

      <EntriesByDate onDateClick={onDateClick} sucursalId={id}/>

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
                <Typography variant="subtitle2">
                  Clientes en el local
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "text.secondary" }}
                >
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
                <Typography
                  variant="subtitle2"
                  sx={{ color: "text.secondary" }}
                >
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

      <Card sx={{ flexBasis: "100%", flexGrow: 1 }}>
        <CardContent sx={{textAlign: "center"}}>
          {loading 
          ? <CircularProgress />
          : !chartData.length 
           ? <Typography variant="h6">No hay datos para mostrar</Typography>
           : <>
          <Typography variant="h7">{dateSelected}</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="createdAt" name="Tiempo" scale='time' type='number' domain={[chartData[0]?.createdAt, chartData[chartData.length-1]?.createdAt]} tickFormatter={timestamp => new Intl.DateTimeFormat('es-AR', {hour: "2-digit", minute: "2-digit"}).format(new Date(timestamp))}/>
              <YAxis dataKey="cantidadActual" scale='linear' name="Clientes"/>
              <Tooltip labelFormatter={timestamp => new Intl.DateTimeFormat('es-AR', {hour: "2-digit", minute: "2-digit"}).format(new Date(timestamp))} />
              <ReferenceLine y={capacidadMaxima} label="Max" stroke="red" strokeDasharray="3 3" />
              <defs>
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={off} stopColor="rgb(216 132 132)" stopOpacity={1} />
                  <stop offset={off} stopColor="#8884d8" stopOpacity={1} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="cantidadActual" stroke="url(#splitColor)" fill="url(#splitColor)" />
            </AreaChart>
          </ResponsiveContainer>
          </>
          }
        </CardContent>
      </Card>
    </Box>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;

  const client = initializeApollo();
  const { data: initialData } = await client.query({
    query: LAST_MOVE,
    variables: {
      lastMoveSucursalId: id,
    },
  });
  return addApolloState(client, {
    props: {
      id,
      initialData: initialData.lastMove,
    },
  });
}
