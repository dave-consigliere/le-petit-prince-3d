/**
 * Paramètres globaux du projet (Architecture.md §5 — configuration/).
 * Toute constante « magique » doit être déclarée ici plutôt que dispersée.
 */
export const CONFIG = {
  /** Fréquence des mises à jour logiques, en Hz (boucle à pas fixe). */
  FREQUENCE_MAJ_FIXE: 60,

  /** Ratio de pixels maximal sur GPU dédié. */
  RATIO_PIXELS_MAX: 2,
  /** Ratio de pixels sur GPU intégré (écrans haute densité détectés). */
  RATIO_PIXELS_INTEGRE: 1.5,

  /** Réglages du joueur (vitesses en m/s, amortissements en 1/s). */
  JOUEUR: {
    VITESSE_MARCHE: 3,
    VITESSE_COURSE: 6.5,
    /** Raideur de l'amortissement de la vitesse (départs/arrêts doux). */
    AMORTISSEMENT_VITESSE: 8,
    /** Raideur de la rotation de l'avatar vers sa direction de marche. */
    VITESSE_ROTATION: 10,
    /** Rayon de la « capsule » du joueur pour les obstacles du décor. */
    RAYON_COLLISION: 0.35,
  },

  /** Réglages de la caméra orbitale de suivi. */
  CAMERA: {
    DISTANCE_DEFAUT: 6,
    DISTANCE_MIN: 3,
    DISTANCE_MAX: 11,
    TANGAGE_DEFAUT: 0.42,
    TANGAGE_MIN: -0.1,
    TANGAGE_MAX: 1.15,
    /** Point visé au-dessus des pieds du joueur (regard à hauteur d'épaule). */
    HAUTEUR_VISEE: 1.0,
    SENSIBILITE: 0.004,
    SENSIBILITE_MOLETTE: 0.004,
    LISSAGE_POSITION: 7,
    /** Vitesse de ré-alignement du rig sur le « haut » local (gravité). */
    VITESSE_ALIGNEMENT: 5,
  },

  /** Terrain du désert : la même fonction sert au visuel et au sol physique. */
  TERRAIN_DESERT: {
    TAILLE: 340,
    SEGMENTS: 150,
    AMPLITUDE: 5.5,
    FREQUENCE: 0.012,
    OCTAVES: 4,
    GRAINE: 612, // clin d'œil à B-612
    /** Limite circulaire de déplacement du joueur. */
    RAYON_MONDE: 130,
  },

  /** Prototype B-612 (jalon M1 : validation de la gravité sphérique). */
  PROTO_B612: {
    RAYON: 8,
  },

  /** Palette « aquarelle » du désert (fin d'après-midi doux). */
  PALETTE_DESERT: {
    cielHaut: '#8ec5d6',
    cielBas: '#f6d7a7',
    sable: 0xe9c79b,
    roche: 0xcfae8e,
    brume: 0xf3d9b1,
    lumiereChaude: 0xfff1da,
    lumiereCiel: 0xbfd9ea,
    lumiereSol: 0xe8c89a,
    planete: 0xd9a7b0,
  },

  /** Palette du prototype B-612 (nuit spatiale douce, jamais angoissante). */
  PALETTE_B612: {
    cielHaut: '#1c2b53',
    cielBas: '#4a3a6b',
    sol: 0xd8b48e,
    volcanActif: 0xb98d6e,
    volcanEteint: 0x9b8a7c,
    rose: 0xd5485e,
    tige: 0x6f9a72,
    lumierePrincipale: 0xdfe6ff,
    lumiereCiel: 0x8fa3d9,
    lumiereSol: 0x6b5a8a,
  },

  /** Palettes des six planètes visitées. */
  PALETTES_PLANETES: {
    roi: {
      cielHaut: '#3a1a5a',
      cielBas: '#7a3a8a',
      sol: 0x9b7ebf,
      lumiere: 0xf0d8ff,
      ambiance: 0x7a5a9a,
    },
    vaniteux: {
      cielHaut: '#4a3a1a',
      cielBas: '#c8a830',
      sol: 0xe8c850,
      lumiere: 0xfff8d0,
      ambiance: 0xb8a040,
    },
    buveur: {
      cielHaut: '#1a2a3a',
      cielBas: '#3a4a5a',
      sol: 0x7a8a9a,
      lumiere: 0xc0d0e0,
      ambiance: 0x6a7a8a,
    },
    businessman: {
      cielHaut: '#2a2a2a',
      cielBas: '#4a4a4a',
      sol: 0x8a8a7a,
      lumiere: 0xd0d0c0,
      ambiance: 0x6a6a5a,
    },
    allumeur: {
      cielHaut: '#0a0a1a',
      cielBas: '#1a1a3a',
      sol: 0x5a5a8a,
      lumiere: 0xffe8a0,
      ambiance: 0x3a3a6a,
    },
    geographe: {
      cielHaut: '#2a1a0a',
      cielBas: '#6a4a2a',
      sol: 0xc8a870,
      lumiere: 0xfff0d0,
      ambiance: 0x9a7a5a,
    },
  } as const,

  /** Rayon commun des petites planètes. */
  RAYON_PLANETE: 7,

  /** Intensités du post-traitement « papier aquarelle ». */
  POST_TRAITEMENT: {
    grain: 0.045,
    vignette: 0.35,
  },
} as const;
