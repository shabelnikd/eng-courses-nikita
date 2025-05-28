import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent, 
  CardActions, Button, Box, Chip, CircularProgress,
  Alert, CardMedia, Divider
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios';

const LessonsList = () => {
  const { levelId } = useParams();
  const [level, setLevel] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        setLoading(true);
        
        // Fetch level details
        const levelResponse = await axios.get(`/levels/${levelId}/`);
        setLevel(levelResponse.data);
        setLessons(levelResponse.data.lessons || []);
        
        // Fetch user progress
        const progressResponse = await axios.get('/progress/');
        
        // Transform progress data by lesson ID
        const progressByLesson = {};
        progressResponse.data.forEach(item => {
          progressByLesson[item.lesson] = item;
        });
        
        setUserProgress(progressByLesson);
      } catch (err) {
        console.error('Error fetching level data:', err);
        setError('Failed to load level data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (levelId) {
      fetchLevelData();
    }
  }, [levelId]);

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

  if (!level) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Level not found.</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h1">
          {level.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {level.description}
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Lessons
      </Typography>
      
      {lessons.length === 0 ? (
        <Alert severity="info">No lessons available for this level yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {lessons.map((lesson, index) => {
            const progress = userProgress[lesson.id] || null;
            const isCompleted = progress && progress.completed;
            
            return (
              <Grid item xs={12} md={6} key={lesson.id}>
                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={lesson.image || `https://source.unsplash.com/random/600x400/?english,lesson${index}`}
                    alt={lesson.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {lesson.title}
                      </Typography>
                      {isCompleted && (
                        <Chip 
                          icon={<CheckCircleOutlineIcon />} 
                          label="Completed" 
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {lesson.description.length > 150
                        ? `${lesson.description.substring(0, 150)}...`
                        : lesson.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      component={RouterLink}
                      to={`/lessons/${lesson.id}`}
                      color="primary"
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      fullWidth
                    >
                      {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default LessonsList; 