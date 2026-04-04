const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Trip = require('./models/Trip');
const Expense = require('./models/Expense');
const Message = require('./models/Message');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-planner');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Trip.deleteMany({}),
      Expense.deleteMany({}),
      Message.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    const pw = await bcrypt.hash('password123', 12);

    const [alice, bob, carol, testUser] = await User.insertMany([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: pw,
        preferences: { budget: 'moderate', interests: ['beaches', 'food', 'history', 'art'], travelStyle: 'leisure' },
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: pw,
        preferences: { budget: 'budget', interests: ['adventure', 'mountains', 'sports', 'wildlife'], travelStyle: 'adventure' },
      },
      {
        name: 'Carol Davis',
        email: 'carol@example.com',
        password: pw,
        preferences: { budget: 'luxury', interests: ['art', 'cities', 'food', 'nightlife'], travelStyle: 'cultural' },
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: pw,
        preferences: { budget: 'moderate', interests: ['beaches', 'adventure', 'food'], travelStyle: 'leisure' },
      },
    ]);
    console.log('👤 Created 4 users');

    const goa = await Trip.create({
      title: 'Goa Beach Getaway 🏖️',
      destination: 'Goa, India',
      description: 'Sun, sand, and amazing seafood! A perfect winter escape.',
      budget: 50000,
      startDate: new Date('2025-12-20'),
      endDate: new Date('2025-12-27'),
      createdBy: alice._id,
      members: [alice._id, bob._id, testUser._id],
      inviteCode: 'GOA123',
      status: 'planning',
      itinerary: [
        { title: 'Arrival & Check-in', description: 'Arrive at Dabolim airport, check into the resort', date: '2025-12-20', time: '14:00', addedBy: alice._id },
        { title: 'Calangute Beach Day', description: 'Full day at Calangute beach, water sports in the afternoon', date: '2025-12-21', time: '09:00', addedBy: alice._id },
        { title: 'Old Goa Heritage Tour', description: 'Visit Basilica of Bom Jesus and Se Cathedral', date: '2025-12-22', time: '10:00', addedBy: bob._id },
        { title: 'Dudhsagar Waterfalls', description: 'Day trip to the majestic waterfalls', date: '2025-12-23', time: '07:00', addedBy: testUser._id },
        { title: 'Night Market at Anjuna', description: 'Shopping and street food at the famous flea market', date: '2025-12-24', time: '18:00', addedBy: alice._id },
      ],
    });

    const paris = await Trip.create({
      title: 'Paris & Beyond 🗼',
      destination: 'Paris, France',
      description: 'A romantic and cultural trip to the City of Light.',
      budget: 200000,
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-03-22'),
      createdBy: carol._id,
      members: [carol._id, alice._id],
      inviteCode: 'PAR456',
      status: 'planning',
      itinerary: [
        { title: 'Arrival & Eiffel Tower', description: 'Check in and evening at Eiffel Tower', date: '2026-03-15', time: '16:00', addedBy: carol._id },
        { title: 'Louvre Museum', description: 'Full day at the world\'s largest art museum', date: '2026-03-16', time: '10:00', addedBy: carol._id },
      ],
    });

    console.log('🗺️  Created 2 trips');

    // Add expenses
    await Expense.create({
      trip: goa._id,
      title: 'Hotel Booking',
      amount: 18000,
      paidBy: alice._id,
      splitType: 'equal',
      category: 'accommodation',
      splits: [
        { user: alice._id, amount: 6000, paid: true },
        { user: bob._id, amount: 6000, paid: false },
        { user: testUser._id, amount: 6000, paid: false },
      ],
    });

    await Expense.create({
      trip: goa._id,
      title: 'Airport Taxi',
      amount: 1500,
      paidBy: bob._id,
      splitType: 'equal',
      category: 'transport',
      splits: [
        { user: alice._id, amount: 500, paid: false },
        { user: bob._id, amount: 500, paid: true },
        { user: testUser._id, amount: 500, paid: false },
      ],
    });

    await Expense.create({
      trip: goa._id,
      title: 'Beach Shack Lunch',
      amount: 3600,
      paidBy: testUser._id,
      splitType: 'equal',
      category: 'food',
      splits: [
        { user: alice._id, amount: 1200, paid: false },
        { user: bob._id, amount: 1200, paid: false },
        { user: testUser._id, amount: 1200, paid: true },
      ],
    });

    console.log('💸 Created 3 expenses');

    // Add messages
    await Message.insertMany([
      { trip: goa._id, sender: alice._id, content: 'Hey everyone! So excited for Goa! 🎉' },
      { trip: goa._id, sender: bob._id, content: 'Me too! Should we do water sports on day 2?' },
      { trip: goa._id, sender: testUser._id, content: 'Absolutely! I heard parasailing is amazing there.' },
      { trip: goa._id, sender: alice._id, content: 'Let\'s also plan a sunset cruise one evening 🌅' },
    ]);

    console.log('💬 Created messages');

    console.log('\n✨ Seed completed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Demo Accounts (password: password123)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  test@example.com   (Test User)');
    console.log('  alice@example.com  (Alice Johnson)');
    console.log('  bob@example.com    (Bob Smith)');
    console.log('  carol@example.com  (Carol Davis)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏖️  Goa Trip invite code: GOA123');
    console.log('🗼 Paris Trip invite code: PAR456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
