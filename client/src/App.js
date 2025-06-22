import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Fab, Tooltip } from '@mui/material';
import Login from './Login';
import Dashboard from './Dashboard';
import DriverDashboard from './DriverDashboard';
import Admin from './Admin';
import Home from './Home';
import Reports from './Reports';
import VehicleTracking from './VehicleTracking';
import Chatbot from './Chatbot';
import AnimatedBackground from './components/AnimatedBackground';
import { Article as ArticleIcon, EmojiEvents as EmojiEventsIcon, Settings as SettingsIcon, Home as HomeIcon } from '@mui/icons-material';
import './App.css';

const Blog = lazy(() => import('./components/Blog'));
const EcoChallenges = lazy(() => import('./components/EcoChallenges'));
const Settings = lazy(() => import('./components/Settings'));

function FloatingNav({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const actions = [
    { icon: <HomeIcon />, name: 'Home', path: '/' },
    { icon: <ArticleIcon />, name: 'Blog', path: '/blog' },
    { icon: <EmojiEventsIcon />, name: 'Eco Challenges', path: '/challenges' },
    { icon: <SettingsIcon />, name: 'Settings', path: '/settings' },
  ];
  
  if (!user) return null;
  
  return (
    <Box sx={{ position: 'fixed', bottom: 24, left: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {actions.map((action) => (
        <Tooltip key={action.name} title={action.name} placement="right">
          <Fab
            size="medium"
            onClick={() => navigate(action.path)}
            sx={{
              bgcolor: location.pathname === action.path ? 'primary.main' : 'background.paper',
              color: location.pathname === action.path ? 'white' : 'primary.main',
              '&:hover': { bgcolor: 'primary.dark', color: 'white' },
              boxShadow: 3,
            }}
          >
            {action.icon}
          </Fab>
        </Tooltip>
      ))}
    </Box>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const appTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1a365d',
        light: '#2d5a87',
        dark: '#0f1f2e',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#059669',
        light: '#10b981',
        dark: '#047857',
        contrastText: '#ffffff',
      },
      background: {
        default: darkMode ? '#121212' : '#f8fafc',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#1e293b',
        secondary: darkMode ? '#b0b0b0' : '#64748b',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  });

  if (loading) {
    return (
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #1a365d',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px',
              }}
            />
            <h2 style={{ color: '#1a365d', margin: 0 }}>Loading...</h2>
          </div>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AnimatedBackground>
        <Router>
          <FloatingNav user={user} />
          <Box sx={{ minHeight: '100vh', background: 'transparent' }}>
            <Suspense fallback={<Box p={8}><h2>Loading...</h2></Box>}>
              <Routes>
                <Route 
                  path="/login" 
                  element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
                />
                <Route 
                  path="/" 
                  element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/dashboard" 
                  element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/driver" 
                  element={user ? <DriverDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/admin" 
                  element={user ? <Admin user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/reports" 
                  element={user ? <Reports user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/tracking" 
                  element={user ? <VehicleTracking user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/blog" 
                  element={user ? <Blog /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/challenges" 
                  element={user ? <EcoChallenges /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/settings" 
                  element={user ? <Settings darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />} 
                />
              </Routes>
            </Suspense>
            {user && <Chatbot />}
          </Box>
        </Router>
      </AnimatedBackground>
    </ThemeProvider>
  );
}

export default App;
