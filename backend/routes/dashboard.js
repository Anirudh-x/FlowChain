import express from 'express';
import BusinessRegistration from '../models/BusinessRegistration.js';

const router = express.Router();

// Get all business registrations
router.get('/registrations', async (req, res) => {
  try {
    const registrations = await BusinessRegistration.find({})
      .sort({ createdAt: -1 })
      .select('-__v'); // Exclude version field

    res.json({
      success: true,
      data: registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations'
    });
  }
});

// Get single business registration by ID
router.get('/registrations/:id', async (req, res) => {
  try {
    const registration = await BusinessRegistration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registration'
    });
  }
});

// Get dashboard analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalRegistrations = await BusinessRegistration.countDocuments();

    // Industry distribution
    const industryStats = await BusinessRegistration.aggregate([
      { $group: { _id: '$primaryIndustry', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Supply chain roles distribution
    const roleStats = await BusinessRegistration.aggregate([
      { $unwind: '$supplyChainRoles' },
      { $group: { _id: '$supplyChainRoles', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Operational scale distribution (since values are ranges like "1-5", "11-50")
    const scaleDistribution = await BusinessRegistration.aggregate([
      {
        $group: {
          _id: null,
          warehouseRanges: {
            $push: {
              $cond: {
                if: { $ne: ['$warehouses', null] },
                then: '$warehouses',
                else: '$$REMOVE'
              }
            }
          },
          storeRanges: {
            $push: {
              $cond: {
                if: { $ne: ['$stores', null] },
                then: '$stores',
                else: '$$REMOVE'
              }
            }
          },
          skuRanges: {
            $push: {
              $cond: {
                if: { $ne: ['$skus', null] },
                then: '$skus',
                else: '$$REMOVE'
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalRegistrations,
        industryStats,
        roleStats,
        scaleDistribution: scaleDistribution[0] || { warehouseRanges: [], storeRanges: [], skuRanges: [] }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// Update business registration
router.put('/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove protected fields
    delete updateData._id;
    delete updateData.createdAt;

    const updatedRegistration = await BusinessRegistration.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRegistration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Registration updated successfully',
      data: updatedRegistration
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating registration'
    });
  }
});

// Delete business registration
router.delete('/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRegistration = await BusinessRegistration.findByIdAndDelete(id);

    if (!deletedRegistration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Registration deleted successfully',
      data: deletedRegistration
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting registration'
    });
  }
});

export default router;