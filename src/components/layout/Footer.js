import React from 'react';
import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.primary.main,
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              English Learning Platform
            </Typography>
            <Typography variant="body2">
              Learn English with interactive lessons, quizzes, and exercises.
              Improve your skills and track your progress.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/frontend/eninglish_lesson_Nikita/frontend/public" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link href="/levels" color="inherit" display="block" sx={{ mb: 1 }}>
              Levels
            </Link>
            <Link href="/profile" color="inherit" display="block" sx={{ mb: 1 }}>
              My Profile
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Email: info@englishlearning.com
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Phone: +1 (123) 456-7890
            </Typography>
            <Typography variant="body2">
              Address: 123 Main St, New York, NY 10001
            </Typography>
          </Grid>
        </Grid>
        <Box mt={3} textAlign="center">
          <Typography variant="body2">
            © {new Date().getFullYear()} English Learning Platform. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 