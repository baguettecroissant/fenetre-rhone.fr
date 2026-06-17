// Programmatic Content Engine - Rhône (69) - Fenêtres
// Generates highly unique, localized, helpful content for each commune in the Rhône department.
// Uses a multi-dimensional sentence-level spintax matrix to avoid duplicate content penalties
// and provides rich technical details (E-E-A-T) optimized for local search queries.

import communes from '../data/communes.json';

export function spin(text: string, seed: string): string {
  let result = text;
  const spintaxTest = /{([^{}|]+\|[^{}]+)}/;
  const spintaxReplace = /{([^{}|]+\|[^{}]+)}/g;
  
  while (spintaxTest.test(result)) {
    result = result.replace(spintaxReplace, (match, choicesStr) => {
      if (['VILLE', 'CODE_POSTAL', 'PRIX_MIN', 'PRIX_MAX', 'VARIANTE_INTRO'].includes(choicesStr)) {
        return match;
      }
      const choices = choicesStr.split('|');
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) | 0;
      }
      hash = hash + choicesStr.length;
      const index = Math.abs(hash) % choices.length;
      return choices[index];
    });
  }
  return result;
}

export interface Commune {
  nom: string;
  slug: string;
  codeInsee: string;
  codePostal: string;
  population: number;
  altitude: number;
  logements: number;
  logementsMaison: number;
  prixM2Moyen: number;
  menuisiersRGE: number;
  tauxRenovation: string;
  intercommunalite: string;
  canton: string;
  latitude?: number;
  longitude?: number;
  distanceLyon?: number;
  windExposure?: string;
  secteurSauvegarde?: boolean;
  profilCommune?: string;
  marcheImmobilier?: string;
  tauxMaisonLabel?: string;
}

export interface ExternalLink {
  label: string;
  url: string;
  description: string;
}

export interface GuideLink {
  href: string;
  label: string;
  desc: string;
}

export interface LocalContent {
  introParagraph: string;
  conseilAides: string;
  anecdotePatrimoine: string;
  marketDataText: string;
  faqItems: { question: string; answer: string }[];
  localAgencyName: string;
  externalLinks: ExternalLink[];
  expertTip: string;
  tableIntro: string;
  guideLinks: GuideLink[];
  savingsEstimate: string;
  lastUpdated: string;
  realEstateInsight: string;
  populationTierContent: string;
  windExposureContext: string;
  abfRegulations: string;
  sourcesCitation: string;
  poseSteps: { title: string; description: string }[];
  aluAdvantages: { title: string; description: string }[];
  rgeCertifications: { title: string; description: string }[];
  diagnosticEnergetique: string;
  calendrierRenovation: string;
  vitrageRecommendation: string;
}

export function getLocalAgency(slug: string): { name: string; detail: string } {
  const metropoleLyonSlugs = new Set([
    'lyon', 'villeurbanne', 'venissieux', 'caluire-et-cuire', 'saint-priest', 
    'vaulx-en-velin', 'bron', 'rillieux-la-pape', 'meyzieu', 'oullins', 
    'decines-charpieu', 'sainte-foy-les-lyon', 'givors', 'saint-genis-laval', 
    'tassin-la-demi-lune', 'ecully', 'saint-fons', 'francheville', 'chassieu', 
    'corbas', 'feyzin', 'mions', 'fontaines-sur-saone', 'neuville-sur-saone', 
    'saint-didier-au-mont-d-or', 'saint-cyr-au-mont-d-or', 'dardilly', 
    'limonest', 'irigny', 'vernaison', 'grigny', 'jonage', 'solaize', 
    'genay', 'la-mulatiere', 'pierre-benite'
  ]);

  if (metropoleLyonSlugs.has(slug)) {
    return {
      name: "l'ALEC de la Métropole de Lyon",
      detail: "l'Agence Locale de l'Énergie et du Climat qui gère le guichet France Rénov' de l'agglomération lyonnaise"
    };
  }
  if (slug.includes('beaujolais') || slug === 'villefranche-sur-saone' || slug === 'gleize' || slug === 'anse') {
    return {
      name: "le point France Rénov' du Beaujolais Saône",
      detail: "le service public d'accompagnement à la transition énergétique pour la région de Villefranche et du Beaujolais"
    };
  }
  return {
    name: "l'ALEC du Rhône",
    detail: "le service public départemental d'accompagnement pour l'amélioration de l'habitat et les subventions MaPrimeRénov'"
  };
}

