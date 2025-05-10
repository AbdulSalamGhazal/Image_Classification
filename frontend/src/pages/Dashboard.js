import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Divider as MuiDivider
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalAnalyzed: 0,
    averageProbability: 0,
    totalSaved: 0,
    averageProcessingTime: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('lifetime');
  const [selectedModelSystem, setSelectedModelSystem] = useState('hybrid');

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const getDateRange = () => {
    const now = new Date();
    switch (timeframe) {
      case 'today':
        return {
          start: new Date(now.setHours(0, 0, 0, 0)),
          end: new Date()
        };
      case 'week':
        return {
          start: new Date(now.setDate(now.getDate() - 7)),
          end: new Date()
        };
      case 'month':
        return {
          start: new Date(now.setMonth(now.getMonth() - 1)),
          end: new Date()
        };
      case 'year':
        return {
          start: new Date(now.setFullYear(now.getFullYear() - 1)),
          end: new Date()
        };
      default: // lifetime
        return {
          start: new Date(0),
          end: new Date()
        };
    }
  };

  const formatProcessingTime = (ms) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/saved-images');
      const savedImages = response.data;

      // Filter images based on timeframe
      const { start, end } = getDateRange();
      const filteredImages = savedImages.filter(img => {
        const imageDate = new Date(img.createdAt);
        return imageDate >= start && imageDate <= end;
      });

      // Calculate statistics
      const totalSaved = filteredImages.length;
      const averageProbability = filteredImages.length > 0
        ? filteredImages.reduce((acc, img) => acc + img.analysisResult.probability, 0) / filteredImages.length
        : 0;

      const averageProcessingTime = filteredImages.length > 0
        ? filteredImages.reduce((acc, img) => acc + (img.analysisResult.processingTime || 0), 0) / filteredImages.length
        : 0;

      // Get recent activity (last 5 items)
      const recentActivity = filteredImages
        .slice(0, 5)
        .map(img => ({
          id: img._id,
          timestamp: new Date(img.createdAt),
          probability: img.analysisResult.probability,
          processingTime: img.analysisResult.processingTime,
          hasComments: img.comments && img.comments.length > 0
        }));

      setStats({
        totalAnalyzed: totalSaved,
        averageProbability,
        totalSaved,
        averageProcessingTime,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  const handleModelSystemChange = (event) => {
    setSelectedModelSystem(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="timeframe-select-label">Time Period</InputLabel>
            <Select
              labelId="timeframe-select-label"
              id="timeframe-select"
              value={timeframe}
              label="Time Period"
              onChange={handleTimeframeChange}
            >
              <MenuItem value="lifetime">Lifetime</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="today">Today</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Images Analyzed
                </Typography>
                <Typography variant="h4">
                  {stats.totalAnalyzed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Detection Probability
                </Typography>
                <Typography variant="h4">
                  {(stats.averageProbability * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Saved Images
                </Typography>
                <Typography variant="h4">
                  {stats.totalSaved}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Processing Time
                </Typography>
                <Typography variant="h4">
                  {formatProcessingTime(stats.averageProcessingTime)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity List */}
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            {stats.recentActivity.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          Image analyzed with {(activity.probability * 100).toFixed(1)}% probability
                        </Typography>
                        <Chip 
                          label={activity.probability > 0.7 ? "High Confidence" : "Medium Confidence"}
                          color={activity.probability > 0.7 ? "success" : "primary"}
                          size="small"
                        />
                        {activity.hasComments && (
                          <Chip 
                            label="Has Comments" 
                            color="secondary" 
                            size="small"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2">
                          {activity.timestamp.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Processing time: {formatProcessingTime(activity.processingTime)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < stats.recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* ML Models Section */}
        <Paper sx={{ mt: 4, p: 3, backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon color="primary" />
              <Typography variant="h5">
                Machine Learning Model System
              </Typography>
            </Box>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel id="model-system-select-label">Select Model System</InputLabel>
              <Select
                labelId="model-system-select-label"
                id="model-system-select"
                value={selectedModelSystem}
                label="Select Model System"
                onChange={handleModelSystemChange}
              >
                <MenuItem value="hybrid">Hybrid Image Analysis System</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Card sx={{ backgroundColor: '#fff' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <ArchitectureIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                <Box>
                  <Typography variant="h6" component="div">
                    Hybrid Image Analysis System
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Combined Classification and Object Detection
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Chip 
                  icon={<MemoryIcon />} 
                  label="Deep Learning" 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  icon={<SpeedIcon />} 
                  label="High Accuracy" 
                  color="success" 
                  variant="outlined"
                />
                <Chip 
                  label="Real-time Processing" 
                  color="info" 
                  variant="outlined"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                A sophisticated image analysis system that combines state-of-the-art classification and object detection capabilities
                to provide comprehensive image understanding and analysis.
              </Typography>

              <MuiDivider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <PsychologyIcon sx={{ fontSize: 30, color: '#1976d2' }} />
                      <Box>
                        <Typography variant="subtitle1" component="div">
                          DenseNet121
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Classification Component
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Provides high-accuracy image classification capabilities, identifying objects and patterns within images.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <PsychologyIcon sx={{ fontSize: 30, color: '#2e7d32' }} />
                      <Box>
                        <Typography variant="subtitle1" component="div">
                          YOLOv8
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Object Detection Component
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Delivers precise object localization with real-time performance, identifying and locating objects within images.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Paper>
      </Box>
    </Container>
  );
}

export default Dashboard; 