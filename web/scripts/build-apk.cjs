// web/scripts/build-apk.cjs
// Builds an installable debug APK from the offline phone pages, with the Android SDK build tools only
// (no Gradle, no npm dependencies). Output: web/release/android/English-Singularity-debug.apk
//
// Pipeline: phone pages -> aapt2 compile/link (manifest, resources, assets) -> javac -> d8 -> append
// classes.dex (stored) -> zipalign -> apksigner (existing debug key) -> verify.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const WEB = path.join(__dirname, '..');
const ANDROID_SRC = path.join(WEB, 'android');
const OUT = path.join(WEB, 'release', 'android');
const BUILD = path.join(OUT, 'build');
const DEX_CACHE = path.join(OUT, 'dex-cache');
const APK = path.join(OUT, 'English-Singularity-debug.apk');

const SDK = process.env.ANDROID_HOME || 'C:\\Users\\Dell\\AppData\\Local\\Android\\Sdk';
const BT = path.join(SDK, 'build-tools', '35.0.0');
const PLATFORM_JAR = path.join(SDK, 'platforms', 'android-35', 'android.jar');
const STUDIO_JBR = 'C:\\Program Files\\Android\\Android Studio\\jbr';
const JDK = fs.existsSync(STUDIO_JBR) ? STUDIO_JBR : process.env.JAVA_HOME;
const JAVA = path.join(JDK, 'bin', 'java.exe');
const JAVAC = path.join(JDK, 'bin', 'javac.exe');
const KEYTOOL = path.join(JDK, 'bin', 'keytool.exe');
const KEYSTORE = path.join(os.homedir(), '.android', 'debug.keystore');
const KS_ALIAS = 'androiddebugkey';
const KS_PASS = 'android';

const AAPT2 = path.join(BT, 'aapt2.exe');
const ZIPALIGN = path.join(BT, 'zipalign.exe');
const D8_JAR = path.join(BT, 'lib', 'd8.jar');
const APKSIGNER_JAR = path.join(BT, 'lib', 'apksigner.jar');

const MIN_SDK = 24;
const TARGET_SDK = 34;          // 35 forces edge-to-edge on Android 15 and would put the nav under the gesture bar
const VERSION_NAME = '1.0';
const VERSION_CODE = Math.floor(Date.now() / 60000); // minutes since epoch: always increases between builds

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: opts.quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit', encoding: 'utf8', ...opts });
  if (r.status !== 0) {
    const detail = (r.stderr || '') + (r.stdout || '');
    throw new Error(`${path.basename(cmd)} failed (exit ${r.status}): ${detail.slice(-1500)}`);
  }
  return r.stdout || '';
}

function listFiles(dir, ext) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? listFiles(p, ext) : (p.endsWith(ext) ? [p] : []);
  });
}

function getLatestMtime(target) {
  let latest = 0;
  if (!fs.existsSync(target)) return latest;
  const stat = fs.statSync(target);
  if (!stat.isDirectory()) return stat.mtimeMs;
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'release', '.git'].includes(entry.name)) continue;
      latest = Math.max(latest, getLatestMtime(full));
    } else {
      latest = Math.max(latest, fs.statSync(full).mtimeMs);
    }
  }
  return latest;
}

function isApkFresh() {
  if (process.argv.includes('--force')) return false;
  if (!fs.existsSync(APK)) return false;
  const apkTime = fs.statSync(APK).mtimeMs;

  const inputs = [
    path.join(WEB, 'src'),
    path.join(WEB, 'android'),
    path.join(WEB, 'public'),
    path.join(WEB, 'index.html'),
    path.join(WEB, 'ielts.html'),
    path.join(WEB, 'vite.config.ts'),
    path.join(__dirname, 'build-phone.cjs'),
    __filename
  ];
  const newestIn = Math.max(...inputs.map(getLatestMtime));
  return apkTime > newestIn;
}

