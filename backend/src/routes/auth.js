const express = require('express');
const { buildConfig, sql } = require('../db');
const router = express.Router();

router.post('/connect', async (req, res) => {
  const { server, port, username, password } = req.body;

  if (!server || !username || !password) {
    return res.status(400).json({ error: 'Serveur, utilisateur et mot de passe requis.' });
  }

  const config = buildConfig({ server, port, username, password });

  let pool;
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    const result = await pool.request().query('SELECT @@VERSION AS version, SUSER_SNAME() AS currentUser');
    const row = result.recordset[0];
    await pool.close();

    req.session.sqlConfig = { server, port, username, password };

    res.json({
      message: 'Connexion réussie',
      version: row.version.split('\n')[0],
      currentUser: row.currentUser
    });
  } catch (err) {
    if (pool) await pool.close().catch(() => {});
    res.status(401).json({ error: `Connexion échouée : ${err.message}` });
  }
});

router.post('/disconnect', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Déconnecté.' });
});

router.get('/status', (req, res) => {
  if (req.session.sqlConfig) {
    res.json({ connected: true, server: req.session.sqlConfig.server, user: req.session.sqlConfig.username });
  } else {
    res.json({ connected: false });
  }
});

module.exports = router;
