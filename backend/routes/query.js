import express from 'express';
import BusinessRegistration from '../models/BusinessRegistration.js';

const router = express.Router();

// Search registrations with filters
router.get('/search', async (req, res) => {
  try {
    const { query, industry, role, limit = 20, skip = 0 } = req.query;

    // Build filter object
    const filter = {};

    if (query) {
      filter.$or = [
        { businessName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } }
      ];
    }

    if (industry) {
      filter.primaryIndustry = industry;
    }

    if (role) {
      filter.supplyChainRoles = { $in: [role] };
    }

    const total = await BusinessRegistration.countDocuments(filter);
    const results = await BusinessRegistration.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: results,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error searching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching registrations'
    });
  }
});

// Get registrations by industry
router.get('/industry/:industry', async (req, res) => {
  try {
    const { industry } = req.params;

    const registrations = await BusinessRegistration.find({
      primaryIndustry: industry
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Error fetching registrations by industry:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations'
    });
  }
});

// Get registrations by supply chain role
router.get('/role/:role', async (req, res) => {
  try {
    const { role } = req.params;

    const registrations = await BusinessRegistration.find({
      supplyChainRoles: { $in: [role] }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Error fetching registrations by role:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations'
    });
  }
});

// Export registrations as JSON
router.get('/export/json', async (req, res) => {
  try {
    const registrations = await BusinessRegistration.find({})
      .sort({ createdAt: -1 });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.json"');
    res.json(registrations);
  } catch (error) {
    console.error('Error exporting registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting registrations'
    });
  }
});

export default router;