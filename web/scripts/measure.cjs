const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('file:///E:/Eng/web/dist/index.html#tree', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  
  const res = await page.evaluate(() => {
    const c = document.querySelector('.constellation-container');
    const cr = c.getBoundingClientRect();
    const wri = document.querySelector('.constellation-node[data-node-id="wri-1"]');
    const wr = wri.getBoundingClientRect();
    const mount = document.getElementById('workspace-mount');
    const mr = mount.getBoundingClientRect();
    const app = document.getElementById('app');
    const ar = app.getBoundingClientRect();
    return {
      container: { top: cr.top, bottom: cr.bottom, height: cr.height },
      wri1: { top: wr.top, bottom: wr.bottom, height: wr.height },
      overflowDiff: wr.bottom - cr.bottom,
      mount: { top: mr.top, bottom: mr.bottom, height: mr.height, scrollHeight: mount.scrollHeight, clientHeight: mount.clientHeight },
      app: { height: ar.height }
    };
  });

  await page.screenshot({ path: path.join(__dirname, '../screenshots/verified-tree-fix.png') });
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})();
