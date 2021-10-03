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
  LineChart,
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
import { useSubscription, gql } from "@apollo/client";
import EntriesByDate from "../../components/entriesByDate";

function createData(fecha, max) {
  return { fecha, max };
}

const rows = [
  createData("21 SEP", 43),
  createData("20 SEP", 47),
  createData("19 SEP", 34),
  createData("18 SEP", 36),
  createData("17 SEP", 40),
];

const SUBSCRIPTION = gql`
  subscription actualPeople($actualPeopleSucursalId: String!) {
    actualPeople(sucursalId: $actualPeopleSucursalId) {
      cant
      maxCant
    }
  }
`;

const MOVIMIENTOS = gql`
  query moves($SucursalId: String!) {
    moves(sucursalId: $SucursalId) {
      data {
        timestamp
        cantidad
      }
    }
  }
`;

export default function Dashboard({ id, initialData }) {
  if (initialData.errors) {
    return <p>{initialData.errors[0].message}</p>;
  }
  const { data: subData } = useSubscription(SUBSCRIPTION, {
    variables: { actualPeopleSucursalId: id },
  });

  const { user } = useContext(userContext);

  const data = [
    { time: 1602450000000, clientes: 10 },
    { time: 1602450300000, clientes: 11 },
    { time: 1602452100000, clientes: 12 },
    { time: 1602452160000, clientes: 11 },
    { time: 1602452400000, clientes: 10 },
  ];

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

      <EntriesByDate sucursalId={id}/>

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
                  {subData
                    ? subData.actualPeople.cant
                    : initialData.data.cantidadActual}
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
                  {subData
                    ? subData.actualPeople.maxCant
                    : initialData.data.sucursal.capacidadMaxima}
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
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <Line type="monotone" label={3} dataKey="clientes" stroke="#8884d8" />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="time" name="Tiempo" scale='time' tickFormatter={timestamp => new Intl.DateTimeFormat('es-AR', {hour: "2-digit", minute: "2-digit"}).format(new Date(timestamp))}/>
              <YAxis dataKey="clientes" name="Clientes"/>
              <Tooltip formatter={timestamp => new Intl.DateTimeFormat('es-AR', {hour: "2-digit", minute: "2-digit"}).format(new Date(timestamp))} />
            </LineChart>
          </ResponsiveContainer>
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
