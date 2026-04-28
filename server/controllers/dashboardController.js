const fileDb = require('../storage/fileDb');

const groupCount = (rows, field) => {
  const map = new Map();
  rows.forEach((r) => {
    const key = r?.[field];
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).map(([key, count]) => ({ _id: key, count }));
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const { filter = 'monthly', date, month, year } = req.query;

    const now = new Date();
    let currentPrefix = '';
    let prevPrefix = '';

    if (filter === 'daily') {
      currentPrefix = date || now.toISOString().split('T')[0];
      const prev = new Date(currentPrefix);
      prev.setDate(prev.getDate() - 1);
      prevPrefix = prev.toISOString().split('T')[0];
    } else if (filter === 'monthly') {
      currentPrefix = month || now.toISOString().slice(0, 7); // YYYY-MM
      const [y, m] = currentPrefix.split('-').map(Number);
      const prev = new Date(y, m - 2, 1);
      prevPrefix = prev.getFullYear() + '-' + String(prev.getMonth() + 1).padStart(2, '0');
    } else if (filter === 'yearly') {
      currentPrefix = year || now.getFullYear().toString();
      prevPrefix = (parseInt(currentPrefix) - 1).toString();
    }

    const prefixRegex = (prefix) => (prefix ? new RegExp(`^${prefix}`) : null);
    const currentRe = prefixRegex(currentPrefix);
    const prevRe = prefixRegex(prevPrefix);
    
    const matches = (val, re) => {
      if (filter === 'all') return true;
      if (!re) return true;
      return re.test(String(val || ''));
    };

    const observationsAll = fileDb.readCollection('observations');
    const reviewsAll = fileDb.readCollection('reviews');
    const releasesAll = fileDb.readCollection('releases');

    // All users can see all dashboard data (no filtering by userId)

    // Filter collections by current period for charts
    const observationsFiltered = observationsAll.filter(o => matches(o?.date, currentRe));
    const reviewsFiltered = reviewsAll.filter(r => matches(r?.dateRequested, currentRe));
    const releasesFiltered = releasesAll.filter(r => matches(r?.releaseDate, currentRe));

    // Current period counts
    const totalObservations = observationsFiltered.length;
    const totalReviews = reviewsFiltered.length;
    const totalReleases = releasesFiltered.length;

    // Previous period counts for percentage change
    const prevObservations = observationsAll.filter(o => matches(o?.date, prevRe)).length;
    const prevReviews = reviewsAll.filter(r => matches(r?.dateRequested, prevRe)).length;
    const prevReleases = releasesAll.filter(r => matches(r?.releaseDate, prevRe)).length;

    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // --- CHARTS DATA (Filtered) ---

    // Observation Incident Types with Location breakdown
    const obsIncidentDist = Array.from(
      observationsFiltered.reduce((acc, o) => {
        if (!o.incidentType) return acc;
        if (!acc.has(o.incidentType)) acc.set(o.incidentType, { type: o.incidentType, count: 0, breakdown: {} });
        const entry = acc.get(o.incidentType);
        entry.count++;
        if (o.location) {
          entry.breakdown[o.location] = (entry.breakdown[o.location] || 0) + 1;
        }
        return acc;
      }, new Map()).values()
    )
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Review Outcomes with Incident Type breakdown
    const reviewOutcomes = Array.from(
      reviewsFiltered.reduce((acc, r) => {
        if (!r.outcome) return acc;
        if (!acc.has(r.outcome)) acc.set(r.outcome, { type: r.outcome, count: 0, breakdown: {} });
        const entry = acc.get(r.outcome);
        entry.count++;
        if (r.incidentType) {
          entry.breakdown[r.incidentType] = (entry.breakdown[r.incidentType] || 0) + 1;
        }
        return acc;
      }, new Map()).values()
    )
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Review Incident Types with Barangay breakdown
    const reviewIncidentTypes = Array.from(
      reviewsFiltered.reduce((acc, r) => {
        if (!r.incidentType) return acc;
        if (!acc.has(r.incidentType)) acc.set(r.incidentType, { type: r.incidentType, count: 0, breakdown: {} });
        const entry = acc.get(r.incidentType);
        entry.count++;
        const loc = r.barangay || r.location;
        if (loc) {
          entry.breakdown[loc] = (entry.breakdown[loc] || 0) + 1;
        }
        return acc;
      }, new Map()).values()
    )
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Top locations from filtered Review logs with Purok breakdown
    const topLocations = Array.from(
      reviewsFiltered.reduce((acc, r) => {
        const loc = r.barangay || r.location;
        if (!loc) return acc;
        if (!acc.has(loc)) acc.set(loc, { location: loc, count: 0, breakdown: {} });
        const entry = acc.get(loc);
        entry.count++;
        if (r.purok) {
          entry.breakdown[r.purok] = (entry.breakdown[r.purok] || 0) + 1;
        } else {
          entry.breakdown['(No Purok)'] = (entry.breakdown['(No Purok)'] || 0) + 1;
        }
        return acc;
      }, new Map()).values()
    )
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Action taken overview from filtered observations with Incident Type breakdown
    const actionTakenOverview = Array.from(
      observationsFiltered.reduce((acc, o) => {
        if (!o.actionTaken) return acc;
        if (!acc.has(o.actionTaken)) acc.set(o.actionTaken, { action: o.actionTaken, count: 0, breakdown: {} });
        const entry = acc.get(o.actionTaken);
        entry.count++;
        if (o.incidentType) {
          entry.breakdown[o.incidentType] = (entry.breakdown[o.incidentType] || 0) + 1;
        }
        return acc;
      }, new Map()).values()
    )
      .sort((a, b) => b.count - a.count);

    // Multi-Agency response from filtered observations with Incident Type breakdown
    const multiAgencyResponse = Array.from(
      observationsFiltered.reduce((acc, o) => {
        if (!o.dispatchTo) return acc;
        if (!acc.has(o.dispatchTo)) acc.set(o.dispatchTo, { agency: o.dispatchTo, count: 0, breakdown: {} });
        const entry = acc.get(o.dispatchTo);
        entry.count++;
        if (o.incidentType) {
          entry.breakdown[o.incidentType] = (entry.breakdown[o.incidentType] || 0) + 1;
        }
        return acc;
      }, new Map()).values()
    )
      .sort((a, b) => b.count - a.count);

    res.json({
      stats: {
        totalObservations,
        totalReviews,
        totalReleases,
        observationChange: calcChange(totalObservations, prevObservations),
        reviewChange: calcChange(totalReviews, prevReviews),
        releaseChange: calcChange(totalReleases, prevReleases)
      },
      observationIncidentDistribution: obsIncidentDist,
      incidentDistribution: reviewOutcomes,
      topIncidentTypes: reviewIncidentTypes,
      topLocations,
      actionTakenOverview,
      multiAgencyResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
