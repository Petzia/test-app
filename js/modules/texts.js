// French interpretation texts. Keys match chart.js (sign index 0–11, planet keys, aspect keys).

export const SIGN_INFO = [
  { modality: 'cardinal', ruler: 'Mars', keywords: 'audace, élan, spontanéité', style: 'avec élan, franchise et une pointe d’impatience' },
  { modality: 'fixe', ruler: 'Vénus', keywords: 'stabilité, sensualité, patience', style: 'avec calme, constance et un vrai sens du concret' },
  { modality: 'mutable', ruler: 'Mercure', keywords: 'curiosité, esprit, légèreté', style: 'avec curiosité, vivacité et beaucoup de mots' },
  { modality: 'cardinal', ruler: 'la Lune', keywords: 'tendresse, protection, mémoire', style: 'avec sensibilité, pudeur et un fort besoin de sécurité' },
  { modality: 'fixe', ruler: 'le Soleil', keywords: 'rayonnement, générosité, fierté', style: 'avec chaleur, panache et le cœur sur la main' },
  { modality: 'mutable', ruler: 'Mercure', keywords: 'précision, service, analyse', style: 'avec soin, discernement et le souci du détail' },
  { modality: 'cardinal', ruler: 'Vénus', keywords: 'harmonie, élégance, diplomatie', style: 'avec grâce, tact et le désir d’équilibre' },
  { modality: 'fixe', ruler: 'Pluton', keywords: 'intensité, profondeur, magnétisme', style: 'avec intensité, mystère et une loyauté totale' },
  { modality: 'mutable', ruler: 'Jupiter', keywords: 'liberté, optimisme, quête de sens', style: 'avec enthousiasme, franchise et l’envie d’horizons lointains' },
  { modality: 'cardinal', ruler: 'Saturne', keywords: 'ambition, rigueur, persévérance', style: 'avec sérieux, retenue et une ambition patiente' },
  { modality: 'fixe', ruler: 'Uranus', keywords: 'originalité, indépendance, idéaux', style: 'avec originalité, détachement et un esprit libre' },
  { modality: 'mutable', ruler: 'Neptune', keywords: 'intuition, rêve, compassion', style: 'avec douceur, imagination et une grande empathie' },
];

export const PLANET_INFO = {
  sun: { domain: 'ton identité profonde et ta vitalité', energy: 'met en lumière', short: 'identité' },
  moon: { domain: 'tes émotions et tes besoins intimes', energy: 'colore l’humeur de', short: 'émotions' },
  mercury: { domain: 'ta façon de penser et de communiquer', energy: 'fait réfléchir sur', short: 'pensée' },
  venus: { domain: 'ta manière d’aimer et ce qui te plaît', energy: 'adoucit', short: 'amour' },
  mars: { domain: 'ton énergie, ton désir et ta façon d’agir', energy: 'dynamise', short: 'action' },
  jupiter: { domain: 'ta chance, ta confiance et ta générosité', energy: 'élargit', short: 'chance' },
  saturn: { domain: 'tes responsabilités et ce que tu construis dans la durée', energy: 'met à l’épreuve', short: 'structure' },
  uranus: { domain: 'ton besoin de liberté et de changement', energy: 'bouscule', short: 'liberté' },
  neptune: { domain: 'tes rêves, ton intuition et ta spiritualité', energy: 'rend flou et inspiré', short: 'rêve' },
  pluto: { domain: 'tes transformations profondes et ton pouvoir intérieur', energy: 'transforme en profondeur', short: 'transformation' },
  asc: { domain: 'la façon dont tu te présentes au monde', energy: '', short: 'image' },
  mc: { domain: 'ta vocation et ton image publique', energy: '', short: 'vocation' },
};

