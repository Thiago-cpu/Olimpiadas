import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  CssBaseline,
  Toolbar,
  List,
  ListItemButton,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import UserContext from "../context/userContext";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import Link from 'next/link';
import { useRouter } from 'next/router';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    })
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  })
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const DrawerLink = styled('a')`
  text-decoration: none;
  color: inherit;
`

export default function Layout({children}) {
  const router = useRouter()
  const theme = useTheme();
  const {user, logout} = React.useContext(UserContext)
  const [open, setOpen] = React.useState(false);
  const { pathname } = router

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  
  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  if( pathname === '/sucursal/[id]') return children
    
  return (
    <Box sx={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Olimpgreso
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        anchor="left"
        open={open}
        onBlur={handleDrawerClose}
      >
        <DrawerHeader>
          <ListItem>
            <ListItemIcon>
              <AccountCircleIcon/>
            </ListItemIcon>
            <ListItemText primary={user.isLogged?user.name:"Invitado"} />
          </ListItem>
          <IconButton onClick={handleDrawerClose}>
            <CloseIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <Link href="/" passHref>
              <ListItem button onClick={handleDrawerClose} component="a">
                  <ListItemIcon>
                    <StorefrontIcon />
                  </ListItemIcon>
                  <ListItemText primary={"Sucursales"} />
              </ListItem>
          </Link>
          {user.isLogged &&
          <>
          <Link href="/misSucursales" passHref >
            <ListItem button component="a" onClick={handleDrawerClose}>
                <ListItemIcon>
                  <StorefrontIcon />
                </ListItemIcon>
                <ListItemText primary={"Mis Sucursales"} />
            </ListItem>
          </Link> 
          {user.role === "Admin" &&
          <Link href="/users" passHref >
            <ListItem button component="a" onClick={handleDrawerClose}>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary={"Usuarios"} />
            </ListItem>
          </Link>
          
          }
          </>
          }
        </List>
        <Divider />
        <List>
          {user.isLogged?
          <ListItem button onClick={()=>{logout(); handleDrawerClose()}}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={"Cerrar Sesión"} />
          </ListItem>
          :
          <>
          <Link href="/login"  passHref={true}>
            <ListItem component="a" button onClick={handleDrawerClose}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary={"Iniciar Sesión"} />
            </ListItem>
          </Link>
          <Link href="/register" passHref={true}>
            <ListItem component="a" button onClick={handleDrawerClose}>
              <ListItemIcon>
                <VpnKeyIcon />
              </ListItemIcon>
              <ListItemText primary={"Registrarse"} />
            </ListItem>
          </Link>
          </>

          }

        </List>
      </Drawer>
      <Main sx={{
        position:"absolute",
        width:"100%",
        minHeight:"100%",
      }} open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}