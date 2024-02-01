const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
require('./cron');
const taskRoutes = require('./taskRoutes');
const subTaskRoutes = require('./subTaskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', taskRoutes);
app.use('/api', subTaskRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
