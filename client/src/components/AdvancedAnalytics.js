import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { analyticsAPI } from '../services/apiService';
import socketService from '../services/socketService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

const AdvancedAnalytics = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedWard, setSelectedWard] = useState(user.ward || 'all');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Analytics data
  const [collectionData, setCollectionData] = useState([]);
  const [vehiclePerformance, setVehiclePerformance] = useState([]);
  const [wasteComposition, setWasteComposition] = useState([]);
  const [reportTrends, setReportTrends] = useState([]);
  const [kpiData, setKpiData] = useState({});
  const [predictiveData, setPredictiveData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [
        collectionRes,
        vehicleRes,
        wasteRes,
        reportRes
      ] = await Promise.all([
        analyticsAPI.getCollectionStats(timeRange, selectedWard !== 'all' ? selectedWard : null),
        analyticsAPI.getVehiclePerformance(null, timeRange),
        analyticsAPI.getWasteAnalytics(timeRange, selectedWard !== 'all' ? selectedWard : null),
        analyticsAPI.getReportAnalytics(timeRange, selectedWard !== 'all' ? selectedWard : null)
      ]);

      setCollectionData(collectionRes.data || []);
      setVehiclePerformance(vehicleRes.data || []);
      setWasteComposition(wasteRes.composition || []);
      setReportTrends(reportRes.trends || []);
      setKpiData(collectionRes.kpis || {});

      // Generate predictive data (mock for now)
      generatePredictiveData();
      generateHeatmapData();

    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedWard]);

  // Generate mock predictive data
  const generatePredictiveData = () => {
    const predictions = [];
    const baseDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predicted: Math.floor(Math.random() * 50) + 100,
        confidence: Math.random() * 0.3 + 0.7,
        actual: i < 7 ? Math.floor(Math.random() * 50) + 95 : null
      });
    }
    
    setPredictiveData(predictions);
  };

  // Generate heatmap data
  const generateHeatmapData = () => {
    const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const heatmap = [];

    wards.forEach(ward => {
      hours.forEach(hour => {
        heatmap.push({
          ward,
          hour,
          intensity: Math.random() * 100,
          collections: Math.floor(Math.random() * 20) + 5
        });
      });
    });

    setHeatmapData(heatmap);
  };

  // Real-time updates
  useEffect(() => {
    if (realTimeMode) {
      const handleRealTimeUpdate = (data) => {
        // Update relevant charts with real-time data
        setCollectionData(prev => {
          const updated = [...prev];
          const today = new Date().toISOString().split('T')[0];
          const todayIndex = updated.findIndex(item => item.date === today);
          
          if (todayIndex >= 0) {
            updated[todayIndex] = {
              ...updated[todayIndex],
              collected: (updated[todayIndex].collected || 0) + 1,
              efficiency: Math.min(100, (updated[todayIndex].efficiency || 0) + 0.1)
            };
          }
          
          return updated;
        });
      };

      socketService.onCollectionNotification(handleRealTimeUpdate);
      socketService.onDailyAnalytics(handleRealTimeUpdate);

      return () => {
        socketService.off('collection_notification', handleRealTimeUpdate);
        socketService.off('daily_analytics', handleRealTimeUpdate);
      };
    }
  }, [realTimeMode]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Auto-refresh in real-time mode
  useEffect(() => {
    if (realTimeMode) {
      const interval = setInterval(fetchAnalyticsData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [realTimeMode, fetchAnalyticsData]);

  const KPICard = ({ title, value, change, trend, color = 'primary' }) => (
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
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {value}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
          {change !== undefined && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon 
                sx={{ 
                  fontSize: 16, 
                  mr: 0.5,
                  transform: trend === 'down' ? 'rotate(180deg)' : 'none'
                }} 
              />
              <Typography variant="body2">
                {change > 0 ? '+' : ''}{change}% vs last period
              </Typography>
            </Box>
          )}
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, border: '1px solid #ccc' }}>
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('Efficiency') && '%'}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const exportData = () => {
    const dataToExport = {
      collections: collectionData,
      vehicles: vehiclePerformance,
      waste: wasteComposition,
      reports: reportTrends,
      kpis: kpiData,
      exportDate: new Date().toISOString(),
      filters: { timeRange, ward: selectedWard }
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabContent = [
    // Collection Analytics
    <Grid container spacing={3}>
      {/* KPI Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Collections"
              value={kpiData.totalCollections || 1247}
              change={12.5}
              trend="up"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Efficiency Rate"
              value={`${kpiData.efficiencyRate || 94.2}%`}
              change={2.1}
              trend="up"
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Missed Collections"
              value={kpiData.missedCollections || 23}
              change={-15.3}
              trend="down"
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Avg Response Time"
              value={`${kpiData.avgResponseTime || 2.4}h`}
              change={-8.7}
              trend="down"
              color="info"
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Collection Trend Chart */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Collection Trends & Efficiency
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={collectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="collected" fill="#4CAF50" name="Collections" />
                <Bar yAxisId="left" dataKey="missed" fill="#FF5722" name="Missed" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#2196F3" 
                  strokeWidth={3}
                  name="Efficiency %"
                />
                <ReferenceLine yAxisId="right" y={95} stroke="red" strokeDasharray="5 5" />
                <Brush dataKey="date" height={30} stroke="#8884d8" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Waste Composition */}
      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Waste Composition
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={wasteComposition}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wasteComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Predictive Analytics */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Predictive Collection Forecast (Next 30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={predictiveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="Predicted Collections"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Actual Collections"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>,

    // Vehicle Performance
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Vehicle Performance Metrics
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={vehiclePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vehicleId" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#4CAF50" name="Efficiency %" />
                <Bar dataKey="fuelConsumption" fill="#FF9800" name="Fuel Consumption (L)" />
                <Bar dataKey="maintenanceScore" fill="#2196F3" name="Maintenance Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Vehicle Utilization
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={vehiclePerformance}>
                <CartesianGrid />
                <XAxis dataKey="hoursActive" name="Hours Active" />
                <YAxis dataKey="collectionsCompleted" name="Collections" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Vehicles" data={vehiclePerformance} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Maintenance Alerts
            </Typography>
            <Box>
              {vehiclePerformance.filter(v => v.maintenanceScore < 70).map((vehicle, index) => (
                <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                  Vehicle {vehicle.vehicleId} requires maintenance (Score: {vehicle.maintenanceScore})
                </Alert>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>,

    // Report Analytics
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report Trends & Resolution Times
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={reportTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="#8884d8" name="Submitted" />
                <Line type="monotone" dataKey="resolved" stroke="#82ca9d" name="Resolved" />
                <Line type="monotone" dataKey="avgResolutionTime" stroke="#ffc658" name="Avg Resolution (hrs)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report Categories
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Missed Collection', value: 35 },
                    { name: 'Overflow', value: 25 },
                    { name: 'Damage', value: 20 },
                    { name: 'Complaint', value: 15 },
                    { name: 'Other', value: 5 }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {wasteComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Advanced Analytics Dashboard
          </Typography>
          
          <Box display="flex" gap={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={realTimeMode}
                  onChange={(e) => setRealTimeMode(e.target.checked)}
                />
              }
              label="Real-time"
            />
            
            <ButtonGroup variant="outlined" size="small">
              <Button
                variant={timeRange === '24h' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('24h')}
              >
                24H
              </Button>
              <Button
                variant={timeRange === '7d' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('7d')}
              >
                7D
              </Button>
              <Button
                variant={timeRange === '30d' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('30d')}
              >
                30D
              </Button>
              <Button
                variant={timeRange === '90d' ? 'contained' : 'outlined'}
                onClick={() => setTimeRange('90d')}
              >
                90D
              </Button>
            </ButtonGroup>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Ward</InputLabel>
              <Select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                label="Ward"
              >
                <MenuItem value="all">All Wards</MenuItem>
                <MenuItem value="Ward 1">Ward 1</MenuItem>
                <MenuItem value="Ward 2">Ward 2</MenuItem>
                <MenuItem value="Ward 3">Ward 3</MenuItem>
              </Select>
            </FormControl>

            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchAnalyticsData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Data">
              <IconButton onClick={exportData}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Collection Analytics" icon={<AssessmentIcon />} />
            <Tab label="Vehicle Performance" icon={<TrendingUpIcon />} />
            <Tab label="Report Analytics" icon={<FilterIcon />} />
          </Tabs>
        </Paper>

        {/* Loading Overlay */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress size={60} />
          </Box>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {!loading && tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </Box>
    </LocalizationProvider>
  );
};

export default AdvancedAnalytics;