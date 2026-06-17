#!/usr/bin/env node
/**
 * Enriches communes.json with calculated SEO-unique fields for Rhône (69):
 * - distanceLyon (distance to Lyon center)
 * - windExposure (wind exposure level in the Rhone/Saone valley)
 * - secteurSauvegarde (whether it falls under ABF regulations)
 * - profilCommune (textual profile)
 * - marcheImmobilier (real estate market description)
 * - tauxMaisonLabel (housing description)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const communesPath = resolve(__dirname, '../src/data/communes.json');
const communes = JSON.parse(readFileSync(communesPath, 'utf-8'));

// Lyon center coordinates (Place Bellecour)
const LYON_LAT = 45.764043;
const LYON_LON = 4.835659;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getProfilCommune(pop, slug) {
  if (slug === 'lyon') return 'métropole majeure régionale et capitale des Gaules';
  if (slug === 'villeurbanne') return 'deuxième commune du département et pôle urbain dynamique';
  if (slug === 'villefranche-sur-saone') return 'capitale historique du Beaujolais et sous-préfecture du Rhône';
  if (['saint-didier-au-mont-d-or', 'saint-cyr-au-mont-d-or', 'limonest'].includes(slug)) return 'commune résidentielle prisée des Monts d\'Or';
  if (pop >= 30000) return 'ville moyenne dynamique et pôle d\'activité majeur';
  if (pop >= 10000) return 'ville périurbaine résidentielle et commerçante du lyonnais';
  if (pop >= 4000) return 'bourg rhodanien ou beaujolais typique';
  return 'commune ou village résidentiel du Rhône';
}

function getMarcheImmobilier(prixM2) {
  if (!prixM2) return 'non renseigné';
  if (prixM2 >= 5000) return 'très haut de gamme (Lyon centre, Monts d\'Or)';
  if (prixM2 >= 4000) return 'très dynamique et résidentiel recherché';
  if (prixM2 >= 3000) return 'intermédiaire et stable';
  return 'accessible et attractif';
}

function getTauxMaisonLabel(pct) {
  if (pct === undefined || pct === null) return 'mixte';
  if (pct >= 80) return 'très majoritairement composé de villas contemporaines et maisons de village';
  if (pct >= 60) return 'principalement composé de maisons individuelles et pavillons';
  if (pct >= 40) return 'mixte et équilibré entre appartements et maisons de ville';
  if (pct >= 20) return 'majoritairement collectif avec résidences et immeubles récents';
  return 'très dense et à forte dominante d\'habitat collectif (cœur de métropole)';
}

function getWindExposure(longitude, latitude, slug) {
  // In Rhone/Saone valley, North and South winds can blow intensely.
  // Western hills (Monts du Lyonnais) are exposed to west/northwest drafts.
  // Saone corridor is exposed to the classic corridor wind.
  
  if (longitude > 4.9) {
    return 'Modéré (Plaine de l\'Est Lyonnais)';
  }
  if (longitude < 4.7) {
    return 'Élevé (Monts du Lyonnais et coteaux exposés)';
  }
  if (['lyon', 'villeurbanne', 'caluire-et-cuire'].includes(slug)) {
    return 'Modéré à Fort (Couloir rhodanien et vents du Nord/Sud en hauteur)';
  }
  return 'Modéré (Protégé par les collines ou en fond de vallée)';
}

function getSecteurSauvegarde(slug) {
  const protectedZones = new Set([
    'lyon', 'villefranche-sur-saone', 'oingt', 'anse', 'beaujeu', 'saint-symphorien-sur-coise', 'riverie'
  ]);
  return protectedZones.has(slug) || slug.includes('mont-d-or'); // Monts d'Or have strict architectural codes
}

let enriched = 0;
for (const c of communes) {
  // Distance to Lyon
  if (c.latitude && c.longitude) {
    c.distanceLyon = Math.round(haversineKm(c.latitude, c.longitude, LYON_LAT, LYON_LON) * 10) / 10;
  } else {
    c.distanceLyon = null;
  }

  // Wind exposure
  c.windExposure = getWindExposure(c.longitude, c.latitude, c.slug);

  // Sector protected by Architectes des Bâtiments de France (ABF)
  c.secteurSauvegarde = getSecteurSauvegarde(c.slug);

  // Commune profile label
  c.profilCommune = getProfilCommune(c.population, c.slug);

  // Real estate market tier
  c.marcheImmobilier = getMarcheImmobilier(c.prixM2Moyen);

  // Housing type label
  c.tauxMaisonLabel = getTauxMaisonLabel(c.logementsMaison);

  enriched++;
}

writeFileSync(communesPath, JSON.stringify(communes, null, 2) + '\n', 'utf-8');
console.log(`✅ Enriched ${enriched} communes with Rhône (69) SEO data fields.`);

// Print sample
const sample = communes[0]; // Lyon
console.log(`\nSample (${sample.nom}):`);
console.log(`  distanceLyon: ${sample.distanceLyon} km`);
console.log(`  windExposure: ${sample.windExposure}`);
console.log(`  secteurSauvegarde: ${sample.secteurSauvegarde}`);
console.log(`  profilCommune: ${sample.profilCommune}`);
console.log(`  marchéImmobilier: ${sample.marcheImmobilier}`);
console.log(`  tauxMaisonLabel: ${sample.tauxMaisonLabel}`);
