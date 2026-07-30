const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createTodoSchema,
  updateTodoSchema,
  listTodosQuerySchema,
} = require('../validators/schemas');

// All routes below require a valid JWT - each user only sees their own todos
router.use(authenticate);

// Shared helper: turns the (already-validated) query object into a
// Prisma `where` clause scoped to the current user.
function buildWhere(userId, query) {
  const where = { userId };

  if (query.completed !== undefined) where.completed = query.completed === 'true';
  if (query.priority) where.priority = query.priority;
  if (query.tag) where.tags = { has: query.tag };
  if (query.search) where.title = { contains: query.search, mode: 'insensitive' };
  if (query.overdue === 'true') {
    where.completed = false;
    where.dueDate = { lt: new Date() };
  }

  return where;
}

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get the logged-in user's todos, with optional filtering, search, and sorting
 *     tags: [Todos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema: { type: boolean }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: overdue
 *         schema: { type: boolean }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, dueDate, priority, title] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: List of todos
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  validate(listTodosQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { sortBy, order } = req.query;
    const where = buildWhere(req.userId, req.query);

    // Priority isn't naturally sortable (it's an enum), so order it
    // HIGH -> MEDIUM -> LOW in JS after fetching for that one case.
    const todos = await prisma.todo.findMany({
      where,
      orderBy: sortBy === 'priority' ? { createdAt: 'desc' } : { [sortBy]: order },
    });

    if (sortBy === 'priority') {
      const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      todos.sort((a, b) =>
        order === 'asc' ? rank[b.priority] - rank[a.priority] : rank[a.priority] - rank[b.priority]
      );
    }

    res.status(200).json(todos);
  })
);

/**
 * @swagger
 * /api/todos/stats:
 *   get:
 *     summary: Get aggregate counts for the logged-in user's todos
 *     tags: [Todos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Aggregate stats
 */
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const [total, completed, overdue, byPriority, allTags] = await Promise.all([
      prisma.todo.count({ where: { userId } }),
      prisma.todo.count({ where: { userId, completed: true } }),
      prisma.todo.count({
        where: { userId, completed: false, dueDate: { lt: new Date() } },
      }),
      prisma.todo.groupBy({
        by: ['priority'],
        where: { userId, completed: false },
        _count: true,
      }),
      prisma.todo.findMany({ where: { userId }, select: { tags: true } }),
    ]);

    const priorityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    byPriority.forEach((row) => {
      priorityCounts[row.priority] = row._count;
    });

    const tagSet = new Set();
    allTags.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));

    res.status(200).json({
      total,
      completed,
      pending: total - completed,
      overdue,
      byPriority: priorityCounts,
      tags: [...tagSet].sort(),
    });
  })
);

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a single todo by id
 *     tags: [Todos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Todo found
 *       404:
 *         description: Not found
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const todo = await prisma.todo.findFirst({
      where: { id, userId: req.userId },
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(200).json(todo);
  })
);

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               notes: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *               dueDate: { type: string, format: date-time }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Todo created
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  validate(createTodoSchema),
  asyncHandler(async (req, res) => {
    const todo = await prisma.todo.create({
      data: { ...req.body, userId: req.userId },
    });
    res.status(201).json(todo);
  })
);

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo's title, notes, priority, due date, tags, or completed status
 *     tags: [Todos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               notes: { type: string }
 *               completed: { type: boolean }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *               dueDate: { type: string, format: date-time }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Todo updated
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  validate(updateTodoSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    const existing = await prisma.todo.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json(todo);
  })
);

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Todo deleted
 *       404:
 *         description: Not found
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    const existing = await prisma.todo.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await prisma.todo.delete({ where: { id } });
    res.status(200).json({ message: 'Todo deleted successfully' });
  })
);

module.exports = router;
