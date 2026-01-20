const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

const createSlot = async (req, res) => {
  const { startTime, endTime } = req.body;
  if (!startTime || !endTime || new Date(startTime) >= new Date(endTime)) {
    return res.status(400).json({ message: 'Invalid times' });
  }

  try {
    // Check for overlaps
    const overlaps = await Slot.find({
      $or: [
        { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } },
      ],
    });
    if (overlaps.length > 0) return res.status(400).json({ message: 'Slot overlaps' });

    const slot = new Slot({ startTime, endTime });
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ message: 'Slot creation failed' });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const slots = await Slot.find({ isBlocked: false });
    const bookings = await Booking.find();
    const bookedSlotIds = bookings.map(b => b.slotId.toString());

    const available = slots.filter(s => !bookedSlotIds.includes(s._id.toString()));
    res.json(available);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed' });
  }
};

const blockSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    slot.isBlocked = true;
    await slot.save();
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: 'Block failed' });
  }
};

const unblockSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    slot.isBlocked = false;
    await slot.save();
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: 'Unblock failed' });
  }
};

module.exports = { createSlot, getAvailableSlots, blockSlot, unblockSlot };