export const SUN_TEXT = [
  'Pionnier·ère dans l’âme, tu avances en premier et tu réfléchis ensuite. Ton courage est contagieux ; ton défi est d’apprendre la patience.',
  'Tu as besoin de bases solides et de plaisirs simples. Fiable et sensuel·le, tu construis lentement mais sûrement — et tu ne lâches rien.',
  'Ton esprit va vite et partout. Tu relies les gens et les idées ; ton défi est de choisir et de t’y tenir.',
  'Tu ressens tout, très fort. Ton foyer et tes proches sont ton centre de gravité ; tu protèges ceux que tu aimes avec une loyauté immense.',
  'Tu es fait·e pour briller et réchauffer les autres. Généreux·se et créatif·ve, tu as besoin d’être vu·e — et reconnu·e — pour ce que tu es.',
  'Tu améliores tout ce que tu touches. Observateur·rice et serviable, tu as l’œil pour le détail ; apprends à être aussi doux·ce avec toi qu’avec les autres.',
  'Tu cherches l’harmonie, la beauté et le juste milieu. Charmant·e et diplomate, tu t’épanouis à deux ; ton défi est d’oser trancher.',
  'Rien ne t’intéresse à moitié. Intense et perspicace, tu vois sous la surface ; tu te transformes à chaque crise et tu en ressors plus fort·e.',
  'Tu as besoin d’espace, de sens et d’aventure. Optimiste et franc·he, tu inspires par ton enthousiasme ; attention à ne pas promettre trop.',
  'Tu vises haut et tu prends ton temps. Responsable et lucide, tu gagnes en assurance avec les années ; laisse-toi aussi le droit de jouer.',
  'Tu penses différemment et tu le sais. Indépendant·e et idéaliste, tu rêves d’un monde plus juste ; ton défi est de laisser approcher l’intimité.',
  'Tu ressens le monde comme une éponge. Intuitif·ve et compatissant·e, tu as une imagination immense ; protège ta sensibilité avec des limites claires.',
];

export const MOON_TEXT = [
  'Tes émotions sont vives et immédiates : tu t’enflammes vite et tu oublies vite. Tu as besoin d’action pour te sentir bien.',
  'Tu te sens en sécurité dans le confort, la nature et la routine. Un bon repas et des bras rassurants apaisent tout.',
  'Tu digères tes émotions en parlant. Tu as besoin de variété, d’échanges et de légèreté pour te sentir vivant·e.',
  'Ta Lune est chez elle : tu es profondément sensible, nostalgique et protecteur·rice. Ton cocon est sacré.',
  'Tu as besoin d’attention, de tendresse démonstrative et de fierté. Tu aimes avec un grand cœur et beaucoup de théâtre.',
  'Tu te rassures en organisant et en rendant service. Tu ressens beaucoup mais tu l’analyses avant de le montrer.',
  'Tu as besoin d’harmonie autour de toi : les conflits t’épuisent. Tu te sens bien dans une relation équilibrée et un décor beau.',
  'Tes émotions sont profondes, secrètes et intenses. Tu donnes ta confiance rarement, mais totalement.',
  'Tu as besoin de liberté émotionnelle et de rire. L’ennui est ton pire ennemi ; l’aventure te répare.',
  'Tu contrôles tes émotions et tu as besoin de te sentir utile et solide. Derrière la réserve se cache une grande fidélité.',
  'Tu prends du recul face à tes émotions. Tu as besoin d’amitié, d’espace et d’être aimé·e pour ta singularité.',
  'Tu absorbes l’humeur des autres sans le vouloir. Musique, rêve et solitude créative te ressourcent.',
];

export const ASC_TEXT = [
  'On te perçoit direct·e, énergique et sans détour. Tu entres dans une pièce comme on ouvre une porte en grand.',
  'On te perçoit calme, posé·e et rassurant·e. Ta présence apaise ; tu dégages une élégance naturelle.',
  'On te perçoit vif·ve, drôle et curieux·se. Tu engages la conversation avec n’importe qui.',
  'On te perçoit doux·ce, attentionné·e et un peu réservé·e. Les gens se confient facilement à toi.',
  'On te remarque : chaleureux·se, solaire, tu as une vraie prestance. Tu donnes envie de faire la fête.',
  'On te perçoit soigné·e, discret·ète et compétent·e. Tu inspires confiance par ta fiabilité.',
  'On te perçoit charmant·e, élégant·e et diplomate. Tu mets naturellement les gens à l’aise.',
  'On te perçoit magnétique et un peu mystérieux·se. Ton regard en dit long, et tu observes avant de te livrer.',
  'On te perçoit ouvert·e, joyeux·se et aventurier·ère. Ta bonne humeur est communicative.',
  'On te perçoit sérieux·se, mature et maître de toi. On te prend vite au sérieux — et on n’a pas tort.',
  'On te perçoit original·e, amical·e et un peu insaisissable. Tu ne ressembles à personne.',
  'On te perçoit doux·ce, rêveur·se et empathique. Il y a quelque chose de poétique dans ta présence.',
];

