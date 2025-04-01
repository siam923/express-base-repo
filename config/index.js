// src/config/index.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
// (Optionally) use a logger instead of console.log
const log = console;

class Config {
  constructor() {
    this.env = process.env.NODE_ENV || process.env.ENV || "dev";
    this.loadEnvFile();
    this.validateRequiredEnvs();
  }

  loadEnvFile() {
    const envFilePath = path.resolve(process.cwd(), `.env.${this.env}`);
    if (fs.existsSync(envFilePath)) {
      dotenv.config({ path: envFilePath });
      log.info(`Loaded environment variables from ${envFilePath}`);
    } else {
      dotenv.config({ path: ".env.dev" });
      log.warn("Loaded environment variables from default .env.dev file");
    }
  }

  validateRequiredEnvs() {
    const requiredEnvs = ["MONGO_URI", ];
    requiredEnvs.forEach((envVar) => {
      if (!process.env[envVar]) {
        throw new Error(`Required environment variable ${envVar} is missing`);
      }
    });
  }

  parseBoolean(value) {
    return value?.toLowerCase() === "true";
  }

  parseInt(value, defaultValue) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  get config() {
    return {
      env: this.env,
      isDevelopment: this.env === "dev",
      isProduction: this.env === "prod",
      isTest: this.env === "qa",

      app: {
        port: this.parseInt(process.env.PORT, 8080),
        url:
          process.env.APP_URL || `http://localhost:${process.env.PORT || 8080}`,
        frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
        jwtSecret: process.env.JWT_SECRET,
        jwtRefresh: process.env.JWT_REFRESH_SECRET,
        sessionSecret: process.env.SESSION_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
        jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      },

      db: {
        uri: process.env.MONGO_URI,
      },

      storage: {
        type: process.env.STORAGE_TYPE || "s3",
        local: {
          uploadDir: process.env.UPLOAD_DIR || "uploads",
          tempDir: process.env.TEMP_DIR || "temp",
        },
        s3: {
          bucket: process.env.S3_BUCKET_NAME,
          publicUrl: process.env.S3_PUBLIC_URL,
        },
      },

      aws: {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },

      email: {
        from: process.env.EMAIL_FROM,
        smtp: {
          host: process.env.SMTP_HOST,
          port: this.parseInt(process.env.SMTP_PORT, 587),
          secure: this.parseBoolean(process.env.SMTP_SECURE),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        },
      },

      // Add rate limiting configs
      rateLimit: {
        windowMs: this.parseInt(
          process.env.RATE_LIMIT_WINDOW_MS,
          15 * 60 * 1000
        ), // 15 minutes
        max: this.parseInt(process.env.RATE_LIMIT_MAX, 100), // limit each IP to 100 requests per windowMs
      },

      // Add cors configs
      cors: {
        origin: process.env.CORS_ORIGIN?.split(",") || [
          // allow all origins
          "*",
          "http://localhost:3000",
        ],
        credentials: true,
      },
    };
  }
}

const config = new Config().config;

// Freeze the config object to prevent modifications
Object.freeze(config);

export default config;
