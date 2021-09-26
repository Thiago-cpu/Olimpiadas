import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Card, CardActions, CardContent, CardHeader, List, ListItem, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link'

function createData(
  fecha: string,
  max: number
  ) {
  return {fecha, max };
}

const rows = [
  createData('21 SEP', 43),
  createData('20 SEP', 47),
  createData('19 SEP', 34),
  createData('18 SEP', 36),
  createData('17 SEP', 40)
];

export default function Dashboard() {
  const data = [
    {name: '9:00', Clientes: 10 },
    {name: '10:00', Clientes: 12 },
    {name: '11:00', Clientes: 24 },
    {name: '12:00', Clientes: 40 },
    {name: '13:00', Clientes: 30 }
  
  ];

  return (
    <Box sx={{ display: 'flex',
                flexWrap: 'wrap',
                columnGap: '1em',
                rowGap: '1em',
                paddingTop:'3rem',
                paddingLeft:'1rem',
                paddingRight:'1rem'
    }}>
      <Box sx={{flexBasis:'100%'}}>
        <Typography variant='h5'>
          Hola, Juan
        </Typography>
        <Typography variant='h6' sx={{color: "text.secondary"}}>
          Aquí esta la información de tu local
        </Typography>
      </Box>

      <Paper sx={{padding:'1em', flexBasis: '25rem', flexGrow: 3}}>
        <Typography  variant="h6">
          Datos históricos
        </Typography>
        <TableContainer >
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Máximo de clientes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.fecha}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.fecha}
                  </TableCell>
                  <TableCell align="right">{row.max}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Card sx={{ flexBasis:'16rem', flexGrow: 1, height: 'fit-content'}}>
        <CardHeader
          title="Concurrencia actual"
          subheader="22 Septiembre, 2021"
        />
          
        <CardContent sx={{padding:'0'}}>
          <List>
            <ListItem>
              <Box sx={{display:'flex', justifyContent:'space-between', width: 'inherit'}}>
                <Typography variant='subtitle2'>
                  Clientes en el local
                </Typography>
                <Typography variant='subtitle2' sx={{color: "text.secondary"}}>
                  20
                </Typography>
              </Box>
            </ListItem>
            <ListItem>
              <Box sx={{display:'flex', justifyContent:'space-between', width: 'inherit'}}>
                <Typography variant='subtitle2'>
                  Capacidad máxima
                </Typography>
                <Typography variant='subtitle2' sx={{color: "text.secondary"}}>
                  60
                </Typography>
              </Box>
            </ListItem>
          </List>
        </CardContent>
        <CardActions>
          <Link href='/ingreso'>
            <Button size="large" component='a'>Ver pantalla de ingreso</Button>
          </Link>
        </CardActions>
      </Card>

      <Card sx={{flexBasis: '100%', flexGrow: 1}}>
        <CardContent>
          <ResponsiveContainer width='100%'  height={300}>
            <LineChart  data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <Line type="monotone" dataKey="Clientes" stroke="#8884d8" />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
            </LineChart>

          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  )
}