const Message = require('../models/Message');
const Trip = require('../models/Trip');

exports.getMessages = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const isMember = trip.members.some((m) => m.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Not a member of this trip' });

    const messages = await Message.find({ trip: req.params.tripId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 })
      .limit(200);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: 'Message content is required' });

    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const isMember = trip.members.some((m) => m.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Not a member of this trip' });

    const message = await Message.create({
      trip: req.params.tripId,
      sender: req.user.id,
      content: content.trim(),
    });

    await message.populate('sender', 'name email');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
