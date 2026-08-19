/**
 * Telecharge le visuel de chaque sport dans `frontend/public/images/activites/`.
 *
 *   node scripts/telecharger-images-sports.mjs
 *
 * Les identifiants sont EPINGLES, pas cherches a l'execution : deux lancements
 * doivent produire exactement les memes fichiers. Une recherche live rendrait
 * l'apparence du site dependante du classement d'Unsplash du jour.
 *
 * Le script REFUSE de telecharger une photo Unsplash+ (`plus`/`premium`) :
 * ce fonds est payant et sa licence n'autorise pas un site commercial sans
 * abonnement. Le controle est refait a chaque lancement parce qu'une photo
 * gratuite peut basculer en Unsplash+ apres coup.
 *
 * Aucune dependance : Node 22 fournit `fetch`.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINATION = join(RACINE, 'frontend', 'public', 'images', 'activites');

/** Un visuel par sport. La cle est le `slug` de l'activite en base. */
const VISUELS = [
  { slug: 'musculation', id: 'uQOBWxjSd-4', sujet: 'Souleve de terre a la barre en salle' },
  { slug: 'seance-collective', id: '3eqaaqdL_IM', sujet: 'Groupe en seance encadree' },
  { slug: 'kung-fu-wushu', id: 'Th0kRmcOyiY', sujet: 'Coup de pied saute en kimono' },
  { slug: 'boxe-kick-boxing', id: 'VVqEIRNtqws', sujet: 'Travail aux pattes d ours en kick-boxing' },
  { slug: 'hiit-cardio', id: '0Wra5YYVQJE', sujet: 'Battle ropes' },
  { slug: 'yoga', id: '9qCXWZkjlmg', sujet: 'Cours de yoga collectif' },
  { slug: 'stretching', id: 'MnrYmqIL1FE', sujet: 'Etirement des ischio-jambiers au sol' },
];

/** 1600x900 : la plus grande taille reellement affichee est le hero de la page
 *  de detail. Au-dela, on ferait telecharger des pixels invisibles. */
const RENDU = 'w=1600&h=900&fit=crop&crop=entropy&q=75&fm=jpg';

async function json(url) {
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${r.status} sur ${url}`);
  return r.json();
}

mkdirSync(DESTINATION, { recursive: true });

const credits = [];
for (const { slug, id, sujet } of VISUELS) {
  const photo = await json(`https://unsplash.com/napi/photos/${id}`);

  if (photo.plus || photo.premium) {
    throw new Error(
      `La photo ${id} (${slug}) est passee en Unsplash+ : licence payante, ` +
        `il faut lui trouver un remplacant gratuit avant de continuer.`
    );
  }

  const octets = Buffer.from(
    await (await fetch(`${photo.urls.raw}&${RENDU}`)).arrayBuffer()
  );
  writeFileSync(join(DESTINATION, `${slug}.jpg`), octets);

  const auteur = photo.user?.name ?? 'inconnu';
  credits.push({ slug, id, auteur, sujet, lien: photo.links?.html ?? '' });
  console.log(`${slug.padEnd(20)} ${String(octets.length).padStart(7)} o   ${auteur}`);
}

writeFileSync(
  join(DESTINATION, 'CREDITS.md'),
  [
    '# Credits photo',
    '',
    'Visuels Unsplash sous [licence Unsplash](https://unsplash.com/license)',
    "(usage commercial autorise, sans autorisation prealable). Aucun n'est",
    'Unsplash+ : `scripts/telecharger-images-sports.mjs` refuse de telecharger',
    'une photo passee sur ce fonds payant.',
    '',
    '| Fichier | Sujet | Auteur | Source |',
    '|---------|-------|--------|--------|',
    ...credits.map(
      (c) => `| \`${c.slug}.jpg\` | ${c.sujet} | ${c.auteur} | [${c.id}](${c.lien}) |`
    ),
    '',
  ].join('\n')
);

console.log(`\n${credits.length} visuels ecrits dans ${DESTINATION}`);
