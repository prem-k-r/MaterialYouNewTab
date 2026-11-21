// Evidence test: Appearance → "Dim Wallpaper" control visibility (PR #270, commit 15f1fa5)
// Run: node dim-visibility.test.js <path-to-repo> <path-to-test-image>
const { chromium } = require('playwright');
const path = require('path');
const [repo, image] = process.argv.slice(2).map(p => path.resolve(p));
const out = path.dirname(__filename);
let failures = 0;
const check = (name, ok, detail) => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } }); // one context → IndexedDB persists across reloads
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));

  const state = () => page.evaluate(() => {
    const el = document.getElementById('dimBarControl');
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return { dataBg: document.body.dataset.bg, visibility: cs.visibility, opacity: cs.opacity, pointerEvents: cs.pointerEvents, height: Math.round(r.height) };
  });
  // Walk the Tab order from the "clear wallpaper" button through the rest of the menu
  const tabStops = async () => {
    await page.focus('#clearImage'); const ids = [];
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); ids.push(await page.evaluate(() => document.activeElement.id)); }
    return ids;
  };
  const openMenu = async (shot) => {
    await page.click('#menuButton', { force: true }); await page.waitForTimeout(700);
    await page.$eval('#uploadTrigger', el => el.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, shot) });
  };
  const expectHidden = async (label) => {
    const s = await state(), t = await tabStops();
    check(`${label}: body[data-bg] is "color"`, s.dataBg === 'color', s.dataBg);
    check(`${label}: control is hidden (visibility/opacity/height/pointer-events)`,
      s.visibility === 'hidden' && s.opacity === '0' && s.height === 0 && s.pointerEvents === 'none', JSON.stringify(s));
    check(`${label}: Tab skips #dimColorPicker and #dimBar`, !t.includes('dimColorPicker') && !t.includes('dimBar'), t.join(' → '));
  };
  const expectVisible = async (label) => {
    const s = await state(), t = await tabStops();
    check(`${label}: body[data-bg] is "wallpaper"`, s.dataBg === 'wallpaper', s.dataBg);
    check(`${label}: control is shown (visibility/opacity/height/pointer-events)`,
      s.visibility === 'visible' && s.opacity === '1' && s.height > 0 && s.pointerEvents === 'auto', JSON.stringify(s));
    check(`${label}: Tab reaches #dimColorPicker then #dimBar`, t[0] === 'dimColorPicker' && t[1] === 'dimBar', t.join(' → '));
  };

  // 1. Fresh profile, no wallpaper
  await page.goto('file://' + repo + '/index.html'); await page.waitForTimeout(1500);
  await openMenu('1-no-wallpaper.png');
  await expectHidden('1. Fresh load, no wallpaper');

  // 2. Upload a wallpaper through the real file input
  await page.setInputFiles('#imageUpload', image); await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, '2-wallpaper-uploaded.png') });
  await expectVisible('2. After uploading a wallpaper');

  // 3. Reload: wallpaper restored from IndexedDB
  await page.reload(); await page.waitForTimeout(2000);
  await openMenu('3-wallpaper-after-reload.png');
  await expectVisible('3. After reload with saved wallpaper');

  // 4. Delete the wallpaper with the trash button and confirm in the dialog
  await page.click('#clearImage'); await page.waitForSelector('#prompt-modal-buttons button', { state: 'visible' });
  await page.click('#prompt-modal-buttons button:has-text("Yes")'); await page.waitForTimeout(800); // confirm the delete
  await page.screenshot({ path: path.join(out, '4-wallpaper-cleared.png') });
  await expectHidden('4. After deleting the wallpaper');

  // 5. Reload: still no wallpaper
  await page.reload(); await page.waitForTimeout(1500);
  await openMenu('5-no-wallpaper-after-reload.png');
  await expectHidden('5. After reload with no wallpaper');

  check('No page errors during the run', errors.length === 0, errors.join('; '));
  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
  await browser.close(); process.exit(failures ? 1 : 0);
})();
