const express = require('express');
const { getConnection } = require('../db');
const router = express.Router();

router.post('/backup', async (req, res) => {
  const { database, path: backupPath } = req.body;

  if (!database || !/^[a-zA-Z0-9_\-]+$/.test(database)) {
    return res.status(400).json({ error: 'Nom de base invalide.' });
  }

  // Default path: auto-generated name if none provided
  const resolvedPath = backupPath
    ? backupPath.replace(/'/g, "''")
    : `C:\\Backup\\${database}_${formatDate()}.bak`;

  let pool;
  try {
    pool = await getConnection(req.session);
    await pool.request().query(
      `BACKUP DATABASE [${database}] TO DISK = '${resolvedPath}' WITH FORMAT, INIT`
    );
    res.json({ message: `Sauvegarde de "${database}" terminée.`, path: resolvedPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

function formatDate() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

module.exports = router;
