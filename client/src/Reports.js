import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Fade,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Stack
} from '@mui/material';
import {
  ReportProblem as ReportProblemIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { wasteAPI } from './api';

const types = [
  { value: 'Missed Collection', label: 'Missed Collection' },
  { value: 'Complaint', label: 'Complaint' },
  { value: 'Suggestion', label: 'Suggestion' },
  { value: 'Bin Overflow', label: 'Bin Overflow' },
  { value: 'Vehicle Issue', label: 'Vehicle Issue' },
  { value: 'Other', label: 'Other' }
];

export default function Reports({ user }) {
  const [form, setForm] = useState({ type: '', details: '', photo: null });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [rating, setRating] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await wasteAPI.getReports();
      setReports(data);
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate file upload - in real app, you'd upload to server
      setForm({ ...form, photo: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);
    
    try {
      const reportData = {
        type: form.type,
        details: form.details,
        photo: form.photo ? form.photo.name : null, // In real app, upload file and get URL
        userId: user.id,
        ward: user.ward
      };
      
      await wasteAPI.createReport(reportData);
      setMessage('Report submitted successfully!');
      setForm({ type: '', details: '', photo: null });
      setShowForm(false);
      fetchReports(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Error occurred while submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async (reportId, value) => {
    try {
      await wasteAPI.updateReport(reportId, { rating: value });
      setRating({ ...rating, [reportId]: value });
      fetchReports(); // Refresh to get updated data
    } catch (err) {
      setError('Failed to submit rating');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircleIcon />;
      case 'In Progress': return <HourglassEmptyIcon />;
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

  return (
    <Fade in={true} timeout={800}>
      <Box maxWidth={800} mx="auto" mt={4} px={0}>
        <Fade in={true} timeout={600}>
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h4" fontWeight={700} color="primary">
                📝 Reports & Feedback
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
                sx={{ borderRadius: 2 }}
              >
                New Report
              </Button>
            </Box>
            
            {message && (
              <Fade in={true}>
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>
              </Fade>
            )}
            
            {error && (
              <Fade in={true}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
              </Fade>
            )}
            
            <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h5" fontWeight={600}>
                  📋 Your Submitted Reports
                </Typography>
              </Box>
              
              <List sx={{ p: 0 }}>
                {reports.map((r, i) => (
                  <Fade in={true} timeout={300 + i * 100} key={i}>
                    <ListItem sx={{ 
                      borderBottom: i < reports.length - 1 ? 1 : 0, 
                      borderColor: 'divider',
                      p: 3,
                      '&:hover': { bgcolor: 'grey.50' },
                      transition: 'background-color 0.3s ease'
                    }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: r.type === 'Missed Collection' ? '#ff9800' : 
                                   r.type === 'Complaint' ? '#1976d2' : 
                                   r.type === 'Suggestion' ? '#4caf50' : '#757575',
                          width: 50,
                          height: 50
                        }}>
                          <ReportProblemIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="h6" fontWeight={600}>
                              {r.type}
                            </Typography>
                            <Chip 
                              icon={getStatusIcon(r.status)} 
                              label={r.status} 
                              color={getStatusColor(r.status)} 
                              size="small" 
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {r.details}
                            </Typography>
                            {r.photo && (
                              <Box sx={{ mt: 1 }}>
                                <Chip 
                                  icon={<PhotoCameraIcon />} 
                                  label="Photo attached" 
                                  size="small" 
                                  variant="outlined"
                                />
                              </Box>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Submitted: {new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString()}
                            </Typography>
                            {r.status === 'Resolved' && (
                              <Stack direction="row" alignItems="center" spacing={1} mt={2}>
                                <Typography variant="body2">Rate Service:</Typography>
                                <Rating
                                  value={rating[r.id] || r.rating || 0}
                                  onChange={(_, value) => handleRate(r.id, value)}
                                  size="small"
                                />
                              </Stack>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  </Fade>
                ))}
                
                {reports.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No reports submitted yet.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setShowForm(true)}
                      sx={{ mt: 2 }}
                    >
                      Submit Your First Report
                    </Button>
                  </Box>
                )}
              </List>
            </Paper>
          </Box>
        </Fade>

        {/* Report Form Dialog */}
        <Dialog 
          open={showForm} 
          onClose={() => setShowForm(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={600}>
                Submit New Report
              </Typography>
              <IconButton onClick={() => setShowForm(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <TextField
                select
                label="Report Type"
                name="type"
                value={form.type}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                sx={{ mb: 2 }}
              >
                {types.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
              
              <TextField
                label="Details"
                name="details"
                value={form.details}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
                placeholder="Please provide detailed information about your report..."
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
                sx={{ mb: 2 }}
              >
                Upload Photo (Optional)
                <input type="file" accept="image/*" hidden onChange={handlePhoto} />
              </Button>
              
              {form.photo && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  📎 Selected: {form.photo.name}
                </Typography>
              )}
            </form>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              variant="contained" 
              disabled={submitting || !form.type || !form.details}
              sx={{ 
                borderRadius: 2, 
                px: 3,
                fontWeight: 600
              }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Submit Report'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
} 