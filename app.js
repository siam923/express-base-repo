// src/app.js
import express from 'express';
import cors from 'cors';
// import morgan from 'morgan';
import db from './config/db.js';
import routes from './routes/index.js';
import errorHandler from './common/middlewares/errorHandler.js';
import AppError from './utils/AppError.js';
import setupSwagger from './config/swagger.js';


class App {
  constructor() {
    this.app = express();
    this.server = null;
    this.setupGracefulShutdown();
    this.initialize();
  }

  async initialize() {
    try {
      await this.setupDatabase();
      // Initialize third-party modules (e.g., Stripe) if needed
      this.setupMiddleware();
      this.setupSwagger();
      this.setupRoutes();
      this.setupErrorHandling();
      // Initialize additional modules if necessary
    } catch (error) {
      console.error('Failed to initialize app:', error);
      process.exit(1);
    }
  }

  setupSwagger() {
    setupSwagger(this.app);
  }

  setupGracefulShutdown() {
    // Handle different termination signals
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    signals.forEach(signal => {
      process.on(signal, () => {
        console.log(`Received ${signal}, starting graceful shutdown...`);
        this.shutdown(signal);
      });
    });
  }

  async shutdown(signal) {
    console.log(`Starting graceful shutdown for signal: ${signal}`);
    
    // Close server if it exists
    if (this.server) {
      try {
        await new Promise((resolve, reject) => {
          this.server.close((err) => {
            if (err) {
              console.error('Error during server shutdown:', err);
              reject(err);
            } else {
              console.log('Server closed successfully');
              resolve();
            }
          });
        });
      } catch (error) {
        console.error('Error while closing server:', error);
      }
    }

    // Close database connection
    try {
      await db.disconnect();
      console.log('Database connection closed successfully');
    } catch (error) {
      console.error('Error while closing database connection:', error);
    }

    // Exit process
    process.exit(0);
  }

  async setupDatabase() {
    await db.connect();
  }


  setupMiddleware() {
    this.app.set('trust proxy', 1);
    // this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
  }

  setupRoutes() {
    this.app.use("/api", routes);
    // 404 handler for unknown routes
    this.app.all('*', (req, res, next) => {
      next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
    });
  }

  setupErrorHandling() {
    // Development error logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use((err, req, res, next) => {
        console.error('Error caught in app.js:', err);
        next(err);
      });
    }
    // Global error handler
    this.app.use(errorHandler);
  }

  getApp() {
    return this.app;
  }

  start(port) {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(port, () => {
          console.log(`Server started on port ${port}`);
          resolve(this.server);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Export the App instance instead of just the Express app
const appInstance = new App();
export default appInstance;
