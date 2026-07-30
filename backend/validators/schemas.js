const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

// Accepts an ISO date string (or null to clear the due date)
const dueDateField = z
  .string()
  .datetime({ message: 'dueDate must be an ISO 8601 date string' })
  .nullable();

const tagsField = z
  .array(z.string().trim().min(1).max(30))
  .max(10, 'A todo can have at most 10 tags')
  .transform((tags) => [...new Set(tags)]);

const createTodoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  notes: z.string().trim().max(2000).optional(),
  priority: priorityEnum.optional(),
  dueDate: dueDateField.optional(),
  tags: tagsField.optional(),
});

const updateTodoSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  completed: z.boolean().optional(),
  priority: priorityEnum.optional(),
  dueDate: dueDateField.optional(),
  tags: tagsField.optional(),
});

// Query params for GET /api/todos - everything arrives as a string,
// so this schema also handles the coercion.
const listTodosQuerySchema = z.object({
  completed: z.enum(['true', 'false']).optional(),
  priority: priorityEnum.optional(),
  tag: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).max(255).optional(),
  overdue: z.enum(['true']).optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

module.exports = {
  registerSchema,
  loginSchema,
  createTodoSchema,
  updateTodoSchema,
  listTodosQuerySchema,
};
