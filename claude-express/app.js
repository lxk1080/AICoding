const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// 根路由 — 返回 Hello World
app.get('/', (req, res) => {
  res.send('Hello World');
});

// 404 兜底 — 未匹配所有路由
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
