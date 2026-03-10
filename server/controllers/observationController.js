const Observation = require('../models/Observation');

// Get all observations with search and pagination
exports.getObservations = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc' } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { location: searchRegex },
        { incidentType: searchRegex },
        { details: searchRegex },
        { date: searchRegex }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Observation.countDocuments(query);
    const observations = await Observation.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      data: observations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single observation
exports.getObservation = async (req, res) => {
  try {
    const observation = await Observation.findById(req.params.id);
    if (!observation) {
      return res.status(404).json({ message: 'Observation not found' });
    }
    res.json(observation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create observation
exports.createObservation = async (req, res) => {
  try {
    const observation = new Observation(req.body);
    await observation.save();
    res.status(201).json(observation);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update observation
exports.updateObservation = async (req, res) => {
  try {
    const observation = await Observation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!observation) {
      return res.status(404).json({ message: 'Observation not found' });
    }
    res.json(observation);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete observation
exports.deleteObservation = async (req, res) => {
  try {
    const observation = await Observation.findByIdAndDelete(req.params.id);
    if (!observation) {
      return res.status(404).json({ message: 'Observation not found' });
    }
    res.json({ message: 'Observation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
