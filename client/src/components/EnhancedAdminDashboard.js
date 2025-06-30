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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Badge,
  Fab,
  Tooltip,
  Switch,
  FormControlLabel,
  LinearProgress,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as VehicleIcon,
  Person as PersonIcon,
  Assignment as ReportIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import RealTimeMap from './RealTimeMap';
import AdvancedAnalytics from './AdvancedAnalytics';
import { analyticsAPI, userAPI, vehicleAPI, reportAPI } from '../services/apiService';
import socketService from '../services/socketService';

const EnhancedAdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState({});
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [reports, setReports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  
  // UI states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [userDialog, setUserDialog] = useState(false);
  const [vehicleDialog, setVehicleDialog] = useState(false);
  const [alertDialog, setAlertDialog] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);
  
  // Pagination
  const [userPage, setUserPage] = useState(0);
  const [vehiclePage, setVehiclePage] = useState(0);
  const [reportPage, setReportPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'resident',
    ward: '',
    phone: ''
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicleId: '',
    type: 'compactor',
    capacity: '',
    driver: '',
    status: 'idle'
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, vehiclesRes, reportsRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        userAPI.getUsers(),
        vehicleAPI.getVehicles(),
        reportAPI.getReports({ limit: 50 })
      ]);

      setDashboardStats(statsRes.stats || {});
      setUsers(usersRes.users || []);
      setVehicles(vehiclesRes.vehicles || []);
      setReports(reportsRes.reports || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates
  useEffect(() => {
    if (realTimeMode) {
      const handleSystemUpdate = (data) => {
        setSystemAlerts(prev => [data, ...prev.slice(0, 9)]);
      };

      const handleEmergencyAlert = (data) => {
        setSystemAlerts(prev => [{
          id: Date.now(),
          type: 'emergency',
          message: data.message,
          timestamp: data.timestamp,
          severity: 'high'
        }, ...prev.slice(0, 9)]);
      };

      const handleMaintenanceAlert = (data) => {
        setSystemAlerts(prev => [{
          id: Date.now(),
          type: 'maintenance',
          message: data.message,
          timestamp: data.timestamp,
          severity: 'medium'
        }, ...prev.slice(0, 9)]);
      };

      socketService.on('system_update', handleSystemUpdate);
      socketService.onEmergencyAlert(handleEmergencyAlert);
      socketService.onMaintenanceAlert(handleMaintenanceAlert);

      return () => {
        socketService.off('system_update', handleSystemUpdate);
        socketService.off('emergency_alert', handleEmergencyAlert);
        socketService.off('maintenance_alert', handleMaintenanceAlert);
      };
    }
  }, [realTimeMode]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh in real-time mode
  useEffect(() => {
    if (realTimeMode) {
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [realTimeMode, fetchDashboardData]);

  // User management functions
  const handleUserSubmit = async () => {
    try {
      if (selectedUser) {
        await userAPI.updateUser(selectedUser.id, userForm);
        setSuccess('User updated successfully');
      } else {
        await userAPI.createUser(userForm);
        setSuccess('User created successfully');
      }
      
      setUserDialog(false);
      setSelectedUser(null);
      setUserForm({ name: '', email: '', role: 'resident', ward: '', phone: '' });
      fetchDashboardData();
    } catch (err) {
      setError('Failed to save user');
    }
  };

  const handleUserEdit = (user) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      ward: user.ward || '',
      phone: user.phone || ''
    });
    setUserDialog(true);
  };

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId);
        setSuccess('User deleted successfully');
        fetchDashboardData();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  // Vehicle management functions
  const handleVehicleSubmit = async () => {
    try {
      if (selectedVehicle) {
        await vehicleAPI.updateVehicle(selectedVehicle.id, vehicleForm);
        setSuccess('Vehicle updated successfully');
      } else {
        await vehicleAPI.createVehicle(vehicleForm);
        setSuccess('Vehicle created successfully');
      }
      
      setVehicleDialog(false);
      setSelectedVehicle(null);
      setVehicleForm({ vehicleId: '', type: 'compactor', capacity: '', driver: '', status: 'idle' });
      fetchDashboardData();
    } catch (err) {
      setError('Failed to save vehicle');
    }
  };

  // Data grid columns
  const userColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'admin' ? 'error' : params.value === 'driver' ? 'warning' : 'success'}
          size="small"
        />
      )
    },
    { field: 'ward', headerName: 'Ward', width: 100 },
    { field: 'points', headerName: 'Points', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleUserEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => handleUserDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const vehicleColumns = [
    { field: 'vehicleId', headerName: 'Vehicle ID', width: 120 },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'capacity', headerName: 'Capacity (kg)', width: 120 },
    { field: 'driver', headerName: 'Driver', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'on-route' ? 'success' : params.value === 'idle' ? 'warning' : 'error'}
          size="small"
        />
      )
    },
    { field: 'fuelLevel', headerName: 'Fuel %', width: 100 },
    { field: 'currentLoad', headerName: 'Load %', width: 100 }
  ];

  const StatCard = ({ title, value, change, icon, color = 'primary', loading = false }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color === 'primary' ? '#1976d2' : color === 'success' ? '#388e3c' : color === 'warning' ? '#f57c00' : '#d32f2f'} 0%, ${color === 'primary' ? '#1565c0' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ef6c00' : '#c62828'} 100%)`,
        color: 'white',
        position: 'relative'
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {loading ? <LinearProgress sx={{ width: 60 }} /> : value}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {title}
              </Typography>
              {change !== undefined && (
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  {change > 0 ? '+' : ''}{change}% from last period
                </Typography>
              )}
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
        {realTimeMode && (
          <Box sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#4caf50',
            animation: 'pulse 2s infinite'
          }} />
        )}
      </Card>
    </motion.div>
  );

  const tabContent = [
    // Overview Tab
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={dashboardStats.totalUsers || users.length}
              change={8.2}
              icon={<PersonIcon />}
              color="primary"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Vehicles"
              value={dashboardStats.activeVehicles || vehicles.filter(v => v.status === 'on-route').length}
              change={-2.1}
              icon={<VehicleIcon />}
              color="success"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Open Reports"
              value={dashboardStats.openReports || reports.filter(r => r.status === 'open').length}
              change={-15.3}
              icon={<ReportIcon />}
              color="warning"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="System Alerts"
              value={systemAlerts.length}
              change={5.7}
              icon={<WarningIcon />}
              color="error"
              loading={loading}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Real-time Map */}
      <Grid item xs={12} lg={8}>
        <Card sx={{ height: 500 }}>
          <CardContent sx={{ p: 0, height: '100%' }}>
            <RealTimeMap height={500} showControls={true} />
          </CardContent>
        </Card>
      </Grid>

      {/* System Alerts */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ height: 500 }}>
          <CardContent>
            <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="600">
                System Alerts
              </Typography>
              <Badge badgeContent={systemAlerts.filter(a => !a.read).length} color="error">
                <NotificationsIcon />
              </Badge>
            </Box>
            
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {systemAlerts.map((alert, index) => (
                <ListItem key={alert.id || index} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: alert.severity === 'high' ? 'error.main' : 
                               alert.severity === 'medium' ? 'warning.main' : 'info.main'
                    }}>
                      {alert.type === 'emergency' ? <WarningIcon /> : 
                       alert.type === 'maintenance' ? <SettingsIcon /> : <NotificationsIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={alert.message}
                    secondary={new Date(alert.timestamp).toLocaleString()}
                  />
                </ListItem>
              ))}
              
              {systemAlerts.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No alerts"
                    secondary="System is running smoothly"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setUserDialog(true)}
                >
                  Add User
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<VehicleIcon />}
                  onClick={() => setVehicleDialog(true)}
                >
                  Add Vehicle
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {/* Export data */}}
                >
                  Export Data
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                  onClick={() => setActiveTab(3)}
                >
                  View Analytics
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>,

    // User Management Tab
    <Box>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="600">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUserDialog(true)}
        >
          Add User
        </Button>
      </Box>
      
      <Card>
        <CardContent>
          <DataGrid
            rows={users}
            columns={userColumns}
            pageSize={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            pagination
            autoHeight
            disableSelectionOnClick
            loading={loading}
          />
        </CardContent>
      </Card>
    </Box>,

    // Vehicle Management Tab
    <Box>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="600">
          Vehicle Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setVehicleDialog(true)}
        >
          Add Vehicle
        </Button>
      </Box>
      
      <Card>
        <CardContent>
          <DataGrid
            rows={vehicles}
            columns={vehicleColumns}
            pageSize={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            pagination
            autoHeight
            disableSelectionOnClick
            loading={loading}
          />
        </CardContent>
      </Card>
    </Box>,

    // Advanced Analytics Tab
    <AdvancedAnalytics user={user} />
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Admin Control Center
        </Typography>
        
        <Box display="flex" gap={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={realTimeMode}
                onChange={(e) => setRealTimeMode(e.target.checked)}
              />
            }
            label="Real-time Mode"
          />
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchDashboardData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Badge badgeContent={systemAlerts.filter(a => !a.read).length} color="error">
            <IconButton onClick={() => setAlertDialog(true)}>
              <NotificationsIcon />
            </IconButton>
          </Badge>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Overview" icon={<AnalyticsIcon />} />
          <Tab label="Users" icon={<PersonIcon />} />
          <Tab label="Vehicles" icon={<VehicleIcon />} />
          <Tab label="Analytics" icon={<AnalyticsIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>

      {/* User Dialog */}
      <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Role"
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="resident">Resident</MenuItem>
            <MenuItem value="driver">Driver</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <TextField
            label="Ward"
            value={userForm.ward}
            onChange={(e) => setUserForm({ ...userForm, ward: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone"
            value={userForm.phone}
            onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog(false)}>Cancel</Button>
          <Button onClick={handleUserSubmit} variant="contained">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vehicle Dialog */}
      <Dialog open={vehicleDialog} onClose={() => setVehicleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Vehicle ID"
            value={vehicleForm.vehicleId}
            onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleId: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Type"
            value={vehicleForm.type}
            onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="compactor">Compactor</MenuItem>
            <MenuItem value="tipper">Tipper</MenuItem>
            <MenuItem value="auto">Auto</MenuItem>
            <MenuItem value="mini-truck">Mini Truck</MenuItem>
          </TextField>
          <TextField
            label="Capacity (kg)"
            type="number"
            value={vehicleForm.capacity}
            onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Driver"
            value={vehicleForm.driver}
            onChange={(e) => setVehicleForm({ ...vehicleForm, driver: e.target.value })}
            fullWidth
            margin="normal"
          >
            {users.filter(u => u.role === 'driver').map(driver => (
              <MenuItem key={driver.id} value={driver.id}>
                {driver.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVehicleDialog(false)}>Cancel</Button>
          <Button onClick={handleVehicleSubmit} variant="contained">
            {selectedVehicle ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedAdminDashboard;