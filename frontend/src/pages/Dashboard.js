import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function Dashboard() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to the Image Classification Dashboard. This is where you can view overall statistics and manage your image classification tasks.
        </Typography>
      </Box>
    </Container>
  );
}

export default Dashboard; 