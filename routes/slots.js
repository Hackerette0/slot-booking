const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { 
  createSlot, 
  getAvailableSlots, 
  blockSlot, 
  unblockSlot 
} = require('../controllers/slotController');

const router = express.Router();

// Apply protect to ALL routes in this router
router.use(protect);   // ← this is correct syntax (protect is the middleware function)

router.get('/available', getAvailableSlots);

// Manager-only routes
router.post('/', authorize('MANAGER'), createSlot);
router.put('/:id/block', authorize('MANAGER'), blockSlot);
router.put('/:id/unblock', authorize('MANAGER'), unblockSlot);

module.exports = router;