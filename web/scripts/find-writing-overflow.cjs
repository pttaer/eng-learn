const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PORT = 4219;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404); res.end();
  }
});

server.listen(PORT, async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 320, height: 568 });
  await page.goto(`http://localhost:${PORT}/ielts.html#writing`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  const items = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.scrollWidth > 320 || el.offsetWidth > 320) {
        list.push({
          tag: el.tagName,
          id: el.id,
          class: el.className,
          scrollW: el.scrollWidth,
          offsetW: el.offsetWidth,
          text: el.innerText ? el.innerText.slice(0, 40) : ''
        });
      }
    });
    return list;
  });

  console.log('Found overflowing elements at 320px:', JSON.stringify(items, null, 2));
  await browser.close();
  server.close();
});

