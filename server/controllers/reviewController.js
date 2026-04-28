const fileDb = require('../storage/fileDb');
const COLLECTION = 'reviews';

const normalizeStr = (val) => (typeof val === 'string' ? val.trim() : val);

const allowedStatuses = new Set(['Pending', 'Reviewed', 'Released']);
const allowedOutcomes = new Set(['Useful', 'Somehow Useful', 'Not Useful', '']);
const allowedCaughtOnCam = new Set(['Captured', 'Uncaptured', '']);

const matchesSearch = (row, searchRegex) => {
  const fields = [
    'name',
    'location',
    'camera',
    'street',
    'purok',
    'barangay',
    'incidentType',
    'description',
    'dateRequested',
    'timeRequested',
    'phoneNumber',
    'incidentDate',
    'incidentTime',
    'reviewedBy',
    'result',
    'status',
    'outcome',
    'comments',
    'caughtOnCam'
  ];
  return fields.some(f => searchRegex.test(String(row?.[f] ?? '')));
};

// Get all reviews with search and pagination
exports.getReviews = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'dateRequested', sortOrder = 'desc' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));

    let rows = fileDb.readCollection(COLLECTION);

    // All users can see all logs (no filtering by userId)

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      rows = rows.filter(r => matchesSearch(r, searchRegex));
    }

    const dir = sortOrder === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const av = a?.[sortBy];
      const bv = b?.[sortBy];
      let cmp = 0;
      if (av == null && bv == null) cmp = 0;
      else if (av == null) cmp = 1;
      else if (bv == null) cmp = -1;
      else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      
      if (cmp === 0) {
        const tA = a?.createdAt || '';
        const tB = b?.createdAt || '';
        return tB.localeCompare(tA);
      }
      return cmp * dir;
    });

    const total = rows.length;
    const reviews = rows.slice((pageNum - 1) * limitNum, (pageNum - 1) * limitNum + limitNum);

    res.json({
      data: reviews,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single review
exports.getReview = async (req, res) => {
  try {
    const review = fileDb.findById(COLLECTION, req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create review
exports.createReview = async (req, res) => {
  try {
    const payload = {
      dateRequested: normalizeStr(req.body?.dateRequested),
      timeRequested: normalizeStr(req.body?.timeRequested),
      name: normalizeStr(req.body?.name),
      phoneNumber: normalizeStr(req.body?.phoneNumber || ''),
      location: normalizeStr(req.body?.location || ''), // Still keep for compatibility
      camera: normalizeStr(req.body?.camera || ''),
      street: normalizeStr(req.body?.street || ''),
      purok: normalizeStr(req.body?.purok || ''),
      barangay: normalizeStr(req.body?.barangay || ''),
      incidentDate: normalizeStr(req.body?.incidentDate),
      incidentTime: normalizeStr(req.body?.incidentTime),
      incidentType: normalizeStr(req.body?.incidentType),
      description: normalizeStr(req.body?.description),
      reviewedBy: normalizeStr(req.body?.reviewedBy) || req.user.name,
      result: normalizeStr(req.body?.result || ''),
      outcome: normalizeStr(req.body?.outcome || ''),
      caughtOnCam: normalizeStr(req.body?.caughtOnCam || ''),
      comments: normalizeStr(req.body?.comments || ''),
      status: normalizeStr(req.body?.status || 'Pending'),
      userId: req.user._id
    };

    const missing = ['dateRequested', 'timeRequested', 'name', 'barangay', 'incidentDate', 'incidentTime', 'incidentType', 'description']
      .filter(k => !payload[k]);
    if (missing.length) {
      return res.status(400).json({ message: 'Validation error', errors: missing.map(k => `${k} is required`) });
    }
    if (!allowedStatuses.has(payload.status)) {
      return res.status(400).json({ message: 'Validation error', errors: ['Invalid status'] });
    }
    if (!allowedOutcomes.has(payload.outcome)) {
      return res.status(400).json({ message: 'Validation error', errors: ['Invalid outcome'] });
    }
    if (!allowedCaughtOnCam.has(payload.caughtOnCam)) {
      return res.status(400).json({ message: 'Validation error', errors: ['Invalid caughtOnCam'] });
    }

    const created = fileDb.create(COLLECTION, payload);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    // Ownership check: only the creator or admin can update
    const existing = fileDb.findById(COLLECTION, req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (req.user.role !== 'admin' && existing.userId !== req.user._id) {
      return res.status(403).json({ message: 'You can only edit your own entries' });
    }

    const patch = {};
    [
      'dateRequested',
      'timeRequested',
      'name',
      'phoneNumber',
      'location',
      'camera',
      'street',
      'purok',
      'barangay',
      'incidentDate',
      'incidentTime',
      'incidentType',
      'description',
      'reviewedBy',
      'result',
      'outcome',
      'caughtOnCam',
      'comments',
      'status'
    ].forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, k)) {
        patch[k] = normalizeStr(req.body[k]);
      }
    });

    const requiredIfPresent = ['dateRequested', 'timeRequested', 'name', 'barangay', 'incidentDate', 'incidentTime', 'incidentType', 'description']
      .filter(k => Object.prototype.hasOwnProperty.call(patch, k) && !patch[k]);
    if (requiredIfPresent.length) {
      return res.status(400).json({ message: 'Validation error', errors: requiredIfPresent.map(k => `${k} is required`) });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'status') && !allowedStatuses.has(patch.status)) {
      return res.status(400).json({ message: 'Validation error', errors: ['Invalid status'] });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'outcome') && !allowedOutcomes.has(patch.outcome)) {
      return res.status(400).json({ message: 'Validation error', errors: ['Invalid outcome'] });
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'caughtOnCam') && !allowedCaughtOnCam.has(patch.caughtOnCam)) {
      return res.status(400).json({ message: 'Validation error', errors: ['Invalid caughtOnCam'] });
    }

    const review = fileDb.updateById(COLLECTION, req.params.id, patch);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Cascade update to related releases
    const releases = fileDb.readCollection('releases').filter(r => r.originalReviewId === req.params.id);
    if (releases.length > 0) {
      const releasePatch = {};
      const syncFields = ['name', 'phoneNumber', 'location', 'camera', 'street', 'purok', 'barangay', 'incidentDate', 'incidentTime', 'incidentType', 'description', 'reviewedBy', 'result', 'outcome', 'caughtOnCam', 'comments'];
      syncFields.forEach(f => {
        if (patch[f] !== undefined) releasePatch[f] = patch[f];
      });
      releases.forEach(rel => {
        fileDb.updateById('releases', rel._id, releasePatch);
      });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    // Ownership check: only the creator or admin can delete
    const existing = fileDb.findById(COLLECTION, req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (req.user.role !== 'admin' && existing.userId !== req.user._id) {
      return res.status(403).json({ message: 'You can only delete your own entries' });
    }

    fileDb.deleteById(COLLECTION, req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
