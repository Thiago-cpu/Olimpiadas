import * as React from "react";
import { initializeApollo, addApolloState } from "../../lib/apolloClient";
import {
  Typography,
  Box,
  CircularProgress
} from "@mui/material";
import { useContext } from "react";
import userContext from "../../context/userContext";
import { useQuery } from "@apollo/client";
import EntriesByDate from "../../components/dashboard/entriesByDate";
import {useRouter} from "next/router";
import { GET_MY_SUCURSALES } from "../../gql/queries/MySucursales";
import { LAST_MOVE } from "../../gql/queries/lastMove";
import Metrics from "../../components/dashboard/Metrics";
import StatusActual from "../../components/dashboard/StatusActual";

export default function DashBoard({ id, initialData }) {
  if (initialData.errors) {
    return <p>{initialData.errors[0].message}</p>;
  }
  const router = useRouter();
  const {data: sucursalesData, loading: sucursalesLoading, error: sucursalesError} = useQuery(GET_MY_SUCURSALES)
  const [dateSelected, setDateSelected] = React.useState()
  const [capacidadMaxima, setCapacidadMaxima] = React.useState(initialData.data.sucursal.capacidadMaxima)

  if(sucursalesError) router.push("/")
  
  const sucursalName = sucursalesData?.me?.data?.sucursales.find(sucursal => sucursal.id === id)?.name
  
  const { user } = useContext(userContext);

  const handleCapacidadMaxima = (newCapacidadMaxima) => {
    if(capacidadMaxima !== newCapacidadMaxima) setCapacidadMaxima(newCapacidadMaxima)
  }

  const onDateClick = (rowSelected) => {
    setDateSelected(rowSelected.fecha)
  }

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

      <StatusActual id={id} capacidadMaxima={capacidadMaxima}  initialData = {initialData} handleCapacidadMaxima={handleCapacidadMaxima} />
      
      {dateSelected && <Metrics id={id} dateSelected={dateSelected} capacidadMaxima={capacidadMaxima}/>}

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
