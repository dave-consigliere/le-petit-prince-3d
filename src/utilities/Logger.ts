/**
 * Système de journalisation du projet (Architecture.md §13).
 * Quatre niveaux : Débogage, Information, Avertissement, Erreur.
 * Le niveau minimal est configurable afin de réduire le bruit en production.
 */
export enum NiveauJournal {
  Debogage = 0,
  Information = 1,
  Avertissement = 2,
  Erreur = 3,
}

export class Logger {
  /** Niveau minimal affiché. En production, passer à Avertissement. */
  static niveauMinimal: NiveauJournal = NiveauJournal.Debogage;

  private static horodatage(): string {
    return new Date().toISOString().substring(11, 23);
  }

  static debogage(message: string, ...details: unknown[]): void {
    if (Logger.niveauMinimal <= NiveauJournal.Debogage) {
      console.debug(`[${Logger.horodatage()}] [DÉBOG.] ${message}`, ...details);
    }
  }

  static info(message: string, ...details: unknown[]): void {
    if (Logger.niveauMinimal <= NiveauJournal.Information) {
      console.info(`[${Logger.horodatage()}] [INFO ] ${message}`, ...details);
    }
  }

  static avertissement(message: string, ...details: unknown[]): void {
    if (Logger.niveauMinimal <= NiveauJournal.Avertissement) {
      console.warn(`[${Logger.horodatage()}] [AVERT.] ${message}`, ...details);
    }
  }

  static erreur(message: string, ...details: unknown[]): void {
    if (Logger.niveauMinimal <= NiveauJournal.Erreur) {
      console.error(`[${Logger.horodatage()}] [ERREUR] ${message}`, ...details);
    }
  }
}
