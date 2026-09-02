// Models ko import kar rahe hain 
const User = require('../models/User');
const Team = require('../models/Team');
const Notification = require('../models/Notification');

// 1. Nayi Team Banane ka function
exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const leaderId = req.user.id; // Guard (fetchuser) se leader ki ID mil jayegi

    // Database mein nayi team create karo
    const newTeam = new Team({
      name: name,
      leader: leaderId,
      members: [] // Shuru mein team khali hogi
    });

    const savedTeam = await newTeam.save();

    // 🔴 Socket: Team list update (Optional par safe practice hai)
    if (req.io) req.io.emit('teamUpdated');

    res.status(200).json({ message: "Team created successfully!", team: savedTeam });
  } catch (error) {
    console.error("Create team error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 2. Team Leader: Invite Bhejne ka function
exports.sendTeamInvite = async (req, res) => {
  try {
    const { teamId, memberEmail } = req.body;
    const leaderId = req.user.id; 

    // Check karo jisko invite bhej rahe hain wo user system mein hai ya nahi
    const member = await User.findOne({ email: memberEmail });
    if (!member) {
      return res.status(404).json({ message: "Bhai, is email se CodeXpert par koi user nahi hai." });
    }

    // Nayi notification create karo
    const invite = new Notification({
      recipient: member._id,
      sender: leaderId,
      team: teamId,
      type: 'team_invite',
      status: 'pending'
    });

    await invite.save();

    // 🔴 Socket: Navbar par instantly notification dot dikhane ke liye
    if (req.io) req.io.emit('notificationUpdated');

    res.status(200).json({ message: "Invitation successfully bhej diya gaya hai!" });
  } catch (error) {
    console.error("Invite send error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 3. Member: Invite ko Accept ya Reject karne ka function
exports.respondToInvite = async (req, res) => {
  try {
    const { notificationId, action } = req.body; 
    const memberId = req.user.id;

    // Check karo notification exist karti hai ya nahi
    const notification = await Notification.findById(notificationId);
    if (!notification || notification.recipient.toString() !== memberId) {
      return res.status(404).json({ message: "Notification nahi mili." });
    }

    // Agar member ne accept kiya
    if (action === 'accepted') {
      notification.status = 'accepted';
      await notification.save();

      // Member ko Team ke database mein add kar do
      await Team.findByIdAndUpdate(notification.team, {
        $addToSet: { members: memberId } 
      });

      // 🔴 Socket: Leader ka MyTeams aur member ka notification dono instantly update honge
      if (req.io) {
        req.io.emit('teamUpdated'); 
        req.io.emit('notificationUpdated');
      }

      return res.status(200).json({ message: "Badhai ho! Aapne team join kar li hai." });
    } 
    // Agar member ne reject kiya
    else if (action === 'rejected') {
      notification.status = 'rejected';
      await notification.save();
      
      // 🔴 Socket: Notification UI se hatane ke liye
      if (req.io) req.io.emit('notificationUpdated');

      return res.status(200).json({ message: "Aapne invitation reject kar diya hai." });
    } 
    else {
      return res.status(400).json({ message: "Invalid action." });
    }

  } catch (error) {
    console.error("Invite respond error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 4. Member ki saari pending notifications fetch karne ka function
exports.getMyNotifications = async (req, res) => {
  try {
    const memberId = req.user.id;

    const notifications = await Notification.find({ 
      recipient: memberId, 
      status: 'pending' 
    }).populate('sender', 'name email').populate('team', 'name');

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get notifications error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 5. User ki saari teams fetch karne ka function (Leader dashboard ke liye)
exports.getMyTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    const teams = await Team.find({
      $or: [
        { leader: userId },
        { members: userId }
      ]
    }).populate('leader', 'name email').populate('members', 'name email');

    res.status(200).json(teams);
  } catch (error) {
    console.error("Get teams error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 6. Team Delete karne ka function (Sirf Leader delete kar sakta hai)
exports.deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team nahi mili." });

    if (team.leader.toString() !== userId) {
      return res.status(403).json({ message: "Sirf team leader hi team delete kar sakta hai." });
    }

    await Team.findByIdAndDelete(teamId);
    await Notification.deleteMany({ team: teamId });

    // 🔴 Socket: Teams delete hote hi sabki list se gayab ho jayegi
    if (req.io) req.io.emit('teamUpdated');

    res.status(200).json({ message: "Team successfully delete ho gayi hai." });
  } catch (error) {
    console.error("Delete team error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 7. Team se Member ko Remove karne ka function
exports.removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team nahi mili." });

    if (team.leader.toString() !== userId) {
      return res.status(403).json({ message: "Sirf leader hi member hata sakta hai." });
    }

    team.members = team.members.filter(m => m.toString() !== memberId);
    await team.save();

    // 🔴 Socket: Member remove hote hi UI update hoga
    if (req.io) req.io.emit('teamUpdated');

    res.status(200).json({ message: "Member ko team se hata diya gaya hai." });
  } catch (error) {
    console.error("Remove member error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};

// 8. Sirf Member wali teams fetch karne ka function (Member dashboard ke liye)
exports.getMemberTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    // Wo teams laao jisme user 'members' array mein ho, lekin leader ye user na ho
    const teams = await Team.find({
      members: userId,
      leader: { $ne: userId }
    }).populate('leader', 'name email').populate('members', 'name email');

    res.status(200).json(teams);
  } catch (error) {
    console.error("Get member teams error: ", error);
    res.status(500).json({ error: "Server mein kuch problem hai." });
  }
};