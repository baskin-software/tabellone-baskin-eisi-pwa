// versione-app.mjs by Daniele Lolli (UncleDan) feat. Claude AI - Release 26.1b1 - 2026-11-18 20-18-30
// Allinea la versione delle app Android e iOS ad APP_VERSION di pwa/js/app.js.
//   26.0b10 -> versionName 26.0b10, versionCode 2600010, iOS 26.0.0 (build 2600010)
//   26.0    -> versionCode 2600099;  26.0.1 -> 2600199;  26.1b1 -> 2601001
// Uso (dalla radice del repository): node tools/versione-app.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const app = readFileSync('pwa/js/app.js', 'utf8');
const v = (app.match(/const APP_VERSION = '([^']+)'/) || [])[1];
const m = v && v.match(/^(\d+)\.(\d+)(?:\.(\d+))?(?:b(\d+))?$/);
if (!m) { console.error('APP_VERSION non riconosciuta: ' + v); process.exit(1); }
const [maj, min, pat, beta] = [+m[1], +m[2], +(m[3] || 0), m[4] ? +m[4] : null];
if (beta !== null && (beta < 1 || beta > 98)) { console.error('Beta fuori intervallo (1-98): ' + v); process.exit(1); }
const code = maj * 100000 + min * 1000 + pat * 100 + (beta ?? 99);
const ios = `${maj}.${min}.${pat}`;

const g = 'android/app/build.gradle';
writeFileSync(g, readFileSync(g, 'utf8')
  .replace(/versionCode \d+/, 'versionCode ' + code)
  .replace(/versionName "[^"]*"/, `versionName "${v}"`));

const x = 'ios/App/App.xcodeproj/project.pbxproj';
writeFileSync(x, readFileSync(x, 'utf8')
  .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${ios};`)
  .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${code};`));

console.log(`Versione ${v}: Android versionCode ${code}, iOS ${ios} (build ${code})`);
if (process.env.GITHUB_ENV) writeFileSync(process.env.GITHUB_ENV, `APP_VER=${v}\nAPP_CODE=${code}\n`, { flag: 'a' });
