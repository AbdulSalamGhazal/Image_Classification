import React from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const [value, setValue] = React.useState(location.pathname === '/inspect' ? 1 : 0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div">
          Image Classification
        </Typography>
        <Box sx={{ 
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Tabs value={value} onChange={handleChange} textColor="inherit">
            <Tab 
              label="Dashboard" 
              component={Link} 
              to="/" 
              sx={{ color: 'white' }}
            />
            <Tab 
              label="Inspect" 
              component={Link} 
              to="/inspect" 
              sx={{ color: 'white' }}
            />
            <Tab 
              label="Saved" 
              component={Link} 
              to="/saved" 
              sx={{ color: 'white' }}
            />
          </Tabs>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 