const express = require('express');
const router = express.Router();
const {
  getReleases,
  releaseFootage,
  deleteRelease
} = require('../controllers/releaseController');

router.get('/', getReleases);
router.post('/release/:reviewId', releaseFootage);
router.delete('/:id', deleteRelease);

module.exports = router;
