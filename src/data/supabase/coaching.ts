import type { CoachingRepository } from '../types';
import { done, maybe, must, supabase } from './client';

/**
 * `coaching_memberships`. The package's workouts in the plan are the user's
 * workouts copied from it (`workouts.source_package_id`).
 */
export function coachingRepository(userId: string): CoachingRepository {
  return {
    async load() {
      const membership = maybe(
        await supabase
          .from('coaching_memberships')
          .select('package_id')
          .eq('user_id', userId)
          .maybeSingle(),
      );
      if (!membership) return undefined;
      const workouts = must(
        await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', userId)
          .eq('source_package_id', membership.package_id)
          .order('created_at'),
      );
      return {
        packageId: membership.package_id,
        workoutIds: workouts.map((workout) => workout.id),
      };
    },

    async save(membership) {
      done(
        membership
          ? await supabase
              .from('coaching_memberships')
              .upsert({ user_id: userId, package_id: membership.packageId })
          : await supabase.from('coaching_memberships').delete().eq('user_id', userId),
      );
    },
  };
}
