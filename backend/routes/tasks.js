// routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Import the Task model

// @route   GET api/tasks
// @desc    Get all tasks
// @access  Public
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/tasks
// @desc    Add a new task
// @access  Public
router.post('/', async (req, res) => {
    // destructure req.body to include 'list'
    const { name, description, dueDate, list } = req.body;

    // Basic validation (list is now optional with a default)
    if (!name || !dueDate) {
        return res.status(400).json({ msg: 'Please enter all required fields (name and dueDate)' });
    }

    try {
        const newTask = new Task({
            name,
            description,
            dueDate,
            list // Save the list
        });

        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/tasks/:id
// @desc    Update a task (e.g., mark as complete/incomplete, update description, update list)
// @access  Public
router.put('/:id', async (req, res) => {
    // destructure req.body to include 'list'
    const { name, description, dueDate, completed, list } = req.body;
    const taskId = req.params.id;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (completed !== undefined) updateFields.completed = completed;
    if (list !== undefined) updateFields.list = list; // Update list

    try {
        const task = await Task.findByIdAndUpdate(
            taskId,
            { $set: updateFields },
            { new: true } // Returns the updated document
        );

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        res.json(task);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Task ID' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Public
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Task ID' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;