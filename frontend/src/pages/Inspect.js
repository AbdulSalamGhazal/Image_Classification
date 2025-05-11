import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import PercentIcon from '@mui/icons-material/Percent';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function Inspect() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setAnalysisResult(null);
      setComments([]);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setPreview(null);
    setAnalysisResult(null);
    setComments([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedImage) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('http://localhost:5001/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysisResult(response.data);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!selectedImage || !analysisResult) return;

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('analysisResult', JSON.stringify(analysisResult));
    formData.append('comments', JSON.stringify(comment.trim() ? [{
      text: comment,
      timestamp: new Date().toLocaleString()
    }] : []));

    try {
      await axios.post('http://localhost:5001/api/saved-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Show success message
      setSaveSuccess(true);
      // Reset everything
      setSelectedImage(null);
      setPreview(null);
      setAnalysisResult(null);
      setComment('');
      setComments([]);
    } catch (error) {
      console.error('Error saving image and comment:', error);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedImage || !analysisResult) return;

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('analysisResult', JSON.stringify(analysisResult));
    formData.append('comments', JSON.stringify(comments));

    try {
      await axios.post('http://localhost:5001/api/saved-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Clear the current image and results
      handleClearImage();
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inspect
        </Typography>
        <Typography variant="body1" gutterBottom>
          Upload an image to classify and analyze its contents.
        </Typography>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {!selectedImage ? (
            <Box
              sx={{
                border: '2px dashed #1976d2',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                width: '100%',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Choose Image
                </Button>
              </label>
              <Typography variant="body2" color="textSecondary">
                or drag and drop an image here
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box
                  sx={{
                    width: '100%',
                    minHeight: '400px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    borderRadius: 2,
                    border: '1px solid #ddd',
                    position: 'relative',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <IconButton
                    onClick={handleClearImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                    />
                    {analysisResult && analysisResult.boundingBox && (
                      <Box
                        sx={{
                          position: 'absolute',
                          border: '2px solid #ff0000',
                          backgroundColor: 'rgba(255, 0, 0, 0.1)',
                          left: `${analysisResult.boundingBox.x * 100}%`,
                          top: `${analysisResult.boundingBox.y * 100}%`,
                          width: `${analysisResult.boundingBox.width * 100}%`,
                          height: `${analysisResult.boundingBox.height * 100}%`,
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {!analysisResult && !isLoading && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!selectedImage || isLoading}
                    sx={{ mt: 3 }}
                  >
                    Analyze Image
                  </Button>
                )}

                {isLoading && (
                  <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    <Typography>Processing...</Typography>
                  </Box>
                )}

                {analysisResult && (
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Stack 
                      direction="row" 
                      spacing={3} 
                      alignItems="center" 
                      justifyContent="center"
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
                          value={analysisResult.probability * 100}
                          size={120}
                          thickness={4}
                          sx={{
                            color: analysisResult.probability > 0.5 ? 'error.main' : 'success.main',
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
                          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                            {(analysisResult.probability * 100).toFixed(1)}%
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
                        backgroundColor: analysisResult.probability > 0.5 ? 'error.light' : 'success.light',
                        color: analysisResult.probability > 0.5 ? 'error.contrastText' : 'success.contrastText',
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: 1,
                        minWidth: 200
                      }}>
                        {analysisResult.probability > 0.5 ? (
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
                  </Box>
                )}
              </Grid>

              {analysisResult && (
                <Grid item xs={12} md={4}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Add Comment (Optional)
                    </Typography>
                    <Box 
                      component="form" 
                      onSubmit={handleCommentSubmit}
                      sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}
                    >
                      <Box sx={{ 
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        '& .ql-container': {
                          minHeight: '200px',
                        }
                      }}>
                        <ReactQuill
                          theme="snow"
                          value={comment}
                          onChange={setComment}
                          modules={modules}
                          formats={formats}
                          placeholder="Add a comment (optional)..."
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          endIcon={<SaveIcon />}
                        >
                          Save Analysis
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={handleClearImage}
                        >
                          Discard
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Paper>

        <Snackbar 
          open={saveSuccess} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            Image and comment saved successfully!
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default Inspect; 