const router = require('express').Router();
const { getMatches } = require('../controllers/matchController');
const auth = require('../middleware/auth');

router.get('/', auth, getMatches);

module.exports = router;
