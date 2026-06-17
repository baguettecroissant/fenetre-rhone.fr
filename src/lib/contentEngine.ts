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
  "Les propriétaires bailleurs de {VILLE} peuvent également prétendre aux aides de l'État sous réserve de confier les chantiers à un installateur RGE et de s'engager à louer le bien à titre de résidence principale."
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
  "Recommandation de pose : Un calfeutrement de fenêtre efficace exige trois barrières distinctes : une étanchéité extérieure à la pluie battante (compriband), une isolation thermique intermédiaire (mousse imprégnée) et une étanchéité intérieure à la vapeur d'eau."
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
  `Remplacer des menuiseries dégradées à {VILLE} empêche la pénétration d'humidité et la formation de condensation sur le verre intérieur. Des profilés récents avec intercalaires warm-edge protègent la salubrité de vos peintures et de vos murs.`
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
      answer: "La visite technique à domicile et l'établissement du devis détaillé sont entièrement gratuits. Cette étape est indispensable pour valider la faisabilité technique et mesurer précisément les ouvertures."
    }
  ]
};

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
  
  // Dynamic FAQ selection: pick 3 from 6
  const faqPool = FAQ_POOLS[category];
  const faqBaseIdx = getVariantIndex(seed, catOffset + 60, faqPool.length);
  const selectedFaq: { question: string; answer: string }[] = [];
  const usedFaqIdx = new Set<number>();
  let faqOffset = faqBaseIdx;
  while (selectedFaq.length < 3) {
    const idx = faqOffset % faqPool.length;
    if (!usedFaqIdx.has(idx)) {
      const faq = faqPool[idx];
      selectedFaq.push({
        question: faq.question.replaceAll('{VILLE}', commune.nom),
        answer: faq.answer
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
    expertTip: EXPERT_TIP_POOLS[expertTipIdx],
    tableIntro: getTableIntro(commune, category),
    guideLinks: getGuideLinks(commune.slug, category),
    savingsEstimate: spinText(SAVINGS_ESTIMATE_POOLS[savingsIdx]),
    lastUpdated: "Juin 2026",
    realEstateInsight: getRealEstateInsight(commune),
    populationTierContent: getPopulationTierContent(commune),
    windExposureContext: spinText(WIND_EXPOSURE_POOLS[windIdx]),
    abfRegulations: getAbfRegulations(commune),
    sourcesCitation: getSourcesCitation(commune)
  };
}
