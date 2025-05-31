// db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            // These options are deprecated in newer Mongoose versions but good to know
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useFindAndModify: false, // Prevents deprecation warnings
            // useCreateIndex: true, // Prevents deprecation warnings
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