export const HOUSE_TEXT = [
  'la personnalité et l’apparence',
  'l’argent, les ressources et l’estime de soi',
  'la communication, les proches et les trajets',
  'le foyer, la famille et les racines',
  'l’amour, la créativité et le plaisir',
  'le travail quotidien, la santé et les habitudes',
  'le couple et les associations',
  'l’intimité, les crises et les transformations',
  'les voyages, les études et la quête de sens',
  'la carrière et la réputation',
  'les amis, les projets et les idéaux',
  'l’inconscient, la solitude et la spiritualité',
];

export const ASPECT_TEXT = {
  conjunction: { tone: 'fusion', natal: 'se mêlent et se renforcent', transit: 'active intensément', advice: 'Un nouveau cycle commence : sois attentif·ve à ce qui naît.' },
  sextile: { tone: 'opportunité', natal: 'collaborent facilement', transit: 'ouvre une porte vers', advice: 'Une occasion se présente : il suffit de faire le premier pas.' },
  square: { tone: 'tension', natal: 'se frottent et te poussent à grandir', transit: 'met la pression sur', advice: 'Une friction utile : ne force pas, ajuste.' },
  trine: { tone: 'harmonie', natal: 'coulent ensemble naturellement', transit: 'soutient en douceur', advice: 'Tout coule : profite de ce vent favorable.' },
  opposition: { tone: 'polarité', natal: 'se tirent dans des directions opposées', transit: 'te met face à', advice: 'Cherche l’équilibre plutôt que le gagnant.' },
};

export const RETROGRADE_TEXT = {
  mercury: 'Mercure rétrograde : relis tes messages, vérifie les contrats, attends-toi aux retards. Idéal pour revoir, reprendre, renouer.',
  venus: 'Vénus rétrograde : les ex reviennent, les goûts changent. Bon moment pour réfléchir à ce que tu aimes vraiment.',
  mars: 'Mars rétrograde : l’énergie baisse ou tourne en rond. Finis plutôt que de commencer.',
  jupiter: 'Jupiter rétrograde : la croissance se fait à l’intérieur. Fais le point sur tes croyances.',
  saturn: 'Saturne rétrograde : revois tes engagements et tes limites, sans pression extérieure.',
  uranus: 'Uranus rétrograde : les envies de changement mûrissent en silence.',
  neptune: 'Neptune rétrograde : les illusions se dissipent, la lucidité revient.',
  pluto: 'Pluton rétrograde : un grand ménage intérieur se fait, en profondeur.',
};

export const MOON_SIGN_MOOD = [
  'Lune en Bélier : journée vive, on a envie d’agir tout de suite.',
  'Lune en Taureau : besoin de calme, de confort et de bonnes choses.',
  'Lune en Gémeaux : on papote, on butine, on change d’avis.',
  'Lune en Cancer : sensibilité à fleur de peau, envie de cocon.',
  'Lune en Lion : envie de briller, de créer et d’être applaudi·e.',
  'Lune en Vierge : parfait pour ranger, trier et prendre soin de soi.',
  'Lune en Balance : on cherche l’harmonie, la beauté et la compagnie.',
  'Lune en Scorpion : émotions intenses, conversations profondes.',
  'Lune en Sagittaire : soif de liberté, d’aventure et de rire.',
  'Lune en Capricorne : on se concentre et on avance sur ses objectifs.',
  'Lune en Verseau : esprit libre, envie d’amis et d’idées neuves.',
  'Lune en Poissons : rêverie, intuition et besoin de douceur.',
];

