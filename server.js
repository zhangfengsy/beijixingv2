const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// ✅ Render必须这样写端口！！
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 文件路径
const DATA_FILE = path.join(__dirname, 'data-data.json');
const LOG_FILE = path.join(__dirname, 'logs.json');
const PAY_FILE = path.join(__dirname, 'pay-records.json');

// 自动初始化缺失文件，再也不会因为缺文件崩溃
function initFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), 'utf8');
  }
}
initFile(LOG_FILE);
initFile(PAY_FILE);

// 1. 获取业务数据
app.get('/api/get-data', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    return res.json({ code: 0, data });
  } catch (e) {
    console.error(e);
    return res.json({ code: -1, msg: '业务数据读取失败' });
  }
});

// 2. 保存操作日志
app.post('/api/save-log', (req, res) => {
  try {
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    logs.unshift({
      ...req.body,
      serverTime: new Date().toLocaleString()
    });
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
    res.json({ code: 0 });
  } catch (e) {
    console.error(e);
    res.json({ code: -1 });
  }
});

// 3. 保存付款记录
app.post('/api/save-pay-record', (req, res) => {
  try {
    const pays = JSON.parse(fs.readFileSync(PAY_FILE, 'utf8'));
    pays.unshift({
      ...req.body,
      serverTime: new Date().toLocaleString()
    });
    fs.writeFileSync(PAY_FILE, JSON.stringify(pays, null, 2), 'utf8');
    res.json({ code: 0 });
  } catch (e) {
    console.error(e);
    res.json({ code: -1 });
  }
});

// 4. 管理员获取全部记录
app.get('/api/admin-all-records', (req, res) => {
  try {
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    const pays = JSON.parse(fs.readFileSync(PAY_FILE, 'utf8'));
    res.json({ code: 0, logs, pays });
  } catch (e) {
    console.error(e);
    res.json({ code: -1 });
  }
});

// ✅ 修复最关键的监听写法！！
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务启动成功，运行端口: ${PORT}`);
});
