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
  Divider as MuiDivider,
  Stack,
  Avatar
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CommentIcon from '@mui/icons-material/Comment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';
import { keyframes } from '@mui/system';

// Add fade-in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

function Dashboard() {
  const [stats, setStats] = useState({
    totalAnalyzed: 0,
    averageProbability: 0,
    totalSaved: 0,
    averageProcessingTime: 0,
    recentActivity: [],
    pneumoniaDistribution: {
      pneumonia: 0,
      noPneumonia: 0
    }
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

      // Calculate pneumonia distribution
      const pneumoniaDistribution = filteredImages.reduce((acc, img) => {
        if (img.analysisResult.probability > 0.5) {
          acc.pneumonia += 1;
        } else {
          acc.noPneumonia += 1;
        }
        return acc;
      }, { pneumonia: 0, noPneumonia: 0 });

      const averageProcessingTime = filteredImages.length > 0
        ? filteredImages.reduce((acc, img) => acc + (img.analysisResult.processingTime || 0), 0) / filteredImages.length
        : 0;

      // Get recent activity (last 6 items)
      const recentActivity = filteredImages
        .slice(0, 6)
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
        recentActivity,
        pneumoniaDistribution
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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          animation: `${fadeIn} 0.5s ease-out`
        }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
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
          {[
            {
              title: "Diagnosis Distribution",
              icon: <PsychologyIcon />,
              gradient: "linear-gradient(45deg, #ed6c02 30%, #ff9800 90%)",
              content: (
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: 1, 
                  p: 2,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <WarningIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.9)' }} />
                    <Typography variant="body1" sx={{ flex: 1, opacity: 0.9 }}>
                      Pneumonia
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {stats.pneumoniaDistribution.pneumonia}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.9)' }} />
                    <Typography variant="body1" sx={{ flex: 1, opacity: 0.9 }}>
                      No Pneumonia
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {stats.pneumoniaDistribution.noPneumonia}
                    </Typography>
                  </Box>
                  {stats.totalAnalyzed > 0 && (
                    <Box sx={{ 
                      mt: 2, 
                      pt: 1.5, 
                      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <AutoAwesomeIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Pneumonia Rate: {((stats.pneumoniaDistribution.pneumonia / stats.totalAnalyzed) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              )
            },
            {
              title: "Saved Images",
              icon: <MemoryIcon />,
              gradient: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
              content: (
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {stats.totalSaved}
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: 1, 
                    p: 2
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total images saved in the database
                    </Typography>
                  </Box>
                </Box>
              )
            },
            {
              title: "Average Processing Time",
              icon: <SpeedIcon />,
              gradient: "linear-gradient(45deg, #2e7d32 30%, #66bb6a 90%)",
              content: (
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {formatProcessingTime(stats.averageProcessingTime)}
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: 1, 
                    p: 2
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Average time to analyze an image
                    </Typography>
                  </Box>
                </Box>
              )
            }
          ].map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
              <Card sx={{ 
                background: card.gradient,
                color: 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                animation: `${fadeIn} 0.5s ease-out ${index * 0.1}s`,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }
              }}>
                <CardContent sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                      borderRadius: '50%', 
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {card.icon}
                    </Box>
                    <Typography color="inherit" variant="h6">
                      {card.title}
                    </Typography>
                  </Box>
                  {card.content}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity List */}
        <Paper sx={{ 
          mt: 4, 
          p: 3,
          animation: `${fadeIn} 0.5s ease-out 0.3s`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderRadius: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <AccessTimeIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
              Recent Activity
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {stats.recentActivity.map((activity, index) => (
              <Grid item xs={12} md={6} key={activity.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center"
                  >
                    {/* Probability Display */}
                    <Box sx={{ 
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CircularProgress
                        variant="determinate"
                        value={activity.probability * 100}
                        size={60}
                        thickness={4}
                        sx={{
                          color: activity.probability > 0.5 ? 'error.main' : 'success.main',
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                          {(activity.probability * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>

                    {/* Diagnosis and Details */}
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          backgroundColor: activity.probability > 0.5 ? 'error.light' : 'success.light',
                          color: activity.probability > 0.5 ? 'error.contrastText' : 'success.contrastText',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          minWidth: 120,
                          justifyContent: 'center'
                        }}>
                          {activity.probability > 0.5 ? (
                            <>
                              <WarningIcon sx={{ fontSize: 18, mr: 0.5 }} />
                              <Typography variant="body2">Pneumonia</Typography>
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5 }} />
                              <Typography variant="body2">No Pneumonia</Typography>
                            </>
                          )}
                        </Box>
                        {activity.hasComments && (
                          <Chip 
                            icon={<CommentIcon />}
                            label="Comments" 
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip 
                          icon={<SpeedIcon />}
                          label={formatProcessingTime(activity.processingTime)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {activity.timestamp.toLocaleString()}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* ML Models Section */}
        <Paper sx={{ 
          mt: 4, 
          p: 3, 
          backgroundColor: '#f8f9fa',
          animation: `${fadeIn} 0.5s ease-out 0.4s`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderRadius: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
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