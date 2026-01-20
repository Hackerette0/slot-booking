const express = require('express');
const { protect, authorize } = require('../middleware/auth');  // ← destructuring
const { 
  bookSlot, 
  getMyBookings, 
  getAllBookings 
} = require('../controllers/bookingController');

const router = express.Router();

router.use(protect);

router.post('/', authorize('user'), bookSlot);           // lowercase 'user' if your role is 'user'
router.get('/my', authorize('user'), getMyBookings);

router.get('/', authorize('manager'), getAllBookings);   // lowercase 'manager'

module.exports = router;