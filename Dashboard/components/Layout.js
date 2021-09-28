import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import UserContext from "../context/userContext";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import Link from 'next/link'
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

export default function Layout({children}) {
  const theme = useTheme();
  const {user, logout} = React.useContext(UserContext)
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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
            Olimpis
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
          <p>Menu</p>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem>
            <ListItemIcon>
              <AccountCircleIcon/>
            </ListItemIcon>
            <ListItemText primary={user.isLogged?user.name:"Invitado"} />
          </ListItem>
          <Link href="/sucursales">
            <ListItem button onClick={handleDrawerClose}>
                <ListItemIcon>
                  <StorefrontIcon />
                </ListItemIcon>
                <ListItemText primary={"Sucursales"} />
            </ListItem>
          </Link>
          {user.isLogged &&
          <>
          <Link href="/misSucursales">
            <ListItem button onClick={handleDrawerClose}>
                <ListItemIcon>
                  <StorefrontIcon />
                </ListItemIcon>
                <ListItemText primary={"Mis Sucursales"} />
            </ListItem>
          </Link>
          {user.role === "Admin" &&
          <Link href="/users">
          <ListItem button onClick={handleDrawerClose}>
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
            <ListItemText primary={"Logout"} />
          </ListItem>
          :
          <>
          <Link sx={{}} href="/login">
            <ListItem button onClick={handleDrawerClose}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary={"Login"} />
            </ListItem>
          </Link>
          <Link sx={{}} href="/register">
            <ListItem button onClick={handleDrawerClose}>
              <ListItemIcon>
                <CheckroomIcon />
              </ListItemIcon>
              <ListItemText primary={"Register"} />
            </ListItem>
          </Link>
          </>

          }

        </List>
      </Drawer>
      <Main sx={{
        position:"absolute",
        width:"100%"
      }} open={open}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}