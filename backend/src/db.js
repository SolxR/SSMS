const sql = require('mssql');

function parseServer(serverInput) {
  // Support "localhost\SQLEXPRESS" or "host\INSTANCE" formats
  const parts = serverInput.split('\\');
  return {
    server: parts[0],
    instanceName: parts[1] || undefined
  };
}

function buildConfig({ server: serverInput, port, username, password }) {
  const { server, instanceName } = parseServer(serverInput);
  return {
    server,
    port: instanceName ? undefined : (parseInt(port) || 1433),
    user: username,
    password,
    options: {
      trustServerCertificate: true,
      encrypt: false,
      instanceName: instanceName || undefined
    },
    connectionTimeout: 15000,
    requestTimeout: 30000
  };
}

async function getConnection(session) {
  if (!session.sqlConfig) {
    throw new Error('Non connecté. Veuillez vous reconnecter.');
  }
  const pool = new sql.ConnectionPool(buildConfig(session.sqlConfig));
  await pool.connect();
  return pool;
}

module.exports = { getConnection, buildConfig, sql };
