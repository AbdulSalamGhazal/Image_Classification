# Frontend Documentation

A modern React-based frontend for the Image Classification System, providing an intuitive user interface for medical image analysis.

## 🚀 Features

- Responsive Material-UI design
- Real-time image analysis
- Interactive dashboard
- Image inspection tools
- Comment system
- Saved images management
- Performance metrics visualization

## 📋 Pages

### Dashboard
- Overview statistics
- Recent analyses
- Model performance metrics
- Quick analysis upload

### Inspect
- Image upload and analysis
- Real-time results display
- Classification confidence scores
- Object detection visualization
- Save analysis results

### Saved Images
- Gallery of analyzed images
- Filter and search functionality
- Detailed analysis view
- Comment system
- Image management

## ⚙️ Configuration

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:5000
```

### Available Scripts
```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
npm run eject    # Eject from create-react-app
```

## 🛠 Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm start
```

## 📁 Project Structure

```
frontend/
├── public/              # Static files
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/      # Reusable components
│   │   ├── Navbar.js
│   │   ├── ImageUpload.js
│   │   └── AnalysisResults.js
│   ├── pages/          # Page components
│   │   ├── Dashboard.js
│   │   ├── Inspect.js
│   │   └── SavedImages.js
│   ├── services/       # API services
│   │   └── api.js
│   ├── utils/          # Utility functions
│   ├── App.js          # Main app component
│   └── index.js        # Entry point
└── package.json
```

## 🎨 UI Components

### Material-UI Components
- AppBar and Navigation
- Cards and Grid layouts
- Dialogs and Modals
- Forms and Inputs
- Data tables
- Charts and Graphs

### Custom Components
- ImageUpload
- AnalysisResults
- CommentSection
- ImageGallery
- PerformanceMetrics
- LoadingSpinner

## 🔒 Security

- Environment variable protection
- API key management
- Input validation
- XSS prevention
- CORS configuration
- Secure file uploads

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - xs: 0px
  - sm: 600px
  - md: 960px
  - lg: 1280px
  - xl: 1920px
- Responsive images
- Adaptive layouts
- Touch-friendly interfaces

## 🧪 Testing

Run tests using Jest and React Testing Library:
```bash
npm test
```

## 📦 Build and Deploy

1. Build the application:
```bash
npm run build
```

2. Test the production build:
```bash
serve -s build
```

3. Deploy to your hosting service

## 📝 Notes

- Uses React 18
- Material-UI v5
- React Router v6
- Axios for API calls
- Recharts for data visualization
- React Quill for rich text
- Environment-based configuration
- Code splitting
- Lazy loading
- Error boundaries
- Performance optimization 