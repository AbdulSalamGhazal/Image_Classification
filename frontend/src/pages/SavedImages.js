import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
  DialogActions,
  Button,
  Snackbar,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

function SavedImages() {
  const [savedImages, setSavedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    fetchSavedImages();
  }, []);

  const fetchSavedImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5050/api/saved-images');
      setSavedImages(response.data);
    } catch (error) {
      console.error('Error fetching saved images:', error);
      setError('Failed to load saved images. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (image) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5050/api/saved-images/${imageToDelete._id}`);
      setSavedImages(savedImages.filter(image => image._id !== imageToDelete._id));
      setDeleteSuccess(true);
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedImage(null);
  };

  const handleCloseSnackbar = () => {
    setDeleteSuccess(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Saved Images
        </Typography>
        <Typography variant="body1" gutterBottom>
          View your saved image analyses and comments.
        </Typography>

        {savedImages.length === 0 ? (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No saved images found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {savedImages.map((image) => (
              <Grid item xs={12} sm={6} md={4} key={image._id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={`http://localhost:5050${image.imageUrl}`}
                    alt="Saved image"
                    sx={{ 
                      cursor: 'pointer',
                      objectFit: 'contain',
                      backgroundColor: '#f5f5f5',
                      position: 'relative'
                    }}
                    onClick={() => handleImageClick(image)}
                  />
                  <CardContent>
                    <Stack 
                      direction="row" 
                      spacing={2} 
                      alignItems="center" 
                      justifyContent="space-between"
                      sx={{ mb: 2 }}
                    >
                      {/* Probability Display */}
                      <Box sx={{ 
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <CircularProgress
                          variant="determinate"
                          value={image.analysisResult.probability * 100}
                          size={60}
                          thickness={4}
                          sx={{
                            color: image.analysisResult.probability > 0.5 ? 'error.main' : 'success.main',
                            '& .MuiCircularProgress-circle': {
                              strokeLinecap: 'round',
                            },
                          }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                            {(image.analysisResult.probability * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>

                      {/* Diagnosis Label */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: image.analysisResult.probability > 0.5 ? 'error.light' : 'success.light',
                        color: image.analysisResult.probability > 0.5 ? 'error.contrastText' : 'success.contrastText',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        minWidth: 140
                      }}>
                        {image.analysisResult.probability > 0.5 ? (
                          <>
                            <WarningIcon sx={{ fontSize: 20, mr: 0.5 }} />
                            <Typography variant="body2">Pneumonia</Typography>
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon sx={{ fontSize: 20, mr: 0.5 }} />
                            <Typography variant="body2">No Pneumonia</Typography>
                          </>
                        )}
                      </Box>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      Saved on: {new Date(image.createdAt).toLocaleString()}
                    </Typography>
                    {image.comments && image.comments.length > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {image.comments.length} comment{image.comments.length !== 1 ? 's' : ''}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(image);
                        }} 
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Image Analysis Details</DialogTitle>
          <DialogContent>
            {selectedImage && (
              <Box>
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <img
                    src={`http://localhost:5050${selectedImage.imageUrl}`}
                    alt="Selected image"
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                  {selectedImage.analysisResult.boundingBox && (
                    <Box
                      sx={{
                        position: 'absolute',
                        border: '2px solid #ff0000',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        left: `${selectedImage.analysisResult.boundingBox.x * 100}%`,
                        top: `${selectedImage.analysisResult.boundingBox.y * 100}%`,
                        width: `${selectedImage.analysisResult.boundingBox.width * 100}%`,
                        height: `${selectedImage.analysisResult.boundingBox.height * 100}%`,
                      }}
                    />
                  )}
                </Box>

                <Stack 
                  direction="row" 
                  spacing={3} 
                  alignItems="center" 
                  justifyContent="center"
                  sx={{ mb: 3 }}
                >
                  {/* Probability Display */}
                  <Box sx={{ 
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <CircularProgress
                      variant="determinate"
                      value={selectedImage.analysisResult.probability * 100}
                      size={100}
                      thickness={4}
                      sx={{
                        color: selectedImage.analysisResult.probability > 0.5 ? 'error.main' : 'success.main',
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                        },
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        {(selectedImage.analysisResult.probability * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Probability
                      </Typography>
                    </Box>
                  </Box>

                  {/* Diagnosis Label */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: selectedImage.analysisResult.probability > 0.5 ? 'error.light' : 'success.light',
                    color: selectedImage.analysisResult.probability > 0.5 ? 'error.contrastText' : 'success.contrastText',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: 1,
                    minWidth: 180
                  }}>
                    {selectedImage.analysisResult.probability > 0.5 ? (
                      <>
                        <WarningIcon sx={{ fontSize: 28, mr: 1 }} />
                        <Typography variant="h6">Pneumonia Detected</Typography>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon sx={{ fontSize: 28, mr: 1 }} />
                        <Typography variant="h6">No Pneumonia Detected</Typography>
                      </>
                    )}
                  </Box>
                </Stack>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Comments
                </Typography>
                <List>
                  {selectedImage.comments.map((comment, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <div 
                              dangerouslySetInnerHTML={{ __html: comment.text }}
                              style={{ maxWidth: '100%', overflow: 'hidden' }}
                            />
                          }
                          secondary={new Date(comment.timestamp).toLocaleString()}
                        />
                      </ListItem>
                      {index < selectedImage.comments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Delete Image</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this image? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={deleteSuccess} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            Image deleted successfully!
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default SavedImages; 