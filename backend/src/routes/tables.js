const express = require('express');
const { getConnection } = require('../db');
const router = express.Router();

router.get('/databases/:name/tables', async (req, res) => {
  const { name } = req.params;
  if (!/^[a-zA-Z0-9_\-]+$/.test(name)) {
    return res.status(400).json({ error: 'Nom de base invalide.' });
  }
  let pool;
  try {
    pool = await getConnection(req.session);
    const result = await pool.request().query(`
      SELECT
        t.TABLE_NAME  AS name,
        t.TABLE_TYPE  AS type,
        (SELECT COUNT(*) FROM [${name}].INFORMATION_SCHEMA.COLUMNS c
         WHERE c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME) AS column_count
      FROM [${name}].INFORMATION_SCHEMA.TABLES t
      WHERE t.TABLE_TYPE = 'BASE TABLE'
      ORDER BY t.TABLE_NAME
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

module.exports = router;
