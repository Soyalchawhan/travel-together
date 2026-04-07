const router = require('express').Router();
const {
  createTrip, joinTrip, getMyTrips, getTripById,
  addItinerary, cancelTrip, deleteTrip, leaveTrip, completeTrip,
} = require('../controllers/tripController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/',           createTrip);
router.post('/join',       joinTrip);
router.get('/',            getMyTrips);
router.get('/:id',         getTripById);
router.post('/:id/itinerary', addItinerary);
router.patch('/:id/cancel',   cancelTrip);
router.patch('/:id/complete', completeTrip);
router.post('/:id/leave',     leaveTrip);
router.delete('/:id',         deleteTrip);

module.exports = router;
