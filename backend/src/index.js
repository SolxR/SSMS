const express = require('express');
const cors = require('cors');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const databaseRoutes = require('./routes/databases');
const loginRoutes = require('./routes/logins');
const queryRoutes = require('./routes/query');
const backupRoutes = require('./routes/backup');
const tableRoutes = require('./routes/tables');

const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'ssms-web-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 8 * 60 * 60 * 1000 }
}));

app.use('/api', authRoutes);
app.use('/api', databaseRoutes);
app.use('/api', loginRoutes);
app.use('/api', queryRoutes);
app.use('/api', backupRoutes);
app.use('/api', tableRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
