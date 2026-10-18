const disbursementModel = require('../models/disbursementModel');

function sanitizeDisbursement(disbursement) {
  return {
    ...disbursement,
    created_at: disbursement.created_at ? new Date(disbursement.created_at).toISOString() : null,
  };
}

async function createDisbursement(req, res) {
  try {
    const { campaign_id, amount, proof_image_url, note } = req.body || {};
    if (!campaign_id || !amount) {
      return res.status(400).json({ message: 'Thiếu thông tin giải ngân.' });
    }

    const disbursementAmount = Number(amount);
    if (!Number.isFinite(disbursementAmount) || disbursementAmount <= 0) {
      return res.status(400).json({ message: 'Số tiền giải ngân phải lớn hơn 0.' });
    }

    const disbursement = await disbursementModel.createWithinAvailableBalance({
      campaign_id: Number(campaign_id),
      amount: disbursementAmount,
      proof_image_url: proof_image_url || 'https://via.placeholder.com/1200x700',
      note: note || '',
      created_by: Number(req.user.user_id),
    });
    return res.status(201).json({
      message: 'Ghi nhận giải ngân thành công.',
      disbursement: sanitizeDisbursement(disbursement),
    });
  } catch (error) {
    if (error.code === 'CAMPAIGN_NOT_FOUND') {
      return res.status(404).json({ message: error.message });
    }
    if (error.code === 'INSUFFICIENT_CAMPAIGN_BALANCE') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Lỗi khi ghi nhận giải ngân.', error: error.message });
  }
}

async function getDisbursementsByCampaign(req, res) {
  try {
    const list = await disbursementModel.findByCampaignId(req.params.campaign_id);
    return res.status(200).json({ data: list.map(sanitizeDisbursement) });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi lấy lịch sử giải ngân.', error: error.message });
  }
}

module.exports = { createDisbursement, getDisbursementsByCampaign };
