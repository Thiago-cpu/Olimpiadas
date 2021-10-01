import { Tooltip, Fab, Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { gql, useSubscription } from "@apollo/client";
import { initializeApollo, addApolloState } from "../../lib/apolloClient";
import Link from 'next/link'

const SUBSCRIPTION = gql`
  subscription actualPeople($actualPeopleSucursalId: String!) {
    actualPeople(sucursalId: $actualPeopleSucursalId) {
      cant
      maxCant
    }
  }
`;

export default function Ingreso({ id, initialData }) {
  if (initialData.errors) {
    return <p>{initialData.errors[0].message}</p>;
  }
  const { data, loading } = useSubscription(SUBSCRIPTION, {
    variables: { actualPeopleSucursalId: id },
  });
  let cantidadDePersonas, maximaCantidadDePersonas;
  if (loading) {
    cantidadDePersonas = initialData.data.cantidadActual;
    maximaCantidadDePersonas = initialData.data.sucursal.capacidadMaxima;
  } else {
    cantidadDePersonas = data.actualPeople.cant;
    maximaCantidadDePersonas = data.actualPeople.maxCant;
  }

  const puedeIngresar = cantidadDePersonas < maximaCantidadDePersonas;
  const personasAretirarse = cantidadDePersonas - maximaCantidadDePersonas + 1;
  const colorDeFondo = puedeIngresar ? "#BAF56E" : "#E37B5A";

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          bgcolor: colorDeFondo,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >

        <Link href="/">
          <Tooltip color="primary" arrow title="Volver" placement="left">
            <Fab aria-label="add" sx={{
              position: "absolute",
              top:"1em",
              left:"1em",
              color:"black"
              }}>
              <ArrowBackIcon />
            </Fab>
          </Tooltip>
        </Link>

        <Typography variant="h1" gutterBottom component="div">
          {puedeIngresar ? "Puedes ingresar" : "No puedes ingresar"}
        </Typography>

        <Typography variant="h4" gutterBottom component="div">
          {puedeIngresar
            ? `Hay ${
                maximaCantidadDePersonas - cantidadDePersonas
              } espacios restantes.`
            : `Deberás esperar a que se retire${
                personasAretirarse > 1
                  ? `n ${personasAretirarse} personas`
                  : ` 1 persona`
              }`}
        </Typography>
      </Box>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </>
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
