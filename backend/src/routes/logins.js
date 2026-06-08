const express = require('express');
const { getConnection } = require('../db');
const router = express.Router();

router.get('/logins', async (req, res) => {
  let pool;
  try {
    pool = await getConnection(req.session);
    const result = await pool.request().query(`
      SELECT name, type_desc, is_disabled, create_date, default_database_name
      FROM sys.server_principals
      WHERE type IN ('S', 'U')
      ORDER BY name
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

router.post('/logins', async (req, res) => {
  const { name, password, defaultDatabase } = req.body;
  if (!name || !/^[a-zA-Z0-9_\-]+$/.test(name)) {
    return res.status(400).json({ error: 'Nom de login invalide.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Mot de passe trop court (min. 6 caractères).' });
  }
  let pool;
  try {
    pool = await getConnection(req.session);
    const db = defaultDatabase && /^[a-zA-Z0-9_\-]+$/.test(defaultDatabase) ? defaultDatabase : 'master';
    // Use parameterized name for the password but identifiers must be quoted
    const escapedPassword = password.replace(/'/g, "''");
    await pool.request().query(
      `CREATE LOGIN [${name}] WITH PASSWORD = '${escapedPassword}', DEFAULT_DATABASE = [${db}]`
    );
    res.json({ message: `Login "${name}" créé avec succès.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

router.delete('/logins/:name', async (req, res) => {
  const { name } = req.params;
  if (!name || !/^[a-zA-Z0-9_\-]+$/.test(name)) {
    return res.status(400).json({ error: 'Nom de login invalide.' });
  }
  let pool;
  try {
    pool = await getConnection(req.session);
    await pool.request().query(`DROP LOGIN [${name}]`);
    res.json({ message: `Login "${name}" supprimé.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

module.exports = router;
