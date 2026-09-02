const express = require('express');
const router = express.Router();

// 🔴 getMemberTeams ko import list mein add kiya
const { 
  createTeam, 
  sendTeamInvite, 
  respondToInvite, 
  getMyNotifications, 
  getMyTeams, 
  deleteTeam, 
  removeMember,
  getMemberTeams 
} = require('../controllers/teamController');

const fetchuser = require('../middleware/fetchuser'); 

// Routes
router.post('/create', fetchuser, createTeam);              
router.post('/invite', fetchuser, sendTeamInvite);         
router.post('/respond-invite', fetchuser, respondToInvite); 
router.get('/notifications', fetchuser, getMyNotifications); 
router.get('/my-teams', fetchuser, getMyTeams); 

// Team delete aur member remove karne ke routes
router.delete('/delete/:teamId', fetchuser, deleteTeam);
router.post('/remove-member', fetchuser, removeMember);

// 🔴 Sirf member wali teams fetch karne ka route
router.get('/member-teams', fetchuser, getMemberTeams);

module.exports = router;