const fileDb = require('../storage/fileDb');

// Get report data
exports.getReportData = async (req, res) => {
  try {
    const { startDate, endDate, startTime, endTime } = req.query;
    const inRange = (date, time) => {
      if (!startDate || !endDate) return true;
      if (!date) return false;
      
      const startDateTime = startTime ? `${startDate}T${startTime}` : `${startDate}T00:00`;
      const endDateTime = endTime ? `${endDate}T${endTime}` : `${endDate}T23:59`;
      const currentDateTime = time ? `${date}T${time}` : `${date}T00:00`;

      return currentDateTime >= startDateTime && currentDateTime <= endDateTime;
    };

    let observations = fileDb.readCollection('observations')
      .filter(o => inRange(o?.date, o?.time));

    let reviews = fileDb.readCollection('reviews')
      .filter(r => inRange(r?.dateRequested, r?.timeRequested));

    let releases = fileDb.readCollection('releases')
      .filter(r => inRange(r?.releaseDate?.split('T')[0], r?.releaseDate?.split('T')[1]?.slice(0,5)));

    // Filter by user if not admin or team_leader
    if (req.user.role !== 'admin' && req.user.role !== 'team_leader') {
      const uId = req.user._id;
      observations = observations.filter(o => o.userId === uId);
      reviews = reviews.filter(r => r.userId === uId);
      releases = releases.filter(r => r.userId === uId);
    }

    observations.sort((a, b) => {
      let cmp = String(b?.date || '').localeCompare(String(a?.date || ''));
      if (cmp === 0) return String(b?.createdAt || '').localeCompare(String(a?.createdAt || ''));
      return cmp;
    });
    reviews.sort((a, b) => {
      let cmp = String(b?.dateRequested || '').localeCompare(String(a?.dateRequested || ''));
      if (cmp === 0) return String(b?.createdAt || '').localeCompare(String(a?.createdAt || ''));
      return cmp;
    });
    releases.sort((a, b) => {
      let cmp = String(b?.releaseDate || '').localeCompare(String(a?.releaseDate || ''));
      if (cmp === 0) return String(b?.createdAt || '').localeCompare(String(a?.createdAt || ''));
      return cmp;
    });

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

    // Aggregate reviewer breakdown
    const reviewerMap = {};
    observations.forEach(item => {
      const reviewer = item.observedBy;
      if (reviewer) {
        if (!reviewerMap[reviewer]) reviewerMap[reviewer] = { observations: 0, reviews: 0, releases: 0 };
        reviewerMap[reviewer].observations++;
      }
    });
    reviews.forEach(item => {
      const reviewer = item.reviewedBy;
      if (reviewer) {
        if (!reviewerMap[reviewer]) reviewerMap[reviewer] = { observations: 0, reviews: 0, releases: 0 };
        reviewerMap[reviewer].reviews++;
      }
    });
    releases.forEach(item => {
      const reviewer = item.releaserName || item.reviewedBy;
      if (reviewer) {
        if (!reviewerMap[reviewer]) reviewerMap[reviewer] = { observations: 0, reviews: 0, releases: 0 };
        reviewerMap[reviewer].releases++;
      }
    });

    const reviewerBreakdown = Object.entries(reviewerMap)
      .map(([name, counts]) => ({ 
        name, 
        observations: counts.observations,
        reviews: counts.reviews, 
        releases: counts.releases, 
        total: counts.observations + counts.reviews + counts.releases 
      }))
      .sort((a, b) => b.total - a.total);

    // Specific observation breakdown
    const observationMap = {};
    observations.forEach(item => {
      const type = item.incidentType;
      if (type) {
        observationMap[type] = (observationMap[type] || 0) + 1;
      }
    });
    const observationBreakdown = Object.entries(observationMap)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      summary: {
        totalObservations: observations.length,
        totalReviews: reviews.length,
        totalReleases: releases.length,
        totalRecords: observations.length + reviews.length + releases.length,
        reviewerBreakdown,
        observationBreakdown
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
