import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Inspect from './pages/Inspect';
import SavedImages from './pages/SavedImages';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inspect" element={<Inspect />} />
          <Route path="/saved" element={<SavedImages />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 