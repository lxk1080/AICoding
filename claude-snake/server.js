const express = require('express');
const path = require('path');

const app = express();
const PORT = 3031;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`🐍 Snake game running at http://localhost:${PORT}`);
});
