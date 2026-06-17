import { Logger } from '../../utilities/Logger';

/**
 * Service de préférences utilisateur (M6).
 *
 * Centralise tous les réglages persistants : volumes audio, taille
 * de texte, contraste, sous-titres. Sauvegarde dédiée (clé propre)
 * pour survivre à un reset de partie.
 */

const CLE_PREFERENCES = 'lpp3d_preferences_v1';

export interface Preferences {
  volumeMusique: number; // 0–1
  volumeAmbiance: number; // 0–1
  volumeEffets: number; // 0–1
  muet: boolean;
  tailleTexte: 'normal' | 'grand' | 'tres-grand';
  contrasteEleve: boolean;
  sousTitres: boolean;
}

const PAR_DEFAUT: Preferences = {
  volumeMusique: 0.35,
  volumeAmbiance: 0.12,
  volumeEffets: 0.5,
  muet: false,
  tailleTexte: 'normal',
  contrasteEleve: false,
  sousTitres: true,
};

export class PreferencesService {
  private interne: Preferences = { ...PAR_DEFAUT };
  private readonly auditeurs = new Set<(p: Preferences) => void>();

  charger(): void {
    try {
      const brut = localStorage.getItem(CLE_PREFERENCES);
      if (!brut) return;
      const charge = JSON.parse(brut) as Partial<Preferences>;
      this.interne = { ...PAR_DEFAUT, ...charge };
      this.appliquerStylesAccessibilite();
      Logger.info('Préférences chargées.');
    } catch (erreur) {
      Logger.erreur('Échec du chargement des préférences.', erreur);
    }
  }

  sauvegarder(): void {
    try {
      localStorage.setItem(CLE_PREFERENCES, JSON.stringify(this.interne));
    } catch (erreur) {
      Logger.erreur('Échec de la sauvegarde des préférences.', erreur);
    }
  }

  get preferences(): Readonly<Preferences> {
    return this.interne;
  }

  modifier<K extends keyof Preferences>(cle: K, valeur: Preferences[K]): void {
    this.interne[cle] = valeur;
    this.sauvegarder();
    this.appliquerStylesAccessibilite();
    for (const cb of this.auditeurs) cb(this.interne);
  }

  reinitialiser(): void {
    this.interne = { ...PAR_DEFAUT };
    this.sauvegarder();
    this.appliquerStylesAccessibilite();
    for (const cb of this.auditeurs) cb(this.interne);
  }

  abonner(cb: (p: Preferences) => void): () => void {
    this.auditeurs.add(cb);
    return () => this.auditeurs.delete(cb);
  }

  /** Applique les classes CSS d'accessibilité sur <body>. */
  private appliquerStylesAccessibilite(): void {
    const corps = document.body;
    corps.classList.remove('taille-texte-normal', 'taille-texte-grand', 'taille-texte-tres-grand');
    corps.classList.add(`taille-texte-${this.interne.tailleTexte}`);
    corps.classList.toggle('contraste-eleve', this.interne.contrasteEleve);
    corps.classList.toggle('sous-titres-off', !this.interne.sousTitres);
  }
}
