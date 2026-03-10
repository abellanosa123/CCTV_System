const Observation = require('../models/Observation');
const Review = require('../models/Review');
const Release = require('../models/Release');

// Get report data
exports.getReportData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let obsQuery = {};
    let revQuery = {};
    let relQuery = {};

    if (startDate && endDate) {
      obsQuery.date = { $gte: startDate, $lte: endDate };
      revQuery.dateRequested = { $gte: startDate, $lte: endDate };
      relQuery.releaseDate = { $gte: startDate, $lte: endDate };
    }

    const [observations, reviews, releases] = await Promise.all([
      Observation.find(obsQuery).sort({ date: -1 }),
      Review.find(revQuery).sort({ dateRequested: -1 }),
      Release.find(relQuery).sort({ releaseDate: -1 })
    ]);

    // Aggregate incident types
    const incidentMap = {};
    [...observations, ...reviews, ...releases].forEach(item => {
      const type = item.incidentType;
      if (type) {
        incidentMap[type] = (incidentMap[type] || 0) + 1;
      }
    });
    const topIncidentTypes = Object.entries(incidentMap)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Aggregate locations
    const locationMap = {};
    [...observations, ...reviews, ...releases].forEach(item => {
      const loc = item.location;
      if (loc) {
        locationMap[loc] = (locationMap[loc] || 0) + 1;
      }
    });
    const topLocations = Object.entries(locationMap)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      summary: {
        totalObservations: observations.length,
        totalReviews: reviews.length,
        totalReleases: releases.length,
        totalRecords: observations.length + reviews.length + releases.length
      },
      topIncidentTypes,
      topLocations,
      observations,
      reviews,
      releases
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
