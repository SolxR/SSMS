const express = require('express');
const { getConnection, sql } = require('../db');
const router = express.Router();

router.get('/databases', async (req, res) => {
  let pool;
  try {
    pool = await getConnection(req.session);
    const result = await pool.request().query(`
      SELECT name, state_desc, recovery_model_desc, create_date
      FROM sys.databases
      ORDER BY name
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

router.post('/databases', async (req, res) => {
  const { name } = req.body;
  if (!name || !/^[a-zA-Z0-9_\-]+$/.test(name)) {
    return res.status(400).json({ error: 'Nom de base invalide.' });
  }
  let pool;
  try {
    pool = await getConnection(req.session);
    await pool.request().query(`CREATE DATABASE [${name}]`);
    res.json({ message: `Base de données "${name}" créée avec succès.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

router.delete('/databases/:name', async (req, res) => {
  const { name } = req.params;
  if (!name || !/^[a-zA-Z0-9_\-]+$/.test(name)) {
    return res.status(400).json({ error: 'Nom de base invalide.' });
  }
  let pool;
  try {
    pool = await getConnection(req.session);
    await pool.request().query(`
      ALTER DATABASE [${name}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
      DROP DATABASE [${name}]
    `);
    res.json({ message: `Base de données "${name}" supprimée.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

module.exports = router;
