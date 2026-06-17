import type { PreferencesService, Preferences } from '../../game/preferences/PreferencesService';

/**
 * Menu paramètres — volumes audio + accessibilité (M6).
 * Ouvrable depuis le menu principal ou le menu pause.
 */

export class MenuParametres {
  private readonly racine: HTMLDivElement;
  private callbackRetour: (() => void) | null = null;

  constructor(private readonly preferences: PreferencesService) {
    this.racine = document.createElement('div');
    this.racine.id = 'menu-parametres';
    this.racine.hidden = true;
    this.racine.setAttribute('role', 'dialog');
    this.racine.setAttribute('aria-label', 'Paramètres');

    const panneau = document.createElement('div');
    panneau.className = 'parametres-panneau';

    const titre = document.createElement('h2');
    titre.className = 'parametres-titre';
    titre.textContent = 'Paramètres';

    panneau.append(titre);
    panneau.append(this.creerSection('Audio', this.construireSectionAudio()));
    panneau.append(this.creerSection('Accessibilité', this.construireSectionAccessibilite()));

    const ligneBoutons = document.createElement('div');
    ligneBoutons.className = 'parametres-ligne-boutons';

    const btnReset = document.createElement('button');
    btnReset.className = 'menu-bouton bouton-secondaire';
    btnReset.textContent = 'Réinitialiser';
    btnReset.addEventListener('click', () => {
      this.preferences.reinitialiser();
      this.synchroniser();
    });

    const btnRetour = document.createElement('button');
    btnRetour.className = 'menu-bouton';
    btnRetour.textContent = 'Retour';
    btnRetour.addEventListener('click', () => this.callbackRetour?.());

    ligneBoutons.append(btnReset, btnRetour);
    panneau.append(ligneBoutons);
    this.racine.appendChild(panneau);
    document.body.appendChild(this.racine);
  }

  ouvrir(): void {
    this.synchroniser();
    this.racine.hidden = false;
    requestAnimationFrame(() => {
      this.racine
        .querySelector<
          HTMLInputElement | HTMLButtonElement | HTMLSelectElement
        >('input, select, button')
        ?.focus();
    });
  }

  fermer(): void {
    this.racine.hidden = true;
  }
  surRetour(cb: () => void): void {
    this.callbackRetour = cb;
  }

  // ---------------------------------------------------------------- privé

  private creerSection(titre: string, contenu: HTMLElement): HTMLElement {
    const section = document.createElement('section');
    section.className = 'parametres-section';
    const h = document.createElement('h3');
    h.textContent = titre;
    section.append(h, contenu);
    return section;
  }

  private construireSectionAudio(): HTMLElement {
    const div = document.createElement('div');

    div.append(this.creerCurseur('Musique', 'volumeMusique'));
    div.append(this.creerCurseur('Ambiance', 'volumeAmbiance'));
    div.append(this.creerCurseur('Effets', 'volumeEffets'));
    div.append(this.creerCase('Muet', 'muet'));
    return div;
  }

  private construireSectionAccessibilite(): HTMLElement {
    const div = document.createElement('div');

    // Taille du texte (sélecteur)
    const lignTaille = document.createElement('label');
    lignTaille.className = 'param-ligne';
    const lblTaille = document.createElement('span');
    lblTaille.textContent = 'Taille du texte';
    const select = document.createElement('select');
    select.dataset['cle'] = 'tailleTexte';
    for (const [v, l] of [
      ['normal', 'Normal'],
      ['grand', 'Grand'],
      ['tres-grand', 'Très grand'],
    ]) {
      const opt = document.createElement('option');
      opt.value = v!;
      opt.textContent = l!;
      select.append(opt);
    }
    select.addEventListener('change', () => {
      this.preferences.modifier('tailleTexte', select.value as Preferences['tailleTexte']);
    });
    lignTaille.append(lblTaille, select);
    div.append(lignTaille);

    div.append(this.creerCase('Contraste élevé', 'contrasteEleve'));
    div.append(this.creerCase('Sous-titres des dialogues', 'sousTitres'));
    return div;
  }

  private creerCurseur(libelle: string, cle: keyof Preferences): HTMLElement {
    const lig = document.createElement('label');
    lig.className = 'param-ligne';
    const lbl = document.createElement('span');
    lbl.textContent = libelle;
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '1';
    input.step = '0.05';
    input.dataset['cle'] = cle;
    input.addEventListener('input', () => {
      this.preferences.modifier(cle, Number(input.value) as never);
    });
    lig.append(lbl, input);
    return lig;
  }

  private creerCase(libelle: string, cle: keyof Preferences): HTMLElement {
    const lig = document.createElement('label');
    lig.className = 'param-ligne param-case';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.dataset['cle'] = cle;
    input.addEventListener('change', () => {
      this.preferences.modifier(cle, input.checked as never);
    });
    const lbl = document.createElement('span');
    lbl.textContent = libelle;
    lig.append(input, lbl);
    return lig;
  }

  private synchroniser(): void {
    const p = this.preferences.preferences;
    for (const el of this.racine.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      '[data-cle]',
    )) {
      const cle = el.dataset['cle'] as keyof Preferences;
      const valeur = p[cle];
      if (el.type === 'checkbox' && el instanceof HTMLInputElement) {
        el.checked = valeur as boolean;
      } else if (el instanceof HTMLSelectElement) {
        el.value = String(valeur);
      } else if (el instanceof HTMLInputElement) {
        el.value = String(valeur);
      }
    }
  }
}
