import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Paper,
  Fade
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  LocalShipping as DriverIcon,
  AdminPanelSettings as AdminIcon,
  Report as ReportIcon,
  LocationOn as TrackingIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Recycling as RecyclingIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Messaging from './components/Messaging';

const Home = ({ user, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'driver': return 'warning';
      case 'resident': return 'success';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'driver': return <DriverIcon />;
      case 'resident': return <PersonIcon />;
      default: return <PersonIcon />;
    }
  };

  const getDashboardCards = () => {
    const baseCards = [
      {
        title: 'Vehicle Tracking',
        description: 'Real-time location of waste collection vehicles',
        icon: <TrackingIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
        path: '/tracking',
        color: 'primary'
      },
      {
        title: 'Reports & Analytics',
        description: 'View detailed reports and performance metrics',
        icon: <ReportIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
        path: '/reports',
        color: 'secondary'
      }
    ];

    if (user.role === 'admin') {
      return [
        ...baseCards,
        {
          title: 'Admin Dashboard',
          description: 'Manage system settings and user accounts',
          icon: <AdminIcon sx={{ fontSize: 40, color: 'error.main' }} />,
          path: '/admin',
          color: 'error'
        }
      ];
    } else if (user.role === 'driver') {
      return [
        ...baseCards,
        {
          title: 'Driver Dashboard',
          description: 'Manage routes and report incidents',
          icon: <DriverIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
          path: '/driver',
          color: 'warning'
        }
      ];
    } else {
      return [
        ...baseCards,
        {
          title: 'Resident Dashboard',
          description: 'Track collections and manage preferences',
          icon: <DashboardIcon sx={{ fontSize: 40, color: 'success.main' }} />,
          path: '/dashboard',
          color: 'success'
        }
      ];
    }
  };

  const drawerItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Vehicle Tracking', icon: <TrackingIcon />, path: '/tracking' },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
    ...(user.role === 'admin' ? [{ text: 'Admin Panel', icon: <AdminIcon />, path: '/admin' }] : []),
    ...(user.role === 'driver' ? [{ text: 'Driver Panel', icon: <DriverIcon />, path: '/driver' }] : []),
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <RecyclingIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Bengaluru Smart Waste Management
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={getRoleIcon(user.role)}
              label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              color={getRoleColor(user.role)}
              variant="outlined"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => setMessagingOpen(true)}>
              <MessageIcon />
            </IconButton>
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            mt: 8,
            background: 'linear-gradient(180deg, #1a365d 0%, #2d5a87 100%)',
            color: 'white',
          },
        }}
      >
        <List sx={{ pt: 2 }}>
          {drawerItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: 3,
        }}
      >
        <Container maxWidth="lg">
          {/* Welcome Section */}
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            className="fade-in"
          >
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mr: 3,
                  background: 'linear-gradient(135deg, #1a365d 0%, #059669 100%)',
                  fontSize: '2rem',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                  Welcome back, {user.name}!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Manage your waste collection activities and stay updated with real-time information.
                </Typography>
                <Chip
                  icon={getRoleIcon(user.role)}
                  label={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`}
                  color={getRoleColor(user.role)}
                  variant="filled"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Paper>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="card-hover" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <RecyclingIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                    85%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Collection Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="card-hover" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <DriverIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                    12
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Vehicles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="card-hover" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                    156
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Pickups
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="card-hover" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                    92%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Satisfaction Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Dashboard Cards */}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {getDashboardCards().map((card, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  className="card-hover" 
                  sx={{ 
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box textAlign="center" mb={2}>
                      {card.icon}
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      {card.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleNavigation(card.path)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Access {card.title}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Messaging Dialog */}
      <Messaging 
        user={user} 
        isOpen={messagingOpen} 
        onClose={() => setMessagingOpen(false)} 
      />
    </Box>
  );
};

export default Home; 