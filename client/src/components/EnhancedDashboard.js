import React, { useState, useEffect } from 'react';
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
  IconButton,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  EcoOutlined as EcoIcon,
  LocalShipping as VehicleIcon,
  Assignment as ReportIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
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
import { analyticsAPI, notificationAPI } from '../services/apiService';
import socketService from '../services/socketService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const EnhancedDashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [realtimeData, setRealtimeData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, notificationsRes, unreadRes] = await Promise.all([
          analyticsAPI.getDashboardStats(user.ward),
          notificationAPI.getNotifications(10),
          notificationAPI.getUnreadCount()
        ]);

        setStats(statsRes.stats || {});
        setNotifications(notificationsRes.notifications || []);
        setUnreadCount(unreadRes.count || 0);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.ward]);

  // Real-time updates
  useEffect(() => {
    const handleCollectionNotification = (data) => {
      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: data.message,
        timestamp: data.timestamp
      }]);

      // Auto-remove alert after 5 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.id !== data.timestamp));
      }, 5000);
    };

    const handleEmergencyAlert = (data) => {
      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Emergency: ${data.message}`,
        timestamp: data.timestamp
      }]);
    };

    const handleDailyAnalytics = (data) => {
      setRealtimeData(prev => ({
        ...prev,
        dailyStats: data
      }));
    };

    socketService.onCollectionNotification(handleCollectionNotification);
    socketService.onEmergencyAlert(handleEmergencyAlert);
    socketService.onDailyAnalytics(handleDailyAnalytics);

    return () => {
      socketService.off('collection_notification', handleCollectionNotification);
      socketService.off('emergency_alert', handleEmergencyAlert);
      socketService.off('daily_analytics', handleDailyAnalytics);
    };
  }, []);

  // Mock data for charts
  const collectionTrend = [
    { day: 'Mon', collected: 120, missed: 5, efficiency: 96 },
    { day: 'Tue', collected: 130, missed: 2, efficiency: 98 },
    { day: 'Wed', collected: 110, missed: 8, efficiency: 93 },
    { day: 'Thu', collected: 140, missed: 1, efficiency: 99 },
    { day: 'Fri', collected: 125, missed: 4, efficiency: 97 },
    { day: 'Sat', collected: 90, missed: 6, efficiency: 94 },
    { day: 'Sun', collected: 80, missed: 3, efficiency: 96 }
  ];

  const wasteComposition = [
    { name: 'Organic', value: 45, color: '#4CAF50' },
    { name: 'Recyclable', value: 30, color: '#2196F3' },
    { name: 'Hazardous', value: 15, color: '#FF9800' },
    { name: 'Electronic', value: 10, color: '#9C27B0' }
  ];

  const StatCard = ({ title, value, change, icon, color = 'primary' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color === 'primary' ? '#1976d2' : color === 'success' ? '#388e3c' : color === 'warning' ? '#f57c00' : '#d32f2f'} 0%, ${color === 'primary' ? '#1565c0' : color === 'success' ? '#2e7d32' : color === 'warning' ? '#ef6c00' : '#c62828'} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {value}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {title}
              </Typography>
              {change && (
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption">
                    {change > 0 ? '+' : ''}{change}% from last week
                  </Typography>
                </Box>
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

  const QuickAction = ({ title, description, icon, onClick, color = 'primary' }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        sx={{ 
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)'
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Avatar sx={{ 
            bgcolor: `${color}.main`, 
            width: 64, 
            height: 64, 
            mx: 'auto', 
            mb: 2 
          }}>
            {icon}
          </Avatar>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening in {user.ward || 'your area'} today
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <IconButton 
            onClick={() => setShowNotifications(true)}
            sx={{ bgcolor: 'primary.main', color: 'white' }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            Quick Report
          </Button>
        </Box>
      </Box>

      {/* Real-time Alerts */}
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{ marginBottom: 16 }}
          >
            <Alert 
              severity={alert.type} 
              onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
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
            title="Collections Today"
            value={stats.todayCollections || 156}
            change={12}
            icon={<VehicleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Efficiency Rate"
            value={`${stats.efficiencyRate || 94}%`}
            change={3}
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Reports"
            value={stats.activeReports || 23}
            change={-8}
            icon={<ReportIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Your Points"
            value={user.points || 0}
            change={15}
            icon={<StarIcon />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Real-time Map */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 500, borderRadius: 3 }}>
            <CardContent sx={{ p: 0, height: '100%' }}>
              <RealTimeMap height={500} ward={user.ward} />
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Typography variant="h6" fontWeight="600" mb={2}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <QuickAction
                title="Report Issue"
                description="Submit a new report"
                icon={<ReportIcon />}
                color="error"
                onClick={() => {/* Navigate to reports */}}
              />
            </Grid>
            <Grid item xs={6}>
              <QuickAction
                title="View Schedule"
                description="Check collection times"
                icon={<ScheduleIcon />}
                color="info"
                onClick={() => {/* Navigate to schedule */}}
              />
            </Grid>
            <Grid item xs={6}>
              <QuickAction
                title="Eco Tips"
                description="Learn sustainability"
                icon={<EcoIcon />}
                color="success"
                onClick={() => {/* Navigate to tips */}}
              />
            </Grid>
            <Grid item xs={6}>
              <QuickAction
                title="Messages"
                description="Chat with team"
                icon={<MessageIcon />}
                color="primary"
                onClick={() => {/* Open messaging */}}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Collection Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={3}>
                Weekly Collection Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={collectionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="collected" 
                    stackId="1"
                    stroke="#4CAF50" 
                    fill="#4CAF50" 
                    fillOpacity={0.6}
                    name="Collected"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="missed" 
                    stackId="1"
                    stroke="#FF5722" 
                    fill="#FF5722" 
                    fillOpacity={0.6}
                    name="Missed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Waste Composition */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={3}>
                Waste Composition
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wasteComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {wasteComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={3}>
                Recent Activity
              </Typography>
              <List>
                {notifications.slice(0, 5).map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: notification.type === 'success' ? 'success.main' : 
                                   notification.type === 'warning' ? 'warning.main' : 'info.main'
                        }}>
                          {notification.type === 'success' ? <EcoIcon /> : 
                           notification.type === 'warning' ? <WarningIcon /> : <NotificationsIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(notification.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications Dialog */}
      <Dialog 
        open={showNotifications} 
        onClose={() => setShowNotifications(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Notifications</Typography>
            <Chip label={`${unreadCount} unread`} color="primary" size="small" />
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: notification.read ? 'grey.300' : 'primary.main'
                    }}>
                      <NotificationsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => {/* Quick action */}}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default EnhancedDashboard;