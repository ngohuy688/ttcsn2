const campaignModel = require('../models/campaignModel');

function sanitizeCampaign(campaign) {
  return {
    ...campaign,
    start_date: campaign.start_date ? new Date(campaign.start_date).toISOString() : null,
    end_date: campaign.end_date ? new Date(campaign.end_date).toISOString() : null,
    created_at: campaign.created_at ? new Date(campaign.created_at).toISOString() : null,
  };
}

function toMySqlDate(value) {
  return value ? new Date(value).toISOString().slice(0, 19).replace('T', ' ') : null;
}

async function listCampaigns(req, res) {
  try {
    const { category, status, q, page = 1, limit = 10 } = req.query;
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const result = await campaignModel.findAll({
      category,
      status,
      q,
      page: safePage,
      limit: safeLimit,
    });

    return res.status(200).json({
      page: safePage,
      limit: safeLimit,
      total: result.total,
      total_pages: Math.max(Math.ceil(result.total / safeLimit), 1),
      data: result.data.map(sanitizeCampaign),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách chiến dịch.', error: error.message });
  }
}

async function getCampaignByIdController(req, res) {
  try {
    const campaign = await campaignModel.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Không tìm thấy chiến dịch.' });
    }
    return res.status(200).json({ campaign: sanitizeCampaign(campaign) });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi lấy chi tiết chiến dịch.', error: error.message });
  }
}

async function createCampaign(req, res) {
  try {
    const {
      title,
      description,
      content,
      target_amount,
      thumbnail_url,
      category_id,
      start_date,
      end_date,
    } = req.body || {};

    if (!title || !description || !content || !target_amount) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin chiến dịch.' });
    }

    const amount = Number(target_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Mục tiêu gây quỹ phải lớn hơn 0.' });
    }
    if (!await campaignModel.categoryExists(category_id)) {
      return res.status(400).json({ message: 'Danh mục chiến dịch không hợp lệ.' });
    }

    const campaign = await campaignModel.create({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      description,
      content,
      target_amount: amount,
      thumbnail_url: thumbnail_url || 'https://via.placeholder.com/1200x600',
      start_date: toMySqlDate(start_date) || toMySqlDate(new Date()),
      end_date: toMySqlDate(end_date) || toMySqlDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      category_id: Number(category_id),
      created_by: Number(req.user.user_id),
    });

    return res.status(201).json({
      message: 'Tạo chiến dịch thành công.',
      campaign: sanitizeCampaign(campaign),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi tạo chiến dịch.', error: error.message });
  }
}

async function updateCampaign(req, res) {
  try {
    const campaign = await campaignModel.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Không tìm thấy chiến dịch.' });
    }

    const updates = {};
    const body = req.body || {};
    ['title', 'description', 'content', 'thumbnail_url'].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(body, field)) updates[field] = body[field];
    });

    if (Object.prototype.hasOwnProperty.call(body, 'target_amount')) {
      const amount = Number(body.target_amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Mục tiêu gây quỹ phải lớn hơn 0.' });
      }
      updates.target_amount = amount;
    }
    if (Object.prototype.hasOwnProperty.call(body, 'category_id')) {
      if (!await campaignModel.categoryExists(body.category_id)) {
        return res.status(400).json({ message: 'Danh mục chiến dịch không hợp lệ.' });
      }
      updates.category_id = Number(body.category_id);
    }
    ['start_date', 'end_date'].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = toMySqlDate(body[field]);
      }
    });

    const updatedCampaign = await campaignModel.update(req.params.id, updates);
    return res.status(200).json({
      message: 'Cập nhật chiến dịch thành công.',
      campaign: sanitizeCampaign(updatedCampaign),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật chiến dịch.', error: error.message });
  }
}

async function updateCampaignStatus(req, res) {
  try {
    const { status } = req.body || {};
    const normalizedStatus = String(status || '').toUpperCase();
    const allowedStatuses = ['PENDING', 'ACTIVE', 'COMPLETED', 'CLOSED'];
    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const campaign = await campaignModel.updateStatus(req.params.id, normalizedStatus);
    if (!campaign) {
      return res.status(404).json({ message: 'Không tìm thấy chiến dịch.' });
    }
    return res.status(200).json({
      message: 'Cập nhật trạng thái chiến dịch thành công.',
      campaign: sanitizeCampaign(campaign),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái chiến dịch.', error: error.message });
  }
}

module.exports = { listCampaigns, getCampaignByIdController, createCampaign, updateCampaign, updateCampaignStatus };
