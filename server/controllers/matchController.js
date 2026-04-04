const User = require('../models/User');

const BUDGET_LEVELS = ['budget', 'moderate', 'luxury'];

const calculateMatch = (u1, u2) => {
  let totalScore = 0;
  let factors = 0;

  // 1. Budget compatibility (40% weight)
  const b1 = BUDGET_LEVELS.indexOf(u1.preferences?.budget || 'moderate');
  const b2 = BUDGET_LEVELS.indexOf(u2.preferences?.budget || 'moderate');
  const budgetDiff = Math.abs(b1 - b2);
  const budgetScore = budgetDiff === 0 ? 100 : budgetDiff === 1 ? 50 : 0;
  totalScore += budgetScore * 0.4;
  factors += 0.4;

  // 2. Travel style (30% weight)
  const styleScore = u1.preferences?.travelStyle === u2.preferences?.travelStyle ? 100 : 0;
  totalScore += styleScore * 0.3;
  factors += 0.3;

  // 3. Interests overlap (30% weight)
  const i1 = u1.preferences?.interests || [];
  const i2 = u2.preferences?.interests || [];
  if (i1.length > 0 && i2.length > 0) {
    const common = i1.filter((x) => i2.includes(x)).length;
    const union = new Set([...i1, ...i2]).size;
    totalScore += (common / union) * 100 * 0.3;
    factors += 0.3;
  }

  return factors > 0 ? Math.round(totalScore / factors) : 0;
};

exports.getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const otherUsers = await User.find({ _id: { $ne: req.user.id } }).select('-password');

    const matches = otherUsers
      .map((u) => ({
        user: {
          id: u._id,
          name: u.name,
          email: u.email,
          preferences: u.preferences,
        },
        matchPercentage: calculateMatch(currentUser, u),
      }))
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 10);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
