const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const swaggerSpec = require('./swagger');
const authRouter = require('./routes/auth');
const todosRouter = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint - useful for deployment platforms and load balancers
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API documentation (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/todos', todosRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler - catches anything forwarded via asyncHandler/next(err)
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Prisma "record not found" on update/delete
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists' });
  }

  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});
