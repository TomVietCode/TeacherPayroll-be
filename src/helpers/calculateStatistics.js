/**
 * Helper utility for calculating statistics
 */

/**
 * Calculates age based on date of birth
 * @param {Date} dateOfBirth - Date of birth
 * @returns {Number} Age in years
 */
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calculates statistics of teachers by departments
 * @param {Array} teachers - List of teachers with department information
 * @param {Array} departments - List of all departments
 * @returns {Array} Department statistics with counts
 */
export const calculateTeachersByDepartment = (teachers, departments) => {
  // Initialize counts for all departments
  const departmentStats = departments.map(dept => ({
    id: dept.id,
    fullName: dept.fullName,
    shortName: dept.shortName,
    count: 0
  }));
  
  // Count teachers in each department
  teachers.forEach(teacher => {
    const deptIndex = departmentStats.findIndex(d => d.id === teacher.departmentId);
    if (deptIndex !== -1) {
      departmentStats[deptIndex].count += 1;
    }
  });
  
  return departmentStats;
};

/**
 * Calculates statistics of teachers by degrees
 * @param {Array} teachers - List of teachers with degree information
 * @param {Array} degrees - List of all degrees
 * @returns {Array} Degree statistics with counts
 */
export const calculateTeachersByDegree = (teachers, degrees) => {
  // Initialize counts for all degrees
  const degreeStats = degrees.map(degree => ({
    id: degree.id,
    fullName: degree.fullName,
    shortName: degree.shortName,
    count: 0
  }));
  
  // Count teachers with each degree
  teachers.forEach(teacher => {
    const degreeIndex = degreeStats.findIndex(d => d.id === teacher.degreeId);
    if (degreeIndex !== -1) {
      degreeStats[degreeIndex].count += 1;
    }
  });
  
  return degreeStats;
};

/**
 * Calculates statistics of teachers by age groups
 * @param {Array} teachers - List of teachers with date of birth
 * @returns {Array} Age group statistics with counts
 */
export const calculateTeachersByAge = (teachers) => {
  // Define age groups
  const ageGroups = [
    { label: 'Dưới 30', min: 0, max: 29, count: 0 },
    { label: '30-39', min: 30, max: 39, count: 0 },
    { label: '40-49', min: 40, max: 49, count: 0 },
    { label: '50-59', min: 50, max: 59, count: 0 },
    { label: '60 trở lên', min: 60, max: Infinity, count: 0 }
  ];
  
  // Count teachers in each age group
  teachers.forEach(teacher => {
    const age = calculateAge(teacher.dateOfBirth);
    const group = ageGroups.find(g => age >= g.min && age <= g.max);
    if (group) {
      group.count += 1;
    }
  });
  
  return ageGroups;
}; 