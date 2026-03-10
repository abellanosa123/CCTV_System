const express = require('express');
const router = express.Router();
const {
  getObservations,
  getObservation,
  createObservation,
  updateObservation,
  deleteObservation
} = require('../controllers/observationController');

router.get('/', getObservations);
router.get('/:id', getObservation);
router.post('/', createObservation);
router.put('/:id', updateObservation);
router.delete('/:id', deleteObservation);

module.exports = router;
