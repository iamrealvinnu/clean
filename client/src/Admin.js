import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Fade,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Group as GroupIcon,
  EventNote as EventNoteIcon,
  DirectionsCar as DirectionsCarIcon,
  BarChart as BarChartIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Report as ReportIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { adminAPI, wasteAPI, trackingAPI, communicationAPI } from './api';
import Messaging from './components/Messaging';

const collectionStats = [
  { day: 'Mon', pickups: 120, missed: 5 },
  { day: 'Tue', pickups: 130, missed: 2 },
  { day: 'Wed', pickups: 110, missed: 7 },
  { day: 'Thu', pickups: 140, missed: 1 },
  { day: 'Fri', pickups: 125, missed: 3 },
  { day: 'Sat', pickups: 90, missed: 4 },
  { day: 'Sun', pickups: 80, missed: 6 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Admin({ user }) {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messagingOpen, setMessagingOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'resident',
    ward: 'Ward 1'
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, reportsRes, vehiclesRes, statsRes] = await Promise.all([
        adminAPI.getUsers(),
        wasteAPI.getReports(),
        trackingAPI.getVehicles(),
        adminAPI.getSystemStats()
      ]);
      
      setUsers(usersRes);
      setReports(reportsRes);
      setVehicles(vehiclesRes);
      setSystemStats(statsRes);
    } catch (err) {
      setError('Failed to load admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async () => {
    try {
      if (selectedUser) {
        await adminAPI.updateUser(selectedUser.id, userForm);
      } else {
        await adminAPI.createUser(userForm);
      }
      setShowUserDialog(false);
      setSelectedUser(null);
      setUserForm({ name: '', email: '', role: 'resident', ward: 'Ward 1' });
      fetchAdminData();
    } catch (err) {
      setError('Failed to save user');
    }
  };

  const handleBroadcastMessage = async () => {
    if (!broadcastMessage.trim()) return;
    
    try {
      await communicationAPI.broadcastMessage({ content: broadcastMessage });
      setBroadcastMessage('');
      setBroadcastOpen(false);
      // Show success message
      setError(''); // Clear any previous errors
    } catch (err) {
      setError('Failed to send broadcast message');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'driver': return 'warning';
      case 'resident': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'success';
      case 'In Progress': return 'warning';
      case 'Open': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box maxWidth={1400} mx="auto" mt={4} px={2}>
        <Fade in={true} timeout={600}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h4" fontWeight={700} color="primary">
              🛠️ Admin Dashboard
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<MessageIcon />}
                onClick={() => setMessagingOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                Messages
              </Button>
              <Button
                variant="contained"
                startIcon={<NotificationsIcon />}
                onClick={() => setBroadcastOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                Broadcast
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Quick Stats */}
        <Fade in={true} timeout={800}>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <GroupIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                    {systemStats?.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <DirectionsCarIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                    {systemStats?.totalVehicles || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Vehicles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <ReportIcon color="warning" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                    {systemStats?.totalReports || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Reports
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <CheckCircleIcon color="info" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                    {systemStats?.activeVehicles || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    On Route
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        <Grid container spacing={3}>
          {/* Analytics Charts */}
          <Grid item xs={12} lg={8}>
            <Fade in={true} timeout={1000}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" mb={3} color="primary" fontWeight={600}>
                    📊 Collection Analytics (This Week)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={collectionStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="pickups" fill="#4e9f3d" name="Pickups" />
                      <Bar dataKey="missed" fill="#ff9800" name="Missed" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Fade>

            <Fade in={true} timeout={1200}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" mb={3} color="primary" fontWeight={600}>
                    📋 Recent Reports
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reports.slice(0, 5).map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{report.type}</TableCell>
                            <TableCell>
                              <Chip 
                                label={report.status} 
                                color={getStatusColor(report.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(report.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary">
                                <VisibilityIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* User Management */}
          <Grid item xs={12} lg={4}>
            <Fade in={true} timeout={1400}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      👥 User Management
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setShowUserDialog(true)}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      Add User
                    </Button>
                  </Box>
                  <List>
                    {users.slice(0, 5).map((user) => (
                      <ListItem key={user.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {user.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          secondary={`${user.role} • ${user.ward}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip 
                            label={user.role} 
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Fade>

            <Fade in={true} timeout={1600}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" mb={3} color="primary" fontWeight={600}>
                    🚛 Vehicle Status
                  </Typography>
                  <List>
                    {vehicles.map((vehicle) => (
                      <ListItem key={vehicle.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <DirectionsCarIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={vehicle.vehicleId}
                          secondary={`${vehicle.driver} • ${vehicle.status}`}
                        />
                        <Chip 
                          label={vehicle.status} 
                          color={vehicle.status === 'On Route' ? 'success' : 
                                 vehicle.status === 'Idle' ? 'warning' : 'error'}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* User Dialog */}
        <Dialog 
          open={showUserDialog} 
          onClose={() => setShowUserDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              {selectedUser ? 'Edit User' : 'Add New User'}
            </Typography>
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
              select
              label="Ward"
              value={userForm.ward}
              onChange={(e) => setUserForm({ ...userForm, ward: e.target.value })}
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="Ward 1">Ward 1</MenuItem>
              <MenuItem value="Ward 2">Ward 2</MenuItem>
              <MenuItem value="Ward 3">Ward 3</MenuItem>
              <MenuItem value="All Wards">All Wards</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUserSubmit}
              variant="contained"
              disabled={!userForm.name || !userForm.email}
              sx={{ borderRadius: 2 }}
            >
              {selectedUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Messaging Dialog */}
        <Messaging 
          user={user} 
          isOpen={messagingOpen} 
          onClose={() => setMessagingOpen(false)} 
        />

        {/* Broadcast Dialog */}
        <Dialog 
          open={broadcastOpen} 
          onClose={() => setBroadcastOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              📢 Broadcast Message to All Users
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Message"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              placeholder="Enter your broadcast message..."
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setBroadcastOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBroadcastMessage}
              variant="contained"
              disabled={!broadcastMessage.trim()}
              sx={{ borderRadius: 2 }}
            >
              Send Broadcast
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
} 