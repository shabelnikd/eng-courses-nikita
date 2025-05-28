import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute; 