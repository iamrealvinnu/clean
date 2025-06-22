import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  TextField, 
  MenuItem, 
  Alert, 
  Stack,
  Fade,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  LinearProgress,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  DirectionsCar as DirectionsCarIcon,
  Map as MapIcon,
  ReportProblem as ReportProblemIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { 
  GoogleMap, 
  Polyline, 
  Marker, 
  useJsApiLoader 
} from '@react-google-maps/api';
import { driverAPI, trackingAPI, communicationAPI } from './api';
import Messaging from './components/Messaging';

const mockRoute = [
  { lat: 12.9716, lng: 77.5946 },
  { lat: 12.975, lng: 77.6 },
  { lat: 12.98, lng: 77.61 },
  { lat: 12.985, lng: 77.615 },
  { lat: 12.99, lng: 77.62 },
];

const statusOptions = ['On Route', 'Idle', 'Maintenance', 'Break'];
const incidentTypes = ['Blocked Road', 'Full Bin', 'Vehicle Issue', 'Traffic', 'Weather', 'Other'];

export default function DriverDashboard({ user }) {
  const [status, setStatus] = useState('On Route');
  const [incident, setIncident] = useState({ type: '', details: '' });
  const [incidentMsg, setIncidentMsg] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [messagingOpen, setMessagingOpen] = useState(false);
  
  const { isLoaded } = useJsApiLoader({ 
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY' 
  });

  useEffect(() => {
    fetchDriverData();
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const [scheduleRes, vehiclesRes] = await Promise.all([
        driverAPI.getDriverSchedule(user.id),
        trackingAPI.getVehicles()
      ]);
      
      setSchedule(scheduleRes);
      setVehicles(vehiclesRes.filter(v => v.driver === user.name));
    } catch (err) {
      console.error('Failed to load driver data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setUpdating(true);
    
    try {
      await driverAPI.updateDriverStatus(user.id, newStatus);
      setIncidentMsg('Status updated successfully!');
      setTimeout(() => setIncidentMsg(''), 3000);
    } catch (err) {
      setIncidentMsg('Failed to update status');
      setTimeout(() => setIncidentMsg(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleIncidentChange = (e) => {
    setIncident({ ...incident, [e.target.name]: e.target.value });
  };

  const handleIncidentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await driverAPI.reportIncident({
        ...incident,
        driverId: user.id,
        driverName: user.name,
        vehicleId: vehicles[0]?.vehicleId || 'Unknown'
      });
      setIncidentMsg('Incident reported successfully!');
      setIncident({ type: '', details: '' });
      setTimeout(() => setIncidentMsg(''), 3000);
    } catch (err) {
      setIncidentMsg('Failed to report incident');
      setTimeout(() => setIncidentMsg(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Route': return 'success';
      case 'Idle': return 'warning';
      case 'Maintenance': return 'error';
      case 'Break': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'On Route': return <CheckCircleIcon />;
      case 'Idle': return <WarningIcon />;
      case 'Maintenance': return <ReportProblemIcon />;
      case 'Break': return <ScheduleIcon />;
      default: return <DirectionsCarIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box maxWidth={1200} mx="auto" mt={4} px={2}>
        <Fade in={true} timeout={600}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h4" fontWeight={700} color="primary">
              🚛 Driver Dashboard
            </Typography>
            <Button
              variant="outlined"
              startIcon={<MessageIcon />}
              onClick={() => setMessagingOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Messages
            </Button>
          </Box>
        </Fade>

        {incidentMsg && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {incidentMsg}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Fade in={true} timeout={800}>
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <DirectionsCarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" fontWeight={600}>
                      Today's Route & Schedule
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" color="text.secondary" mb={2}>
                    Welcome back, {user.name}! Here's your schedule for today.
                  </Typography>
                  
                  <List>
                    {schedule.map((stop, i) => (
                      <ListItem key={i} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {i + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${stop.day} - ${stop.time}`}
                          secondary={`${stop.type} collection in ${stop.ward}`}
                        />
                        <Chip 
                          label={stop.type} 
                          color="primary" 
                          variant="outlined" 
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box mt={3}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <MapIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Assigned Route
                      </Typography>
                    </Box>
                    {isLoaded && (
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: 300 }}
                        center={mockRoute[0]}
                        zoom={13}
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
                        <Polyline 
                          path={mockRoute} 
                          options={{ 
                            strokeColor: '#4e9f3d', 
                            strokeWeight: 4,
                            strokeOpacity: 0.8
                          }} 
                        />
                        <Marker position={mockRoute[0]} label="Start" />
                        <Marker position={mockRoute[mockRoute.length - 1]} label="End" />
                        {currentLocation && (
                          <Marker 
                            position={currentLocation} 
                            icon={{
                              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                              scaledSize: new window.google.maps.Size(20, 20)
                            }}
                          />
                        )}
                      </GoogleMap>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Fade in={true} timeout={1000}>
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" mb={2} fontWeight={600}>
                    🚦 Live Status
                  </Typography>
                  
                  <TextField
                    select
                    label="Current Status"
                    value={status}
                    onChange={handleStatusChange}
                    fullWidth
                    margin="normal"
                    disabled={updating}
                    InputProps={{
                      startAdornment: getStatusIcon(status)
                    }}
                  >
                    {statusOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </TextField>
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    sx={{ mt: 2, borderRadius: 2 }}
                    disabled={updating}
                  >
                    {updating ? <CircularProgress size={20} color="inherit" /> : 'Update Status'}
                  </Button>
                  
                  {vehicles.length > 0 && (
                    <Box mt={3}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Your Vehicle:
                      </Typography>
                      <Chip 
                        label={vehicles[0].vehicleId} 
                        color="primary" 
                        variant="outlined"
                        icon={<DirectionsCarIcon />}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
            
            <Fade in={true} timeout={1200}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ReportProblemIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6" fontWeight={600}>
                      Incident Reporting
                    </Typography>
                  </Box>
                  
                  <form onSubmit={handleIncidentSubmit}>
                    <TextField
                      select
                      label="Incident Type"
                      name="type"
                      value={incident.type}
                      onChange={handleIncidentChange}
                      fullWidth
                      margin="normal"
                      required
                    >
                      {incidentTypes.map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                    
                    <TextField
                      label="Details"
                      name="details"
                      value={incident.details}
                      onChange={handleIncidentChange}
                      fullWidth
                      margin="normal"
                      multiline
                      rows={3}
                      required
                      placeholder="Please provide details about the incident..."
                    />
                    
                    <Stack direction="row" spacing={2} mt={2}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="warning"
                        disabled={submitting || !incident.type || !incident.details}
                        sx={{ borderRadius: 2, flex: 1 }}
                      >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Report Incident'}
                      </Button>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Messaging Dialog */}
        <Messaging 
          user={user} 
          isOpen={messagingOpen} 
          onClose={() => setMessagingOpen(false)} 
        />
      </Box>
    </Fade>
  );
} 