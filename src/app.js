import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import errorHandler from './middlewares/errorHandler.js';

// Routes
import degreeRoutes from './routes/degreeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import statisticsRoutes from './routes/statisticsRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import semesterRoutes from './routes/semesterRoutes.js';

// Initialize app and Prisma client
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); 
app.use(cors()); 
app.use(morgan('dev')); 

// Define routes
app.use('/api/degrees', degreeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/semesters', semesterRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle application shutdown - close Prisma connection
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Prisma connection closed');
  process.exit(0);
});

export default app; 