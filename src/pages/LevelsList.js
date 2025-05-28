import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent, 
  CardActions, Button, Box, LinearProgress, Chip,
  Alert, CircularProgress, Paper
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';

const LevelsList = () => {
  const [levels, setLevels] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setLoading(true);
        // Fetch all levels
        const levelsResponse = await axios.get('/levels/');
        setLevels(levelsResponse.data);
        
        // Fetch user progress
        const progressResponse = await axios.get('/progress/');
        
        // Transform progress data by level
        const progressByLevel = {};
        progressResponse.data.forEach(item => {
          const levelId = item.lesson.level;
          if (!progressByLevel[levelId]) {
            progressByLevel[levelId] = {
              total: 0,
              completed: 0
            };
          }
          progressByLevel[levelId].total += 1;
          if (item.completed) {
            progressByLevel[levelId].completed += 1;
          }
        });
        
        setUserProgress(progressByLevel);
      } catch (err) {
        console.error('Error fetching levels:', err);
        setError('Failed to load levels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h1">
          English Levels
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Choose a level to start your learning journey
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {levels.map((level) => {
          // Calculate progress percentage
          const progress = userProgress[level.id] || { total: 0, completed: 0 };
          const progressPercentage = progress.total > 0 
            ? Math.round((progress.completed / progress.total) * 100) 
            : 0;
            
          return (
            <Grid item xs={12} md={6} key={level.id}>
              <Paper 
                elevation={3} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: 2
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="h5" component="h2">
                    {level.name}
                  </Typography>
                  <Chip 
                    label={`${level.lessons_count} Lessons`} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="body1" paragraph>
                    {level.description}
                  </Typography>
                  
                  {progress.total > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Your progress
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {progressPercentage}% Complete
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progressPercentage} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {progress.completed} of {progress.total} lessons completed
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ px: 3, pb: 3 }}>
                  <Button 
                    component={RouterLink} 
                    to={`/levels/${level.id}/lessons`}
                    variant="contained" 
                    endIcon={<ArrowForwardIcon />}
                    size="large"
                    fullWidth
                  >
                    {progress.total > 0 ? 'Continue Level' : 'Start Level'}
                  </Button>
                </CardActions>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default LevelsList; 