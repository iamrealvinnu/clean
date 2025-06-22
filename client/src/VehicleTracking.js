import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Fade, 
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import { 
  GoogleMap, 
  Marker, 
  InfoWindow, 
  useJsApiLoader 
} from '@react-google-maps/api';
import {
  DirectionsCar as DirectionsCarIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { trackingAPI } from './api';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const center = { lat: 12.9716, lng: 77.5946 }; // Bengaluru

export default function VehicleTracking({ height = 500, hideTitle = false }) {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY', // Use environment variable or fallback
  });

  useEffect(() => {
    fetchVehicles();
    // Set up real-time updates every 15 seconds
    const interval = setInterval(fetchVehicles, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle Google Maps loading error
  useEffect(() => {
    if (loadError) {
      setMapError(true);
      console.warn('Google Maps failed to load:', loadError);
    }
  }, [loadError]);

  const fetchVehicles = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      
      const data = await trackingAPI.getVehicles();
      setVehicles(data);
      setError('');
    } catch (err) {
      setError('Failed to load vehicle data');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Route': return 'success';
      case 'Idle': return 'warning';
      case 'Maintenance': return 'error';
      case 'Offline': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'On Route': return '🚛';
      case 'Idle': return '⏸️';
      case 'Maintenance': return '🔧';
      case 'Offline': return '❌';
      default: return '🚛';
    }
  };

  const formatLastUpdated = (timestamp) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return updated.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => fetchVehicles()}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box>
        {!hideTitle && (
          <Fade in={true} timeout={600}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h4" fontWeight={700} color="primary">
                🚛 Live Vehicle Tracking
              </Typography>
              <Tooltip title="Refresh data">
                <IconButton 
                  onClick={() => fetchVehicles(true)}
                  disabled={refreshing}
                  color="primary"
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Fade>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Fade in={true} timeout={800}>
              <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {isLoaded && !mapError ? (
                  <GoogleMap 
                    mapContainerStyle={{ ...mapContainerStyle, height: height }}
                    center={center} 
                    zoom={12}
                    options={{
                      styles: [
                        {
                          featureType: 'poi',
                          elementType: 'labels',
                          stylers: [{ visibility: 'off' }]
                        }
                      ]
                    }}
                  >
                    {vehicles.map((v, i) => (
                      <Marker
                        key={i}
                        position={{ lat: v.lat, lng: v.lng }}
                        onClick={() => setSelected(v)}
                        label={{
                          text: v.vehicleId,
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/truck.png',
                          scaledSize: new window.google.maps.Size(30, 30)
                        }}
                      />
                    ))}
                    {selected && (
                      <InfoWindow 
                        position={{ lat: selected.lat, lng: selected.lng }} 
                        onCloseClick={() => setSelected(null)}
                      >
                        <Box sx={{ p: 1, minWidth: 200 }}>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Vehicle ID: {selected.vehicleId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Driver: {selected.driver}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Route: {selected.route}
                          </Typography>
                          <Chip 
                            label={selected.status} 
                            color={getStatusColor(selected.status)}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                          {selected.lastUpdated && (
                            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                              Last updated: {formatLastUpdated(selected.lastUpdated)}
                            </Typography>
                          )}
                        </Box>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                ) : mapError ? (
                  <Box 
                    display="flex" 
                    flexDirection="column"
                    justifyContent="center" 
                    alignItems="center" 
                    height={height}
                    sx={{ bgcolor: 'grey.50', p: 3 }}
                  >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      🗺️ Map Unavailable
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
                      Google Maps is currently unavailable. Please check the vehicle list below for real-time tracking information.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => window.location.reload()}
                      sx={{ borderRadius: 2 }}
                    >
                      Retry Loading Map
                    </Button>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={height}>
                    <CircularProgress size={60} />
                  </Box>
                )}
              </Paper>
            </Fade>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Fade in={true} timeout={1000}>
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h5" fontWeight={600} color="primary">
                    📊 Vehicle Status
                  </Typography>
                  <Chip 
                    label={`${vehicles.length} vehicles`} 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                  />
                </Box>
                
                {vehicles.map((vehicle, i) => (
                  <Fade in={true} timeout={1200 + i * 100} key={i}>
                    <Card 
                      sx={{ 
                        mb: 2, 
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        },
                        ...(selected?.vehicleId === vehicle.vehicleId && {
                          border: 2,
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50'
                        })
                      }}
                      onClick={() => setSelected(vehicle)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box sx={{ fontSize: '1.5rem' }}>
                            {getStatusIcon(vehicle.status)}
                          </Box>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight={600}>
                              {vehicle.vehicleId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {vehicle.driver}
                            </Typography>
                            <Chip 
                              label={vehicle.status} 
                              color={getStatusColor(vehicle.status)}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                          <Tooltip title="View on map">
                            <IconButton size="small" color="primary">
                              <LocationIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        {vehicle.lastUpdated && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Last updated: {formatLastUpdated(vehicle.lastUpdated)}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Fade>
                ))}
                
                {vehicles.length === 0 && (
                  <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                      No vehicles available at the moment.
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
} 