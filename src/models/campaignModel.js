const { pool } = require('../config/db');

function normalizeCampaign(row) {
  if (!row) return null;
  return {
    ...row,
    campaign_id: Number(row.campaign_id),
    target_amount: Number(row.target_amount || 0),
    current_amount: Number(row.current_amount || 0),
    category_id: row.category_id === null ? null : Number(row.category_id),
    created_by: row.created_by === null ? null : Number(row.created_by),
  };
}

async function findAll({ category, status, q, page, limit }) {
  const conditions = [];
  const values = [];
  if (category) {
    conditions.push('category_id = ?');
    values.push(Number(category));
  }
  if (status) {
    conditions.push('status = ?');
    values.push(String(status).toUpperCase());
  }
  const query = String(q || '').trim().slice(0, 100);
  if (query) {
    const escapedQuery = query.replace(/[!%_]/g, '!$&');
    conditions.push("(title LIKE ? ESCAPE '!' OR description LIKE ? ESCAPE '!' OR content LIKE ? ESCAPE '!')");
    const pattern = `%${escapedQuery}%`;
    values.push(pattern, pattern, pattern);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [[countRow]] = await pool.query(
    `SELECT COUNT(*) AS total FROM campaigns ${where}`,
    values
  );
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM campaigns ${where} ORDER BY created_at DESC, campaign_id DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return {
    total: Number(countRow.total),
    data: rows.map(normalizeCampaign),
  };
}

async function findById(campaignId, executor = pool) {
  const [rows] = await executor.query(
    'SELECT * FROM campaigns WHERE campaign_id = ? LIMIT 1',
    [Number(campaignId)]
  );
  return normalizeCampaign(rows[0]);
}

async function categoryExists(categoryId) {
  const [rows] = await pool.query(
    'SELECT 1 FROM categories WHERE category_id = ? LIMIT 1',
    [Number(categoryId)]
  );
  return rows.length > 0;
}

async function create(campaign) {
  const [result] = await pool.query(
    `INSERT INTO campaigns
      (title, slug, description, content, target_amount, current_amount, thumbnail_url, status, start_date, end_date, category_id, created_by)
     VALUES (?, ?, ?, ?, ?, 0, ?, 'PENDING', ?, ?, ?, ?)`,
    [
      campaign.title,
      campaign.slug,
      campaign.description,
      campaign.content,
      campaign.target_amount,
      campaign.thumbnail_url,
      campaign.start_date,
      campaign.end_date,
      campaign.category_id,
      campaign.created_by,
    ]
  );
  return findById(result.insertId);
}

async function update(campaignId, updates) {
  const fields = {
    title: 'title',
    description: 'description',
    content: 'content',
    target_amount: 'target_amount',
    thumbnail_url: 'thumbnail_url',
    category_id: 'category_id',
    start_date: 'start_date',
    end_date: 'end_date',
  };
  const assignments = [];
  const values = [];

  Object.entries(fields).forEach(([key, column]) => {
    if (!Object.prototype.hasOwnProperty.call(updates, key)) return;
    assignments.push(`${column} = ?`);
    values.push(updates[key]);
    if (key === 'title') {
      assignments.push('slug = ?');
      values.push(updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  });

  if (assignments.length === 0) return findById(campaignId);
  values.push(Number(campaignId));
  await pool.query(
    `UPDATE campaigns SET ${assignments.join(', ')} WHERE campaign_id = ?`,
    values
  );
  return findById(campaignId);
}

async function updateStatus(campaignId, status) {
  await pool.query(
    'UPDATE campaigns SET status = ? WHERE campaign_id = ?',
    [status, Number(campaignId)]
  );
  return findById(campaignId);
}

module.exports = { findAll, findById, categoryExists, create, update, updateStatus };
