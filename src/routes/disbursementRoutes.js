const express = require('express');
const { createDisbursement, getDisbursementsByCampaign } = require('../controllers/disbursementController');
const { authenticateToken, authorizeRoles } = require('../utils/auth');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('CAMPAIGN_MANAGER', 'ADMIN'), createDisbursement);
router.get('/campaigns/:campaign_id', getDisbursementsByCampaign);

module.exports = router;
