#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const communesPath = join(__dirname, '..', 'src', 'data', 'communes.json');

if (!existsSync(communesPath)) {
  console.error('communes.json not found. Run fetch-cities.mjs first.');
  process.exit(1);
}

const communes = JSON.parse(readFileSync(communesPath, 'utf-8'));

// Notable altitudes in Rhône (69)
const knownAltitudes = {
  'lyon': 173, 'villeurbanne': 170, 'venissieux': 186, 'caluire-et-cuire': 250,
  'saint-priest': 208, 'vaulx-en-velin': 168, 'bron': 210, 'villefranche-sur-saone': 191,
  'rillieux-la-pape': 268, 'meyzieu': 190, 'oullins': 170, 'decines-charpieu': 188,
  'sainte-foy-les-lyon': 300, 'givors': 160, 'saint-genis-laval': 220, 'tassin-la-demi-lune': 220,
  'ecully': 240, 'genas': 225, 'brignais': 230, 'chassieu': 200, 'tarare': 380,
  'rillieux-la-pape': 268, 'saint-fons': 165, 'francheville': 260, 'corbas': 200,
  'feyzin': 210, 'mions': 210, 'craponne': 280, 'chaponost': 290, 'l-arbresle': 230,
  'saint-didier-au-mont-d-or': 340, 'saint-cyr-au-mont-d-or': 320, 'belleville-en-beaujolais': 191
};

// Map postal code/slug to Rhône intercommunalities
function getIntercommunalite(cp, slug) {
  const codePostal = String(cp);
  
  const lyonMetropole = new Set([
    'lyon', 'villeurbanne', 'venissieux', 'caluire-et-cuire', 'saint-priest', 
    'vaulx-en-velin', 'bron', 'rillieux-la-pape', 'meyzieu', 'oullins', 
    'decines-charpieu', 'sainte-foy-les-lyon', 'givors', 'saint-genis-laval', 
    'tassin-la-demi-lune', 'ecully', 'saint-fons', 'francheville', 'chassieu', 
    'corbas', 'feyzin', 'mions', 'fontaines-sur-saone', 'neuville-sur-saone', 
    'saint-didier-au-mont-d-or', 'saint-cyr-au-mont-d-or', 'dardilly', 
    'limonest', 'irigny', 'vernaison', 'grigny', 'jonage', 'solaize', 
    'genay', 'la-mulatiere', 'pierre-benite', 'st-genis-laval'
  ]);
  
  if (lyonMetropole.has(slug) || codePostal.startsWith('690') || codePostal.startsWith('69100') || codePostal.startsWith('69200') || codePostal.startsWith('69300') || codePostal.startsWith('69500') || codePostal.startsWith('69600') || codePostal.startsWith('69800') || codePostal.startsWith('69150') || codePostal.startsWith('69120') || codePostal.startsWith('69140') || codePostal.startsWith('69160') || codePostal.startsWith('69130') || codePostal.startsWith('69230') || codePostal.startsWith('69110') || codePostal.startsWith('69340') || codePostal.startsWith('69350') || codePostal.startsWith('69680')) {
    return "Métropole de Lyon";
  }

  if (codePostal.startsWith('69400') || slug === 'villefranche-sur-saone' || slug === 'limas' || slug === 'gleize' || slug === 'arnas') {
    return "Communauté d'Agglomération de Villefranche Beaujolais Saône";
  }

  if (codePostal.startsWith('69220') || slug === 'belleville-en-beaujolais') {
    return "Communauté de Communes Saône Beaujolais";
  }

  if (codePostal.startsWith('69480') || codePostal.startsWith('69620') || slug === 'anse') {
    return "Communauté de Communes Beaujolais Pierres Dorées";
  }

  if (codePostal.startsWith('69210') || slug === 'l-arbresle') {
    return "Communauté de Communes du Pays de L'Arbresle";
  }

  if (codePostal.startsWith('69170') || slug === 'tarare') {
    return "Communauté de Communes de l'Ouest Rhodanien";
  }

  if (codePostal.startsWith('69740') || slug === 'genas' || slug === 'saint-bonnet-de-mure' || slug === 'saint-laurent-de-mure') {
    return "Communauté de Communes de l'Est Lyonnais";
  }

  if (codePostal.startsWith('69360') || slug === 'saint-symphorien-d-ozon' || slug === 'ternay' || slug === 'communay') {
    return "Communauté de Communes du Pays de l'Ozon";
  }

  if (codePostal.startsWith('69530') || slug === 'brignais' || slug === 'vourles' || slug === 'millery' || slug === 'montagny') {
    return "Communauté de Communes de la Vallée du Garon";
  }

  if (codePostal.startsWith('69670') || codePostal.startsWith('69290') || slug === 'vaugneray' || slug === 'craponne' || slug === 'brindas' || slug === 'grezieu-la-varenne' || slug === 'chaponost') {
    return "Communauté de Communes des Vallons du Lyonnais";
  }

  return "Communauté de Communes des Monts du Lyonnais";
}

function getCanton(cp, nom, slug) {
  const codePostal = String(cp);
  if (codePostal.startsWith('690')) {
    return `Lyon (${nom})`;
  }
  if (codePostal.startsWith('69100')) {
    return 'Villeurbanne';
  }
  if (codePostal.startsWith('69200')) {
    return 'Vénissieux';
  }
  if (codePostal.startsWith('69400')) {
    return 'Villefranche-sur-Saône';
  }
  if (slug === 'caluire-et-cuire') {
    return 'Caluire-et-Cuire';
  }
  return `Canton de ${nom}`;
}