// 0s Build Instant Cache Hit Check
if (isApkFresh()) {
  console.log(`⚡ [APK] Up-to-date in 0.00s! ${path.relative(WEB, APK)} (${Math.round(fs.statSync(APK).size / 1024)} KB) is cached.`);
  console.log(`⚡ [APK] Use --force to trigger a clean re-compilation.`);
  process.exit(0);
}

const t0 = Date.now();

// 1. Fresh offline pages
run('node', [path.join(__dirname, 'build-phone.cjs')]);

// 2. Clean build tree
fs.rmSync(BUILD, { recursive: true, force: true });
const dirs = {
  res: path.join(BUILD, 'res'),
  assets: path.join(BUILD, 'assets'),
  gen: path.join(BUILD, 'gen'),
  classes: path.join(BUILD, 'classes'),
  dex: path.join(BUILD, 'dex'),
};
Object.values(dirs).forEach(d => fs.mkdirSync(d, { recursive: true }));
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(DEX_CACHE, { recursive: true });

// 3. Assets: the two phone pages, exactly as built (everything inlined)
for (const page of ['index.html', 'ielts.html']) {
  fs.copyFileSync(path.join(WEB, 'release', 'phone', page), path.join(dirs.assets, page));
}

// 4. Resources: strings/styles from android/res, launcher icon from the PWA icon
fs.cpSync(path.join(ANDROID_SRC, 'res'), dirs.res, { recursive: true });
const mipmap = path.join(dirs.res, 'mipmap-xxxhdpi');
fs.mkdirSync(mipmap, { recursive: true });
fs.copyFileSync(path.join(WEB, 'public', 'icon-192.png'), path.join(mipmap, 'ic_launcher.png'));

// 5. aapt2 compile + link -> unsigned APK with manifest, resources, R.java and assets
const compiledRes = path.join(BUILD, 'compiled-res.zip');
run(AAPT2, ['compile', '--dir', dirs.res, '-o', compiledRes]);
const linked = path.join(BUILD, 'linked.apk');
run(AAPT2, [
  'link', '-o', linked,
  '-I', PLATFORM_JAR,
  '--manifest', path.join(ANDROID_SRC, 'AndroidManifest.xml'),
  '-A', dirs.assets,
  '--min-sdk-version', String(MIN_SDK),
  '--target-sdk-version', String(TARGET_SDK),
  '--version-code', String(VERSION_CODE),
  '--version-name', VERSION_NAME,
  '--enable-sparse-encoding',
  '--enable-compact-entries',
  '--java', dirs.gen,
  compiledRes,
]);

// 6 & 7: Check DEX Cache to skip javac and d8 when Java source is unchanged
const javaSrcFiles = listFiles(path.join(ANDROID_SRC, 'src'), '.java');
const cachedDex = path.join(DEX_CACHE, 'classes.dex');
const dexFile = path.join(dirs.dex, 'classes.dex');

const javaMtime = Math.max(...javaSrcFiles.map(f => fs.statSync(f).mtimeMs));
if (fs.existsSync(cachedDex) && fs.statSync(cachedDex).mtimeMs > javaMtime && !process.argv.includes('--force')) {
  fs.copyFileSync(cachedDex, dexFile);
} else {
  // 6. javac (source/target 11; --release would conflict with android.jar)
  const rJava = path.join(dirs.gen, 'app', 'englishsingularity', 'R.java');
  run(JAVAC, ['-source', '11', '-target', '11', '-encoding', 'UTF-8', '-classpath', PLATFORM_JAR,
    '-d', dirs.classes, rJava, ...javaSrcFiles], { quiet: true });

  // 7. d8 -> classes.dex
  const classFiles = listFiles(dirs.classes, '.class');
  run(JAVA, ['-cp', D8_JAR, 'com.android.tools.r8.D8', '--lib', PLATFORM_JAR, '--min-api', String(MIN_SDK),
    '--output', dirs.dex, ...classFiles], { quiet: true });

  fs.copyFileSync(dexFile, cachedDex);
}

