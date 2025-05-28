import React, { useState, useContext, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Avatar, Grid,
  TextField, Button, Alert, CircularProgress, Divider
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, updateProfile, loading: authLoading } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    bio: '',
    avatar: ''
  });
  const [levels, setLevels] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || ''
      });
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch levels
        const levelsResponse = await axios.get('/levels/');
        setLevels(levelsResponse.data);
        
        // Fetch user progress
        const progressResponse = await axios.get('/progress/');
        setUserProgress(progressResponse.data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setUpdateLoading(true);
    
    try {
      const success = await updateProfile(formData);
      if (success) {
        setSuccess('Profile updated successfully');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Calculate stats
  const completedLessons = userProgress.filter(p => p.completed).length;
  const totalLessons = userProgress.length;
  const completionPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;
    
  // Group progress by level
  const progressByLevel = {};
  userProgress.forEach(item => {
    if (!progressByLevel[item.level_name]) {
      progressByLevel[item.level_name] = {
        total: 0,
        completed: 0
      };
    }
    progressByLevel[item.level_name].total += 1;
    if (item.completed) {
      progressByLevel[item.level_name].completed += 1;
    }
  });

  if (loading || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Please login to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={currentUser.avatar || ''}
              alt={currentUser.username}
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem'
              }}
            >
              {!currentUser.avatar && (
                currentUser.username?.charAt(0).toUpperCase() || <AccountCircleIcon fontSize="inherit" />
              )}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {currentUser.username}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {currentUser.email}
            </Typography>
            
            <Box sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Level:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {currentUser.current_level_name || 'Not set'}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Bio:
              </Typography>
              <Typography variant="body1" paragraph>
                {currentUser.bio || 'No bio available'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Edit Profile
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Profile Picture URL"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://example.com/your-image.jpg"
                    helperText="Enter a URL to your profile picture"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Tell us about yourself and your goals for learning English"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={updateLoading}
                    startIcon={<SaveIcon />}
                  >
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Learning Statistics
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={4} textAlign="center">
                <Typography variant="h4" color="primary">
                  {completedLessons}
                </Typography>
                <Typography variant="body2">Lessons Completed</Typography>
              </Grid>
              <Grid item xs={4} textAlign="center">
                <Typography variant="h4" color="primary">
                  {totalLessons}
                </Typography>
                <Typography variant="body2">Total Lessons</Typography>
              </Grid>
              <Grid item xs={4} textAlign="center">
                <Typography variant="h4" color="primary">
                  {completionPercentage}%
                </Typography>
                <Typography variant="body2">Completion</Typography>
              </Grid>
            </Grid>
            
            <Typography variant="h6" gutterBottom>
              Progress by Level
            </Typography>
            
            {Object.keys(progressByLevel).length === 0 ? (
              <Alert severity="info">
                You haven't started any lessons yet. Begin your learning journey now!
              </Alert>
            ) : (
              Object.entries(progressByLevel).map(([levelName, progress]) => (
                <Box key={levelName} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">
                      {levelName}
                    </Typography>
                    <Typography variant="body2">
                      {progress.completed} / {progress.total} lessons
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 