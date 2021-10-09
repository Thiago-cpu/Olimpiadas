import { useLazyQuery } from "@apollo/client";
import { Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  Area,
  Tooltip,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { MOVIMIENTOS } from "../../gql/queries/movesByDate";

const arFormat = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
});

const format = (timestamp) => arFormat.format(new Date(timestamp));

export default function Metrics({ dateSelected, capacidadMaxima, id }) {
  if (!dateSelected || loading) return <CircularProgress />;
  const [getMoves, { called, data: moveData, loading, refetch }] =
    useLazyQuery(MOVIMIENTOS);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (moveData && moveData.moves && moveData.moves.data) {
      setChartData(() =>
        moveData.moves.data.map((move) => {
          const newMove = { ...move };
          newMove.createdAt = +new Date(move.createdAt);
          return newMove;
        })
      );
    }
  }, [moveData]);

  useEffect(() => {
    if (!called) {
      getMoves({ variables: { sucursalId: id, movesDia: dateSelected } });
    } else {
      refetch({ sucursalId: id, movesDia: dateSelected });
    }
  }, [dateSelected]);

  const offset = () => {
    let maxClient = 0;
    if (!chartData.length) return maxClient;

    chartData.forEach((move) => {
      if (move.cantidadActual > maxClient) maxClient = move.cantidadActual;
    });
    return (maxClient - capacidadMaxima) / maxClient;
  };

  const off = offset();

  return (
    <Card sx={{ flexBasis: "100%", flexGrow: 1 }}>
      <CardContent sx={{ textAlign: "center" }}>
        {!chartData.length ? (
          <Typography variant="h6">No hay datos para mostrar</Typography>
        ) : (
          <>
            <Typography variant="h7">
              {new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(new Date(dateSelected))}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
              >
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis
                  dataKey="createdAt"
                  name="Tiempo"
                  scale="time"
                  type="number"
                  domain={[
                    chartData[0]?.createdAt,
                    chartData[chartData.length - 1]?.createdAt,
                  ]}
                  tickFormatter={timestamp => format(timestamp)}
                />
                <YAxis
                  dataKey="cantidadActual"
                  scale="linear"
                  name="Clientes"
                />
                <Tooltip labelFormatter={timestamp => format(timestamp)} />
                <ReferenceLine
                  y={capacidadMaxima}
                  label="Max"
                  stroke="red"
                  strokeDasharray="3 3"
                />
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset={off}
                      stopColor="rgb(216 132 132)"
                      stopOpacity={1}
                    />
                    <stop offset={off} stopColor="#8884d8" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="cantidadActual"
                  stroke="url(#splitColor)"
                  fill="url(#splitColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
