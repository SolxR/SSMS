const express = require('express');
const { getConnection } = require('../db');
const router = express.Router();

router.post('/query', async (req, res) => {
  const { sql, database } = req.body;
  if (!sql || !sql.trim()) {
    return res.status(400).json({ error: 'Requête SQL vide.' });
  }

  let pool;
  try {
    pool = await getConnection(req.session);

    if (database && /^[a-zA-Z0-9_\-]+$/.test(database)) {
      await pool.request().query(`USE [${database}]`);
    }

    const start = Date.now();
    const result = await pool.request().query(sql);
    const elapsed = Date.now() - start;

    // Handle multiple result sets
    const recordsets = result.recordsets || (result.recordset ? [result.recordset] : []);
    const rowsAffected = result.rowsAffected || [];

    res.json({
      recordsets,
      rowsAffected,
      elapsed,
      message: buildMessage(recordsets, rowsAffected)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

function buildMessage(recordsets, rowsAffected) {
  const parts = [];
  recordsets.forEach((rs, i) => {
    if (rs.length > 0) parts.push(`Jeu de résultats ${i + 1} : ${rs.length} ligne(s)`);
  });
  rowsAffected.forEach(n => {
    if (n > 0) parts.push(`(${n} ligne(s) affectée(s))`);
  });
  return parts.join(' | ') || 'Commande exécutée avec succès.';
}

module.exports = router;
