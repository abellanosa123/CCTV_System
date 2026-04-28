const fileDb = require('../storage/fileDb');
const COLLECTION = 'observations';

const normalizeStr = (val) => (typeof val === 'string' ? val.trim() : val);

const matchesSearch = (row, searchRegex) => {
  const fields = ['location', 'camera', 'street', 'purok', 'barangay', 'incidentType', 'details', 'date', 'time', 'actionTaken', 'dispatchTo', 'dispatchTime', 'observedBy'];
  return fields.some(f => searchRegex.test(String(row?.[f] ?? '')));
};

// Get all observations with search and pagination
exports.getObservations = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc' } = req.query;
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
    const observations = rows.slice((pageNum - 1) * limitNum, (pageNum - 1) * limitNum + limitNum);

    res.json({
      data: observations,
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

// Get single observation
exports.getObservation = async (req, res) => {
  try {
    const observation = fileDb.findById(COLLECTION, req.params.id);
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
    const payload = {
      date: normalizeStr(req.body?.date),
      time: normalizeStr(req.body?.time),
      location: normalizeStr(req.body?.location),
      camera: normalizeStr(req.body?.camera) || '',
      street: normalizeStr(req.body?.street) || '',
      purok: normalizeStr(req.body?.purok) || '',
      barangay: normalizeStr(req.body?.barangay),
      incidentType: normalizeStr(req.body?.incidentType),
      actionTaken: normalizeStr(req.body?.actionTaken),
      dispatchTo: normalizeStr(req.body?.dispatchTo) || '',
      dispatchTime: normalizeStr(req.body?.dispatchTime) || '',
      details: normalizeStr(req.body?.details),
      observedBy: req.user.name,
      userId: req.user._id
    };

    const missing = ['date', 'time', 'barangay', 'incidentType', 'actionTaken', 'details']
      .filter(k => !payload[k]);
    if (missing.length) {
      return res.status(400).json({ message: 'Validation error', errors: missing.map(k => `${k} is required`) });
    }

    const created = fileDb.create(COLLECTION, payload);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update observation
exports.updateObservation = async (req, res) => {
  try {
    // Ownership check: only the creator or admin can update
    const existing = fileDb.findById(COLLECTION, req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Observation not found' });
    }
    if (req.user.role !== 'admin' && existing.userId !== req.user._id) {
      return res.status(403).json({ message: 'You can only edit your own entries' });
    }

    const patch = {};
    const allowedFields = ['date', 'time', 'location', 'camera', 'street', 'purok', 'barangay', 'incidentType', 'actionTaken', 'dispatchTo', 'dispatchTime', 'details'];
    if (req.user.role === 'admin') {
      allowedFields.push('observedBy');
    }
    allowedFields.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, k)) {
        patch[k] = normalizeStr(req.body[k]);
      }
    });

    const requiredIfPresent = ['date', 'time', 'barangay', 'incidentType', 'actionTaken', 'details']
      .filter(k => Object.prototype.hasOwnProperty.call(patch, k) && !patch[k]);
    if (requiredIfPresent.length) {
      return res.status(400).json({ message: 'Validation error', errors: requiredIfPresent.map(k => `${k} is required`) });
    }

    const observation = fileDb.updateById(COLLECTION, req.params.id, patch);
    if (!observation) {
      return res.status(404).json({ message: 'Observation not found' });
    }
    res.json(observation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete observation
exports.deleteObservation = async (req, res) => {
  try {
    // Ownership check: only the creator or admin can delete
    const existing = fileDb.findById(COLLECTION, req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Observation not found' });
    }
    if (req.user.role !== 'admin' && existing.userId !== req.user._id) {
      return res.status(403).json({ message: 'You can only delete your own entries' });
    }

    fileDb.deleteById(COLLECTION, req.params.id);
    res.json({ message: 'Observation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
