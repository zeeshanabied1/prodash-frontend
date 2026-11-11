import { sql } from 'drizzle-orm';
import {
  sqliteTable, text, integer, real, index, primaryKey, uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const createdAt = () => text('created_at').notNull().default(sql`(datetime('now'))`);
const updatedAt = () => text('updated_at').notNull().default(sql`(datetime('now'))`);

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').notNull().default('#64748b'),
  icon: text('icon').notNull().default('folder'),
  status: text('status', { enum: ['active','on_hold','completed','archived'] }).notNull().default('active'),
  startDate: text('start_date'),
  dueDate: text('due_date'),
  completedAt: text('completed_at'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: text('deleted_at'),
}, (t) => [index('idx_projects_status').on(t.status)]);

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#64748b'),
  icon: text('icon').notNull().default('tag'),
  kind: text('kind', { enum: ['task','project','time_entry','general'] }).notNull().default('task'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('uq_categories_name_kind').on(t.name, t.kind)]);

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull().unique(),
  color: text('color').notNull().default('#64748b'),
  createdAt: createdAt(),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().notNull(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  parentTaskId: text('parent_task_id'),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['todo','in_progress','blocked','completed','cancelled'] }).notNull().default('todo'),
  priority: text('priority', { enum: ['low','medium','high','urgent'] }).notNull().default('medium'),
  startDate: text('start_date'),
  dueDate: text('due_date'),
  completedAt: text('completed_at'),
  estimatedMinutes: integer('estimated_minutes'),
  sortOrder: integer('sort_order').notNull().default(0),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: text('deleted_at'),
}, (t) => [
  index('idx_tasks_project').on(t.projectId),
  index('idx_tasks_category').on(t.categoryId),
  index('idx_tasks_status_due').on(t.status, t.dueDate),
]);

export const taskTags = sqliteTable('task_tags', {
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
}, (t) => [primaryKey({ columns: [t.taskId, t.tagId] })]);

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  goalType: text('goal_type', { enum: ['target','milestone','habit'] }).notNull().default('target'),
  status: text('status', { enum: ['active','completed','paused','cancelled'] }).notNull().default('active'),
  startDate: text('start_date'),
  targetDate: text('target_date'),
  completedAt: text('completed_at'),
  targetValue: real('target_value'),
  currentValue: real('current_value').notNull().default(0),
  unit: text('unit'),
  color: text('color').notNull().default('#64748b'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: text('deleted_at'),
}, (t) => [index('idx_goals_status_target').on(t.status, t.targetDate)]);

export const habits = sqliteTable('habits', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  frequency: text('frequency', { enum: ['daily','weekly','monthly','custom'] }).notNull().default('daily'),
  targetCount: integer('target_count').notNull().default(1),
  scheduleDays: text('schedule_days'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  reminderTime: text('reminder_time'),
  color: text('color').notNull().default('#64748b'),
  icon: text('icon').notNull().default('repeat'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  deletedAt: text('deleted_at'),
}, (t) => [index('idx_habits_active').on(t.isActive)]);

export const habitEntries = sqliteTable('habit_entries', {
  id: text('id').primaryKey().notNull(),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  entryDate: text('entry_date').notNull(),
  completedCount: integer('completed_count').notNull().default(1),
  note: text('note'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('uq_habit_entries_habit_date').on(t.habitId, t.entryDate)]);

export const timeEntries = sqliteTable('time_entries', {
  id: text('id').primaryKey().notNull(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  durationSeconds: integer('duration_seconds'),
  isBillable: integer('is_billable', { mode: 'boolean' }).notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index('idx_time_entries_started').on(t.startedAt),
  index('idx_time_entries_project').on(t.projectId),
]);

export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey().notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  description: text('description'),
  metadata: text('metadata'),
  createdAt: createdAt(),
}, (t) => [index('idx_activity_entity').on(t.entityType, t.entityId)]);

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey().notNull(),
  value: text('value'),
  valueType: text('value_type', { enum: ['string','number','boolean','json'] }).notNull().default('string'),
  updatedAt: updatedAt(),
});