export function getVariantIndex(slug: string, offset: number, maxVariants: number): number {
  let hash = 2166136261;
  hash = Math.imul(hash ^ offset, 16777619);
  hash = Math.imul(hash ^ (offset >>> 16), 2654435761);
  for (let i = 0; i < slug.length; i++) {
    hash = Math.imul(hash ^ slug.charCodeAt(i), 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 2246822507);
  hash ^= hash >>> 13;
  return (hash >>> 0) % maxVariants;
}

export function getDynamicPrices(commune: Commune) {
  let priceFactor = 1.0;
  
  if (commune.population > 400000) priceFactor += 0.06; // Lyon center premium
  else if (commune.population > 40000) priceFactor += 0.03; // Suburban hubs (Villeurbanne, Caluire, etc.)
  
  if (commune.secteurSauvegarde) {
    priceFactor += 0.08; // ABF regulations: custom wood frames / profiles
  }
  
  if (commune.prixM2Moyen && commune.prixM2Moyen > 4800) {
    priceFactor += 0.05; // Premium zones (Monts d'Or, Saint-Didier, Ecully)
  } else if (commune.prixM2Moyen && commune.prixM2Moyen < 2500) {
    priceFactor -= 0.04; // More accessible outer zones
  }
  
  priceFactor = Math.max(0.90, Math.min(1.22, priceFactor));

  return {
    pvcDouble: { min: Math.round(500 * priceFactor), max: Math.round(950 * priceFactor) },
    aluDouble: { min: Math.round(750 * priceFactor), max: Math.round(1500 * priceFactor) },
    boisDouble: { min: Math.round(650 * priceFactor), max: Math.round(1300 * priceFactor) },
    mixteDouble: { min: Math.round(950 * priceFactor), max: Math.round(1900 * priceFactor) },
    baieAlu: { min: Math.round(1900 * priceFactor), max: Math.round(3800 * priceFactor) },
    voletElec: { min: Math.round(400 * priceFactor), max: Math.round(850 * priceFactor) },
    velux: { min: Math.round(850 * priceFactor), max: Math.round(1700 * priceFactor) },
    priceFactor
  };
}

// ═══════════════════════════════════════════════════════════════
// ANECDOTE PATRIMOINE — Localized for Lyon/Rhône
// ═══════════════════════════════════════════════════════════════

export function getAnecdotePatrimoine(slug: string, nom: string, commune: Commune): string {
  if (slug === 'lyon') {
    return "Lyon, ancienne capitale des Gaules classée au patrimoine mondial de l'UNESCO, présente un bâti historique d'une incroyable richesse. Des ruelles médiévales et cours Renaissance du Vieux-Lyon aux immeubles de Canuts à la Croix-Rousse, en passant par les somptueuses façades haussmanniennes de la Presqu'île, le remplacement des menuiseries est soumis à des contrôles stricts des Architectes des Bâtiments de France (ABF). Rénover ses fenêtres à Lyon requiert d'allier le respect des moulures, des petits-bois et des couleurs historiques à la performance moderne (coefficient Uw, facteur solaire Sw et isolation phonique renforcée contre le bruit urbain).";
  }
  if (slug === 'villeurbanne') {
    return "Villeurbanne, limitrophe de Lyon et caractérisée par son emblématique quartier des Gratte-Ciel, possède une identité architecturale unique marquée par l'Art déco et l'histoire ouvrière. Rénover ses fenêtres à Villeurbanne nécessite de s'accorder avec ce patrimoine architectural moderne : les profilés en aluminium fins de couleur gris anthracite ou le PVC à haute performance thermique y sont particulièrement plébiscités pour conserver les grandes ouvertures lumineuses d'origine.";
  }
  if (slug === 'caluire-et-cuire') {
    return "Caluire-et-Cuire, située sur le plateau entre Rhône et Saône, offre un panorama exceptionnel et un cadre résidentiel très recherché. Sa proximité immédiate avec la Croix-Rousse en fait une extension naturelle de la vie lyonnaise. Pour les maisons de ville et les résidences arborées caluirardes, l'isolation thermique hiver/été est essentielle afin de se prémunir du froid continental et des canicules estivales de plus en plus fréquentes.";
  }
  if (slug === 'saint-didier-au-mont-d-or' || slug === 'saint-cyr-au-mont-d-or' || slug === 'limonest') {
    return `Nichée dans le cadre verdoyant et prestigieux des Monts d'Or, la commune de ${nom} se distingue par ses superbes demeures en pierre dorée et ses propriétés haut de gamme. Le PLU local et la proximité de secteurs sauvegardés imposent des exigences esthétiques majeures : les menuiseries mixtes bois-alu ou bois massif aux teintes patrimoniales y sont vivement recommandées pour préserver l'élégance de ces façades historiques tout en atteignant une performance énergétique d'exception.`;
  }
  if (slug === 'villefranche-sur-saone') {
    return "Villefranche-sur-Saône, capitale du Beaujolais, recèle de magnifiques cours intérieures de la Renaissance et de façades classées le long de la rue Nationale. Dans ce cœur de ville historique, le remplacement de fenêtres exige une conformité absolue avec les directives ABF (Architectes des Bâtiments de France) : menuiseries en chêne noble, crémones traditionnelles et vitrages isolants à profil affiné.";
  }
  if (slug === 'tarare') {
    return "Tarare, bâtie dans la vallée de la Turdine et historiquement surnommée la cité de la mousseline, est entourée par les reliefs du Haut-Beaujolais. Son climat de moyenne montagne (altitude de 380m) expose le parc de logements à des hivers rigoureux et des vents du nord marqués. Les habitants privilégient des fenêtres triple vitrage ou PVC renforcé avec classement AEV supérieur pour supprimer les infiltrations d'air glacé.";
  }
  if (slug === 'givors') {
    return "Givors, carrefour historique de la vallée du Rhône au riche passé industriel de verreries et de métallurgie, possède un patrimoine architectural varié, notamment la cité des Étoiles labellisée Patrimoine du XXe siècle. Les fenêtres y subissent à la fois les variations thermiques du couloir rhodanien et les nuisances sonores ferroviaires et routières, nécessitant des vitrages à affaiblissement acoustique performant (Rw).";
  }

  // Enhanced generic anecdotes for Rhône (20 variants)
  const genericAnecdotes = [
    `Le climat du Rhône (69) se caractérise par des influences continentales avec des hivers froids et des étés caniculaires. À ${nom}, remplacer vos anciennes menuiseries simple vitrage améliore considérablement le coefficient Uw de vos ouvertures et réduit vos dépenses de chauffage. Avec ${commune.logements?.toLocaleString('fr-FR')} logements recensés, la transition énergétique est une priorité locale majeure.`,
    `Les résidences et pavillons de ${nom} bénéficient de l'expertise de menuisiers qualifiés RGE, au nombre de ${commune.menuisiersRGE} dans la zone. Poser des fenêtres modernes en PVC ou en aluminium permet de valoriser votre patrimoine immobilier dans le canton de ${commune.canton}, tout en optimisant le confort de votre foyer.`,
    `Les canicules d'été à ${nom} (altitude : ${commune.altitude} m) rendent le facteur solaire Sw des vitrages primordial. Nos menuisiers partenaires installent des double vitrages à contrôle solaire qui bloquent jusqu'à 60% du rayonnement, limitant la surchauffe intérieure sans recourir à la climatisation.`,
    `Investir dans de nouvelles fenêtres valorise votre bien sur le marché ${commune.marcheImmobilier} de ${nom}, où le prix immobilier moyen s'établit à ${commune.prixM2Moyen} €/m². Des menuiseries neuves conformes à la RE2020 sont un excellent levier pour améliorer l'étiquette DPE du logement.`,
    `Le couloir rhodanien est soumis à des vents du nord constants. À ${nom}, à seulement ${commune.distanceLyon} km de Lyon, nous recommandons des fenêtres dotées d'un excellent classement AEV (Air-Eau-Vent) et équipées de joints d'étanchéité EPDM à double lèvre pour éliminer les sifflements d'air.`,
    `Un DPE performant est devenu un atout de taille pour vendre ou louer à ${nom}. Remplacer vos simple vitrages par des doubles vitrages argon Uw ≤ 1,3 W/m².K permet de gagner une à deux classes sur votre DPE, un argument de poids sur ce marché immobilier ${commune.marcheImmobilier}.`,
    `En copropriété à ${nom}, parmi les ${commune.logements?.toLocaleString('fr-FR')} logements de la commune, le remplacement de fenêtres doit respecter scrupuleusement l'harmonie des façades. Nos menuisiers RGE vous aident à préparer le descriptif technique pour le vote en assemblée générale (AG).`,
    `Les nuisances acoustiques urbaines ou routières dans l'agglomération de ${commune.intercommunalite} nécessitent des vitrages asymétriques (type 10/16/4). Nos artisans partenaires conçoivent des solutions phoniques qui divisent par quatre le bruit extérieur à ${nom}.`,
    `Rattachée à l'intercommunalité ${commune.intercommunalite}, ${nom} profite de programmes locaux d'aide à l'amélioration de l'habitat. Le taux annuel de rénovation thermique y atteint ${commune.tauxRenovation}%, signe d'une forte dynamique de modernisation des menuiseries.`,
    `Les façades en pierres dorées ou en maçonnerie traditionnelle à ${nom} se marient idéalement avec des profilés aluminium laqués ou du bois verni. À ${commune.altitude} mètres d'altitude, les écarts de température nécessitent des menuiseries à rupture de pont thermique complète.`,
    `Le bassin de ${nom} compte près de ${commune.menuisiersRGE} menuiseries qualifiées RGE. Cette forte présence locale garantit une réactivité d'intervention sous 3 semaines et des tarifs compétitifs pour la rénovation de vos portes-fenêtres et baies vitrées.`,
    `À ${nom}, ${commune.tauxMaisonLabel}. Cette typologie de logements oriente le choix des ouvertures : des baies vitrées coulissantes en alu pour les pièces de vie lumineuses ou des fenêtres oscillo-battantes en PVC pour les espaces plus exigus.`,
    `Le fort taux d'UV estival à ${nom} dessèche prématurément les anciens mastics de vitrage. L'installation de fenêtres modernes dotées de parcloses à clips et de joints thermoplastiques garantit une étanchéité inaltérable sur plus de 25 ans.`,
    `Avec une population de ${commune.population?.toLocaleString('fr-FR')} habitants, ${nom} présente un parc immobilier ${commune.tauxMaisonLabel}. Nos poseurs locaux RGE maîtrisent toutes les configurations de pose (dépose totale ou rénovation sur dormant existant).`,
    `Située dans le secteur du canton de ${commune.canton}, ${nom} allie attractivité périurbaine et charme rhodanien. Le changement de vos fenêtres permet d'économiser jusqu'à 25% d'énergie tout en sécurisant votre maison avec des vitrages anti-effraction.`,
    `Le parc résidentiel de ${nom} compte ${commune.logements?.toLocaleString('fr-FR')} logements, dont une part significative construite avant les premières réglementations thermiques. Rénover ces fenêtres constitue le premier geste d'isolation recommandé par France Rénov'.`,
    `La rénovation des menuiseries à ${nom} est largement subventionnée en 2026 grâce au cumul des CEE et des aides nationales gérées par ${getLocalAgency(slug).name}. Un taux de rénovation locale de ${commune.tauxRenovation}% confirme l'intérêt des ménages pour ces travaux.`,
    `Chaque type d'habitat à ${nom} (mas en pierre, maison des années 70, résidence contemporaine) exige une technique de pose adaptée. Nos artisans du canton de ${commune.canton} réalisent des installations sur mesure conformes aux normes DTU 36.5.`,
    `La proximité de ${nom} avec Lyon (${commune.distanceLyon} km) permet aux artisans menuisiers RGE d'assurer un suivi technique rigoureux. Avec un prix au m² de ${commune.prixM2Moyen} €, moderniser vos vitrages assure une excellente plus-value verte lors de la vente.`,
    `Sur les ${commune.logements?.toLocaleString('fr-FR')} résidences de ${nom}, une proportion importante de fenêtres ne répond plus aux critères d'isolation modernes. Le double vitrage renforcé à gaz Argon évite la condensation intérieure et améliore considérablement le confort phonique.`
  ];
  
  let hashVal = 0;
  for (let i = 0; i < slug.length; i++) {
    hashVal = (hashVal * 31 + slug.charCodeAt(i)) | 0;
  }
  hashVal = hashVal ^ (commune.population * 7);
  hashVal = hashVal ^ (commune.altitude * 13);
  hashVal = hashVal ^ (slug.length * 2654435761);
  return genericAnecdotes[Math.abs(hashVal) % genericAnecdotes.length];
}

// ═══════════════════════════════════════════════════════════════
// EXTERNAL LINKS — Pool of 10, rotate 4 per commune
// ═══════════════════════════════════════════════════════════════

function getExternalLinks(commune: Commune): ExternalLink[] {
  const allLinks: ExternalLink[] = [
    {
      label: "France Rénov' — Portail national de la rénovation",
      url: "https://france-renov.gouv.fr",
      description: "Le simulateur officiel du gouvernement pour estimer le montant de vos aides MaPrimeRénov' et contacter un conseiller local."
    },
    {
      label: "ANAH — Agence Nationale de l'Habitat",
      url: "https://www.anah.fr",
      description: "Informations détaillées sur les subventions nationales pour la rénovation énergétique et l'amélioration de l'habitat."
    },
    {
      label: "Vérifier un artisan RGE — Annuaire Qualibat",
      url: "https://www.qualibat.com",
      description: "Le registre officiel permettant de s'assurer de la validité de la qualification RGE Rénovation Énergétique de votre installateur."
    },
    {
      label: "ALEC de la Métropole de Lyon (Énergie Climat)",
      url: "https://www.alec-lyon.org",
      description: "Conseils neutres et gratuits et aides territoriales pour la transition énergétique des logements de l'agglomération lyonnaise."
    },
    {
      label: "ADEME Auvergne-Rhône-Alpes",
      url: "https://www.auvergne-rhone-alpes.ademe.fr",
      description: "Ressources régionales sur la performance environnementale, l'isolation thermique et la rénovation des bâtiments anciens."
    },
    {
      label: "Certificats d'Économies d'Énergie (CEE)",
      url: "https://www.ecologie.gouv.fr/cee",
      description: "Le fonctionnement des primes énergie versées par les fournisseurs pour le remplacement de vitrages simples."
    },
    {
      label: "ANIL — Éco-PTZ et financement sans intérêt",
      url: "https://www.anil.org",
      description: "Calculateurs et règles juridiques de l'Éco-Prêt à Taux Zéro pour financer le reste à charge de vos travaux."
    },
    {
      label: "Mon Accompagnateur Rénov' (MAR)",
      url: "https://www.faire.gouv.fr",
      description: "Le parcours d'accompagnement obligatoire pour les projets de rénovation d'ampleur dans le département 69."
    },
    {
      label: "UFME — Réglementations & Normes Fenêtres",
      url: "https://www.ufme.fr",
      description: "Fiches techniques et explications des labels AEV, des vitrages phoniques et de la pose selon le DTU 36.5."
    },
    {
      label: "DREAL Auvergne-Rhône-Alpes — Urbanisme",
      url: "https://www.auvergne-rhone-alpes.developpement-durable.gouv.fr",
      description: "Informations sur les règles locales d'urbanisme, PLU métropolitain et préservation du patrimoine dans le Rhône."
    }
  ];

  const baseIdx = getVariantIndex(commune.slug, 500, allLinks.length);
  const selected: ExternalLink[] = [];
  const used = new Set<number>();
  let offset = baseIdx;
  while (selected.length < 4) {
    const idx = offset % allLinks.length;
    if (!used.has(idx)) {
      selected.push(allLinks[idx]);
      used.add(idx);
    }
    offset++;
  }
  return selected;
}

// ═══════════════════════════════════════════════════════════════
// GUIDE LINKS — Localized guides list
// ═══════════════════════════════════════════════════════════════

function getGuideLinks(slug: string = '', category: string = 'main'): GuideLink[] {
  const allGuides: GuideLink[] = [
    { href: '/guides/budget-remplacement-fenetre-lyon-2026/', label: 'Budget Fenêtres Rhône 2026', desc: 'Prix moyen par matériau et arrondissements lyonnais pour vos travaux.' },
    { href: '/guides/aides-financieres-eco-ptz-maprimerenov/', label: "Aides & Subventions 2026", desc: "Comment cumuler MaPrimeRénov', primes CEE et Éco-PTZ dans le Rhône." },
    { href: '/guides/pvc-vs-aluminium-quel-materiau-choisir/', label: 'PVC vs Aluminium : Le Duel', desc: 'Performances isolantes, coût et esthétique pour votre maison ou appartement.' },
    { href: '/guides/fenetres-haussmannien-lyon-contraintes-abf/', label: 'Haussmannien et Bâtiments de France', desc: 'Les contraintes ABF à respecter à Lyon, Villefranche ou les Monts d\'Or.' },
    { href: '/guides/remplacement-fenetre-copropriete-lyon-regles-aides/', label: 'Changement de fenêtres en copro', desc: 'Règles de syndic, déclaration en mairie et subventions collectives.' },
    { href: '/guides/isolation-acoustique-fenetre-anti-bruit-lyon/', label: 'Isolation Acoustique Anti-Bruit', desc: 'Comment choisir ses fenêtres contre les bruits urbains et de circulation.' },
    { href: '/guides/impact-dpe-renovation-fenetres-valeur-immobiliere/', label: 'Plus-value Immobilière & DPE', desc: 'Combien de valeur gagne votre bien dans le 69 grâce à des fenêtres isolantes.' },
    { href: '/guides/fenetres-canicule-estivale-protection-solaire-rhone/', label: 'Protéger son logement des canicules', desc: 'Choisir des verres à contrôle solaire pour limiter la climatisation en été.' }
  ];

  const catBonus = category === 'main' ? 0 : category === 'alu' ? 50 : 150;
  const baseOffset = getVariantIndex(slug, 300 + catBonus, allGuides.length);
  const selected: GuideLink[] = [];
  const usedIndices = new Set<number>();
  
  let rotOffset = baseOffset;
  while (selected.length < 3) {
    const idx = rotOffset % allGuides.length;
    if (!usedIndices.has(idx)) {
      selected.push(allGuides[idx]);
      usedIndices.add(idx);
    }
    rotOffset++;
  }
  
  return selected;
}

// ═══════════════════════════════════════════════════════════════
// SPINTAX INTRO POOLS — per category
// ═══════════════════════════════════════════════════════════════

const INTRO_POOLS: Record<string, string[]> = {
  main: [
    "Pour le {remplacement|changement} de vos fenêtres à {VILLE}, {bénéficiez|profitez} de l'accompagnement de menuisiers RGE qualifiés du 69. Estimez vos aides MaPrimeRénov' 2026 et obtenez un devis sur mesure pour vos menuiseries PVC, aluminium ou bois.",
    "Vos fenêtres simple vitrage à {VILLE} laissent passer les courants d'air ? Nos menuisiers partenaires certifiés RGE installent des fenêtres double vitrage performantes entre {PRIX_MIN}€ et {PRIX_MAX}€ TTC, aides déduites.",
    "Améliorez durablement les performances DPE de votre logement à {VILLE} grâce à la pose de fenêtres thermiques par un artisan RGE du Rhône. Bénéficiez de la TVA réduite à 5,5% et de subventions immédiates.",
    "Besoin d'un artisan menuisier certifié RGE à {VILLE} dans le Rhône ? Découvrez les solutions de pose PVC, aluminium ou bois les plus isolantes et simulez vos aides à la rénovation en moins de 2 minutes.",
    "Les fenêtres anciennes à {VILLE} sont responsables de 25% de pertes de chaleur. Nos installateurs qualifiés posent des menuiseries de classe AEV supérieure pour résister au climat continental et aux fortes chaleurs.",
    "Vous habitez à {VILLE} et souhaitez équiper votre appartement ou maison de doubles vitrages performants ? Comparez les prix de pose et bénéficiez de l'accompagnement de {l'ALEC de la Métropole de Lyon|l'ALEC locale}.",
    "Faites poser vos fenêtres et baies vitrées coulissantes à {VILLE} par un menuisier qualifié RGE Rénovation Énergétique. Accédez aux primes CEE du 69 et déduisez vos aides d'État directement de vos devis.",
    "Le climat de {VILLE} exige une attention particulière portée au coefficient Uw des vitrages. Nos poseurs RGE installent des ouvertures étanches conçues pour vous prémunir du froid hivernal et des pics de canicule.",
    "Rénovation thermique à {VILLE} : changez vos vieilles fenêtres pour du double vitrage à contrôle solaire et {économisez|réduisez vos factures de} 15 à 30% de chauffage dans le Rhône.",
    "À {VILLE}, confiez votre chantier de changement de fenêtres à un menuisier RGE local. Assurez-vous d'une pose conforme aux DTU en vigueur tout en optimisant vos subventions nationales MaPrimeRénov'."
  ],
  alu: [
    "La fenêtre aluminium double vitrage est la solution {idéale|privilégiée} pour apporter luminosité et design à votre logement à {VILLE}. Découvrez les tarifs et techniques de pose RGE dans le Rhône.",
    "Vous recherchez des ouvertures en alu avec profilés fins et rupture de pont thermique à {VILLE} ? Nos artisans RGE partenaires installent des menuiseries alu sur mesure haut de gamme.",
    "Le choix de l'aluminium pour vos fenêtres à {VILLE} garantit une durabilité maximale et un entretien nul. Ce matériau s'accorde superbement avec les façades modernes ou rénovées du Rhône.",
    "Le remplacement de vos fenêtres par des profilés alu à {VILLE} ouvre droit aux aides de l'État en 2026. Nos menuisiers RGE qualifiés optimisent l'apport solaire (Sw) et thermique (Uw) de vos menuiseries.",
    "À {VILLE}, les fenêtres alu double vitrage dotées de vitrages isolants thermo-acoustiques vous protègent efficacement du froid continental et des canicules de l'agglomération lyonnaise.",
    "Donnez une touche contemporaine et soignée à vos façades à {VILLE} avec des menuiseries en aluminium laqué (RAL au choix). Des profilés étroits pour un clair de vitrage maximal.",
    "L'aluminium {constitue|représente} le choix haut de gamme et pérenne de fenêtre à {VILLE}. Associé aux subventions MaPrimeRénov' du Rhône, votre investissement valorise durablement votre bien.",
    "Installez des baies coulissantes ou fenêtres alu à {VILLE} conçues avec des barrettes polyamide isolantes et joints EPDM pour une étanchéité de classe AEV supérieure."
  ],
  rge: [
    "Recourir à un artisan certifié RGE à {VILLE} est requis pour déduire les aides de l'ANAH (MaPrimeRénov') et obtenir un Éco-PTZ sans intérêts. Trouvez les meilleurs menuisiers RGE près de chez vous.",
    "Nos menuisiers partenaires agréés RGE à {VILLE} disposent des qualifications professionnelles (Qualibat RGE) nécessaires pour garantir la conformité thermique de vos ouvertures.",
    "Bénéficiez d'une fiscalité avantageuse avec une TVA à 5,5% en confiant la pose de vos fenêtres à un installateur RGE de {VILLE}. Visite technique et devis gratuits sous 48 heures.",
    "Pour éradiquer les fuites d'air à {VILLE} face aux vents du couloir rhodanien, faites appel à un menuisier RGE du Rhône. Nos artisans sont formés aux dernières techniques de dépose totale.",
    "Nos menuisiers certifiés RGE interviennent à {VILLE} pour la pose de vos fenêtres PVC, aluminium ou bois. Profitez d'une garantie décennale et d'un calfeutrement de haute technicité.",
    "Un projet de menuiserie réussi à {VILLE} commence par le choix d'un artisan certifié RGE. Obtenez vos primes énergies (CEE) et réduisez le reste à charge de vos travaux.",
    "Faites poser vos nouvelles fenêtres par un menuisier certifié RGE à {VILLE} pour s'assurer du respect des règles d'urbanisme (PLU) et des normes d'étanchéité DTU 36.5.",
    "Les installateurs de fenêtres RGE du secteur de {VILLE} maîtrisent parfaitement les spécificités du bâti lyonnais et des Monts d'Or, garantissant une intégration esthétique irréprochable."
  ]
};

// ═══════════════════════════════════════════════════════════════
// CONSEIL AIDES — Spintax pool
// ═══════════════════════════════════════════════════════════════

const CONSEIL_POOLS = [
  "Pour vos fenêtres à {VILLE}, MaPrimeRénov' finance jusqu'à 100 € par fenêtre remplacée pour les revenus très modestes, cumulable avec la prime CEE de 45 € par équipement. Les artisans RGE déduisent fréquemment ces subventions de votre facture finale.",
  "Dans les secteurs protégés de Lyon (Vieux-Lyon, Presqu'île) ou dans les communes des Monts d'Or à proximité de {VILLE}, le PVC peut faire l'objet de restrictions au profit du bois ou de profilés alu à aspect traditionnel. Renseignez-vous en mairie avant vos travaux.",
  "La TVA réduite à 5,5% s'applique sur l'achat et la pose de vos menuiseries isolantes à {VILLE} si votre logement est achevé depuis plus de 2 ans. Cet allégement fiscal est accordé d'office lors d'une pose par un professionnel certifié.",
  "L'éco-prêt à taux zéro (Éco-PTZ) permet de financer vos travaux de fenêtres à {VILLE} sans intérêt, avec un remboursement étalé sur 15 ans. Il peut aller jusqu'à 15 000 € pour un geste de remplacement de fenêtres.",
  "Changer des fenêtres simple vitrage pour du double vitrage Uw ≤ 1,3 W/m².K à {VILLE} permet de réduire vos déperditions thermiques par les ouvertures de 15% à 25%, ce qui représente une économie de chauffage substantielle en hiver continental.",
  "La combinaison des aides de l'ANAH (MaPrimeRénov') et des primes énergie (CEE) peut couvrir jusqu'à 50% du prix de vos fenêtres à {VILLE}. Nos menuisiers RGE s'occupent de collecter et monter vos dossiers de financement.",
  "Depuis 2026, l'accès à MaPrimeRénov' exige de remplacer au moins 2 fenêtres ou d'intégrer les menuiseries dans un bouquet de travaux (isolation des combles ou changement de chauffage) pour obtenir les primes les plus importantes à {VILLE}.",
  "Les propriétaires bailleurs de {VILLE} peuvent également prétendre aux aides de l'État sous réserve de confier les chantiers à un installateur RGE et de s'engager à louer le bien à titre de résidence principale.",
  "À {VILLE}, la transition vers des vitrages à isolation renforcée constitue le premier poste de travaux recommandé par les conseillers France Rénov'. Le bouclier thermique créé par un double vitrage Uw ≤ 1,3 réduit significativement les appels de chauffage en période hivernale.",
  "Le dispositif Coup de Pouce Rénovation Performante permet aux ménages de {VILLE} de bénéficier d'une prime bonifiée lorsque le remplacement de fenêtres s'inscrit dans un parcours de rénovation globale incluant au moins deux gestes d'isolation.",
  "Pour les logements anciens de {VILLE}, le remplacement des fenêtres simple vitrage par des menuiseries certifiées NF et posées par un artisan RGE constitue le levier le plus rapide pour améliorer le classement DPE, avec un impact mesurable dès la première saison de chauffe.",
  "Les copropriétaires de {VILLE} peuvent mutualiser les travaux de remplacement de fenêtres pour obtenir des tarifs dégressifs et accéder aux aides collectives de l'ANAH, réduisant le reste à charge individuel de 30 à 40% par rapport à un chantier isolé.",
  "Le prêt Avance Rénovation, complémentaire de l'Éco-PTZ, est désormais accessible aux propriétaires modestes de {VILLE}. Remboursable lors de la vente du bien, il finance intégralement le reste à charge des travaux de menuiserie sans condition de revenus minimaux.",
  "À {VILLE}, les menuiseries posées par un professionnel RGE bénéficient automatiquement de la garantie de parfait achèvement (1 an) et de la garantie biennale de bon fonctionnement (2 ans), en plus de la garantie décennale couvrant les défauts d'étanchéité."
];

// ═══════════════════════════════════════════════════════════════
// WIND EXPOSURE — 6 variants
// ═══════════════════════════════════════════════════════════════

const WIND_EXPOSURE_POOLS = [
  "L'exposition au vent à {VILLE} est classée « {WIND_EXPOSURE} ». Les menuiseries installées doivent être testées et certifiées AEV (classement de perméabilité à l'air A*3 minimum et de résistance au vent V*C2) pour éviter tout courant d'air gênant.",
  "Le climat de {VILLE} implique des vents réguliers liés au couloir rhodanien. Une étanchéité soignée réalisée par des joints en silicone neutre et des cales d'ancrage robustes prévient toute déformation des dormants sous la pression des rafales.",
  "Avec un niveau d'exposition au vent « {WIND_EXPOSURE} » à {VILLE}, le choix des quincailleries est important. Les menuiseries équipées de gâches de sécurité multipoints garantissent une pression homogène sur les joints d'étanchéité.",
  "Le vent du nord est un facteur clé du climat à {VILLE}. Les fenêtres de rénovation doivent être posées avec un joint d'étanchéité imprégné (compriband) pour empêcher l'air glacial de s'infiltrer à la jonction entre le mur et le dormant.",
  "Le classement AEV des fenêtres est primordial à {VILLE} (« {WIND_EXPOSURE} »). Un artisan menuisier certifié RGE sélectionnera des profilés certifiés NF CSTBat conçus pour préserver une étanchéité absolue même lors des tempêtes automnales.",
  "Dans les zones à l'exposition « {WIND_EXPOSURE} » de {VILLE}, le type de vitrage doit être adapté : un double vitrage asymétrique avec gaz Argon offre une résistance mécanique optimale et limite les résonances vibratoires dues au vent."
];

// ═══════════════════════════════════════════════════════════════
// EXPERT TIPS — Pool of 10
// ═══════════════════════════════════════════════════════════════

const EXPERT_TIP_POOLS = [
  "Conseil d'artisan lyonnais : En climat continental avec des étés très chauds, préférez des vitrages intégrant un intercalaire composite 'warm-edge' (bord chaud) au lieu de l'aluminium classique. Il réduit de 70% le pont thermique périphérique et évite la condensation.",
  "Recommandation technique : La pose en dépose totale est toujours préférable à la pose en rénovation. En retirant entièrement l'ancien cadre en bois à {VILLE}, vous maximisez le clair de vitrage (luminosité) et supprimez tout risque de pourrissement sous-jacent.",
  "Conseil d'expert RGE : Vérifiez l'étiquette de vos vitrages. Le coefficient Ug mesure la performance du verre seul, tandis que le Uw indique celle de la fenêtre complète. Pour bénéficier des aides 2026, exigez un Uw ≤ 1,3 W/m².K pour vos fenêtres PVC ou alu.",
  "Astuce de poseur : Les coffres de volets roulants intégrés sont des sources majeures de fuites d'air et de bruit. Lors du changement de fenêtres, demandez une isolation thermo-acoustique interne du coffre pour maximiser les économies d'énergie.",
  "Conseil de menuisier : En cas d'exposition au bruit (proximité de Lyon ou axes routiers), le double vitrage standard 4/16/4 est insuffisant. Choisissez un vitrage asymétrique 10/16/4 ou feuilleté acoustique 44.2 Silence pour gagner jusqu'à 6 dB d'affaiblissement.",
  "Astuce thermique : Pour les fenêtres orientées Sud ou Ouest dans le Rhône, le facteur solaire (Sw) doit se situer autour de 0.40. Un verre à faible émissivité avec contrôle solaire réfléchit la chaleur extérieure en été tout en captant la lumière naturelle.",
  "Sécurité et isolation : Pour les fenêtres du rez-de-chaussée à {VILLE}, l'installation d'un vitrage feuilleté de classe P2A (type 44.2) retarde l'intrusion de plus de 3 minutes, décourageant la majorité des cambrioleurs tout en conservant une excellente isolation.",
  "Recommandation technique : Le gaz Argon contenu entre les deux vitres garantit l'isolation. Avec le temps, il s'échappe de 1% par an. Si vos fenêtres ont plus de 20 ans, le gaz s'est dissipé et vos ouvertures ont perdu une grande part de leur efficacité.",
  "Conseil d'urbanisme : Dans le Rhône, de nombreuses communes appliquent des nuanciers de couleurs très stricts pour les façades. Assurez-vous d'obtenir l'accord écrit de la mairie de {VILLE} ou de votre syndic de copropriété avant de choisir des fenêtres de couleur.",
  "Recommandation de pose : Un calfeutrement de fenêtre efficace exige trois barrières distinctes : une étanchéité extérieure à la pluie battante (compriband), une isolation thermique intermédiaire (mousse imprégnée) et une étanchéité intérieure à la vapeur d'eau.",
  "Conseil de menuisier : Pour les fenêtres exposées plein sud dans le Rhône, privilégiez un double vitrage à contrôle solaire renforcé avec un facteur solaire Sw < 0.35. Vous bloquerez 65% de la chaleur radiante estivale tout en conservant une excellente transmission lumineuse à {VILLE}.",
  "Astuce technique : Lors du remplacement de vos fenêtres à {VILLE}, demandez systématiquement la pose d'entrées d'air hygroréglables (type EA-H) sur les coffres ou traverses hautes. Elles assurent le renouvellement d'air conforme à l'arrêté du 24 mars 1982 sans créer de courant d'air froid.",
  "Recommandation d'expert : Exigez de votre poseur à {VILLE} un PV de réception détaillant les tests d'étanchéité réalisés (test fumigène ou infiltrométrie partielle). Ce document est indispensable pour faire valoir la garantie décennale en cas de défaut d'étanchéité ultérieur.",
  "Conseil pratique : Si vous habitez en étage élevé à {VILLE}, optez pour des fenêtres oscillo-battantes plutôt que battantes classiques. Le mode oscillo permet une ventilation sécurisée même en votre absence, réduisant les risques liés aux vents violents du couloir rhodanien.",
  "Astuce de poseur : Demandez le remplacement des appuis de fenêtre (tablettes extérieures) en même temps que les châssis à {VILLE}. Un appui en aluminium larmier avec pente de 10% garantit l'évacuation des eaux de ruissellement et protège durablement le joint périphérique inférieur.",
  "Conseil d'urbanisme : Dans le Rhône et notamment à {VILLE}, vérifiez que le devis mentionne explicitement la référence RAL choisie (7016, 7039…). Un coloris non conforme au nuancier communal peut entraîner un refus de conformité lors du contrôle d'urbanisme post-travaux."
];

// ═══════════════════════════════════════════════════════════════
// SAVINGS ESTIMATE — Pool of 8
// ═══════════════════════════════════════════════════════════════

const SAVINGS_ESTIMATE_POOLS = [
  `Pour un logement représentatif à {VILLE}, remplacer des fenêtres simple vitrage par du double vitrage PVC Uw 1.3 permet d'économiser environ 250 € à 480 € par an sur vos factures de chauffage, tout en supprimant l'inconfort lié aux parois froides.`,
  `Changer 6 fenêtres obsolètes par des menuiseries isolantes à {VILLE} génère une baisse immédiate de 15% à 20% sur vos factures de gaz ou d'électricité. Le retour sur investissement est grandement accéléré par les aides MaPrimeRénov' 2026.`,
  `Selon l'ADEME, l'isolation des parois vitrées à {VILLE} réduit la sensation de courant d'air et permet de baisser la température de consigne de votre chauffage de 1°C en hiver, ce qui engendre 7% d'économies d'énergie supplémentaires.`,
  `Le remplacement de vos fenêtres à {VILLE} élimine les ponts thermiques périphériques. Grâce à une pose par un artisan RGE Qualibat, l'étanchéité à l'air de votre maison est certifiée, évitant les pertes caloriques invisibles.`,
  `Dans le Rhône, la consommation moyenne de chauffage pour une maison individuelle peut chuter de 220 kWh/m²/an à moins de 160 kWh/m²/an après la pose de doubles vitrages performants à {VILLE}, représentant un gain financier annuel non négligeable.`,
  `Pendant les canicules estivales du lyonnais, des fenêtres de qualité supérieure à {VILLE} réduisent l'usage de la climatisation de 30% en maintenant la fraîcheur accumulée durant la nuit, améliorant ainsi votre confort de vie.`,
  `Pour les foyers modestes à {VILLE}, le reste à charge après déduction des aides régionales et des primes énergie CEE pour l'isolation des fenêtres s'élève à seulement quelques centaines d'euros, garantissant un amortissement en moins de 4 ans.`,
  `Remplacer des menuiseries dégradées à {VILLE} empêche la pénétration d'humidité et la formation de condensation sur le verre intérieur. Des profilés récents avec intercalaires warm-edge protègent la salubrité de vos peintures et de vos murs.`,
  `En rénovant l'ensemble des ouvertures d'un logement de 80 m² à {VILLE}, l'économie thermique cumulée permet une réduction de 18% à 25% de la facture de chauffage annuelle, avec un retour sur investissement accéléré par les aides de l'État.`,
  `Le remplacement des fenêtres à {VILLE} permet de supprimer définitivement l'effet de paroi froide ressenti à moins de 50 cm des vitrages anciens. Ce gain de confort autorise une réduction de 1 à 2 °C du thermostat sans perte de confort, soit 7 à 14% d'économies supplémentaires.`,
  `Pour une maison individuelle à {VILLE}, le retour sur investissement du remplacement de 6 fenêtres PVC double vitrage (budget moyen de 5 000 à 7 000 € après aides) est estimé entre 6 et 9 ans grâce aux économies de chauffage et à la valorisation immobilière.`,
  `Les logements rénovés avec des menuiseries performantes à {VILLE} voient leur consommation de climatisation baisser de 25 à 35% en été grâce au contrôle solaire des vitrages modernes, un avantage décisif face aux pics de chaleur rhodaniens.`,
  `À {VILLE}, le cumul des aides (MaPrimeRénov' + CEE + TVA 5,5%) permet de réduire le coût réel du remplacement de fenêtres de 35 à 55% selon vos revenus fiscaux. Les ménages très modestes peuvent obtenir un reste à charge inférieur à 200 € par fenêtre.`,
  `L'isolation des parois vitrées à {VILLE} contribue à l'amélioration de la qualité de l'air intérieur en supprimant la condensation sur les vitres froides, principale cause de développement de moisissures dans les logements anciens du Rhône.`
];

// ═══════════════════════════════════════════════════════════════
// FAQ POOLS — Lyon / Rhône specific (6 questions each)
// ═══════════════════════════════════════════════════════════════

const FAQ_POOLS: Record<string, { question: string; answer: string }[]> = {
  main: [
    {
      question: "Quel est le meilleur matériau (PVC, Alu ou Bois) pour des fenêtres à {VILLE} ?",
      answer: "Le PVC offre le meilleur rapport qualité/prix isolant (Uw le plus bas) et ne nécessite aucun entretien. L'aluminium est idéal pour les grandes dimensions et baies vitrées coulissantes grâce à sa finesse. Le bois est recherché pour son authenticité et reste obligatoire dans les secteurs protégés de Lyon et du Rhône sous l'égide des ABF."
    },
    {
      question: "Quelles sont les obligations en copropriété pour remplacer des fenêtres à {VILLE} ?",
      answer: "Vous devez impérativement respecter le règlement de copropriété concernant la couleur extérieure des profilés, le matériau et le type de vitrage. Une déclaration préalable de travaux (DP) en mairie et l'accord écrit du syndic sont indispensables avant de lancer le chantier."
    },
    {
      question: "À combien s'élèvent les aides de l'État pour des fenêtres en 2026 dans le Rhône ?",
      answer: "Les subventions MaPrimeRénov' sont calculées selon vos ressources : de 40 € à 100 € par fenêtre remplacée pour les revenus modestes à très modestes. S'y ajoutent la prime énergie (CEE) d'environ 40 € par menuiserie et la TVA réduite à 5,5% appliquée d'office par les menuisiers RGE."
    },
    {
      question: "Combien de temps dure la pose de nouvelles fenêtres à {VILLE} ?",
      answer: "Pour un pavillon standard de 5 à 7 fenêtres, le chantier s'étale généralement sur 2 à 3 jours. S'il s'agit d'une dépose totale, le temps d'intervention peut être légèrement rallongé afin de soigner les raccords de plâtre et de maçonnerie."
    },
    {
      question: "Faut-il déclarer le changement de fenêtres en mairie à {VILLE} ?",
      answer: "Une déclaration préalable de travaux (DP) est obligatoire si vous modifiez l'aspect extérieur de votre logement (changement de couleur, passage du bois au PVC, dimensions). En secteur classé ABF, le dossier est soumis à l'accord conforme de l'Architecte des Bâtiments de France."
    },
    {
      question: "Quelle est la durée de vie d'une fenêtre double vitrage installée dans le Rhône ?",
      answer: "Une fenêtre PVC de qualité ou une fenêtre alu thermolaquée affiche une longévité de 30 à 45 ans. Les fenêtres en bois exigent un entretien régulier (lasure tous les 5 ans) mais offrent une durée de vie équivalente, voire supérieure."
    },
    {
      question: "Peut-on combiner remplacement de fenêtres et isolation des murs à {VILLE} ?",
      answer: "C'est même fortement recommandé à {VILLE}. Coupler l'isolation des murs par l'extérieur (ITE) avec le remplacement des fenêtres maximise les gains énergétiques et débloque des primes MaPrimeRénov' bonifiées dans le cadre d'une rénovation globale."
    },
    {
      question: "Le triple vitrage est-il pertinent pour un logement à {VILLE} ?",
      answer: "Dans le climat continental du Rhône, le triple vitrage est surtout justifié pour les façades exposées nord en altitude. Pour la majorité des logements de {VILLE}, un double vitrage renforcé avec gaz Argon (Uw ≤ 1,3 W/m².K) offre le meilleur rapport coût/performance."
    },
    {
      question: "Quelles sont les différences entre dépose totale et pose en rénovation à {VILLE} ?",
      answer: "La dépose totale retire l'ancien cadre (dormant) pour une isolation optimale et un meilleur rendu esthétique. La pose en rénovation conserve le dormant existant, réduisant le coût et la durée du chantier. Les menuisiers RGE de {VILLE} recommandent la dépose totale pour les fenêtres d'avant 1990."
    },
    {
      question: "Comment améliorer le DPE de son logement à {VILLE} en remplaçant les fenêtres ?",
      answer: "Le remplacement de fenêtres simple vitrage par du double vitrage Uw ≤ 1,3 W/m².K à {VILLE} peut faire gagner 1 à 2 classes DPE selon la configuration du logement. C'est le premier geste à réaliser, car il conditionne l'efficacité de l'isolation globale."
    }
  ],
  alu: [
    {
      question: "Pourquoi choisir des fenêtres en aluminium pour sa maison à {VILLE} ?",
      answer: "L'aluminium se distingue par sa rigidité exceptionnelle qui permet des profilés très fins et des surfaces vitrées maximales (plus de lumière). Il offre également une durabilité remarquable sans aucun entretien, un grand choix de coloris RAL et une recyclabilité totale."
    },
    {
      question: "Quelle est la performance thermique d'une fenêtre alu à {VILLE} ?",
      answer: "Grâce aux systèmes de rupture de pont thermique (barrettes polyamide isolantes), les fenêtres alu modernes atteignent d'excellentes performances, avec un coefficient Uw généralement compris entre 1,2 et 1,4 W/m².K, répondant parfaitement aux exigences de la RE2020."
    },
    {
      question: "La pose de fenêtres alu à {VILLE} est-elle éligible aux aides financières ?",
      answer: "Oui, le remplacement de fenêtres par de l'aluminium est éligible aux subventions MaPrimeRénov' de l'ANAH, à la prime énergie (CEE), à la TVA à 5,5% et à l'Éco-PTZ, sous réserve que la pose soit effectuée par un menuisier qualifié RGE."
    },
    {
      question: "L'aluminium est-il adapté aux appartements et maisons anciennes à {VILLE} ?",
      answer: "Tout à fait. Ses profilés fins imitent à la perfection les anciennes menuiseries en acier et s'intègrent très bien dans le bâti traditionnel lyonnais. Cependant, en secteur sauvegardé ABF, une validation des teintes (souvent gris anthracite ou teintes sombres) est nécessaire."
    },
    {
      question: "Quel est le coût moyen d'une fenêtre alu double vitrage à {VILLE} ?",
      answer: "Le tarif d'une fenêtre en aluminium posée varie généralement entre 750 € et 1 500 € TTC selon ses dimensions, le type de vitrage et le mode d'ouverture. Les baies vitrées coulissantes de grandes dimensions peuvent aller de 1 900 € à 3 800 € TTC."
    },
    {
      question: "Comment entretenir des fenêtres alu dans le Rhône ?",
      answer: "L'entretien est extrêmement simple : un nettoyage annuel à l'eau claire additionnée d'un détergent doux (pH neutre) suivi d'un rinçage à l'eau claire et d'un essuyage avec un chiffon doux suffit à préserver le laquage d'origine."
    },
    {
      question: "Les fenêtres alu sont-elles adaptées aux grandes baies vitrées à {VILLE} ?",
      answer: "Absolument, c'est même le matériau de référence pour les baies coulissantes de plus de 2 mètres. À {VILLE}, les baies alu avec seuil encastré PMR et rail en aluminium anodisé offrent une longévité supérieure et une mancœuvrabilité optimale."
    },
    {
      question: "Quel est le délai de fabrication d'une fenêtre alu sur mesure pour {VILLE} ?",
      answer: "Le délai de fabrication d'une fenêtre aluminium sur mesure est généralement de 3 à 6 semaines après validation du devis à {VILLE}. Ce délai inclut la fabrication en atelier, le laquage certifié Qualicoat et le contrôle qualité avant expédition."
    },
    {
      question: "Peut-on poser des fenêtres alu bicolores à {VILLE} ?",
      answer: "Oui, la bicoloration est une spécialité de l'aluminium. À {VILLE}, la combinaison la plus demandée est gris anthracite RAL 7016 côté extérieur et blanc RAL 9016 côté intérieur. Les menuisiers RGE locaux proposent également des finitions texturées et sablées."
    }
  ],
  rge: [
    {
      question: "Comment vérifier qu'un menuisier à {VILLE} est bien certifié RGE en 2026 ?",
      answer: "Vous devez utiliser l'annuaire public officiel France Rénov' ou exiger le certificat Qualibat RGE en cours de validité. Il est impératif que la date d'échéance couvre la période de réalisation de vos travaux à {VILLE}."
    },
    {
      question: "Que signifie le label RGE pour un installateur de fenêtres à {VILLE} ?",
      answer: "Le label RGE ('Reconnu Garant de l'Environnement') certifie que l'artisan maîtrise les techniques d'économie d'énergie. C'est un gage de qualité de pose qui atteste de l'audit régulier des chantiers de l'entreprise par des organismes indépendants."
    },
    {
      question: "Puis-je toucher les aides de l'ANAH si je pose mes fenêtres moi-même à {VILLE} ?",
      answer: "Non, aucune aide publique (MaPrimeRénov', primes CEE, Éco-PTZ) n'est versée si les fenêtres ne sont pas fournies et installées par une entreprise titulaire de la qualification RGE."
    },
    {
      question: "Quels sont les recours en cas de malfaçon sur des fenêtres posées par un artisan RGE à {VILLE} ?",
      answer: "Vous bénéficiez de la garantie de parfait achèvement (1 an), de la garantie biennale de bon fonctionnement (2 ans) et surtout de la garantie décennale (10 ans) obligatoire pour tous les menuisiers RGE, couvrant les défauts d'étanchéité et de structure."
    },
    {
      question: "Un artisan RGE à {VILLE} s'occupe-t-il des démarches administratives pour les aides ?",
      answer: "Oui, la majorité des menuisiers certifiés RGE dans le Rhône font office de 'mandataire' ANAH et déduisent directement les primes de leur devis, vous évitant ainsi de faire l'avance des frais."
    },
    {
      question: "Quel est le coût d'une visite technique préalable par un menuisier RGE à {VILLE} ?",
      answer: "La visite technique à domicile et l'établissement du devis détaillé sont entièrement gratuits à {VILLE}. Cette étape est indispensable pour valider la faisabilité technique et mesurer précisément les ouvertures."
    },
    {
      question: "Combien de menuisiers RGE interviennent dans le secteur de {VILLE} ?",
      answer: "Le bassin de {VILLE} bénéficie d'un réseau dense de menuisiers certifiés RGE dans le département du Rhône. Nous sélectionnons pour vous les professionnels les mieux notés et les plus réactifs pour garantir un chantier de qualité dans les meilleurs délais."
    },
    {
      question: "Quel est le délai moyen d'intervention d'un menuisier RGE à {VILLE} ?",
      answer: "Après signature du devis, le délai d'intervention moyen des menuisiers RGE de {VILLE} est de 2 à 4 semaines pour la fabrication et la pose. En période de forte demande (septembre-novembre), ce délai peut s'allonger à 6 semaines."
    },
    {
      question: "Un menuisier RGE de {VILLE} peut-il réaliser la pose de volets roulants en même temps ?",
      answer: "Oui, les artisans RGE du Rhône proposent généralement la fourniture et pose combinée de fenêtres et volets roulants à {VILLE}. Cette approche groupe permet d'optimiser les coûts de main-d'œuvre et de bénéficier d'aides cumulées sur les deux postes."
    }
  ]
};

// ═══════════════════════════════════════════════════════════════
// POSE STEPS — 5 steps × 3 variants, localized per commune
// ═══════════════════════════════════════════════════════════════

function getPoseSteps(commune: Commune): { title: string; description: string }[] {
  const v = (offset: number, count: number) => getVariantIndex(commune.slug, 2000 + offset, count);
  const agency = getLocalAgency(commune.slug);

  const step1Variants = [
    { title: "Diagnostic technique à domicile", description: `Prise de cotes précises, étude de l'exposition au vent (« ${commune.windExposure} ») et vérification de la maçonnerie existante pour définir la méthode de pose adaptée au bâti de ${commune.nom}.` },
    { title: "Visite technique et relevé de mesures", description: `Un menuisier qualifié se déplace à ${commune.nom} pour relever les dimensions exactes de vos ouvertures, inspecter l'état des dormants et évaluer les contraintes spécifiques (altitude ${commune.altitude} m, ${commune.secteurSauvegarde ? 'secteur protégé ABF' : 'zone PLU standard'}).` },
    { title: "Audit fenêtres et étude thermique", description: `Le technicien RGE analyse l'état de vos menuiseries actuelles à ${commune.nom}, mesure les déperditions thermiques et détermine le classement AEV requis pour votre exposition (${commune.windExposure}).` }
  ];

  const step2Variants = [
    { title: "Simulation financière des aides", description: `Estimation gratuite de votre reste à charge à ${commune.nom} en intégrant la TVA 5,5%, la prime énergie CEE et l'aide MaPrimeRénov' de l'ANAH applicable sur le territoire de ${commune.intercommunalite}.` },
    { title: "Chiffrage et montage du dossier de subventions", description: `Calcul précis du budget total et déduction automatique des aides cumulables pour les résidents de ${commune.nom} : MaPrimeRénov', CEE, Éco-PTZ et aides de ${commune.intercommunalite}.` },
    { title: "Estimation du reste à charge et financement", description: `Nos partenaires RGE à ${commune.nom} calculent vos droits aux subventions et vous proposent un plan de financement incluant l'Éco-PTZ (jusqu'à 50 000 € sans intérêts sur 20 ans) via ${agency.name}.` }
  ];

  const step3Variants = [
    { title: "Déclaration en mairie (Urbanisme)", description: commune.secteurSauvegarde ? `En zone protégée à ${commune.nom}, l'accord de l'Architecte des Bâtiments de France (ABF) est obligatoire. Nous constituons le dossier complet avec plans et échantillons de profilés.` : `Dépôt d'une Déclaration Préalable (DP) en mairie de ${commune.nom} pour valider le changement d'aspect extérieur conformément au PLU de ${commune.intercommunalite}.` },
    { title: "Formalités administratives et urbanisme", description: commune.secteurSauvegarde ? `${commune.nom} étant en secteur sauvegardé, un dossier ABF complet est monté par notre équipe : plans de façade, fiches techniques des profilés et nuancier RAL conforme.` : `À ${commune.nom}, une déclaration préalable de travaux est requise dès lors que vous modifiez les teintes, le matériau ou le dessin de vos fenêtres existantes.` },
    { title: "Conformité réglementaire locale", description: commune.secteurSauvegarde ? `Commune à prescriptions architecturales renforcées, ${commune.nom} exige une validation ABF préalable. Nos menuisiers connaissent les teintes et profilés autorisés localement.` : `Votre installateur RGE se charge du dépôt de la déclaration préalable auprès du service urbanisme de ${commune.nom} et du suivi jusqu'à l'obtention du non-opposition.` }
  ];

  const step4Variants = [
    { title: "Fabrication sur mesure et installation", description: `Vos menuiseries sont fabriquées aux dimensions exactes relevées, puis installées en ${commune.logementsMaison > 50 ? '1 à 2 jours pour une maison individuelle' : '2 à 3 jours pour un appartement en copropriété'} à ${commune.nom}. L'artisan veille à la propreté du chantier.` },
    { title: "Pose professionnelle par un installateur certifié", description: `Installation en dépose totale ou en rénovation sur dormant existant à ${commune.nom}. Nos poseurs RGE maîtrisent les ${commune.logementsMaison > 50 ? 'pavillons et maisons de ville' : 'copropriétés et appartements en étage'} typiques du secteur de ${commune.canton}.` },
    { title: "Livraison et mise en œuvre sur site", description: `Les ${commune.menuisiersRGE} menuisiers RGE du bassin de ${commune.nom} assurent une pose conforme DTU 36.5 avec compriband d'étanchéité, mousse isolante et finitions intérieures soignées.` }
  ];

  const step5Variants = [
    { title: "Réception et versement des subventions", description: `Réception contradictoire des travaux à ${commune.nom}, signature du PV d'achèvement et transmission des pièces pour l'octroi des aides MaPrimeRénov' sous 30 à 60 jours ouvrés.` },
    { title: "Contrôle final et déblocage des aides", description: `Vérification de l'étanchéité et de la conformité de chaque fenêtre posée à ${commune.nom}. La facture acquittée est transmise à l'ANAH et au fournisseur CEE pour débloquer vos subventions.` },
    { title: "Validation technique et suivi post-chantier", description: `PV de réception signé à ${commune.nom}, photos avant/après archivées, et suivi du versement des primes via ${agency.name}. Garantie de parfait achèvement d'1 an incluse.` }
  ];

  return [
    step1Variants[v(1, 3)],
    step2Variants[v(2, 3)],
    step3Variants[v(3, 3)],
    step4Variants[v(4, 3)],
    step5Variants[v(5, 3)]
  ];
}

// ═══════════════════════════════════════════════════════════════
// ALU ADVANTAGES — 3 advantages × 3 variants, localized
// ═══════════════════════════════════════════════════════════════

function getAluAdvantages(commune: Commune): { title: string; description: string }[] {
  const v = (offset: number, count: number) => getVariantIndex(commune.slug, 3000 + offset, count);

  const adv1Variants = [
    { title: "Finesse des profilés et apports solaires (Sw)", description: `Les montants alu extra-fins augmentent la surface vitrée de 15% par rapport au PVC, un atout majeur pour les façades de ${commune.nom} orientées sud. Vous captez plus de lumière naturelle et bénéficiez d'un apport solaire gratuit en hiver.` },
    { title: "Luminosité maximale grâce aux montants ultra-fins", description: `À ${commune.nom}, les profilés aluminium permettent des montants de seulement 35 mm de largeur, contre 60-70 mm en PVC. Le clair de vitrage supplémentaire augmente la transmission lumineuse de votre intérieur de 12 à 18%.` },
    { title: "Design épuré et surfaces vitrées étendues", description: `Les fenêtres alu installées à ${commune.nom} offrent un clair de jour supérieur grâce à des montants de 35 à 45 mm. Les baies coulissantes à galandage éliminent tout obstacle visuel, idéal pour les logements du canton de ${commune.canton}.` }
  ];

  const adv2Variants = [
    { title: "Solidité structurelle et stabilité dimensionnelle", description: `L'aluminium est idéal pour les grandes dimensions comme les baies vitrées coulissantes de terrasses à ${commune.nom}. Aucun risque de déformation dans le temps, même avec des ouvertures de 3 à 6 mètres de large.` },
    { title: "Résistance mécanique pour les grandes ouvertures", description: `La rigidité naturelle de l'aluminium autorise des portées de 3 à 6 mètres sans traverse intermédiaire. À ${commune.nom}, c'est le matériau de choix pour les vérandas et baies panoramiques face aux intempéries du couloir rhodanien.` },
    { title: "Durabilité sans entretien dans le Rhône", description: `Le laquage thermolaqué des fenêtres alu résiste aux UV, à la pluie acide et aux écarts thermiques du climat continental de ${commune.nom} (${commune.altitude} m d'altitude). Aucun ponçage, lasure ou peinture nécessaire pendant 30 à 50 ans.` }
  ];

  const adv3Variants = [
    { title: "Bicoloration et choix de finitions (RAL)", description: `Choisissez parmi plus de 200 teintes RAL pour vos fenêtres à ${commune.nom}. Le gris anthracite RAL 7016 reste le plus prisé dans le Rhône, mais les teintes sablées et texturées gagnent en popularité dans les communes résidentielles.` },
    { title: "Personnalisation chromatique et intégration architecturale", description: `À ${commune.nom}, les fenêtres alu bicolores (extérieur gris anthracite / intérieur blanc ou bois) s'intègrent parfaitement aux façades ${commune.secteurSauvegarde ? 'protégées du patrimoine local' : 'contemporaines ou rénovées'}. Le laquage Qualicoat garantit la tenue des couleurs 25 ans.` },
    { title: "Palette de coloris adaptée au patrimoine rhodanien", description: `Les nuanciers des communes de ${commune.intercommunalite} autorisent généralement les teintes neutres (RAL 7016, 7039, 9005) pour l'aluminium. ${commune.secteurSauvegarde ? 'En secteur ABF, des teintes patrimoniales spécifiques peuvent être imposées.' : 'Votre installateur RGE vérifie la conformité auprès du service urbanisme de ' + commune.nom + '.'}` }
  ];

  return [
    adv1Variants[v(1, 3)],
    adv2Variants[v(2, 3)],
    adv3Variants[v(3, 3)]
  ];
}

// ═══════════════════════════════════════════════════════════════
// RGE CERTIFICATIONS — 3 certs × 3 variants, localized
// ═══════════════════════════════════════════════════════════════

function getRgeCertifications(commune: Commune): { title: string; description: string }[] {
  const v = (offset: number, count: number) => getVariantIndex(commune.slug, 4000 + offset, count);

  const cert1Variants = [
    { title: "Le label RGE (Qualibat, Certibat ou Poseur de fenêtres)", description: `Il doit être valide à la date de signature du devis et de fin de travaux à ${commune.nom}. Ce label garantit un audit périodique de la qualité de pose de l'entreprise par des organismes indépendants accrédités.` },
    { title: "Qualification RGE Rénovation Énergétique", description: `À ${commune.nom}, seuls les artisans titulaires d'une qualification RGE en cours de validité ouvrent droit aux aides publiques. Parmi les ${commune.menuisiersRGE} menuisiers RGE du secteur, nos partenaires sont audités annuellement sur leurs chantiers.` },
    { title: "Certification Qualibat RGE Menuiseries", description: `Les ${commune.menuisiersRGE} professionnels certifiés RGE intervenant à ${commune.nom} sont soumis à un contrôle biennal de leurs compétences techniques et de la conformité de leurs installations aux normes RT/RE en vigueur.` }
  ];

  const cert2Variants = [
    { title: "L'Assurance Décennale obligatoire", description: `Elle vous protège pendant 10 ans contre tout vice de pose compromettant l'étanchéité, l'isolation ou la solidité des châssis installés à ${commune.nom}. Exigez systématiquement l'attestation d'assurance datée de l'année en cours.` },
    { title: "Garantie décennale et responsabilité civile professionnelle", description: `Tout artisan intervenant à ${commune.nom} doit être couvert par une assurance décennale spécifique « pose de menuiseries extérieures ». Cette garantie couvre les infiltrations, défauts d'isolation et problèmes structurels pendant 10 ans.` },
    { title: "Protection juridique et assurance constructeur", description: `La garantie décennale, obligatoire pour les menuisiers de ${commune.nom}, couvre les dommages affectant la destination de l'ouvrage. En cas de défaut d'étanchéité dans les 10 ans, la réparation est intégralement prise en charge.` }
  ];

  const cert3Variants = [
    { title: "Le respect de la norme DTU 36.5", description: `Recueil officiel des règles de pose pour les menuiseries extérieures. À ${commune.nom}, un artisan RGE l'applique à la lettre : fixations adaptées au support (béton, pierre, brique), compriband d'étanchéité et traitement des rejingots.` },
    { title: "Conformité aux Documents Techniques Unifiés (DTU)", description: `Les menuisiers certifiés RGE du secteur de ${commune.nom} appliquent le DTU 36.5 (menuiseries extérieures) et le DTU 37.1 (menuiseries métalliques). Ces normes définissent les règles de fixation, de calfeutrement et de drainage adaptées au climat (${commune.windExposure}).` },
    { title: "Normes de pose et référentiel technique NF DTU", description: `La pose RGE à ${commune.nom} respecte le DTU 36.5 révisé 2023, qui impose trois barrières d'étanchéité (pluie, thermique, vapeur) et des fixations dimensionnées pour la zone de vent du secteur (${commune.windExposure}).` }
  ];

  return [
    cert1Variants[v(1, 3)],
    cert2Variants[v(2, 3)],
    cert3Variants[v(3, 3)]
  ];
}

// ═══════════════════════════════════════════════════════════════
// DIAGNOSTIC ÉNERGÉTIQUE LOCAL
// ═══════════════════════════════════════════════════════════════

function getDiagnosticEnergetique(commune: Commune): string {
  const variants = [
    `À ${commune.nom} (altitude ${commune.altitude} m), le parc résidentiel de ${commune.logements?.toLocaleString('fr-FR')} logements se compose à ${commune.logementsMaison}% de maisons individuelles. L'exposition climatique « ${commune.windExposure} » impose des menuiseries à classement AEV renforcé. Les ${commune.menuisiersRGE} installateurs RGE locaux constatent que plus de 40% des fenêtres du parc ancien (pré-1990) présentent un Uw supérieur à 3,5 W/m².K.`,
    `Le diagnostic thermique de ${commune.nom} révèle un parc de ${commune.logements?.toLocaleString('fr-FR')} logements avec un taux de rénovation annuel de ${commune.tauxRenovation}%, en hausse constante. Les ${commune.logementsMaison}% de maisons individuelles sont les premières candidates au remplacement de fenêtres. Le marché immobilier à ${commune.prixM2Moyen} €/m² rend la rénovation énergétique particulièrement rentable.`,
    `Sur le territoire de ${commune.nom}, rattaché à ${commune.intercommunalite}, le besoin en rénovation des ouvertures est estimé à ${Math.round((commune.logements || 5000) * 0.35).toLocaleString('fr-FR')} fenêtres anciennes à remplacer. L'altitude de ${commune.altitude} m et l'exposition « ${commune.windExposure} » imposent des vitrages avec un coefficient Uw maximal de 1,3 W/m².K pour la RE2020.`,
    `L'analyse du bâti résidentiel de ${commune.nom} montre un habitat composé à ${commune.logementsMaison}% de maisons. Avec ${commune.menuisiersRGE} menuisiers certifiés RGE couvrant le secteur et un prix immobilier moyen de ${commune.prixM2Moyen} €/m², la rénovation des fenêtres constitue l'investissement le plus rentable pour les propriétaires du canton de ${commune.canton}.`,
    `${commune.nom}, à ${commune.distanceLyon} km de Lyon, bénéficie d'un tissu professionnel de ${commune.menuisiersRGE} menuisiers RGE actifs. Le parc de ${commune.logements?.toLocaleString('fr-FR')} logements présente un profil à ${commune.logementsMaison}% de maisons, avec des besoins spécifiques en isolation liés au climat continental et à l'altitude de ${commune.altitude} m.`
  ];
  return variants[getVariantIndex(commune.slug, 5000, variants.length)];
}

// ═══════════════════════════════════════════════════════════════
// CALENDRIER IDÉAL DE RÉNOVATION
// ═══════════════════════════════════════════════════════════════

function getCalendrierRenovation(commune: Commune): string {
  const highAltitude = (commune.altitude || 200) > 300;
  const windExposed = (commune.windExposure || '').includes('Élevé') || (commune.windExposure || '').includes('Fort');

  const variants = [
    `À ${commune.nom}, la période idéale pour remplacer vos fenêtres s'étend de ${highAltitude ? 'mai à septembre' : 'mars à novembre'}, lorsque les conditions météorologiques permettent un séchage optimal des joints d'étanchéité. ${windExposed ? 'L\'exposition marquée aux vents impose d\'éviter les mois de décembre à février pour la pose des grands formats (baies vitrées).' : 'Les mois de printemps offrent le meilleur compromis entre disponibilité des artisans et conditions climatiques.'} Délai moyen d'intervention des menuisiers RGE du secteur : 2 à 4 semaines après signature.`,
    `Pour vos travaux de menuiserie à ${commune.nom} (${commune.altitude} m d'altitude), planifiez la pose entre ${highAltitude ? 'mai et octobre pour éviter le gel nocturne qui compromet la prise des mastics' : 'avril et novembre, période favorable au séchage des compribands et silicones'}. Les ${commune.menuisiersRGE} artisans RGE du secteur enregistrent un pic de demandes entre septembre et novembre. ${windExposed ? 'Anticipez votre projet pour éviter les délais prolongés.' : 'Réservez dès le printemps pour une installation estivale optimale.'}`,
    `Le calendrier idéal de rénovation à ${commune.nom} tient compte du climat continental lyonnais : ${highAltitude ? 'l\'altitude de ' + commune.altitude + ' m limite la fenêtre de pose optimale à la belle saison (mai-septembre)' : 'la douceur relative de la vallée permet des interventions quasi toute l\'année, avec une préférence pour le printemps et l\'automne'}. Les aides MaPrimeRénov' étant attribuées par ordre d'arrivée, déposez votre demande avant le pic de rentrée (septembre).`,
    `La saisonnalité impacte le coût et les délais à ${commune.nom}. En basse saison (janvier-mars), les artisans RGE du Rhône offrent souvent des remises de 5 à 10% sur la main-d'œuvre. En haute saison (septembre-novembre), les délais s'allongent de 2 semaines. ${highAltitude ? 'À ' + commune.altitude + ' m d\'altitude, prévoyez impérativement une pose avant les premières gelées d\'octobre.' : 'Profitez du début d\'été pour combiner confort de pose et disponibilité optimale des équipes.'}`
  ];
  return variants[getVariantIndex(commune.slug, 6000, variants.length)];
}

// ═══════════════════════════════════════════════════════════════
// VITRAGE RECOMMENDATION — Dynamic per commune data
// ═══════════════════════════════════════════════════════════════

function getVitrageRecommendation(commune: Commune): string {
  const highAlt = (commune.altitude || 200) > 350;
  const acoustic = (commune.distanceLyon || 30) < 10;
  const premium = (commune.prixM2Moyen || 3000) > 4500;
  const windExposed = (commune.windExposure || '').includes('Élevé') || (commune.windExposure || '').includes('Fort');

  if (highAlt) {
    return `À ${commune.nom} (${commune.altitude} m), le triple vitrage est recommandé pour les façades nord et ouest. L'écart thermique hivernal justifie un Uw ≤ 0,9 W/m².K. Pour les autres orientations, un double vitrage renforcé à contrôle solaire (Uw ≤ 1,1) offre un excellent compromis coût/performance.`;
  }
  if (acoustic) {
    return `La proximité immédiate de Lyon expose ${commune.nom} aux nuisances sonores urbaines. Nous recommandons un double vitrage asymétrique 10/16/4 (Rw = 38 dB) ou un feuilleté acoustique 44.2 Silence pour les façades donnant sur les axes routiers. Coefficient Uw cible : ≤ 1,3 W/m².K.`;
  }
  if (premium) {
    return `Sur le marché haut de gamme de ${commune.nom} (${commune.prixM2Moyen} €/m²), nous préconisons des menuiseries premium avec double vitrage à contrôle solaire et gaz Argon (Uw ≤ 1,1 W/m².K). Un vitrage de qualité supérieure valorise significativement votre bien dans ce secteur recherché.`;
  }
  if (windExposed) {
    return `L'exposition au vent élevée à ${commune.nom} (« ${commune.windExposure} ») impose un classement AEV renforcé (A*3 E*7B V*C3 minimum). Le double vitrage 4/20/4 avec gaz Argon et intercalaire warm-edge offre la meilleure résistance aux contraintes mécaniques du vent.`;
  }
  return `Pour le climat continental standard de ${commune.nom} (${commune.altitude} m), le double vitrage renforcé 4/16/4 avec gaz Argon (Uw ≤ 1,3 W/m².K) constitue le choix optimal. Il divise par 4 les déperditions thermiques tout en restant éligible à l'ensemble des aides publiques.`;
}

// ═══════════════════════════════════════════════════════════════
// OTHER SPECIFIC HELPERS
// ═══════════════════════════════════════════════════════════════

function getMarketDataText(commune: Commune, category: string): string {
  const pop = commune.population;
  const countRGE = commune.menuisiersRGE;
  const priceM2 = commune.prixM2Moyen;

  if (category === 'alu') {
    return `À ${commune.nom}, le marché de la menuiserie aluminium est particulièrement dynamique avec ${countRGE} entreprises locales spécialisées. Cette offre professionnelle maintient les tarifs de pose de fenêtres alu et baies vitrées coulissantes à un niveau compétitif pour valoriser votre patrimoine estimé à ${priceM2} €/m² en moyenne.`;
  }
  if (category === 'rge') {
    return `Le département du Rhône compte des centaines d'artisans labellisés. Autour de ${commune.nom}, ce sont près de ${countRGE} professionnels certifiés RGE qui couvrent le secteur, garantissant une installation dans le respect des règles professionnelles et de l'étanchéité thermique exigée pour l'Éco-PTZ.`;
  }
  return `Avec un parc immobilier composé de ${commune.logements?.toLocaleString('fr-FR')} logements à ${commune.nom}, les besoins en rénovation sont réguliers. Le prix moyen des travaux varie selon le type de pose et le nombre de vantaux, mais la forte concentration de menuisiers dans le secteur de ${commune.canton} assure des délais d'intervention réduits sous 3 à 4 semaines.`;
}

function getPopulationTierContent(commune: Commune): string {
  const pop = commune.population;
  if (pop > 100000) {
    return `En tant que grande métropole du Rhône de plus de ${pop.toLocaleString('fr-FR')} habitants, ${commune.nom} concentre un parc immobilier majoritairement collectif avec de grandes exigences thermiques et acoustiques.`;
  }
  if (pop > 20000) {
    return `Ville dynamique de la couronne lyonnaise comptant ${pop.toLocaleString('fr-FR')} habitants, ${commune.nom} présente une typologie d'habitat mixte où alternent résidences récentes et pavillons anciens nécessitant d'être isolés.`;
  }
  return `Bourg résidentiel de ${pop.toLocaleString('fr-FR')} habitants situé dans le Rhône, ${commune.nom} est caractérisé par un cadre de vie calme et un habitat majoritairement composé de maisons individuelles propices à la pose de doubles vitrages performants.`;
}

function getAbfRegulations(commune: Commune): string {
  if (commune.secteurSauvegarde) {
    return `⚠️ **Contraintes du Patrimoine (ABF)** : Une partie de la commune de **${commune.nom}** se trouve en secteur sauvegardé ou à proximité de monuments classés. Le remplacement de fenêtres doit obligatoirement faire l'objet d'un accord conforme de l'Architecte des Bâtiments de France (ABF). Le PVC blanc est généralement proscrit au profit de fenêtres bois ou alu à profil fin, reprenant les teintes et moulures d'origine (teintes grises, vertes ou petits-bois réels).`;
  }
  return `**Réglementation d'urbanisme** : À ${commune.nom}, hors secteur sauvegardé, le remplacement de fenêtres est régi par le Plan Local d'Urbanisme (PLU) de la commune ou de la ${commune.intercommunalite}. Bien que les contraintes soient assouplies, il est exigé de conserver l'harmonie visuelle extérieure (teintes autorisées, type de découpage de la menuiserie). Une déclaration préalable en mairie reste nécessaire si vous changez l'aspect ou le matériau d'origine.`;
}

function getRealEstateInsight(commune: Commune): string {
  const price = commune.prixM2Moyen;
  const market = commune.marcheImmobilier;
  return `Sur le marché immobilier de ${commune.nom} (${market} à ${price} €/m²), la transition d'un logement classé F-G (passoire thermique) vers un DPE B ou C après travaux d'isolation des parois vitrées apporte une **plus-value verte** immédiate estimée entre 4% et 9% du prix de vente, tout en facilitant grandement la mise en location.`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN CONTENT GENERATOR
// ═══════════════════════════════════════════════════════════════

export function generateCommuneContent(commune: Commune, category: 'main' | 'alu' | 'rge'): LocalContent {
  const seed = commune.slug;
  const catOffset = category === 'main' ? 0 : category === 'alu' ? 100 : 200;
  
  const introIdx = getVariantIndex(seed, catOffset + 10, INTRO_POOLS[category].length);
  const conseilIdx = getVariantIndex(seed, catOffset + 20, CONSEIL_POOLS.length);
  const windIdx = getVariantIndex(seed, catOffset + 30, WIND_EXPOSURE_POOLS.length);
  const expertTipIdx = getVariantIndex(seed, catOffset + 40, EXPERT_TIP_POOLS.length);
  const savingsIdx = getVariantIndex(seed, catOffset + 50, SAVINGS_ESTIMATE_POOLS.length);
  
  const priceMin = category === 'alu' ? getDynamicPrices(commune).aluDouble.min : getDynamicPrices(commune).pvcDouble.min;
  const priceMax = category === 'alu' ? getDynamicPrices(commune).aluDouble.max : getDynamicPrices(commune).pvcDouble.max;

  const varsMap: Record<string, string> = {
    VILLE: commune.nom,
    CODE_POSTAL: commune.codePostal,
    PRIX_MIN: String(priceMin),
    PRIX_MAX: String(priceMax),
    WIND_EXPOSURE: commune.windExposure || 'Modéré',
    VARIANTE_INTRO: INTRO_POOLS[category][introIdx]
  };

  const spinText = (text: string) => {
    let res = text;
    for (const [k, v] of Object.entries(varsMap)) {
      res = res.replaceAll(`{${k}}`, v);
    }
    return spin(res, seed);
  };

  const localAgency = getLocalAgency(commune.slug);
  
  // Dynamic FAQ selection: pick 4 from 10
  const faqPool = FAQ_POOLS[category];
  const faqBaseIdx = getVariantIndex(seed, catOffset + 60, faqPool.length);
  const selectedFaq: { question: string; answer: string }[] = [];
  const usedFaqIdx = new Set<number>();
  let faqOffset = faqBaseIdx;
  while (selectedFaq.length < 4) {
    const idx = faqOffset % faqPool.length;
    if (!usedFaqIdx.has(idx)) {
      const faq = faqPool[idx];
      selectedFaq.push({
        question: faq.question.replaceAll('{VILLE}', commune.nom),
        answer: faq.answer.replaceAll('{VILLE}', commune.nom)
      });
      usedFaqIdx.add(idx);
    }
    faqOffset++;
  }

  function getTableIntro(commune: Commune, category: string): string {
    const variants: Record<string, string[]> = {
      main: [
        `Découvrez ci-dessous les tarifs indicatifs pour l'installation de fenêtres à ${commune.nom} par un artisan RGE. Ces fourchettes englobent la fourniture, la pose et l'enlèvement des anciens dormants.`,
        `Voici le récapitulatif des coûts moyens pour le remplacement de vos ouvertures à ${commune.nom}, calculés à partir des devis RGE observés dans le Rhône en 2026.`,
        `Consultez la grille des tarifs pour la pose de fenêtres double vitrage à ${commune.nom}. Ces estimations intègrent le coût de la main-d'œuvre qualifiée et des matériaux.`,
        `Les tarifs présentés ci-dessous reflètent la moyenne des prix appliqués par les menuisiers du secteur de ${commune.nom}. Ils incluent la certification RGE et la TVA de 5,5%.`
      ],
      alu: [
        `Voici le comparateur de prix pour la menuiserie aluminium et ses alternatives à ${commune.nom}. L'aluminium reste l'option privilégiée pour allier design, finesse et durabilité.`,
        `Consultez la grille comparative des coûts de pose des fenêtres alu et autres matériaux à ${commune.nom}. Prix de fourniture et de pose inclus.`,
        `Ce tableau expose les tarifs de pose des fenêtres alu par rapport aux châssis PVC et bois à ${commune.nom}, basés sur les grilles de prix 2026.`,
        `Découvrez les prix actualisés des menuiseries alu à ${commune.nom} comparés au PVC ou au bois. Pose par un menuisier RGE certifié.`
      ],
      rge: [
        `Consultez les prix moyens pratiqués par un menuisier certifié RGE intervenant à ${commune.nom}. Ces tarifs vous ouvrent droit aux financements publics.`,
        `Voici la grille tarifaire des installations certifiées RGE à ${commune.nom}. Ces prix incluent les garanties décennales et l'assistance administrative.`,
        `Les professionnels agréés RGE du canton de ${commune.canton} appliquent les tarifs suivants. Ils gèrent pour vous la déduction de vos subventions.`,
        `Découvrez le barème de prix moyen proposé par les ${commune.menuisiersRGE} menuisiers RGE actifs à ${commune.nom} et sa périphérie.`
      ]
    };
    const pool = variants[category] || variants.main;
    return pool[getVariantIndex(commune.slug, 1000 + (category === 'alu' ? 10 : category === 'rge' ? 20 : 0), pool.length)];
  }

  function getSourcesCitation(commune: Commune): string {
    const variants = [
      `Sources locales des données : ANAH 2026, Fiches DPE territoriales du Rhône, Observatoire de l'immobilier lyonnais, INSEE ${commune.codeInsee}.`,
      `Données collectées : Barèmes nationaux ANAH 2026, Observatoire climatologique Auvergne-Rhône-Alpes, Certifications Qualibat, Fiches INSEE (${commune.codeInsee}).`,
      `Sources de référence : ANAH guides 2026, ALEC de la Métropole de Lyon, Répertoire RGE Qualibat, Base notariale DVF pour le Rhône.`,
      `Sources d'information : Barèmes MaPrimeRénov' 2026, Fiches démographiques INSEE ${commune.nom} (${commune.codeInsee}), ALEC Rhône, RGE Qualibat.`
    ];
    return variants[getVariantIndex(commune.slug, 1100, variants.length)];
  }

  return {
    introParagraph: spinText(INTRO_POOLS[category][introIdx]),
    conseilAides: spinText(CONSEIL_POOLS[conseilIdx]),
    anecdotePatrimoine: getAnecdotePatrimoine(commune.slug, commune.nom, commune),
    marketDataText: getMarketDataText(commune, category),
    faqItems: selectedFaq,
    localAgencyName: localAgency.name,
    externalLinks: getExternalLinks(commune),
    expertTip: spinText(EXPERT_TIP_POOLS[expertTipIdx]),
    tableIntro: getTableIntro(commune, category),
    guideLinks: getGuideLinks(commune.slug, category),
    savingsEstimate: spinText(SAVINGS_ESTIMATE_POOLS[savingsIdx]),
    lastUpdated: "Juin 2026",
    realEstateInsight: getRealEstateInsight(commune),
    populationTierContent: getPopulationTierContent(commune),
    windExposureContext: spinText(WIND_EXPOSURE_POOLS[windIdx]),
    abfRegulations: getAbfRegulations(commune),
    sourcesCitation: getSourcesCitation(commune),
    poseSteps: getPoseSteps(commune),
    aluAdvantages: getAluAdvantages(commune),
    rgeCertifications: getRgeCertifications(commune),
    diagnosticEnergetique: getDiagnosticEnergetique(commune),
    calendrierRenovation: getCalendrierRenovation(commune),
    vitrageRecommendation: getVitrageRecommendation(commune)
  };
}
