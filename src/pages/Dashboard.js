import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, Typography, Grid, Card, CardContent, 
  CardActions, Button, Box, LinearProgress, Divider,
  Paper, Stack, Chip
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [userProgress, setUserProgress] = useState([]);
  const [recentLessons, setRecentLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch user progress
        const progressResponse = await axios.get('/progress/');
        
        // Fetch recent lessons
        const lessonsResponse = await axios.get('/lessons/', {
          params: { limit: 4, ordering: '-created_at' }
        });
        
        setUserProgress(progressResponse.data);
        setRecentLessons(lessonsResponse.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate completion percentage
  const completedLessons = userProgress.filter(p => p.completed).length;
  const totalLessons = userProgress.length;
  const completionPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;

  // Get last accessed lesson
  const sortedProgress = [...userProgress].sort(
    (a, b) => new Date(b.last_accessed) - new Date(a.last_accessed)
  );
  const lastLesson = sortedProgress[0];
  
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Welcome back, {currentUser?.username || 'Student'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Continue your journey to English fluency
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {/* Progress Overview */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Your Progress
            </Typography>
            <Box sx={{ mb: 3, mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Overall Completion
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {completionPercentage}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={completionPercentage} 
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{completedLessons}</Typography>
                <Typography variant="body2" color="text.secondary">Completed</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{totalLessons - completedLessons}</Typography>
                <Typography variant="body2" color="text.secondary">Remaining</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{totalLessons}</Typography>
                <Typography variant="body2" color="text.secondary">Total Lessons</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Continue Learning */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Continue Learning
            </Typography>
            
            {lastLesson ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {lastLesson.lesson_title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {lastLesson.level_name} Level
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    icon={lastLesson.completed ? <CheckCircleOutlineIcon /> : <ScheduleIcon />} 
                    label={lastLesson.completed ? "Completed" : "In Progress"} 
                    color={lastLesson.completed ? "success" : "primary"}
                    size="small"
                    variant="outlined"
                  />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Last accessed: {new Date(lastLesson.last_accessed).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Button 
                  component={RouterLink} 
                  to={`/lessons/${lastLesson.lesson}`} 
                  variant="contained" 
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                >
                  Continue
                </Button>
              </Box>
            ) : (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body1">
                  You haven't started any lessons yet.
                </Typography>
                <Button 
                  component={RouterLink} 
                  to="/levels" 
                  variant="contained" 
                  sx={{ mt: 2 }}
                >
                  Browse Levels
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Lessons */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            New Lessons
          </Typography>
          <Grid container spacing={3}>
            {recentLessons.map((lesson) => (
              <Grid item xs={12} sm={6} md={3} key={lesson.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box 
                    sx={{ 
                      height: 140, 
                      backgroundImage: `url(${lesson.image || 'https://source.unsplash.com/random/300x200/?english'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}
                  >
                    <Chip 
                      label={lesson.level_name} 
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255,255,255,0.8)'
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {lesson.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lesson.description.length > 100 
                        ? `${lesson.description.substring(0, 100)}...` 
                        : lesson.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      component={RouterLink} 
                      to={`/lessons/${lesson.id}`}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Start Lesson
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 