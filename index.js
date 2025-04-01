// src/index.js
import config from './config/index.js'; 
import appInstance from './app.js';

const PORT = config.app.port || 8080;

// Use the proper start method from the App class
appInstance.start(PORT).then(() => {
  console.log(`Server running on port ${PORT}`);
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

