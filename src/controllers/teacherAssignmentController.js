import { PrismaClient } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import {
  createTeacherAssignmentSchema,
  updateTeacherAssignmentSchema,
  bulkAssignmentSchema,
  assignmentQuerySchema
} from '../validators/teacherAssignmentValidator.js';

const prisma = new PrismaClient();

// Get all teacher assignments with advanced filtering and pagination
export const getAllAssignments = async (req, res) => {
  try {
    const validatedQuery = assignmentQuerySchema.parse(req.query);
    
    const page = parseInt(validatedQuery.page) || 1;
    const limit = parseInt(validatedQuery.limit) || 20;
    const skip = (page - 1) * limit;

    // Build where clause dynamically
    const where = {};
    
    if (validatedQuery.teacherId) where.teacherId = validatedQuery.teacherId;
    if (validatedQuery.courseClassId) where.courseClassId = validatedQuery.courseClassId;

    // Add nested filters
    if (validatedQuery.semesterId || validatedQuery.subjectId || validatedQuery.departmentId) {
      where.courseClass = {};
      if (validatedQuery.semesterId) where.courseClass.semesterId = validatedQuery.semesterId;
      if (validatedQuery.subjectId) where.courseClass.subjectId = validatedQuery.subjectId;
      if (validatedQuery.departmentId) {
        where.courseClass.subject = {
          departmentId: validatedQuery.departmentId
        };
      }
    }

    const [assignments, total] = await Promise.all([
      prisma.teacherAssignment.findMany({
        where,
        include: {
          teacher: {
            select: {
              id: true,
              code: true,
              fullName: true,
              department: {
                select: { fullName: true, shortName: true }
              }
            }
          },
          courseClass: {
            select: {
              id: true,
              code: true,
              name: true,
              studentCount: true,
              subject: {
                select: {
                  name: true,
                  credits: true,
                  totalPeriods: true,
                  department: {
                    select: { fullName: true, shortName: true }
                  }
                }
              },
              semester: {
                select: {
                  termNumber: true,
                  academicYear: true,
                  isSupplementary: true
                }
              }
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.teacherAssignment.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: assignments,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher assignments'
    });
  }
};

// Get assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.teacherAssignment.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            code: true,
            fullName: true,
            department: {
              select: { fullName: true, shortName: true }
            }
          }
        },
        courseClass: {
          select: {
            id: true,
            code: true,
            name: true,
            studentCount: true,
            subject: {
              select: {
                name: true,
                credits: true,
                totalPeriods: true,
                department: {
                  select: { fullName: true, shortName: true }
                }
              }
            },
            semester: {
              select: {
                termNumber: true,
                academicYear: true,
                isSupplementary: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Teacher assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error fetching teacher assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher assignment'
    });
  }
};

// Create single teacher assignment
export const createAssignment = async (req, res) => {
  try {
    const validatedData = createTeacherAssignmentSchema.parse(req.body);

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: validatedData.teacherId }
    });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Check if course class exists
    const courseClass = await prisma.courseClass.findUnique({
      where: { id: validatedData.courseClassId }
    });
    if (!courseClass) {
      return res.status(404).json({
        success: false,
        message: 'Course class not found'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_courseClassId: {
          teacherId: validatedData.teacherId,
          courseClassId: validatedData.courseClassId
        }
      }
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'Teacher is already assigned to this course class'
      });
    }

    const assignment = await prisma.teacherAssignment.create({
      data: {
        id: uuidv7(),
        teacherId: validatedData.teacherId,
        courseClassId: validatedData.courseClassId,
      },
      include: {
        teacher: {
          select: {
            code: true,
            fullName: true
          }
        },
        courseClass: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Teacher assignment created successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error creating teacher assignment:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create teacher assignment'
    });
  }
};

// Bulk assignment - assign one teacher to multiple classes
export const bulkAssignment = async (req, res) => {
  try {
    const validatedData = bulkAssignmentSchema.parse(req.body);

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: validatedData.teacherId }
    });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Check if all course classes exist
    const courseClasses = await prisma.courseClass.findMany({
      where: {
        id: { in: validatedData.courseClassIds }
      }
    });

    if (courseClasses.length !== validatedData.courseClassIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more course classes not found'
      });
    }

    // Check for existing assignments
    const existingAssignments = await prisma.teacherAssignment.findMany({
      where: {
        teacherId: validatedData.teacherId,
        courseClassId: { in: validatedData.courseClassIds }
      }
    });

    if (existingAssignments.length > 0) {
      const existingClassIds = existingAssignments.map(a => a.courseClassId);
      const conflictClasses = courseClasses.filter(c => existingClassIds.includes(c.id));
      
      return res.status(409).json({
        success: false,
        message: 'Teacher is already assigned to some of these classes',
        conflictClasses: conflictClasses.map(c => ({ id: c.id, name: c.name }))
      });
    }

    // Create bulk assignments
    const assignmentData = validatedData.courseClassIds.map(courseClassId => ({
      id: uuidv7(),
      teacherId: validatedData.teacherId,
      courseClassId,
    }));

    const assignments = await prisma.teacherAssignment.createMany({
      data: assignmentData
    });

    res.status(201).json({
      success: true,
      message: `Successfully assigned teacher to ${assignments.count} classes`,
      data: {
        assignedCount: assignments.count,
        teacherName: teacher.fullName,
        classCount: validatedData.courseClassIds.length
      }
    });
  } catch (error) {
    console.error('Error creating bulk assignments:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk assignments'
    });
  }
};

