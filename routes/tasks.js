const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getTasks, 
  submitTaskForReview, 
  approveTask, 
  updateTaskProgress 
} = require('../controllers/taskController');
const fetchuser = require('../middleware/fetchuser');

router.post('/create', fetchuser, createTask);
router.get('/all', fetchuser, getTasks);
router.post('/submit-review', fetchuser, submitTaskForReview);
router.post('/approve', fetchuser, approveTask);

// 🔴 Member dwara task progress (in-progress) update karne ka route
router.post('/update-progress', fetchuser, updateTaskProgress);

module.exports = router;