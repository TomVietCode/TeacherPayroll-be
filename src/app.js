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
import courseClassRoutes from './routes/courseClassRoutes.js';
import teacherAssignmentRoutes from './routes/teacherAssignmentRoutes.js';
import hourlyRateRoutes from './routes/hourlyRateRoutes.js';
import teacherCoefficientRoutes from './routes/teacherCoefficientRoutes.js';
import classCoefficientRoutes from './routes/classCoefficientRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Initialize app and Prisma client
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); 
app.use(cors()); 
app.use(morgan('dev')); 

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/degrees', degreeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/course-classes', courseClassRoutes);
app.use('/api/teacher-assignments', teacherAssignmentRoutes);
app.use('/api/hourly-rates', hourlyRateRoutes);
app.use('/api/teacher-coefficients', teacherCoefficientRoutes);
app.use('/api/class-coefficients', classCoefficientRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/reports', reportRoutes);

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