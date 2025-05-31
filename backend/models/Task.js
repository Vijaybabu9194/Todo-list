// models/Task.js
const mongoose = require('mongoose');

// Define the schema for a Task
const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: { // Ensure this field is present
        type: String,
        required: false, // Description is optional
        trim: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create and export the Task model
module.exports = mongoose.model('Task', TaskSchema);
