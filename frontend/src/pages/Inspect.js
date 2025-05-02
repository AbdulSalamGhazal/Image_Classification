import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function Inspect() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inspect
        </Typography>
        <Typography variant="body1">
          Use this page to inspect and analyze individual images. Upload images to classify them and view detailed results.
        </Typography>
      </Box>
    </Container>
  );
}

export default Inspect; 