function hash(slug, seed = 0) {
  let h = seed * 31;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getAltitude(commune) {
  if (knownAltitudes[commune.slug]) return knownAltitudes[commune.slug];
  
  const lat = commune.latitude || 45.75;
  let alt = 200; // base altitude of Saône/Rhône valley plains
  
  if (commune.slug.includes('mont') || commune.slug.includes('pyr') || commune.slug.includes('pierre-dorees')) {
    alt = 350;
  }
  
  const variation = (hash(commune.slug, 7) % 150) - 75;
  alt += variation;
  
  return Math.round(Math.max(150, alt));
}

function computeStats(commune) {
  const pop = commune.population || 5000;
  const slug = commune.slug;
  const alt = commune.altitude || 200;
  
  // Estimate number of households (logements)
  const ratio = pop > 500000 ? 1.85 : pop > 40000 ? 2.05 : 2.25;
  const logements = Math.round(pop / ratio);
  
  // Estimate house percentage
  let pctMaisons;
  if (slug === 'lyon') {
    pctMaisons = 4; // ultra density
  } else if (slug === 'villeurbanne') {
    pctMaisons = 8;
  } else if (['venissieux', 'vaulx-en-velin', 'saint-fons', 'la-mulatiere'].includes(slug)) {
    pctMaisons = 15 + (hash(slug, 4) % 8); // dense apartments
  } else if (['caluire-et-cuire', 'rillieux-la-pape', 'oullins', 'decines-charpieu', 'bron', 'saint-priest'].includes(slug)) {
    pctMaisons = 28 + (hash(slug, 5) % 10); // suburban mixed
  } else if (['saint-didier-au-mont-d-or', 'saint-cyr-au-mont-d-or', 'limonest', 'ecully'].includes(slug)) {
    pctMaisons = 55 + (hash(slug, 8) % 15); // premium villas
  } else if (alt > 300) {
    pctMaisons = 75 + (hash(slug, 6) % 15); // rural villages (mostly single houses)
  } else {
    pctMaisons = 60 + (hash(slug, 7) % 12); // standard residential suburbs
  }
  
  pctMaisons = Math.min(95, Math.max(3, pctMaisons));

  // Estimate average real estate price per m2 (2026 estimation)
  let prixM2;
  const premiumSlugs = new Set(['saint-didier-au-mont-d-or', 'saint-cyr-au-mont-d-or', 'limonest', 'ecully', 'tassin-la-demi-lune', 'sainte-foy-les-lyon', 'charbonnieres-les-bains']);
  
  if (slug === 'lyon') {
    prixM2 = 5100 + (hash(slug, 31) % 800); 
  } else if (premiumSlugs.has(slug)) {
    prixM2 = 5800 + (hash(slug, 32) % 1000); // expensive Monts d'Or & West Lyon areas
  } else if (['villeurbanne', 'caluire-et-cuire', 'oullins', 'saint-genis-laval', 'genas'].includes(slug)) {
    prixM2 = 4000 + (hash(slug, 33) % 600); // highly rated residential
  } else if (['venissieux', 'vaulx-en-velin', 'givors', 'saint-fons', 'tarare'].includes(slug)) {
    prixM2 = 2300 + (hash(slug, 34) % 400); // more accessible
  } else {
    prixM2 = 3100 + (hash(slug, 35) % 500); // general intermediate
  }
  
  prixM2 = Math.round(prixM2 / 10) * 10;
  
  // Estimate number of certified RGE Menuisiers
  let menuisiersRGE = 2;
  if (pop > 500000) menuisiersRGE = 65;
  else if (pop > 100000) menuisiersRGE = 28;
  else if (pop > 40000) menuisiersRGE = 15;
  else if (pop > 20000) menuisiersRGE = 9;
  else if (pop > 10000) menuisiersRGE = 6;
  else menuisiersRGE = 3;
  
  // Add some random variation
  menuisiersRGE += (hash(slug, 12) % 3) - 1;
  menuisiersRGE = Math.max(1, menuisiersRGE);

  // Estimate window renovation rate
  const tauxRenovation = (2.1 + (hash(slug, 15) % 9) / 10).toFixed(1); // 2.1% to 2.9%

  return { 
    logements, 
    logementsMaison: pctMaisons, 
    prixM2Moyen: prixM2,
    menuisiersRGE,
    tauxRenovation
  };
}

const enriched = communes.map(commune => {
  const altitude = getAltitude(commune);
  const stats = computeStats({ ...commune, altitude });
  const intercommunalite = getIntercommunalite(commune.codePostal, commune.slug);
  const canton = getCanton(commune.codePostal, commune.nom, commune.slug);
  
  return {
    ...commune,
    altitude,
    logements: stats.logements,
    logementsMaison: stats.logementsMaison,
    prixM2Moyen: stats.prixM2Moyen,
    menuisiersRGE: stats.menuisiersRGE,
    tauxRenovation: stats.tauxRenovation,
    intercommunalite,
    canton
  };
});

writeFileSync(communesPath, JSON.stringify(enriched, null, 2), 'utf-8');

console.log(`✅ Enriched ${enriched.length} Rhône (69) communes with local statistics.`);
console.log('Sample Lyon:', JSON.stringify(enriched[0], null, 2));
console.log('Sample Villeurbanne:', JSON.stringify(enriched.find(c => c.slug === 'villeurbanne'), null, 2));
console.log('Sample Saint-Didier-au-Mont-d-Or:', JSON.stringify(enriched.find(c => c.slug === 'saint-didier-au-mont-d-or'), null, 2));
console.log('Sample Tarare:', JSON.stringify(enriched.find(c => c.slug === 'tarare'), null, 2));
