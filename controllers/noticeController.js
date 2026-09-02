const Notice = require('../models/Notice');

// 1. Notice Send karna (Team ya Specific Member ko)
exports.sendNotice = async (req, res) => {
  try {
    const { title, message, teamId, recipientId, priority } = req.body;
    const senderId = req.user.id;

    const newNotice = new Notice({
      title,
      message,
      team: teamId,
      sender: senderId,
      recipient: recipientId || null, // Agar select nahi kiya toh sabke liye
      priority: priority || 'Normal'
    });

    await newNotice.save();
    res.status(200).json({ message: "Notice successfully send ho gaya hai!", notice: newNotice });
  } catch (error) {
    console.error("Send notice error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 2. Notices Fetch karna (User ya Team ke hisaab se)
exports.getNotices = async (req, res) => {
  try {
    const userId = req.user.id;
    // Wo notices laao jo ya toh user ke liye specifically bheje gaye hain YA uski team ke saare members ke liye hain
    const notices = await Notice.find({
      $or: [
        { recipient: userId },
        { recipient: null }
      ]
    }).populate('sender', 'name email').populate('team', 'name').sort({ createdAt: -1 });

    res.status(200).json(notices);
  } catch (error) {
    console.error("Get notices error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};