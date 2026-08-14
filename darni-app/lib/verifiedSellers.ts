import { supabase } from './supabase';

/** Renvoie l'ensemble des user_id ayant une vérification approuvée (table verifications). */
export async function fetchVerifiedUserIds(userIds: (string | null | undefined)[]): Promise<Set<string>> {
  const distinct = [...new Set(userIds.filter((id): id is string => !!id))];
  if (distinct.length === 0) return new Set();

  const { data, error } = await supabase
    .from('public_verified_sellers')
    .select('user_id')
    .in('user_id', distinct);

  if (error) return new Set();
  return new Set((data ?? []).map((v: { user_id: string }) => v.user_id));
}
