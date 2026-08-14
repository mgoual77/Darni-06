/** Liste complète des 48 wilayas — pour tout champ où l'utilisateur doit pouvoir choisir sa vraie wilaya (ex: formulaire de publication). */
export const WILAYAS = [
  'Adrar', 'Ain Defla', 'Ain Témouchent', 'Alger', 'Annaba',
  'Batna', 'Béchar', 'Béjaïa', 'Biskra', 'Blida',
  'Bordj Bou Arréridj', 'Bouira', 'Boumerdès', 'Chlef', 'Constantine',
  'Djelfa', 'El Bayadh', 'El Oued', 'El Tarf', 'Ghardaïa',
  'Guelma', 'Illizi', 'Jijel', 'Khenchela', 'Laghouat',
  'Mascara', 'Médéa', 'Mila', 'Mostaganem', "M'Sila",
  'Naâma', 'Oran', 'Ouargla', 'Oum El Bouaghi', 'Relizane',
  'Saïda', 'Sétif', 'Sidi Bel Abbès', 'Skikda', 'Souk Ahras',
  'Tamanrasset', 'Tébessa', 'Tiaret', 'Tindouf', 'Tipaza',
  'Tissemsilt', 'Tizi Ouzou', 'Tlemcen',
];

/** Wilayas les plus peuplées, dans l'ordre — pour les chips/tabs de filtre rapide (Home, Search). Tronquer avec .slice(0, n) selon la place disponible à l'écran. */
export const POPULAR_WILAYAS = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif',
  'Tizi Ouzou', 'Béjaïa', 'Batna', 'Tlemcen',
];
