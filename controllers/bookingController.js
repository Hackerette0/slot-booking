const Booking = require('../models/Booking');
const Slot = require('../models/Slot');

const bookSlot = async (req, res) => {
  const { slotId } = req.body;
  if (!slotId) return res.status(400).json({ message: 'Invalid input' });

  try {
    const slot = await Slot.findById(slotId);
    if (!slot || slot.isBlocked) return res.status(400).json({ message: 'Slot unavailable' });

    const existingBooking = await Booking.findOne({ slotId });
    if (existingBooking) return res.status(400).json({ message: 'Slot booked' });

    const booking = new Booking({ slotId, userId: req.user.id });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Booking failed' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate('slotId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('slotId').populate('userId', 'username');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed' });
  }
};

module.exports = { bookSlot, getMyBookings, getAllBookings };