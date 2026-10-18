const express = require('express');
const { createDonation, getDonationsByCampaign, getUserDonations } = require('../controllers/donationController');
const { authenticateToken } = require('../utils/auth');

const router = express.Router();

router.post('/', createDonation);
router.get('/campaigns/:campaign_id', getDonationsByCampaign);
router.get('/users/me', authenticateToken, getUserDonations);

module.exports = router;
