const express = require('express');
const router = express.Router();
const { sendNotice, getNotices } = require('../controllers/noticeController');
const fetchuser = require('../middleware/fetchuser');

router.post('/send', fetchuser, sendNotice);
router.get('/all', fetchuser, getNotices);

module.exports = router;