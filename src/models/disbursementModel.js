const { pool } = require('../config/db');

function normalizeDisbursement(row) {
  return {
    ...row,
    disbursement_id: Number(row.disbursement_id),
    campaign_id: Number(row.campaign_id),
    amount: Number(row.amount || 0),
    created_by: row.created_by === null ? null : Number(row.created_by),
  };
}

async function createWithinAvailableBalance(disbursement) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [campaignRows] = await connection.query(
      'SELECT current_amount FROM campaigns WHERE campaign_id = ? FOR UPDATE',
      [disbursement.campaign_id]
    );
    if (campaignRows.length === 0) {
      const error = new Error('Chiến dịch không tồn tại.');
      error.code = 'CAMPAIGN_NOT_FOUND';
      throw error;
    }

    const [disbursementRows] = await connection.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_disbursed FROM disbursements WHERE campaign_id = ?',
      [disbursement.campaign_id]
    );
    const availableAmount = Number(campaignRows[0].current_amount || 0)
      - Number(disbursementRows[0].total_disbursed || 0);
    if (disbursement.amount > availableAmount) {
      const error = new Error('Số tiền giải ngân vượt quá số dư khả dụng của chiến dịch.');
      error.code = 'INSUFFICIENT_CAMPAIGN_BALANCE';
      throw error;
    }

    const [result] = await connection.query(
      `INSERT INTO disbursements
        (campaign_id, amount, proof_image_url, note, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        disbursement.campaign_id,
        disbursement.amount,
        disbursement.proof_image_url,
        disbursement.note,
        disbursement.created_by,
      ]
    );
    const [rows] = await connection.query(
      'SELECT * FROM disbursements WHERE disbursement_id = ?',
      [result.insertId]
    );
    await connection.commit();
    return normalizeDisbursement(rows[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findByCampaignId(campaignId) {
  const [rows] = await pool.query(
    'SELECT * FROM disbursements WHERE campaign_id = ? ORDER BY created_at DESC, disbursement_id DESC',
    [Number(campaignId)]
  );
  return rows.map(normalizeDisbursement);
}

module.exports = { createWithinAvailableBalance, findByCampaignId };
