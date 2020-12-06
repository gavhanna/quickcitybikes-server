const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.NODE_ENV === 'development'
        ? process.env.MONGO_URI_DEV
        : process.env.MONGO_URI_PROD,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      }
    );

    console.log(
      `MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold
    );
  } catch (err) {
    console.log(
      `MongoDB Error: ${err} @ URL: ${
        process.env.NODE_ENV === 'development'
          ? process.env.MONGO_URI_DEV
          : process.env.MONGO_URI_PROD
      }`.cyan.underline.bold
    );
  }
};

module.exports = connectDB;
