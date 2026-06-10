/**
 * Bruit cohérent 2D (bruit de valeur + somme fractale).
 *
 * Pourquoi un bruit « maison » plutôt qu'une bibliothèque ?
 * 1. déterminisme total (la même graine produit le même désert, donc
 *    le terrain visuel et le sol physique partagent une seule fonction) ;
 * 2. zéro dépendance ;
 * 3. testable unitairement (déterminisme, bornes, continuité).
 */
export class Bruit2D {
  constructor(private readonly graine: number = 12.9898) {}

  /** Hachage pseudo-aléatoire déterministe d'une cellule entière → [0 ; 1). */
  private hachage(ix: number, iy: number): number {
    const s = Math.sin(ix * 127.1 + iy * 311.7 + this.graine * 74.7) * 43758.5453123;
    return s - Math.floor(s);
  }

  /** Bruit de valeur lissé (interpolation « smoothstep ») → [-1 ; 1]. */
  valeur(x: number, y: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);

    const a = this.hachage(ix, iy);
    const b = this.hachage(ix + 1, iy);
    const c = this.hachage(ix, iy + 1);
    const d = this.hachage(ix + 1, iy + 1);

    const v = a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
    return v * 2 - 1;
  }

  /**
   * Somme fractale (fBm) : superpose plusieurs octaves de bruit pour obtenir
   * des dunes naturelles (grandes ondulations + petits détails).
   * Résultat normalisé dans [-1 ; 1].
   */
  fbm(x: number, y: number, octaves = 4, lacunarite = 2, gain = 0.5): number {
    let amplitude = 1;
    let frequence = 1;
    let somme = 0;
    let total = 0;
    for (let o = 0; o < octaves; o++) {
      somme += this.valeur(x * frequence, y * frequence) * amplitude;
      total += amplitude;
      amplitude *= gain;
      frequence *= lacunarite;
    }
    return somme / total;
  }
}
