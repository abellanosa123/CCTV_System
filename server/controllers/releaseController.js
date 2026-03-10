const Release = require('../models/Release');
const Review = require('../models/Review');

// Get all releases with search and pagination
exports.getReleases = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'releaseDate', sortOrder = 'desc' } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { location: searchRegex },
        { incidentType: searchRegex },
        { description: searchRegex },
        { requestedBy: searchRegex },
        { releaseDate: searchRegex }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Release.countDocuments(query);
    const releases = await Release.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      data: releases,
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

// Release footage from review
exports.releaseFoootage = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const releaseDate = req.body.releaseDate || new Date().toISOString().split('T')[0];

    const release = new Release({
      originalReviewId: review._id,
      releaseDate,
      name: review.name,
      phoneNumber: review.phoneNumber,
      location: review.location,
      incidentDate: review.incidentDate,
      incidentTime: review.incidentTime,
      incidentType: review.incidentType,
      description: review.description,
      requestedBy: review.name,
      reviewedBy: review.reviewedBy,
      outcome: review.outcome,
      comments: review.comments
    });

    await release.save();

    // Update review status to Released
    review.status = 'Released';
    await review.save();

    res.status(201).json(release);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete release
exports.deleteRelease = async (req, res) => {
  try {
    const release = await Release.findByIdAndDelete(req.params.id);
    if (!release) {
      return res.status(404).json({ message: 'Release not found' });
    }
    res.json({ message: 'Release deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
