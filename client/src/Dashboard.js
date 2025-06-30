import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Paper, 
  CircularProgress, 
  Alert, 
  Chip,
  Fade
} from '@mui/material';
import {
  ReportProblemIcon,
  EmojiEventsIcon,
  RecyclingIcon,
  ScheduleIcon,
  LocationIcon,
  CheckCircleIcon,
  MessageIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { wasteAPI } from './api';
import VehicleTracking from './VehicleTracking';
import Messaging from './components/Messaging';

const tips = [
  'Segregate your waste: keep wet and dry waste separate.',
  'Rinse recyclables before putting them in the bin.',
  'Compost your kitchen waste for a greener Bengaluru!',
  'Use reusable bags instead of plastic bags.',
  'Report any issues immediately for faster resolution.'
];

const leaderboard = [
  { name: 'Asha Patel', points: 150, ward: 'Ward 2' },
  { name: 'Nitesh Kumar', points: 120, ward: 'Ward 1' },
  { name: 'Ravi Singh', points: 100, ward: 'Ward 1' },
  { name: 'Priya Sharma', points: 95, ward: 'Ward 3' },
  { name: 'Mohan Das', points: 85, ward: 'Ward 2' }
];

export default function Dashboard({ user, onLogout }) {
  const [nextPickup, setNextPickup] = useState(null);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messagingOpen, setMessagingOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [schedulesRes, reportsRes, analyticsRes] = await Promise.all([
        wasteAPI.getSchedules(),
        wasteAPI.getReports(),
        wasteAPI.getAnalytics()
      ]);
      
      setReports(reportsRes);
      setAnalytics(analyticsRes);
      
      // Find next pickup for user's ward
      const userWardSchedules = schedulesRes.filter(s => s.ward === user.ward);
      if (userWardSchedules.length > 0) {
        // Simple logic: pick the next schedule based on current day
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const nextSchedule = userWardSchedules.find(s => s.day === today) || userWardSchedules[0];
        setNextPickup(nextSchedule);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.ward]);

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'success';
      case 'In Progress': return 'warning';
      case 'Open': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircleIcon />;
      case 'In Progress': return <CircularProgress size={16} />;
      default: return <ReportProblemIcon />;
    }
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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box maxWidth={1200} mx="auto" mt={4} px={2}>
        <Fade in={true} timeout={600}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h4" fontWeight={700} color="primary">
              🏠 Resident Dashboard
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
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Fade in={true} timeout={600}>
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                    Hello, {user.name}! 👋
                  </Typography>
                  <Typography variant="h6" color="text.secondary" mb={3}>
                    Welcome to your waste management dashboard for <b>{user.ward}</b>.
                  </Typography>
                  
                  {nextPickup && (
                    <Paper elevation={2} sx={{ 
                      p: 3, 
                      mb: 3, 
                      background: 'linear-gradient(135deg, #e3f0fa 0%, #f4f8fb 100%)', 
                      borderRadius: 2 
                    }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" color="primary">
                          📅 Next Pickup
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        <b>{nextPickup.day}</b>, {nextPickup.time}
                      </Typography>
                      <Chip 
                        label={nextPickup.type} 
                        color="primary" 
                        variant="outlined" 
                        sx={{ mt: 1 }}
                      />
                    </Paper>
                  )}
                  
                  <Grid container spacing={2}>
                    <Grid item>
                      <Button 
                        component={Link} 
                        to="/reports" 
                        variant="contained" 
                        color="warning" 
                        size="large" 
                        startIcon={<ReportProblemIcon />} 
                        sx={{ borderRadius: 2 }}
                      >
                        Report Issue
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button 
                        component={Link} 
                        to="/reports" 
                        variant="outlined" 
                        color="primary" 
                        size="large" 
                        sx={{ borderRadius: 2 }}
                      >
                        View All Reports
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
            
            <Fade in={true} timeout={800}>
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <LocationIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" color="primary" fontWeight={600}>
                      🗺️ Live Vehicle Tracking
                    </Typography>
                  </Box>
                  <VehicleTracking height={300} hideTitle />
                </CardContent>
              </Card>
            </Fade>
            
            <Fade in={true} timeout={1000}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <RecyclingIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h5" color="success.main" fontWeight={600}>
                      ♻️ Waste Segregation Tips
                    </Typography>
                  </Box>
                  <List>
                    {tips.map((tip, i) => (
                      <ListItem key={i} sx={{ mb: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#4e9f3d', width: 40, height: 40 }}>
                            <RecyclingIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={tip} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Fade in={true} timeout={1200}>
              <Card sx={{ 
                mb: 3, 
                borderRadius: 3, 
                boxShadow: 3, 
                background: 'linear-gradient(135deg, #e3f0fa 60%, #f4f8fb 100%)' 
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" mb={2} color="secondary" fontWeight={600}>
                    🏆 Your Points
                  </Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <EmojiEventsIcon sx={{ fontSize: 50, color: '#FFD700', mr: 2 }} />
                    <Typography variant="h3" fontWeight={700}>{user.points || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Earn points by reporting, recycling, and participating in community events!
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
            
            <Fade in={true} timeout={1400}>
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" mb={3} color="primary" fontWeight={600}>
                    📊 Quick Stats
                  </Typography>
                  {analytics && (
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography>Total Reports:</Typography>
                        <Chip label={analytics.totalReports} color="primary" />
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography>Resolution Rate:</Typography>
                        <Chip label={`${analytics.resolutionRate}%`} color="success" />
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography>Satisfaction:</Typography>
                        <Chip label={`${analytics.satisfactionRate}/5`} color="warning" />
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
            
            <Fade in={true} timeout={1600}>
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" mb={3} color="primary" fontWeight={600}>
                    🏅 Community Leaderboard
                  </Typography>
                  <List>
                    {leaderboard.map((user, i) => (
                      <ListItem key={i} sx={{ mb: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#4e9f3d', 
                            width: 35, 
                            height: 35 
                          }}>
                            {i + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={user.name} 
                          secondary={`${user.points} points • ${user.ward}`} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Fade>
            
            <Fade in={true} timeout={1800}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" mb={3} color="primary" fontWeight={600}>
                    📋 Recent Reports
                  </Typography>
                  <List>
                    {reports.slice(0, 3).map((report, i) => (
                      <ListItem key={i} sx={{ mb: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: report.status === 'Resolved' ? '#4caf50' : 
                                     report.status === 'In Progress' ? '#ff9800' : '#757575',
                            width: 35, 
                            height: 35 
                          }}>
                            {getStatusIcon(report.status)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={report.type} 
                          secondary={`${report.status} • ${new Date(report.createdAt).toLocaleDateString()}`} 
                        />
                        <Chip 
                          label={report.status} 
                          color={getStatusColor(report.status)}
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