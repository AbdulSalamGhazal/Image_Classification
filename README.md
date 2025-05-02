# Image Classification Project

This repository contains an image classification project developed for System Developments course using MERN stack.

## Project Description
A full-stack web application for image classification tasks using MERN (MongoDB, Express.js, React.js, Node.js) stack.

## Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Environment Setup:
   - Create a `.env` file in the backend directory with the following variables:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server (in a new terminal)
   cd frontend
   npm start
   ```

## Project Structure
```
Image_Classification/
├── backend/           # Node.js/Express backend
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   └── server.js     # Entry point
├── frontend/         # React frontend
│   ├── public/       # Static files
│   ├── src/          # Source code
│   │   ├── components/  # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── utils/      # Utility functions
│   └── package.json
├── .gitignore        # Git ignore file
└── README.md         # Project documentation
```

## Usage
[Add usage instructions here]

## License
[Add license information here] 