const express = require('express');
const router = express.Router();
const {
  getOptions,
  addOption,
  updateOption,
  deleteOption
} = require('../controllers/dropdownController');

router.get('/:category', getOptions);
router.post('/:category', addOption);
router.put('/:id', updateOption);
router.delete('/:id', deleteOption);

module.exports = router;
