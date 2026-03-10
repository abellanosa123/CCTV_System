const express = require('express');
const router = express.Router();
const {
  getReleases,
  releaseFoootage,
  deleteRelease
} = require('../controllers/releaseController');

router.get('/', getReleases);
router.post('/release/:reviewId', releaseFoootage);
router.delete('/:id', deleteRelease);

module.exports = router;
