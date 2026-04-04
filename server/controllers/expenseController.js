const Expense = require('../models/Expense');
const Trip = require('../models/Trip');

exports.addExpense = async (req, res) => {
  try {
    const { tripId, title, amount, splitType, splits, category } = req.body;
    if (!tripId || !title || !amount || !splits || splits.length === 0)
      return res.status(400).json({ message: 'Missing required fields' });

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const isMember = trip.members.some((m) => m.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Not a member of this trip' });

    let finalSplits = [];

    if (splitType === 'equal') {
      // splits is array of user IDs
      const perPerson = parseFloat((amount / splits.length).toFixed(2));
      finalSplits = splits.map((userId) => ({
        user: userId,
        amount: perPerson,
        paid: userId.toString() === req.user.id.toString(),
      }));
    } else {
      // custom split — splits is array of { user, amount }
      finalSplits = splits.map((s) => ({
        user: s.user,
        amount: parseFloat(s.amount) || 0,
        paid: s.user.toString() === req.user.id.toString(),
      }));
    }

    const expense = await Expense.create({
      trip: tripId,
      title,
      amount: parseFloat(amount),
      paidBy: req.user.id,
      splitType: splitType || 'equal',
      splits: finalSplits,
      category: category || 'other',
    });

    await expense.populate('paidBy', 'name email');
    await expense.populate('splits.user', 'name email');

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTripExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ trip: req.params.tripId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getBalances = async (req, res) => {
  try {
    const expenses = await Expense.find({ trip: req.params.tripId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email');

    // Net balance map: balances[userId] = { name, owes: {}, isOwed: {} }
    const balances = {};

    const getOrCreate = (id, name) => {
      if (!balances[id]) balances[id] = { name, owes: {}, isOwed: {} };
      return balances[id];
    };

    expenses.forEach((expense) => {
      const payerId = expense.paidBy._id.toString();
      getOrCreate(payerId, expense.paidBy.name);

      expense.splits.forEach((split) => {
        if (!split.user) return;
        const splitUserId = split.user._id.toString();
        if (splitUserId === payerId) return; // payer doesn't owe themselves

        getOrCreate(splitUserId, split.user.name);

        // splitUser owes payer
        if (!balances[splitUserId].owes[payerId])
          balances[splitUserId].owes[payerId] = { name: expense.paidBy.name, amount: 0 };
        balances[splitUserId].owes[payerId].amount += split.amount;

        // payer is owed by splitUser
        if (!balances[payerId].isOwed[splitUserId])
          balances[payerId].isOwed[splitUserId] = { name: split.user.name, amount: 0 };
        balances[payerId].isOwed[splitUserId].amount += split.amount;
      });
    });

    // Round amounts
    Object.values(balances).forEach((b) => {
      Object.values(b.owes).forEach((o) => (o.amount = parseFloat(o.amount.toFixed(2))));
      Object.values(b.isOwed).forEach((o) => (o.amount = parseFloat(o.amount.toFixed(2))));
    });

    res.json(balances);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
