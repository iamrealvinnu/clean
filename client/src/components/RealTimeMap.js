import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  Polyline,
  useJsApiLoader
} from '@react-google-maps/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { vehicleAPI } from '../services/apiService';
import socketService from '../services/socketService';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const RealTimeMap = ({ height = 500, ward = null, showControls = true }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [showTrails, setShowTrails] = useState(false);
  const [vehicleTrails, setVehicleTrails] = useState({});
  const [filters, setFilters] = useState({
    onRoute: true,
    idle: true,
    maintenance: false,
    offline: false
  });

  const mapRef = useRef(null);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['geometry']
  });

  // Fetch vehicles data
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getVehicles(ward);
      setVehicles(response.vehicles || []);
      setError('');
    } catch (err) {
      setError('Failed to load vehicle data');
      console.error('Vehicle fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [ward]);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.warn('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Initialize map
  useEffect(() => {
    fetchVehicles();
    getUserLocation();
  }, [fetchVehicles, getUserLocation]);

  // Real-time vehicle updates
  useEffect(() => {
    const handleVehicleLocationUpdate = (data) => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(vehicle => {
          if (vehicle.vehicleId === data.vehicleId) {
            // Add to trail if enabled
            if (showTrails) {
              setVehicleTrails(prevTrails => ({
                ...prevTrails,
                [data.vehicleId]: [
                  ...(prevTrails[data.vehicleId] || []).slice(-20), // Keep last 20 points
                  { lat: data.lat, lng: data.lng, timestamp: data.timestamp }
                ]
              }));
            }

            return {
              ...vehicle,
              currentLocation: { lat: data.lat, lng: data.lng },
              lastUpdated: data.timestamp
            };
          }
          return vehicle;
        });
      });
    };

    const handleVehicleStatusUpdate = (data) => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(vehicle => {
          if (vehicle.vehicleId === data.vehicleId) {
            return {
              ...vehicle,
              status: data.status,
              lastUpdated: data.timestamp
            };
          }
          return vehicle;
        });
      });
    };

    socketService.onVehicleLocationUpdate(handleVehicleLocationUpdate);
    socketService.onVehicleStatusUpdate(handleVehicleStatusUpdate);

    return () => {
      socketService.off('vehicle_location_update', handleVehicleLocationUpdate);
      socketService.off('vehicle_status_update', handleVehicleStatusUpdate);
    };
  }, [showTrails]);

  // Filter vehicles based on status
  const filteredVehicles = vehicles.filter(vehicle => {
    const status = vehicle.status.toLowerCase().replace('-', '');
    return filters[status] !== false;
  });

  // Get vehicle icon based on status
  const getVehicleIcon = (status) => {
    const iconBase = 'https://maps.google.com/mapfiles/ms/icons/';
    switch (status) {
      case 'on-route':
        return `${iconBase}green-dot.png`;
      case 'idle':
        return `${iconBase}yellow-dot.png`;
      case 'maintenance':
        return `${iconBase}red-dot.png`;
      case 'offline':
        return `${iconBase}grey-dot.png`;
      default:
        return `${iconBase}blue-dot.png`;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'on-route': return 'success';
      case 'idle': return 'warning';
      case 'maintenance': return 'error';
      case 'offline': return 'default';
      default: return 'primary';
    }
  };

  // Center map on user location
  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  };

  // Center map on vehicle
  const centerOnVehicle = (vehicle) => {
    if (vehicle.currentLocation && mapRef.current) {
      mapRef.current.panTo(vehicle.currentLocation);
      mapRef.current.setZoom(16);
      setSelectedVehicle(vehicle);
    }
  };

  if (loadError) {
    return (
      <Alert severity="error" sx={{ height }}>
        Failed to load Google Maps. Please check your API key and internet connection.
      </Alert>
    );
  }

  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ height, position: 'relative' }}>
      {/* Map Controls */}
      {showControls && (
        <Box sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Card sx={{ p: 1 }}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Tooltip title="Refresh data">
                <IconButton onClick={fetchVehicles} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              {userLocation && (
                <Tooltip title="Center on my location">
                  <IconButton onClick={centerOnUser}>
                    <MyLocationIcon />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Toggle vehicle trails">
                <FormControlLabel
                  control={
                    <Switch
                      checked={showTrails}
                      onChange={(e) => setShowTrails(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Trails"
                  sx={{ m: 0 }}
                />
              </Tooltip>
            </Box>
          </Card>
        </Box>
      )}

      {/* Vehicle Status Legend */}
      {showControls && (
        <Box sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          zIndex: 1000
        }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Vehicle Status
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {Object.entries(filters).map(([status, enabled]) => (
                <Chip
                  key={status}
                  label={status.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  color={getStatusColor(status)}
                  variant={enabled ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => setFilters(prev => ({ ...prev, [status]: !prev[status] }))}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Card>
        </Box>
      )}

      {/* Google Map */}
      <GoogleMap
        ref={mapRef}
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={13}
        options={mapOptions}
        onClick={() => setSelectedVehicle(null)}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(20, 20)
            }}
            title="Your Location"
          />
        )}

        {/* Vehicle markers */}
        {filteredVehicles.map((vehicle) => (
          <Marker
            key={vehicle._id}
            position={vehicle.currentLocation}
            icon={{
              url: getVehicleIcon(vehicle.status),
              scaledSize: new window.google.maps.Size(30, 30)
            }}
            title={`${vehicle.vehicleId} - ${vehicle.status}`}
            onClick={() => setSelectedVehicle(vehicle)}
          />
        ))}

        {/* Vehicle trails */}
        {showTrails && Object.entries(vehicleTrails).map(([vehicleId, trail]) => (
          trail.length > 1 && (
            <Polyline
              key={vehicleId}
              path={trail.map(point => ({ lat: point.lat, lng: point.lng }))}
              options={{
                strokeColor: '#2196F3',
                strokeOpacity: 0.6,
                strokeWeight: 3
              }}
            />
          )
        ))}

        {/* Info window for selected vehicle */}
        {selectedVehicle && (
          <InfoWindow
            position={selectedVehicle.currentLocation}
            onCloseClick={() => setSelectedVehicle(null)}
          >
            <Box sx={{ minWidth: 200, p: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedVehicle.vehicleId}
              </Typography>
              
              <Box mb={1}>
                <Chip
                  label={selectedVehicle.status}
                  color={getStatusColor(selectedVehicle.status)}
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Driver: {selectedVehicle.driver?.name || 'Unknown'}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Type: {selectedVehicle.type}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Capacity: {selectedVehicle.capacity} kg
              </Typography>

              {selectedVehicle.currentLoad !== undefined && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Load: {selectedVehicle.currentLoad} kg ({Math.round((selectedVehicle.currentLoad / selectedVehicle.capacity) * 100)}%)
                </Typography>
              )}

              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date(selectedVehicle.lastUpdated).toLocaleTimeString()}
              </Typography>

              <Box mt={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => centerOnVehicle(selectedVehicle)}
                >
                  Center on Vehicle
                </Button>
              </Box>
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Loading overlay */}
      {loading && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 2000
        }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Box sx={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000
        }}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default RealTimeMap;