const SYNASTRY_PAIRS = {
  'sun-moon': 'Le Soleil de l’un éclaire la Lune de l’autre : un des liens les plus classiques des couples durables.',
  'venus-mars': 'Vénus et Mars : l’attirance, le désir, l’étincelle physique.',
  'moon-moon': 'Vos Lunes se parlent : c’est le confort émotionnel, le fait de se sentir « à la maison » ensemble.',
  'sun-sun': 'Vos Soleils se répondent : vos identités et vos façons de briller interagissent.',
  'venus-venus': 'Vos Vénus se rencontrent : goûts, plaisirs et façon d’aimer.',
  'moon-venus': 'La Lune et Vénus : tendresse, douceur et affection naturelle.',
  'sun-venus': 'Le Soleil et Vénus : admiration, charme et plaisir d’être ensemble.',
  'sun-asc': 'Le Soleil de l’un touche l’Ascendant de l’autre : une reconnaissance immédiate, dès le premier regard.',
  'moon-asc': 'La Lune touche l’Ascendant : on se sent compris·e sans avoir à s’expliquer.',
  'venus-asc': 'Vénus touche l’Ascendant : l’un trouve l’autre beau, tout simplement.',
  'mars-mars': 'Vos Mars se rencontrent : votre énergie, vos disputes et votre façon d’agir ensemble.',
  'mercury-mercury': 'Vos Mercures se répondent : la façon dont vous vous parlez et vous comprenez.',
  'saturn-moon': 'Saturne et la Lune : sécurité et engagement, parfois un peu de froideur à apprivoiser.',
  'saturn-venus': 'Saturne et Vénus : un lien sérieux et fidèle, qui se construit dans le temps.',
  'saturn-sun': 'Saturne et le Soleil : l’un structure l’autre ; du solide, avec parfois un sentiment de contrôle.',
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// "de Anna" → "d’Anna"
export const ofName = (name) => (/^[aeiouyhàâéèêëîïôûü]/i.test(name) ? `d’${name}` : `de ${name}`);

export function natalAspectText(keyA, keyB, aspectKey) {
  return capitalize(`${PLANET_INFO[keyA].short} et ${PLANET_INFO[keyB].short} ${ASPECT_TEXT[aspectKey].natal}.`);
}

const SYNASTRY_TONE = {
  conjunction: 'Ce lien est fusionnel : très fort, dans un sens comme dans l’autre.',
  sextile: 'Ici, ça coule tout seul : une belle facilité à cultiver.',
  trine: 'Ici, l’harmonie est naturelle : un vrai cadeau.',
  square: 'Mais ici, ça frotte : ce lien demande de l’ajustement et de la patience.',
  opposition: 'Mais ici, vous êtes en miroir : attirance et désaccords vont ensemble.',
};

export function synastryText(keyA, keyB, aspectKey) {
  const pair = SYNASTRY_PAIRS[`${keyA}-${keyB}`] ?? SYNASTRY_PAIRS[`${keyB}-${keyA}`];
  const base = pair ?? capitalize(`${PLANET_INFO[keyA].short} et ${PLANET_INFO[keyB].short} entrent en relation.`);
  return `${base} ${SYNASTRY_TONE[aspectKey]}`;
}

const HARMONY_LABEL = {
  conjunction: 'fusionne avec', sextile: 'stimule', square: 'défie', trine: 's’accorde avec', opposition: 'fait face à',
};
export const harmonyVerb = (aspectKey) => HARMONY_LABEL[aspectKey];

export function scoreLabel(score) {
  if (score >= 80) return 'Connexion céleste ✨';
  if (score >= 65) return 'Très belle alchimie';
  if (score >= 50) return 'Bonne entente, avec du travail';
  if (score >= 35) return 'Relation stimulante… et piquante';
  return 'Défi cosmique : opposés qui s’attirent ?';
}

export const ELEMENT_TEXT = {
  feu: 'Feu : élan, passion, spontanéité.',
  terre: 'Terre : concret, sens pratique, stabilité.',
  air: 'Air : idées, échanges, légèreté.',
  eau: 'Eau : émotion, intuition, profondeur.',
};
