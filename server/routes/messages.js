const router = require('express').Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/:tripId', getMessages);
router.post('/:tripId', sendMessage);

module.exports = router;
