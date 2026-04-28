const fileDb = require('../storage/fileDb');
const RELEASES = 'releases';
const REVIEWS = 'reviews';

const matchesSearch = (row, searchRegex) => {
  const fields = [
    'location',
    'camera',
    'street',
    'purok',
    'barangay',
    'incidentType',
    'description',
    'requestedBy',
    'releaseDate',
    'name',
    'phoneNumber',
    'incidentDate',
    'incidentTime',
    'reviewedBy',
    'result',
    'outcome',
    'comments',
    'caughtOnCam'
  ];
  return fields.some(f => searchRegex.test(String(row?.[f] ?? '')));
};

// Get all releases with search and pagination
exports.getReleases = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'releaseDate', sortOrder = 'desc' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));

    let rows = fileDb.readCollection(RELEASES);

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
    const releases = rows.slice((pageNum - 1) * limitNum, (pageNum - 1) * limitNum + limitNum);

    res.json({
      data: releases,
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

// Release footage from review
exports.releaseFootage = async (req, res) => {
  try {
    const review = fileDb.findById(REVIEWS, req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const { releaseDate = new Date().toISOString().split('T')[0], releaserName } = req.body;

    const release = fileDb.create(RELEASES, {
      originalReviewId: review._id,
      releaseDate,
      releaserName,
      name: review.name,
      phoneNumber: review.phoneNumber,
      location: review.location,
      camera: review.camera || '',
      street: review.street || '',
      purok: review.purok || '',
      barangay: review.barangay || '',
      incidentDate: review.incidentDate,
      incidentTime: review.incidentTime,
      incidentType: review.incidentType,
      description: review.description,
      requestedBy: review.name,
      reviewedBy: review.reviewedBy,
      result: review.result || '',
      outcome: review.outcome,
      caughtOnCam: review.caughtOnCam,
      comments: review.comments,
      userId: req.user._id
    });

    // Update review status to Released
    fileDb.updateById(REVIEWS, review._id, { status: 'Released' });

    res.status(201).json(release);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete release
exports.deleteRelease = async (req, res) => {
  try {
    // Ownership check: only the creator or admin can delete
    const existing = fileDb.findById(RELEASES, req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Release not found' });
    }
    if (req.user.role !== 'admin' && existing.userId !== req.user._id) {
      return res.status(403).json({ message: 'You can only delete your own entries' });
    }

    fileDb.deleteById(RELEASES, req.params.id);
    res.json({ message: 'Release deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
