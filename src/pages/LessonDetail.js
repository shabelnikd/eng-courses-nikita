import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Divider, Button, 
  Stepper, Step, StepLabel, StepContent, CircularProgress,
  Alert, TextField, RadioGroup, FormControlLabel, Radio,
  FormControl, FormLabel, Card, CardContent, CardActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';

const LessonDetail = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [contents, setContents] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/lessons/${lessonId}/`);
        setLesson(response.data);
        
        // Sort contents by order
        const sortedContents = [...response.data.contents].sort((a, b) => a.order - b.order);
        setContents(sortedContents);
      } catch (err) {
        console.error('Error fetching lesson data:', err);
        setError('Failed to load lesson data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonData();
    }
  }, [lessonId]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAnswerChange = (contentId, quizId, value) => {
    setUserAnswers({
      ...userAnswers,
      [`${contentId}-${quizId}`]: value
    });
  };

  const handleExerciseChange = (contentId, exerciseId, value) => {
    setUserAnswers({
      ...userAnswers,
      [`${contentId}-${exerciseId}`]: value
    });
  };

  const handleSubmitQuiz = async (contentId, quiz) => {
    const answerKey = `${contentId}-${quiz.id}`;
    const selectedOption = userAnswers[answerKey];
    
    if (!selectedOption) {
      setFeedback({
        ...feedback,
        [answerKey]: {
          status: 'error',
          message: 'Please select an answer'
        }
      });
      return;
    }

    try {
      setSubmitLoading(true);
      const response = await axios.post('/answers/', {
        quiz: quiz.id,
        selected_option: selectedOption
      });
      
      setFeedback({
        ...feedback,
        [answerKey]: {
          status: response.data.is_correct ? 'success' : 'error',
          message: response.data.is_correct ? 'Correct!' : 'Incorrect. Try again.'
        }
      });
    } catch (err) {
      console.error('Error submitting quiz answer:', err);
      setFeedback({
        ...feedback,
        [answerKey]: {
          status: 'error',
          message: 'Failed to submit your answer. Please try again.'
        }
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitExercise = async (contentId, exercise) => {
    const answerKey = `${contentId}-${exercise.id}`;
    const userAnswer = userAnswers[answerKey];
    
    if (!userAnswer) {
      setFeedback({
        ...feedback,
        [answerKey]: {
          status: 'error',
          message: 'Please enter your answer'
        }
      });
      return;
    }

    try {
      setSubmitLoading(true);
      const response = await axios.post('/answers/', {
        exercise: exercise.id,
        user_answer: userAnswer
      });
      
      setFeedback({
        ...feedback,
        [answerKey]: {
          status: response.data.is_correct ? 'success' : 'error',
          message: response.data.is_correct ? 'Correct!' : 'Incorrect. Try again.'
        }
      });
    } catch (err) {
      console.error('Error submitting exercise answer:', err);
      setFeedback({
        ...feedback,
        [answerKey]: {
          status: 'error',
          message: 'Failed to submit your answer. Please try again.'
        }
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const markLessonComplete = async () => {
    try {
      await axios.post(`/lessons/${lessonId}/complete/`);
      navigate('/');
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
      setError('Failed to mark lesson as complete. Please try again.');
    }
  };

  const renderContent = (content) => {
    switch (content.content_type) {
      case 'text':
        return (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {content.content}
          </Typography>
        );
        
      case 'video':
        return (
          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>
              {content.title}
            </Typography>
            <Box sx={{ position: 'relative', paddingTop: '56.25%', mb: 2 }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={content.content}
                title={content.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </Box>
        );
        
      case 'audio':
        return (
          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>
              {content.title}
            </Typography>
            <audio controls style={{ width: '100%' }}>
              <source src={content.content} />
              Your browser does not support the audio element.
            </audio>
          </Box>
        );
        
      case 'quiz':
        return (
          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>
              {content.title}
            </Typography>
            {content.quizzes.map((quiz) => {
              const answerKey = `${content.id}-${quiz.id}`;
              const currentFeedback = feedback[answerKey];
              
              return (
                <Card key={quiz.id} variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {quiz.question}
                    </Typography>
                    
                    <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
                      <RadioGroup
                        value={userAnswers[answerKey] || ''}
                        onChange={(e) => handleAnswerChange(content.id, quiz.id, e.target.value)}
                      >
                        {quiz.options.map((option) => (
                          <FormControlLabel
                            key={option.id}
                            value={option.id.toString()}
                            control={<Radio />}
                            label={option.text}
                            disabled={!!currentFeedback}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                    
                    {currentFeedback && (
                      <Alert 
                        severity={currentFeedback.status === 'success' ? 'success' : 'error'}
                        sx={{ mt: 2 }}
                      >
                        {currentFeedback.message}
                      </Alert>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      onClick={() => handleSubmitQuiz(content.id, quiz)}
                      disabled={submitLoading || !!currentFeedback}
                      variant="contained"
                      color="primary"
                    >
                      {submitLoading ? 'Submitting...' : 'Submit Answer'}
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        );
        
      case 'exercise':
        return (
          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>
              {content.title}
            </Typography>
            {content.exercises.map((exercise) => {
              const answerKey = `${content.id}-${exercise.id}`;
              const currentFeedback = feedback[answerKey];
              
              return (
                <Card key={exercise.id} variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Instructions:</strong> {exercise.instruction}
                    </Typography>
                    
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {exercise.question}
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="Your answer"
                      variant="outlined"
                      value={userAnswers[answerKey] || ''}
                      onChange={(e) => handleExerciseChange(content.id, exercise.id, e.target.value)}
                      disabled={!!currentFeedback}
                      sx={{ mt: 2 }}
                    />
                    
                    {currentFeedback && (
                      <Alert 
                        severity={currentFeedback.status === 'success' ? 'success' : 'error'}
                        sx={{ mt: 2 }}
                      >
                        {currentFeedback.message}
                      </Alert>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      onClick={() => handleSubmitExercise(content.id, exercise)}
                      disabled={submitLoading || !!currentFeedback}
                      variant="contained"
                      color="primary"
                    >
                      {submitLoading ? 'Submitting...' : 'Submit Answer'}
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        );
        
      default:
        return null;
    }
  };

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

  if (!lesson) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Lesson not found.</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(`/levels/${lesson.level}/lessons`)}
          sx={{ mb: 2 }}
        >
          Back to Lessons
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          {lesson.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {lesson.level_name} Level
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      
      {contents.length === 0 ? (
        <Alert severity="info">No content available for this lesson yet.</Alert>
      ) : (
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {contents.map((content, index) => (
              <Step key={content.id}>
                <StepLabel>{content.title}</StepLabel>
                <StepContent>
                  <Paper elevation={0} sx={{ p: 3, mb: 2 }}>
                    {renderContent(content)}
                  </Paper>
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                      {index === contents.length - 1 ? (
                        <Button
                          variant="contained"
                          onClick={markLessonComplete}
                          endIcon={<CheckIcon />}
                        >
                          Finish Lesson
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          endIcon={<ArrowForwardIcon />}
                        >
                          Continue
                        </Button>
                      )}
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}
    </Container>
  );
};

export default LessonDetail; 