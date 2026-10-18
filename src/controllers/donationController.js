const donationModel = require('../models/donationModel');
const userModel = require('../models/userModel');

function sanitizeDonation(donation) {
  return {
    ...donation,
    created_at: donation.created_at ? new Date(donation.created_at).toISOString() : null,
  };
}

async function createDonation(req, res) {
  try {
    const {
      campaign_id,
      donor_name,
      amount,
      message,
      payment_method,
      transaction_code,
      is_anonymous,
    } = req.body || {};

    if (!campaign_id || !amount || !payment_method || !transaction_code) {
      return res.status(400).json({ message: 'Thiếu thông tin quyên góp cần thiết.' });
    }

    const donationAmount = Number(amount);
    if (!Number.isFinite(donationAmount) || donationAmount <= 0) {
      return res.status(400).json({ message: 'Số tiền quyên góp phải lớn hơn 0.' });
    }

    const currentUser = req.user ? await userModel.findById(req.user.user_id) : null;
    const donation = {
      campaign_id: Number(campaign_id),
      user_id: currentUser ? Number(currentUser.user_id) : null,
      donor_name: is_anonymous
        ? 'Nhà hảo tâm ẩn danh'
        : donor_name || currentUser?.full_name || 'Nhà hảo tâm',
      amount: donationAmount,
      message: message || '',
      payment_method,
      transaction_code,
      status: 'SUCCESS',
      is_anonymous: Boolean(is_anonymous),
    };

    const result = await donationModel.createAndIncreaseCampaignTotal(donation);
    const io = req.app.get('io');
    if (io) {
      io.to(`campaign_${campaign_id}`).emit('update_progress', {
        campaign_id: Number(campaign_id),
        current_amount: result.current_amount,
        new_donation: sanitizeDonation(result.donation),
      });
    }

    return res.status(201).json({
      message: 'Quyên góp thành công.',
      donation: sanitizeDonation(result.donation),
    });
  } catch (error) {
    if (error.code === 'CAMPAIGN_NOT_FOUND') {
      return res.status(404).json({ message: error.message });
    }
    if (error.code === 'CAMPAIGN_NOT_ACTIVE') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Lỗi khi ghi nhận quyên góp.', error: error.message });
  }
}

async function getDonationsByCampaign(req, res) {
  try {
    const list = await donationModel.findByCampaignId(req.params.campaign_id);
    return res.status(200).json({ data: list.map(sanitizeDonation) });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách quyên góp.', error: error.message });
  }
}

async function getUserDonations(req, res) {
  try {
    const list = await donationModel.findByUserId(req.user.user_id);
    return res.status(200).json({ data: list.map(sanitizeDonation) });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi lấy lịch sử quyên góp.', error: error.message });
  }
}

module.exports = { createDonation, getDonationsByCampaign, getUserDonations };
