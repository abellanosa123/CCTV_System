const DropdownOption = require('../models/DropdownOption');

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
  'Barangay 10'
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
    for (const type of DEFAULT_INCIDENT_TYPES) {
      await DropdownOption.findOneAndUpdate(
        { category: 'incidentType', value: type },
        { category: 'incidentType', value: type, isDefault: true },
        { upsert: true }
      );
    }
    for (const loc of DEFAULT_LOCATIONS) {
      await DropdownOption.findOneAndUpdate(
        { category: 'location', value: loc },
        { category: 'location', value: loc, isDefault: true },
        { upsert: true }
      );
    }
    for (const action of DEFAULT_ACTIONS) {
      await DropdownOption.findOneAndUpdate(
        { category: 'actionTaken', value: action },
        { category: 'actionTaken', value: action, isDefault: true },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error('Error seeding dropdown defaults:', err.message);
  }
};

// Get options by category
exports.getOptions = async (req, res) => {
  try {
    const { category } = req.params;
    if (!['incidentType', 'location', 'actionTaken'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    await seedDefaults();
    const options = await DropdownOption.find({ category }).sort({ isDefault: -1, value: 1 });
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
    const existing = await DropdownOption.findOne({ category, value: value.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Option already exists' });
    }
    const option = new DropdownOption({ category, value: value.trim(), isDefault: false });
    await option.save();
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
    const option = await DropdownOption.findByIdAndUpdate(
      id,
      { value: value.trim() },
      { new: true }
    );
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
    const option = await DropdownOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: 'Option not found' });
    }
    await DropdownOption.findByIdAndDelete(id);
    res.json({ message: 'Option deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
