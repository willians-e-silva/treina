import type { Tables } from '../database.types';
import type { TasksRepository } from '../types';
import { done, inList, must, supabase } from './client';

import type { RepeatUnit, Task } from '@/lib/tasks';

type TaskRow = Tables<'tasks'> & { subtasks: Tables<'subtasks'>[] };

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    repeat:
      row.repeat_kind === 'every' && row.repeat_interval && row.repeat_unit
        ? { kind: 'every', interval: row.repeat_interval, unit: row.repeat_unit as RepeatUnit }
        : { kind: 'none' },
    startDate: row.start_date,
    doneDates: row.done_dates,
    subtasks: [...row.subtasks]
      .sort((a, b) => a.position - b.position)
      .map((subtask) => ({ id: subtask.id, title: subtask.title, doneDates: subtask.done_dates })),
  };
}

function taskColumns(task: Task) {
  return {
    title: task.title,
    repeat_kind: task.repeat.kind,
    repeat_interval: task.repeat.kind === 'every' ? task.repeat.interval : null,
    repeat_unit: task.repeat.kind === 'every' ? task.repeat.unit : null,
    start_date: task.startDate,
    done_dates: task.doneDates,
  };
}

/** `tasks`, each with its `subtasks` (ordered by `position`). */
export function tasksRepository(userId: string): TasksRepository {
  async function saveSubtasks(task: Task) {
    if (task.subtasks.length > 0) {
      done(
        await supabase.from('subtasks').upsert(
          task.subtasks.map((subtask, position) => ({
            id: subtask.id,
            task_id: task.id,
            user_id: userId,
            position,
            title: subtask.title,
            done_dates: subtask.doneDates,
          })),
        ),
      );
    }
    let removed = supabase.from('subtasks').delete().eq('task_id', task.id);
    if (task.subtasks.length > 0) {
      removed = removed.not('id', 'in', inList(task.subtasks.map((subtask) => subtask.id)));
    }
    done(await removed);
  }

  return {
    async list() {
      const rows = must(
        await supabase
          .from('tasks')
          .select('*, subtasks(*)')
          .eq('user_id', userId)
          .order('created_at'),
      );
      return rows.map(toTask);
    },

    async add(task) {
      done(
        await supabase.from('tasks').insert({ id: task.id, user_id: userId, ...taskColumns(task) }),
      );
      await saveSubtasks(task);
    },

    async update(task) {
      done(await supabase.from('tasks').update(taskColumns(task)).eq('id', task.id));
      await saveSubtasks(task);
    },

    async remove(id) {
      // Its subtasks go with it (`on delete cascade`).
      done(await supabase.from('tasks').delete().eq('id', id));
    },
  };
}
