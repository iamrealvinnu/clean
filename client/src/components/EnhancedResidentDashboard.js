import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Paper,
  IconButton,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Fab,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Recycling as RecyclingIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as ReportIcon,
  Message as MessageIcon,
  Camera as CameraIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
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
  ResponsiveContainer,
  Legend
} from 'recharts';

import RealTimeMap from './RealTimeMap';
import { scheduleAPI, reportAPI, userAPI, analyticsAPI } from '../services/apiService';
import socketService from '../services/socketService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const EnhancedResidentDashboard = ({ user }) => {
  const [nextCollection, setNextCollection] = useState(null);
  const [userStats, setUserStats] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [wasteStats, setWasteStats] = useState([]);
  const [reportDialog, setReportDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Real-time data
  const [liveVehicles, setLiveVehicles] = useState([]);
  const [collectionAlerts, setCollectionAlerts] = useState([]);
  
  // Form states
  const [reportForm, setReportForm] = useState({
    type: '',
    title: '',
    description: '',
    priority: 'medium',
    images: []
  });

  // Fetch resident data
  const fetchResidentData = useCallback(async () => {
    try {
      setLoading(true);
      const [scheduleRes, statsRes, leaderboardRes, wasteRes] = await Promise.all([
        scheduleAPI.getSchedules({ ward: user.ward, upcoming: true }),
        userAPI.getUserStats(user.id),
        userAPI.getLeaderboard(user.ward),
        analyticsAPI.getWasteAnalytics('30d', user.ward)
      ]);

      setNextCollection(scheduleRes.schedules?.[0]);
      setUserStats(statsRes.stats || {});
      setLeaderboard(leaderboardRes.leaderboard || []);
      setWasteStats(wasteRes.trends || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Resident data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user.ward, user.id]);

  // Real-time updates
  useEffect(() => {
    const handleCollectionNotification = (data) => {
      if (data.ward === user.ward) {
        setCollectionAlerts(prev => [data, ...prev.slice(0, 4)]);
        
        // Auto-remove alert after 10 seconds
        setTimeout(() => {
          setCollectionAlerts(prev => prev.filter(alert => alert.timestamp !== data.timestamp));
        }, 10000);
      }
    };

    const handleVehicleUpdate = (data) => {
      if (data.ward === user.ward) {
        setLiveVehicles(prev => {
          const updated = prev.filter(v => v.vehicleId !== data.vehicleId);
          return [...updated, data];
        });
      }
    };

    socketService.onCollectionNotification(handleCollectionNotification);
    socketService.onVehicleLocationUpdate(handleVehicleUpdate);

    return () => {
      socketService.off('collection_notification', handleCollectionNotification);
      socketService.off('vehicle_location_update', handleVehicleUpdate);
    };
  }, [user.ward]);

  // Initialize
  useEffect(() => {
    fetchResidentData();
  }, [fetchResidentData]);

  // Submit report
  const handleSubmitReport = async () => {
    try {
      await reportAPI.createReport({
        type: reportForm.type,
        title: reportForm.title,
        description: reportForm.description,
        priority: reportForm.priority,
        location: {
          ward: user.ward,
          coordinates: { lat: 12.9716, lng: 77.5946 } // Default coordinates
        },
        category: 'resident-report'
      });
      
      setSuccess('Report submitted successfully');
      setReportDialog(false);
      setReportForm({ type: '', title: '', description: '', priority: 'medium', images: [] });
    } catch (err) {
      setError('Failed to submit report');
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle, trend }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color === 'primary' ? '#1976d2' : color === 'success' ? '#388e3c' : color === 'warning' ? '#f57c00' : '#d32f2f'} 0%, ${color === 'primary' ? '#1565c0' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ef6c00' : '#c62828'} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <CardContent>
          <Box display="flex" justifyContent="between" alignItems="center">
            <Box>
              <Typography variant="h3" fontWeight="bold">
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
              {trend && (
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2">
                    {trend > 0 ? '+' : ''}{trend}% this month
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
        
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.1)'
        }} />
      </Card>
    </motion.div>
  );

  const mockWasteData = [
    { month: 'Jan', organic: 45, recyclable: 30, hazardous: 15, electronic: 10 },
    { month: 'Feb', organic: 48, recyclable: 28, hazardous: 14, electronic: 10 },
    { month: 'Mar', organic: 42, recyclable: 32, hazardous: 16, electronic: 10 },
    { month: 'Apr', organic: 50, recyclable: 25, hazardous: 15, electronic: 10 },
    { month: 'May', organic: 47, recyclable: 29, hazardous: 14, electronic: 10 },
    { month: 'Jun', organic: 49, recyclable: 27, hazardous: 14, electronic: 10 }
  ];

  const ecoTips = [
    { tip: 'Separate wet and dry waste properly', points: 10 },
    { tip: 'Use reusable bags for shopping', points: 15 },
    { tip: 'Compost your kitchen waste', points: 20 },
    { tip: 'Recycle paper and plastic items', points: 12 },
    { tip: 'Avoid single-use plastics', points: 18 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Welcome back, {user.name}! 🏠
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your eco-friendly journey in {user.ward}
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
            <IconButton>
              <NotificationsIcon />
            </IconButton>
          </Badge>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setReportDialog(true)}
          >
            Quick Report
          </Button>
        </Box>
      </Box>

      {/* Real-time Collection Alerts */}
      <AnimatePresence>
        {collectionAlerts.map((alert) => (
          <motion.div
            key={alert.timestamp}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{ marginBottom: 16 }}
          >
            <Alert 
              severity={alert.type === 'started' ? 'info' : 'success'}
              icon={alert.type === 'started' ? <LocationIcon /> : <CheckCircleIcon />}
              sx={{ borderRadius: 2 }}
            >
              {alert.message}
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Eco Points"
            value={user.points || 0}
            subtitle="Keep collecting!"
            trend={15}
            icon={<StarIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Reports Submitted"
            value={userStats.totalReports || 0}
            subtitle="Community contributions"
            icon={<ReportIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Waste Recycled"
            value={`${userStats.wasteRecycled || 0} kg`}
            subtitle="This month"
            trend={8}
            icon={<RecyclingIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Leaderboard Rank"
            value={`#${leaderboard.findIndex(l => l.userId === user.id) + 1 || 'N/A'}`}
            subtitle="In your ward"
            icon={<TrophyIcon />}
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Next Collection & Map */}
        <Grid item xs={12} lg={8}>
          {/* Next Collection Info */}
          {nextCollection && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="600">
                    📅 Next Collection Schedule
                  </Typography>
                  <Chip 
                    label={nextCollection.wasteType} 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <ScheduleIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h6">
                          {new Date(nextCollection.scheduledDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {nextCollection.timeSlot.start} - {nextCollection.timeSlot.end}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center">
                      <LocationIcon sx={{ mr: 2, color: 'success.main' }} />
                      <Typography variant="body1">
                        {nextCollection.ward} - Collection Route
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Preparation Tips:
                      </Typography>
                      <Typography variant="body2">
                        • Separate {nextCollection.wasteType.toLowerCase()} waste
                        <br />
                        • Place bins outside by {nextCollection.timeSlot.start}
                        <br />
                        • Ensure proper packaging for safety
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Live Vehicle Tracking */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                  🚛 Live Vehicle Tracking
                </Typography>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Live updates"
                  size="small"
                />
              </Box>
              
              <RealTimeMap 
                height={400} 
                ward={user.ward}
                showControls={true}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Leaderboard */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏆 Ward Leaderboard
              </Typography>
              
              <List>
                {leaderboard.slice(0, 5).map((leader, index) => (
                  <ListItem key={leader.userId} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'primary.main',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography variant="body1" fontWeight={leader.userId === user.id ? 'bold' : 'normal'}>
                            {leader.name}
                          </Typography>
                          {leader.userId === user.id && (
                            <Chip label="You" size="small" color="primary" sx={{ ml: 1 }} />
                          )}
                        </Box>
                      }
                      secondary={`${leader.points} points`}
                    />
                    <ListItemSecondaryAction>
                      {index < 3 && (
                        <TrophyIcon sx={{ 
                          color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                        }} />
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Eco Tips */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🌱 Daily Eco Tips
              </Typography>
              
              <List>
                {ecoTips.slice(0, 3).map((tip, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                        <RecyclingIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={tip.tip}
                      secondary={`+${tip.points} points`}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View All Tips
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Your Impact
              </Typography>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                  <Typography variant="body2">Monthly Goal</Typography>
                  <Typography variant="body2">75%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={75} color="success" />
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                  <Typography variant="body2">Recycling Rate</Typography>
                  <Typography variant="body2">92%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={92} color="info" />
              </Box>

              <Box>
                <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                  <Typography variant="body2">Community Rank</Typography>
                  <Typography variant="body2">Top 15%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={85} color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Waste Analytics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Your Waste Analytics (Last 6 Months)
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockWasteData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="organic" stackId="1" stroke="#4CAF50" fill="#4CAF50" />
                  <Area type="monotone" dataKey="recyclable" stackId="1" stroke="#2196F3" fill="#2196F3" />
                  <Area type="monotone" dataKey="hazardous" stackId="1" stroke="#FF9800" fill="#FF9800" />
                  <Area type="monotone" dataKey="electronic" stackId="1" stroke="#9C27B0" fill="#9C27B0" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Report Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit a Report</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Report Type"
            value={reportForm.type}
            onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
            fullWidth
            margin="normal"
            required
          >
            <MenuItem value="missed-collection">Missed Collection</MenuItem>
            <MenuItem value="overflow">Bin Overflow</MenuItem>
            <MenuItem value="damage">Damaged Infrastructure</MenuItem>
            <MenuItem value="complaint">General Complaint</MenuItem>
            <MenuItem value="suggestion">Suggestion</MenuItem>
          </TextField>
          
          <TextField
            label="Title"
            value={reportForm.title}
            onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
            fullWidth
            margin="normal"
            required
            placeholder="Brief title for your report"
          />

          <TextField
            select
            label="Priority"
            value={reportForm.priority}
            onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}
            fullWidth
            margin="normal"
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </TextField>

          <TextField
            label="Description"
            value={reportForm.description}
            onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
            placeholder="Describe the issue in detail..."
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
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitReport} 
            variant="contained" 
            startIcon={<SendIcon />}
            disabled={!reportForm.type || !reportForm.title || !reportForm.description}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setReportDialog(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default EnhancedResidentDashboard;