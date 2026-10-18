const { pool } = require('../config/db');

function normalizeDonation(row) {
  return {
    ...row,
    donation_id: Number(row.donation_id),
    campaign_id: Number(row.campaign_id),
    user_id: row.user_id === null ? null : Number(row.user_id),
    amount: Number(row.amount || 0),
    is_anonymous: Boolean(row.is_anonymous),
  };
}

async function createAndIncreaseCampaignTotal(donation) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [campaignRows] = await connection.query(
      'SELECT current_amount, status FROM campaigns WHERE campaign_id = ? FOR UPDATE',
      [donation.campaign_id]
    );
    if (campaignRows.length === 0) {
      const error = new Error('Chiến dịch không tồn tại.');
      error.code = 'CAMPAIGN_NOT_FOUND';
      throw error;
    }
    if (campaignRows[0].status !== 'ACTIVE') {
      const error = new Error('Chiến dịch chưa được duyệt hoặc đã đóng quyên góp.');
      error.code = 'CAMPAIGN_NOT_ACTIVE';
      throw error;
    }

    const [result] = await connection.query(
      `INSERT INTO donations
        (campaign_id, user_id, donor_name, amount, message, payment_method, transaction_code, status, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        donation.campaign_id,
        donation.user_id,
        donation.donor_name,
        donation.amount,
        donation.message,
        donation.payment_method,
        donation.transaction_code,
        donation.status,
        donation.is_anonymous ? 1 : 0,
      ]
    );
    await connection.query(
      'UPDATE campaigns SET current_amount = current_amount + ? WHERE campaign_id = ?',
      [donation.amount, donation.campaign_id]
    );
    const [rows] = await connection.query(
      'SELECT * FROM donations WHERE donation_id = ?',
      [result.insertId]
    );
    await connection.commit();
    return {
      donation: normalizeDonation(rows[0]),
      current_amount: Number(campaignRows[0].current_amount || 0) + donation.amount,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findByCampaignId(campaignId) {
  const [rows] = await pool.query(
    'SELECT * FROM donations WHERE campaign_id = ? ORDER BY created_at DESC, donation_id DESC',
    [Number(campaignId)]
  );
  return rows.map(normalizeDonation);
}

async function findByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT donations.*, campaigns.title AS campaign_title
     FROM donations
     LEFT JOIN campaigns ON campaigns.campaign_id = donations.campaign_id
     WHERE donations.user_id = ?
     ORDER BY donations.created_at DESC, donations.donation_id DESC`,
    [Number(userId)]
  );
  return rows.map(normalizeDonation);
}

module.exports = { createAndIncreaseCampaignTotal, findByCampaignId, findByUserId };
