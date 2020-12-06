const hpp = require('hpp');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const helmet = require('helmet');
const xss = require('xss-clean');
const express = require('express');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const mongoSanitize = require('express-mongo-sanitize');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect BD
connectDB();

// Route files
const bikes = require('./routes/bikes');
const settings = require('./routes/settings');
const auth = require('./routes/auth');
const users = require('./routes/users');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
// app.use(
//   fileupload({
//     useTempFiles: true,
//     tempFileDir: '/tmp/'
//   })
// );

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Prevent http param polution
app.use(hpp());

if (process.env.NODE_ENV === 'production') {
  var whitelist = ['https://quickcitybikes.com'];
  var corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  };
  // Enale CORS
  app.use(cors(corsOptions));
} else {
  app.use(cors());
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/img', express.static(path.join(__dirname, 'public/img')));
// app.use(
//   '/.well-known',
//   express.static(path.join(__dirname, 'public/.well-known'))
// );

// Mount routers
app.use('/api/v1/bikes', bikes);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/settings', settings);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server and exit process
  server.close(() => process.exit(1));
});
