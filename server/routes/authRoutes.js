const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
router.post('/register', registerUser);
router.post('/login', loginUser);
// Protect middleware ensures only authenticated users can invalidate their active session.
router.post('/logout', protect, logoutUser); 

module.exports = router;