// 8. Assemble the APK with maximum Deflate compression (level 9) before zipalign,
// while keeping classes.dex and uncompressed assets stored (ZIP_STORED) as Android expects
const py = `
import sys, zipfile, os
apk, dex = sys.argv[1], sys.argv[2]
temp_apk = apk + '.tmp'
with zipfile.ZipFile(apk, 'r') as zin, zipfile.ZipFile(temp_apk, 'w') as zout:
    for item in zin.infolist():
        if item.filename == 'classes.dex':
            continue
        data = zin.read(item.filename)
        if item.compress_type == zipfile.ZIP_STORED:
            zout.writestr(item, data)
        else:
            zi = zipfile.ZipInfo(item.filename, item.date_time)
            zi.compress_type = zipfile.ZIP_DEFLATED
            zout.writestr(zi, data, compresslevel=9)
    # classes.dex must be STORED (uncompressed) for Android installer runtime mmap
    zout.write(dex, 'classes.dex', compress_type=zipfile.ZIP_STORED)
os.replace(temp_apk, apk)
print('assembled APK with deflate level 9 and stored classes.dex')
`;
const pyRun = spawnSync('python', ['-', linked, dexFile], { input: py, encoding: 'utf8' });
if (pyRun.status !== 0) throw new Error('python assembly failed: ' + (pyRun.stderr || pyRun.stdout));

// 9. Align, then sign with the existing debug key (zipalign must run before signing)
// Use Zopfli recompression (-z) unless --fast is explicitly requested, maximizing compression
const aligned = path.join(BUILD, 'aligned.apk');
const zipalignArgs = ['-p', '-f', '4'];
if (!process.argv.includes('--fast')) {
  zipalignArgs.unshift('-z');
}
zipalignArgs.push(linked, aligned);
run(ZIPALIGN, zipalignArgs);

if (!fs.existsSync(KEYSTORE)) {
  fs.mkdirSync(path.dirname(KEYSTORE), { recursive: true });
  run(KEYTOOL, ['-genkeypair', '-keystore', KEYSTORE, '-storepass', KS_PASS, '-alias', KS_ALIAS,
    '-keypass', KS_PASS, '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000',
    '-dname', 'CN=Android Debug,O=Android,C=US'], { quiet: true });
}
if (fs.existsSync(APK)) fs.rmSync(APK);
run(JAVA, ['-jar', APKSIGNER_JAR, 'sign', '--ks', KEYSTORE, '--ks-key-alias', KS_ALIAS,
  '--ks-pass', `pass:${KS_PASS}`, '--key-pass', `pass:${KS_PASS}`, '--out', APK, aligned]);

// 10. Verify signature and what the manifest actually grants
run(JAVA, ['-jar', APKSIGNER_JAR, 'verify', '--print-certs', APK], { quiet: true });
const badging = execFileSync(AAPT2, ['dump', 'badging', APK], { encoding: 'utf8' });
const pkg = (badging.match(/package: name='([^']+)' versionCode='(\d+)' versionName='([^']*)'/) || []).slice(1);
const sdks = (badging.match(/sdkVersion:'(\d+)'|targetSdkVersion:'(\d+)'/g) || []).join(' ');
const perms = (badging.match(/uses-permission: name='([^']+)'/g) || []).map(p => p.replace(/.*name='|'$/g, ''));
console.log(`[APK] Built in ${((Date.now() - t0) / 1000).toFixed(2)}s -> ${path.relative(WEB, APK)} (${Math.round(fs.statSync(APK).size / 1024)} KB)`);
console.log(`[APK] package=${pkg[0]} versionCode=${pkg[1]} versionName=${pkg[2]} ${sdks}`);
console.log(`[APK] permissions: ${perms.length ? perms.join(', ') : 'none (fully offline)'}`);
if (perms.includes('android.permission.INTERNET')) throw new Error('INTERNET permission must not be present');
