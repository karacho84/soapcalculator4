import type { Fragrance } from '../models/Fragrance';

export const defaultFragrances: Fragrance[] = [
  {
    id: 'lavender_eo',
    name: 'Lavendel (Ätherisches Öl)',
    type: 'essential',
    notes: 'Klassisch, beruhigend. Hält gut in Seife.'
  },
  {
    id: 'lemongrass_eo',
    name: 'Lemongras (Ätherisches Öl)',
    type: 'essential',
    notes: 'Frisch, zitrisch. Zieht schnell an (Puddingstadium beachten).'
  },
  {
    id: 'orange_eo',
    name: 'Orange 10-fach (Ätherisches Öl)',
    type: 'essential',
    notes: 'Muss hoch dosiert oder fixiert werden, da flüchtig.'
  },
  {
    id: 'generic_fo',
    name: 'Parfümöl (Generisch)',
    type: 'fragrance_oil',
    notes: 'Herstellerangaben zur Hautverträglichkeit beachten!'
  }
];
