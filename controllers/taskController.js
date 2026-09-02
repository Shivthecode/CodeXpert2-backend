const Task = require('../models/Task');

// 1. Leader task create kare aur member ko assign kare (Priority ke sath)
exports.createTask = async (req, res) => {
  try {
    const { title, description, teamId, memberId, priority } = req.body;
    const leaderId = req.user.id;

    const newTask = new Task({
      title,
      description,
      team: teamId,
      assignedTo: memberId,
      leader: leaderId,
      priority: priority || 'Medium',
      status: 'todo'
    });

    await newTask.save();
    
    // 🔴 Socket.io signal: Naya task aane par real-time update
    if (req.io) req.io.emit('taskUpdated'); 
    
    res.status(200).json({ message: "Task successfully assign kar diya gaya hai!", task: newTask });
  } catch (error) {
    console.error("Create task error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 2. Member ya Leader apne tasks fetch kare
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    // Wo tasks laao jisme user ya toh assigned member ho ya leader ho
    const tasks = await Task.find({
      $or: [{ assignedTo: userId }, { leader: userId }]
    }).populate('assignedTo', 'name email').populate('team', 'name');

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get tasks error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 3. Member task ko complete karke Review ke liye bhej de (status -> in_review)
exports.submitTaskForReview = async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task nahi mila." });

    task.status = 'in_review';
    await task.save();

    // 🔴 Socket.io signal: Leader ki screen par task review me instantly dikhega
    if (req.io) req.io.emit('taskUpdated');

    res.status(200).json({ message: "Task review ke liye leader ke paas bhej diya gaya hai!" });
  } catch (error) {
    console.error("Submit task error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 4. Leader task ko approve kar de (status -> completed)
exports.approveTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task nahi mila." });

    task.status = 'completed';
    await task.save();

    // 🔴 Socket.io signal: Member ko instantly pata chalega ki task approve ho gaya
    if (req.io) req.io.emit('taskUpdated');

    res.status(200).json({ message: "Task successfully approve ho gaya hai!" });
  } catch (error) {
    console.error("Approve task error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 5. Member task ko 'in-progress' (Working) state mein daale
exports.updateTaskProgress = async (req, res) => {
  try {
    const { taskId, status } = req.body; // status = 'in-progress'
    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task nahi mila." });

    task.status = status;
    await task.save();

    // 🔴 Socket.io signal: Leader ko instantly task in-progress dikhega
    if (req.io) req.io.emit('taskUpdated');

    res.status(200).json({ message: "Task status update ho gaya hai!" });
  } catch (error) {
    console.error("Update task progress error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};