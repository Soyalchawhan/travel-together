const router = require('express').Router();
const {
  createTrip,
  joinTrip,
  getMyTrips,
  getTripById,
  addItinerary,
} = require('../controllers/tripController');
const auth = require('../middleware/auth');

router.use(auth);
router.post('/', createTrip);
router.post('/join', joinTrip);
router.get('/', getMyTrips);
router.get('/:id', getTripById);
router.post('/:id/itinerary', addItinerary);

module.exports = router;