// Update teacher assignment
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateTeacherAssignmentSchema.parse(req.body);

    // Check if assignment exists
    const existingAssignment = await prisma.teacherAssignment.findUnique({
      where: { id }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Teacher assignment not found'
      });
    }

    // If updating teacher or course class, check for conflicts
    if (validatedData.teacherId || validatedData.courseClassId) {
      const teacherId = validatedData.teacherId || existingAssignment.teacherId;
      const courseClassId = validatedData.courseClassId || existingAssignment.courseClassId;

      const conflictAssignment = await prisma.teacherAssignment.findFirst({
        where: {
          teacherId,
          courseClassId,
          id: { not: id }
        }
      });

      if (conflictAssignment) {
        return res.status(409).json({
          success: false,
          message: 'Teacher is already assigned to this course class'
        });
      }
    }

    const updateData = {};
    if (validatedData.teacherId) updateData.teacherId = validatedData.teacherId;
    if (validatedData.courseClassId) updateData.courseClassId = validatedData.courseClassId;

    const assignment = await prisma.teacherAssignment.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            code: true,
            fullName: true
          }
        },
        courseClass: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Teacher assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error updating teacher assignment:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update teacher assignment'
    });
  }
};

// Delete teacher assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAssignment = await prisma.teacherAssignment.findUnique({
      where: { id },
      include: {
        teacher: { select: { fullName: true } },
        courseClass: { select: { name: true } }
      }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Teacher assignment not found'
      });
    }

    await prisma.teacherAssignment.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Teacher assignment deleted successfully',
      data: {
        teacherName: existingAssignment.teacher.fullName,
        className: existingAssignment.courseClass.name
      }
    });
  } catch (error) {
    console.error('Error deleting teacher assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete teacher assignment'
    });
  }
};

// Get unassigned course classes for bulk assignment
export const getUnassignedClasses = async (req, res) => {
  try {
    const validatedQuery = assignmentQuerySchema.parse(req.query);
    
    const where = {
      assignments: { none: {} } // Only classes without assignments
    };

    if (validatedQuery.semesterId) where.semesterId = validatedQuery.semesterId;
    if (validatedQuery.subjectId) where.subjectId = validatedQuery.subjectId;
    if (validatedQuery.departmentId) {
      where.subject = { departmentId: validatedQuery.departmentId };
    }

    const unassignedClasses = await prisma.courseClass.findMany({
      where,
      include: {
        subject: {
          select: {
            name: true,
            credits: true,
            totalPeriods: true,
            department: {
              select: { fullName: true, shortName: true }
            }
          }
        },
        semester: {
          select: {
            termNumber: true,
            academicYear: true,
            isSupplementary: true
          }
        }
      },
      orderBy: [
        { semester: { startDate: 'desc' } },
        { subject: { name: 'asc' } },
        { classNumber: 'asc' }
      ]
    });

    res.status(200).json({
      success: true,
      data: unassignedClasses,
      count: unassignedClasses.length
    });
  } catch (error) {
    console.error('Error fetching unassigned classes:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unassigned classes'
    });
  }
};

// Get teacher workload summary
export const getTeacherWorkload = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { semesterId } = req.query;

    const where = {
      teacherId,
    };

    if (semesterId) {
      where.courseClass = { semesterId };
    }

    const assignments = await prisma.teacherAssignment.findMany({
      where,
      include: {
        courseClass: {
          select: {
            name: true,
            studentCount: true,
            subject: {
              select: {
                name: true,
                credits: true,
                totalPeriods: true
              }
            },
            semester: {
              select: {
                termNumber: true,
                academicYear: true
              }
            }
          }
        }
      }
    });

    const workloadSummary = {
      totalClasses: assignments.length,
      totalStudents: assignments.reduce((sum, a) => sum + a.courseClass.studentCount, 0),
      totalCredits: assignments.reduce((sum, a) => sum + a.courseClass.subject.credits, 0),
      totalPeriods: assignments.reduce((sum, a) => sum + a.courseClass.subject.totalPeriods, 0),
      assignments: assignments.map(a => ({
        id: a.id,
        className: a.courseClass.name,
        subjectName: a.courseClass.subject.name,
        credits: a.courseClass.subject.credits,
        periods: a.courseClass.subject.totalPeriods,
        studentCount: a.courseClass.studentCount,
        semester: `${a.courseClass.semester.academicYear} - Term ${a.courseClass.semester.termNumber}`,
      }))
    };

    res.status(200).json({
      success: true,
      data: workloadSummary
    });
  } catch (error) {
    console.error('Error fetching teacher workload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher workload'
    });
  }
}; 