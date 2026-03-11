const Observation = require('../models/Observation');
const Review = require('../models/Review');
const Release = require('../models/Release');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const { filter = 'monthly' } = req.query;

    const now = new Date();
    let dateFilter = {};
    let prevDateFilter = {};

    if (filter === 'daily') {
      const today = now.toISOString().split('T')[0];
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      dateFilter = { $regex: `^${today}` };
      prevDateFilter = { $regex: `^${yesterdayStr}` };
    } else if (filter === 'monthly') {
      const monthStr = now.toISOString().slice(0, 7);
      const prevMonth = new Date(now);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const prevMonthStr = prevMonth.toISOString().slice(0, 7);
      dateFilter = { $regex: `^${monthStr}` };
      prevDateFilter = { $regex: `^${prevMonthStr}` };
    } else if (filter === 'yearly') {
      const yearStr = now.getFullYear().toString();
      const prevYearStr = (now.getFullYear() - 1).toString();
      dateFilter = { $regex: `^${yearStr}` };
      prevDateFilter = { $regex: `^${prevYearStr}` };
    }

    // Current period counts
    const [totalObservations, totalReviews, totalReleases] = await Promise.all([
      Observation.countDocuments(filter !== 'all' ? { date: dateFilter } : {}),
      Review.countDocuments(filter !== 'all' ? { dateRequested: dateFilter } : {}),
      Release.countDocuments(filter !== 'all' ? { releaseDate: dateFilter } : {})
    ]);

    // Previous period counts for percentage change
    const [prevObservations, prevReviews, prevReleases] = await Promise.all([
      Observation.countDocuments(filter !== 'all' ? { date: prevDateFilter } : {}),
      Review.countDocuments(filter !== 'all' ? { dateRequested: prevDateFilter } : {}),
      Release.countDocuments(filter !== 'all' ? { releaseDate: prevDateFilter } : {})
    ]);

    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Action Taken distribution from Observations (for Logs Overview chart)
    const actionTakenData = await Observation.aggregate([
      { $group: { _id: '$actionTaken', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Incident Distribution based on Review Outcome
    const reviewOutcomes = await Review.aggregate([
      { $group: { _id: '$outcome', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);
    const incidentDistribution = reviewOutcomes
      .filter(item => item._id) // ignore empty outcomes if any
      .map(item => ({ type: item._id, count: item.count }));

    // Top Incident Types from Review Logs
    const reviewIncidentTypes = await Review.aggregate([
      { $group: { _id: '$incidentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);
    const topIncidentTypes = reviewIncidentTypes
      .filter(item => item._id)
      .map(item => ({ type: item._id, count: item.count }));

    // Top locations (from Review logs as requested)
    const revLocations = await Review.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const topLocations = revLocations
      .filter(item => item._id)
      .map(item => ({ location: item._id, count: item.count }))
      .slice(0, 8);

    // Action taken overview for bar chart
    const actionTakenOverview = actionTakenData
      .filter(item => item._id)
      .map(item => ({ action: item._id, count: item.count }));

    res.json({
      stats: {
        totalObservations,
        totalReviews,
        totalReleases,
        observationChange: calcChange(totalObservations, prevObservations),
        reviewChange: calcChange(totalReviews, prevReviews),
        releaseChange: calcChange(totalReleases, prevReleases)
      },
      incidentDistribution,
      topIncidentTypes,
      topLocations,
      actionTakenOverview
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
