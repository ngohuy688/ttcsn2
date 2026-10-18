const express = require('express');
const {
  listCampaigns,
  getCampaignByIdController,
  createCampaign,
  updateCampaign,
  updateCampaignStatus,
} = require('../controllers/campaignController');
const { authenticateToken, authorizeRoles } = require('../utils/auth');

const router = express.Router();

router.get('/', listCampaigns);
router.get('/:id', getCampaignByIdController);
router.post('/', authenticateToken, authorizeRoles('CAMPAIGN_MANAGER', 'ADMIN'), createCampaign);
router.put('/:id', authenticateToken, authorizeRoles('CAMPAIGN_MANAGER', 'ADMIN'), updateCampaign);
router.patch('/:id/status', authenticateToken, authorizeRoles('ADMIN'), updateCampaignStatus);

module.exports = router;
