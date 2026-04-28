const fileDb = require('../storage/fileDb');
const COLLECTION = 'dropdownOptions';

// Default incident types
const DEFAULT_INCIDENT_TYPES = [
  'Vehicular Accident',
  'Theft / Robbery',
  'Assault / Physical Injury',
  'Fire Incident',
  'Illegal Parking',
  'Traffic Violation',
  'Vandalism',
  'Suspicious Activity',
  'Drowning',
  'Flooding',
  'Structural Collapse',
  'Illegal Dumping',
  'Noise Disturbance',
  'Medical Emergency'
];

// Default locations
const DEFAULT_LOCATIONS = [
  'Barangay 1',
  'Barangay 2',
  'Barangay 3',
  'Barangay 4',
  'Barangay 5',
  'Barangay 6',
  'Barangay 7',
  'Barangay 8',
  'Barangay 9',
  'Barangay 10',
  'Barangay 11'
];

// Default action taken options
const DEFAULT_ACTIONS = [
  'Monitored',
  'Noted',
  '10-5 to 911'
];

// Seed defaults if not exist
const seedDefaults = async () => {
  try {
    const rows = fileDb.readCollection(COLLECTION);
    const desired = [
      ...DEFAULT_INCIDENT_TYPES.map(value => ({ category: 'incidentType', value })),
      ...DEFAULT_LOCATIONS.map(value => ({ category: 'location', value })),
      ...DEFAULT_ACTIONS.map(value => ({ category: 'actionTaken', value }))
    ];

    desired.forEach(({ category, value }) => {
      const existing = rows.find(r => r?.category === category && r?.value === value);
      if (!existing) {
        fileDb.create(COLLECTION, { category, value, isDefault: true });
        return;
      }
      if (!existing.isDefault) {
        fileDb.updateById(COLLECTION, existing._id, { isDefault: true });
      }
    });
  } catch (err) {
    console.error('Error seeding dropdown defaults:', err.message);
  }
};

// Get options by category
exports.getOptions = async (req, res) => {
  try {
    const { category } = req.params;
    if (!['incidentType', 'location', 'actionTaken', 'dispatchTo'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    await seedDefaults();
    const options = fileDb.readCollection(COLLECTION)
      .filter(o => o?.category === category)
      .sort((a, b) => String(a.value || '').localeCompare(String(b.value || '')));
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a custom option
exports.addOption = async (req, res) => {
  try {
    const { category } = req.params;
    const { value } = req.body;
    if (!value || !value.trim()) {
      return res.status(400).json({ message: 'Value is required' });
    }
    const trimmed = value.trim();
    const existing = fileDb.readCollection(COLLECTION).find(o => o?.category === category && o?.value === trimmed);
    if (existing) {
      return res.status(400).json({ message: 'Option already exists' });
    }
    const option = fileDb.create(COLLECTION, { category, value: trimmed, isDefault: false });
    res.status(201).json(option);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an option (for fixing typos)
exports.updateOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    if (!value || !value.trim()) {
      return res.status(400).json({ message: 'Value is required' });
    }
    const trimmed = value.trim();
    const current = fileDb.findById(COLLECTION, id);
    if (!current) {
      return res.status(404).json({ message: 'Option not found' });
    }
    const existing = fileDb.readCollection(COLLECTION).find(o => o?._id !== id && o?.category === current.category && o?.value === trimmed);
    if (existing) {
      return res.status(400).json({ message: 'Option already exists' });
    }
    const option = fileDb.updateById(COLLECTION, id, { value: trimmed });
    if (!option) {
      return res.status(404).json({ message: 'Option not found' });
    }
    res.json(option);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a custom option (only non-default)
exports.deleteOption = async (req, res) => {
  try {
    const { id } = req.params;
    const option = fileDb.findById(COLLECTION, id);
    if (!option) {
      return res.status(404).json({ message: 'Option not found' });
    }
    fileDb.deleteById(COLLECTION, id);
    res.json({ message: 'Option deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
