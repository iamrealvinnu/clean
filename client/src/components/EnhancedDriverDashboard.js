import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fab,
  Switch,
  FormControlLabel,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Navigation as NavigationIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  DirectionsCar as VehicleIcon,
  LocalGasStation as FuelIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  Message as MessageIcon,
  Camera as CameraIcon,
  Send as SendIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import RealTimeMap from './RealTimeMap';
import { scheduleAPI, vehicleAPI, reportAPI } from '../services/apiService';
import socketService from '../services/socketService';

const EnhancedDriverDashboard = ({ user }) => {
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [vehicleStatus, setVehicleStatus] = useState({});
  const [activeRoute, setActiveRoute] = useState(null);
  const [collectionProgress, setCollectionProgress] = useState(0);
  const [incidentDialog, setIncidentDialog] = useState(false);
  const [completionDialog, setCompletionDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Real-time data
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeProgress, setRouteProgress] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [notifications, setNotifications] = useState([]);
  
  // Form states
  const [incidentForm, setIncidentForm] = useState({
    type: '',
    description: '',
    location: '',
    severity: 'medium',
    images: []
  });

  const [completionForm, setCompletionForm] = useState({
    collectionsCompleted: 0,
    wasteCollected: 0,
    issues: '',
    notes: ''
  });

  // Fetch driver data
  const fetchDriverData = useCallback(async () => {
    try {
      setLoading(true);
      const [schedulesRes, vehicleRes] = await Promise.all([
        scheduleAPI.getSchedules({ 
          driver: user.id, 
          date: new Date().toISOString().split('T')[0] 
        }),
        vehicleAPI.getVehicle(user.vehicleId)
      ]);

      setTodaySchedules(schedulesRes.schedules || []);
      setVehicleStatus(vehicleRes.vehicle || {});
      
      // Set current active schedule
      const activeSchedule = schedulesRes.schedules?.find(s => s.status === 'in-progress');
      setCurrentSchedule(activeSchedule || schedulesRes.schedules?.[0]);

    } catch (err) {
      setError('Failed to load driver data');
      console.error('Driver data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id, user.vehicleId]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          // Update vehicle location
          if (user.vehicleId) {
            vehicleAPI.updateVehicleLocation(user.vehicleId, location);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [user.vehicleId]);

  // Real-time updates
  useEffect(() => {
    const handleCollectionUpdate = (data) => {
      if (data.driverId === user.id) {
        setNotifications(prev => [data, ...prev.slice(0, 9)]);
      }
    };

    const handleRouteUpdate = (data) => {
      if (data.driverId === user.id) {
        setActiveRoute(data.route);
        setRouteProgress(data.progress);
      }
    };

    socketService.onCollectionNotification(handleCollectionUpdate);
    socketService.on('route_update', handleRouteUpdate);

    return () => {
      socketService.off('collection_notification', handleCollectionUpdate);
      socketService.off('route_update', handleRouteUpdate);
    };
  }, [user.id]);

  // Initialize
  useEffect(() => {
    fetchDriverData();
    getCurrentLocation();
    
    // Update location every 30 seconds
    const locationInterval = setInterval(getCurrentLocation, 30000);
    
    return () => clearInterval(locationInterval);
  }, [fetchDriverData, getCurrentLocation]);

  // Start collection
  const handleStartCollection = async (scheduleId) => {
    try {
      await scheduleAPI.startCollection(scheduleId);
      await vehicleAPI.updateVehicleStatus(user.vehicleId, 'on-route');
      setSuccess('Collection started successfully');
      fetchDriverData();
    } catch (err) {
      setError('Failed to start collection');
    }
  };

  // Complete collection
  const handleCompleteCollection = async () => {
    try {
      if (currentSchedule) {
        await scheduleAPI.completeCollection(currentSchedule.id, completionForm);
        await vehicleAPI.updateVehicleStatus(user.vehicleId, 'idle');
        setSuccess('Collection completed successfully');
        setCompletionDialog(false);
        setCompletionForm({ collectionsCompleted: 0, wasteCollected: 0, issues: '', notes: '' });
        fetchDriverData();
      }
    } catch (err) {
      setError('Failed to complete collection');
    }
  };

  // Report incident
  const handleReportIncident = async () => {
    try {
      await reportAPI.createReport({
        type: 'incident',
        title: `${incidentForm.type} - Driver Report`,
        description: incidentForm.description,
        location: {
          address: incidentForm.location,
          coordinates: currentLocation
        },
        priority: incidentForm.severity === 'high' ? 'urgent' : incidentForm.severity,
        category: 'operational'
      });
      
      setSuccess('Incident reported successfully');
      setIncidentDialog(false);
      setIncidentForm({ type: '', description: '', location: '', severity: 'medium', images: [] });
    } catch (err) {
      setError('Failed to report incident');
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color === 'primary' ? '#1976d2' : color === 'success' ? '#388e3c' : color === 'warning' ? '#f57c00' : '#d32f2f'} 0%, ${color === 'primary' ? '#1565c0' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ef6c00' : '#c62828'} 100%)`,
        color: 'white'
      }}>
        <CardContent>
          <Box display="flex" justifyContent="between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {value}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Driver Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user.name}! Ready for today's route?
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
            <IconButton>
              <MessageIcon />
            </IconButton>
          </Badge>
          
          <Button
            variant="contained"
            startIcon={<WarningIcon />}
            onClick={() => setIncidentDialog(true)}
            color="warning"
          >
            Report Issue
          </Button>
        </Box>
      </Box>

      {/* Status Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Collections"
            value={todaySchedules.filter(s => s.status === 'completed').length}
            subtitle={`of ${todaySchedules.length} scheduled`}
            icon={<AssignmentIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vehicle Status"
            value={vehicleStatus.status || 'Unknown'}
            subtitle={`Fuel: ${vehicleStatus.fuelLevel || 0}%`}
            icon={<VehicleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Route Progress"
            value={`${Math.round(collectionProgress)}%`}
            subtitle="Collections completed"
            icon={<NavigationIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Performance Score"
            value={performanceMetrics.score || 95}
            subtitle="This week average"
            icon={<SpeedIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Current Route */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                  Current Route & Navigation
                </Typography>
                <Box display="flex" gap={1}>
                  <Tooltip title="Refresh location">
                    <IconButton onClick={getCurrentLocation}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Live tracking"
                    size="small"
                  />
                </Box>
              </Box>
              
              <RealTimeMap 
                height={400} 
                ward={user.ward}
                showControls={true}
                centerOnVehicle={user.vehicleId}
              />
            </CardContent>
          </Card>

          {/* Collection Progress */}
          {currentSchedule && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Collection Progress
                </Typography>
                
                <Stepper orientation="vertical">
                  {currentSchedule.collectionPoints?.map((point, index) => (
                    <Step key={index} active={point.status !== 'pending'} completed={point.status === 'collected'}>
                      <StepLabel>
                        <Box display="flex" justifyContent="between" alignItems="center" width="100%">
                          <Typography variant="body1">
                            {point.address}
                          </Typography>
                          <Chip 
                            label={point.status} 
                            color={point.status === 'collected' ? 'success' : point.status === 'missed' ? 'error' : 'default'}
                            size="small"
                          />
                        </Box>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          Estimated time: {point.estimatedTime}
                        </Typography>
                        {point.notes && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Notes: {point.notes}
                          </Typography>
                        )}
                        <Box mt={2}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {/* Mark as collected */}}
                            disabled={point.status === 'collected'}
                          >
                            Mark Collected
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => {/* Mark as missed */}}
                          >
                            Mark Missed
                          </Button>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Schedule & Actions */}
        <Grid item xs={12} lg={4}>
          {/* Today's Schedule */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Schedule
              </Typography>
              
              <List>
                {todaySchedules.map((schedule, index) => (
                  <ListItem key={schedule.id} divider={index < todaySchedules.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: schedule.status === 'completed' ? 'success.main' : 
                                 schedule.status === 'in-progress' ? 'warning.main' : 'primary.main'
                      }}>
                        {schedule.status === 'completed' ? <CheckCircleIcon /> : 
                         schedule.status === 'in-progress' ? <TimerIcon /> : <ScheduleIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${schedule.timeSlot.start} - ${schedule.timeSlot.end}`}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {schedule.ward} - {schedule.wasteType}
                          </Typography>
                          <Chip 
                            label={schedule.status} 
                            size="small" 
                            color={schedule.status === 'completed' ? 'success' : 
                                   schedule.status === 'in-progress' ? 'warning' : 'default'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {schedule.status === 'scheduled' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleStartCollection(schedule.id)}
                        >
                          Start
                        </Button>
                      )}
                      {schedule.status === 'in-progress' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => setCompletionDialog(true)}
                        >
                          Complete
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Vehicle Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vehicle Status
              </Typography>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                  <Typography variant="body2">Fuel Level</Typography>
                  <Typography variant="body2">{vehicleStatus.fuelLevel || 0}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={vehicleStatus.fuelLevel || 0} 
                  color={vehicleStatus.fuelLevel > 50 ? 'success' : vehicleStatus.fuelLevel > 20 ? 'warning' : 'error'}
                />
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                  <Typography variant="body2">Load Capacity</Typography>
                  <Typography variant="body2">
                    {Math.round((vehicleStatus.currentLoad / vehicleStatus.capacity) * 100) || 0}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.round((vehicleStatus.currentLoad / vehicleStatus.capacity) * 100) || 0}
                  color="info"
                />
              </Box>

              <Box display="flex" justifyContent="between" alignItems="center">
                <Typography variant="body2">Last Service:</Typography>
                <Typography variant="body2">
                  {vehicleStatus.maintenance?.lastService ? 
                    new Date(vehicleStatus.maintenance.lastService).toLocaleDateString() : 
                    'N/A'
                  }
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Notifications
              </Typography>
              
              <List>
                {notifications.slice(0, 5).map((notification, index) => (
                  <ListItem key={index} divider={index < 4}>
                    <ListItemText
                      primary={notification.message}
                      secondary={new Date(notification.timestamp).toLocaleTimeString()}
                    />
                  </ListItem>
                ))}
                
                {notifications.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No new notifications"
                      secondary="You're all caught up!"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Incident Report Dialog */}
      <Dialog open={incidentDialog} onClose={() => setIncidentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Incident</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Incident Type"
            value={incidentForm.type}
            onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value })}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="vehicle-breakdown">Vehicle Breakdown</MenuItem>
            <MenuItem value="road-block">Road Block</MenuItem>
            <MenuItem value="accident">Accident</MenuItem>
            <MenuItem value="overflow">Bin Overflow</MenuItem>
            <MenuItem value="safety-hazard">Safety Hazard</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          
          <TextField
            select
            label="Severity"
            value={incidentForm.severity}
            onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </TextField>

          <TextField
            label="Location"
            value={incidentForm.location}
            onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
            fullWidth
            margin="normal"
            placeholder="Describe the location"
          />

          <TextField
            label="Description"
            value={incidentForm.description}
            onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
            placeholder="Describe the incident in detail..."
          />

          <Button
            variant="outlined"
            startIcon={<CameraIcon />}
            sx={{ mt: 2 }}
            component="label"
          >
            Add Photos
            <input type="file" hidden multiple accept="image/*" />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncidentDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReportIncident} 
            variant="contained" 
            startIcon={<SendIcon />}
            disabled={!incidentForm.type || !incidentForm.description}
          >
            Report Incident
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collection Completion Dialog */}
      <Dialog open={completionDialog} onClose={() => setCompletionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Collection</DialogTitle>
        <DialogContent>
          <TextField
            label="Collections Completed"
            type="number"
            value={completionForm.collectionsCompleted}
            onChange={(e) => setCompletionForm({ ...completionForm, collectionsCompleted: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="Total Waste Collected (kg)"
            type="number"
            value={completionForm.wasteCollected}
            onChange={(e) => setCompletionForm({ ...completionForm, wasteCollected: e.target.value })}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Issues Encountered"
            value={completionForm.issues}
            onChange={(e) => setCompletionForm({ ...completionForm, issues: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            placeholder="Any issues or problems encountered..."
          />

          <TextField
            label="Additional Notes"
            value={completionForm.notes}
            onChange={(e) => setCompletionForm({ ...completionForm, notes: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            placeholder="Any additional notes or observations..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompletionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCompleteCollection} 
            variant="contained" 
            color="success"
            disabled={!completionForm.collectionsCompleted || !completionForm.wasteCollected}
          >
            Complete Collection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setIncidentDialog(true)}
      >
        <WarningIcon />
      </Fab>
    </Box>
  );
};

export default EnhancedDriverDashboard;