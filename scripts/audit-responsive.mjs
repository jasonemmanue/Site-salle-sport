/**
 * Audit responsive du site public et du back-office.
 *
 * Pilote Chrome par le protocole DevTools — Node 22 fournit WebSocket en
 * global, donc aucune dependance a installer. Pour chaque page et chaque
 * largeur, on releve :
 *   - le debordement horizontal (scrollWidth > innerWidth), avec le nom des
 *     elements fautifs ;
 *   - les cibles tactiles sous 32px ;
 *   - une capture d'ecran.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9431;
const OUT = process.argv[2] || './captures';
// Ports HOTE publies par docker-compose. Surchargeables pour viser un serveur
// de developpement lance hors Docker (`npm run dev` sur 3000 / 3001).
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3400';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3403';

const VIEWPORTS = [
  { nom: 'phone', width: 375, height: 812, mobile: true, scale: 3 },
  { nom: 'tablet', width: 768, height: 1024, mobile: true, scale: 2 },
];

const PAGES_PUBLIQUES = [
  '/', '/activites', '/planning', '/abonnements', '/coachs',
  '/equipements', '/articles', '/videos', '/transformations', '/avis', '/contact',
];

const PAGES_ADMIN = [
  '/dashboard', '/activites', '/planning', '/articles', '/avis', '/contacts', '/parametres',
];

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

async function jetonAdmin() {
  const r = await fetch('http://127.0.0.1:8010/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'username=admin@sport.com&password=changeme',
  });
  if (!r.ok) throw new Error('login admin impossible: ' + r.status);
  return r.json();
}

function connecter(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.onopen = () => resolve(ws);
    ws.onerror = (e) => reject(new Error('websocket: ' + e.message));
  });
}

function creerClient(ws) {
  let id = 0;
  const attente = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && attente.has(msg.id)) {
      const { resolve, reject } = attente.get(msg.id);
      attente.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  };
  return (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      attente.set(n, { resolve, reject });
      ws.send(JSON.stringify({ id: n, method, params }));
      setTimeout(() => {
        if (attente.has(n)) { attente.delete(n); reject(new Error('timeout ' + method)); }
      }, 30000);
    });
}

const SONDE = `(() => {
  const vw = window.innerWidth;
  // Un carrousel ou un tableau dans un conteneur .overflow-x-auto depasse la
  // fenetre par construction : ce n'est pas un defaut. On ne retient que ce
  // qui deborde sans ancetre defilable.
  const dansZoneDefilable = (el) => {
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true;
      p = p.parentElement;
    }
    return false;
  };
  const deborde = [...document.querySelectorAll('body *')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const st = getComputedStyle(el);
      if (st.position === 'fixed' && r.left < 0) return false;   // tiroir hors ecran, voulu
      if (st.visibility === 'hidden' || st.display === 'none') return false;
      if (r.right <= vw + 1) return false;
      return !dansZoneDefilable(el);
    })
    .slice(0, 6)
    .map(el => {
      const r = el.getBoundingClientRect();
      const cls = (typeof el.className === 'string' ? el.className : '').slice(0, 70);
      return el.tagName.toLowerCase() + (cls ? '.' + cls.replace(/\\s+/g, '.') : '') + ' -> ' + Math.round(r.right) + 'px';
    });
  const petitesCibles = [...document.querySelectorAll('a,button,input,select,textarea')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.height < 32 || r.width < 32);
    })
    .slice(0, 5)
    .map(el => el.tagName.toLowerCase() + ':' + (el.textContent || '').trim().slice(0, 22));
  return JSON.stringify({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: vw,
    deborde,
    petitesCibles,
  });
})()`;

async function main() {
  mkdirSync(OUT, { recursive: true });
  const tokens = await jetonAdmin();
  console.log('jeton admin obtenu\n');

  const chrome = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--disable-extensions',
    '--disable-features=WebAppInstallation',
    `--user-data-dir=${resolve(OUT, '_chrome')}`,
    'about:blank',
  ], { stdio: 'ignore' });

  await attendre(4000);

  // Chrome ecoute parfois sur [::1] et non 127.0.0.1 : on tente les deux.
  let cible;
  const hotes = [`http://127.0.0.1:${PORT}`, `http://[::1]:${PORT}`, `http://localhost:${PORT}`];
  for (let i = 0; i < 40 && !cible; i++) {
    for (const h of hotes) {
      try {
        const liste = await (await fetch(`${h}/json/list`)).json();
        cible = liste.find((t) => t.type === 'page');
        if (cible) break;
      } catch {}
    }
    if (!cible) await attendre(500);
  }
  if (!cible) throw new Error('aucune page Chrome trouvee');

  const ws = await connecter(cible.webSocketDebuggerUrl);
  const send = creerClient(ws);
  await send('Page.enable');
  await send('Runtime.enable');

  const problemes = [];

  const visiter = async (base, chemin, vp, prefixe, avecJeton) => {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile,
    });

    if (avecJeton) {
      await send('Page.navigate', { url: base + '/login' });
      await attendre(1200);
      await send('Runtime.evaluate', {
        expression: `localStorage.setItem('admin_token', ${JSON.stringify(tokens.access_token)});
                     localStorage.setItem('admin_refresh_token', ${JSON.stringify(tokens.refresh_token)});`,
      });
    }

    for (let essai = 0; ; essai++) {
      try {
        await send('Page.navigate', { url: base + chemin });
        break;
      } catch (e) {
        if (essai >= 2) throw e;
        await attendre(1500);
      }
    }
    await attendre(avecJeton ? 3200 : 2600);

    const { result } = await send('Runtime.evaluate', { expression: SONDE, returnByValue: true });
    const info = JSON.parse(result.value);

    const nom = `${prefixe}${chemin === '/' ? 'accueil' : chemin.replace(/\//g, '-').slice(1)}-${vp.nom}`;
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    writeFileSync(join(OUT, nom + '.png'), Buffer.from(shot.data, 'base64'));

    const trop = info.scrollWidth > info.innerWidth + 1;
    if (trop || info.deborde.length) {
      problemes.push({ page: prefixe + chemin, vp: vp.nom, ...info });
      console.log(`  DEBORDE  ${prefixe}${chemin} @${vp.nom}  ${info.scrollWidth}px > ${info.innerWidth}px`);
      info.deborde.forEach((d) => console.log(`           ${d}`));
    } else {
      console.log(`  ok       ${prefixe}${chemin} @${vp.nom}`);
    }
  };

  for (const vp of VIEWPORTS) {
    console.log(`\n=== PUBLIC @ ${vp.nom} (${vp.width}px) ===`);
    for (const p of PAGES_PUBLIQUES) await visiter(PUBLIC_URL, p, vp, 'public', false);
  }

  for (const vp of VIEWPORTS) {
    console.log(`\n=== ADMIN @ ${vp.nom} (${vp.width}px) ===`);
    for (const p of PAGES_ADMIN) await visiter(ADMIN_URL, p, vp, 'admin', true);
  }

  console.log('\n================ BILAN ================');
  if (!problemes.length) {
    console.log('Aucun debordement horizontal detecte.');
  } else {
    console.log(`${problemes.length} page(s) en debordement :`);
    for (const p of problemes) console.log(` - ${p.page} @${p.vp}: ${p.scrollWidth}/${p.innerWidth}`);
  }
  console.log(`\nCaptures dans ${OUT}`);

  ws.close();
  chrome.kill();
  process.exit(problemes.length ? 1 : 0);
}

main().catch((e) => { console.error('ECHEC:', e.message); process.exit(2); });
