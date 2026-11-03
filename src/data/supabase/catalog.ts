import type { CatalogRepository } from '../types';
import { must, supabase } from './client';

import type { PackageLevel, Trainer } from '@/lib/trainers';
import type { NewPlannedExercise } from '@/lib/workouts';

/** The trainer catalog: `trainers` → `training_packages` → workouts and comments. */
export const catalogRepository: CatalogRepository = {
  async load() {
    const rows = must(
      await supabase
        .from('trainers')
        .select('*, training_packages(*, package_workouts(*), package_comments(*))')
        .order('position'),
    );
    return rows.map((trainer): Trainer => ({
      id: trainer.id,
      name: trainer.name,
      photoUrl: trainer.photo_url ?? '',
      instagram: trainer.instagram ?? '',
      specialty: trainer.specialty,
      bio: trainer.bio,
      followers: trainer.followers,
      rating: Number(trainer.rating),
      ratingCount: trainer.rating_count,
      students: trainer.students,
      packages: [...trainer.training_packages]
        .sort((a, b) => a.position - b.position)
        .map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          level: pkg.level as PackageLevel,
          weeks: pkg.weeks,
          workouts: [...pkg.package_workouts]
            .sort((a, b) => a.position - b.position)
            .map((workout) => ({
              name: workout.name,
              summary: workout.summary,
              description: workout.description,
              // Written by supabase/seed.sql from `NewPlannedExercise[]`.
              exercises: workout.exercises as unknown as NewPlannedExercise[],
            })),
          comments: [...pkg.package_comments]
            .sort((a, b) => b.commented_on.localeCompare(a.commented_on))
            .map((comment) => ({
              id: comment.id,
              author: comment.author_name,
              rating: comment.rating,
              text: comment.body,
              date: comment.commented_on,
            })),
        })),
    }));
  },
};
