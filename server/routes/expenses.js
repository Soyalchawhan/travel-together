const router = require('express').Router();
const { addExpense, getTripExpenses, getBalances } = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.use(auth);
router.post('/', addExpense);
router.get('/trip/:tripId', getTripExpenses);
router.get('/trip/:tripId/balances', getBalances);

module.exports = router;
