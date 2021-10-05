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
import { useSubscription, gql, useQuery } from "@apollo/client";
import EntriesByDate from "../../components/entriesByDate";


const SUBSCRIPTION = gql`
  subscription actualPeople($actualPeopleSucursalId: String!) {
    actualPeople(sucursalId: $actualPeopleSucursalId) {
      cant
      maxCant
    }
  }
`;

const MOVIMIENTOS = gql`
  query movesByDate($movesDia: DateTime!, $sucursalId: String!) {
    moves(dia: $movesDia, sucursalId: $sucursalId) {
      data {
        id
        createdAt
        cantidadActual
      }
    }
  }
`;

export default function DashBoard({ id, initialData }) {
  const {data: moveData, refetch} = useQuery(MOVIMIENTOS,{
    variables: {
      sucursalId: id,
      movesDia: new Date().toISOString()
    },
    notifyOnNetworkStatusChange: true
  })
  const [chartData, setChartData] = React.useState([])
  const [dateSelected, setDateSelected] = React.useState()

  if (initialData.errors) {
    return <p>{initialData.errors[0].message}</p>;
  }
  const { data: subData } = useSubscription(SUBSCRIPTION, {
    variables: { actualPeopleSucursalId: id },
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
    refetch({sucursalId: id, movesDia: fecha})
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
  ? subData.actualPeople.cant
  : initialData.data.cantidadActual

  const capacidadMaxima = subData
  ? subData.actualPeople.maxCant
  : initialData.data.sucursal.capacidadMaxima

  const off = offset()

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
          Aquí esta la información de tu local
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
          {!chartData.length?"loading..."
          :
          <>
          <Typography variant="h7">{dateSelected}</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="createdAt" name="Tiempo" scale='time' type='number' domain={[chartData[0].createdAt, chartData[chartData.length-1].createdAt]} tickFormatter={timestamp => new Intl.DateTimeFormat('es-AR', {hour: "2-digit", minute: "2-digit"}).format(new Date(timestamp))}/>
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

const GET_INITIAL_DATA = gql`
  query lastMove($lastMoveSucursalId: String!) {
    lastMove(sucursalId: $lastMoveSucursalId) {
      data {
        sucursal {
          capacidadMaxima
        }
        cantidadActual
      }
      errors {
        message
      }
    }
  }
`;

export async function getServerSideProps({ params }) {
  const { id } = params;

  const client = initializeApollo();
  const { data: initialData } = await client.query({
    query: GET_INITIAL_DATA,
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
