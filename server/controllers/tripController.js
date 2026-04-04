const Trip = require('../models/Trip');

exports.createTrip = async (req, res) => {
  try {
    const { title, destination, description, budget, startDate, endDate } = req.body;
    if (!title || !destination || !budget || !startDate || !endDate)
      return res.status(400).json({ message: 'All fields are required' });

    const trip = await Trip.create({
      title,
      destination,
      description,
      budget,
      startDate,
      endDate,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    await trip.populate('members', 'name email preferences');
    await trip.populate('createdBy', 'name email');

    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.joinTrip = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ message: 'Invite code is required' });

    const trip = await Trip.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!trip) return res.status(404).json({ message: 'No trip found with this invite code' });

    const alreadyMember = trip.members.some((m) => m.toString() === req.user.id);
    if (alreadyMember) return res.status(400).json({ message: 'You are already a member of this trip' });

    trip.members.push(req.user.id);
    await trip.save();
    await trip.populate('members', 'name email preferences');
    await trip.populate('createdBy', 'name email');

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ members: req.user.id })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('members', 'name email preferences')
      .populate('createdBy', 'name email')
      .populate('itinerary.addedBy', 'name');

    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const isMember = trip.members.some((m) => m._id.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Not authorized to view this trip' });

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addItinerary = async (req, res) => {
  try {
    const { title, description, date, time } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const isMember = trip.members.some((m) => m.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Not a member of this trip' });

    trip.itinerary.push({ title, description, date, time, addedBy: req.user.id });
    await trip.save();
    await trip.populate('itinerary.addedBy', 'name');

    res.json(trip.itinerary);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
