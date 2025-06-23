import ExcelJS from 'exceljs';
import { calculateAge } from './calculate.js';

/**
 * Xuất dữ liệu thống kê khoa ra file Excel
 * @param {Array} data Dữ liệu thống kê khoa
 * @param {Number} total Tổng số giáo viên
 */
export const exportDepartmentStatisticsToExcel = async (data, total) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Thống kê theo khoa');
  
  // Định dạng tiêu đề
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 10 },
    { header: 'Tên khoa', key: 'name', width: 40 },
    { header: 'Viết tắt', key: 'shortName', width: 15 },
    { header: 'Số lượng giáo viên', key: 'count', width: 20 },
    { header: 'Tỷ lệ (%)', key: 'percentage', width: 15 }
  ];
  
  // Style cho header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Thêm dữ liệu
  data.forEach((item, index) => {
    worksheet.addRow({
      stt: index + 1,
      name: item.label,
      shortName: item.shortName,
      count: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(2) : '0.00'
    });
  });
  
  // Thêm hàng tổng cộng
  worksheet.addRow({
    stt: '',
    name: 'Tổng cộng',
    shortName: '',
    count: total,
    percentage: '100.00'
  });
  
  // Style cho hàng tổng cộng
  const lastRow = worksheet.rowCount;
  worksheet.getRow(lastRow).font = { bold: true };
  
  // Định dạng các ô số liệu
  for (let i = 2; i <= lastRow; i++) {
    worksheet.getCell(`D${i}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`E${i}`).alignment = { horizontal: 'center' };
  }
  
  // Tạo buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Xuất dữ liệu thống kê bằng cấp ra file Excel
 * @param {Array} data Dữ liệu thống kê bằng cấp
 * @param {Number} total Tổng số giáo viên
 */
export const exportDegreeStatisticsToExcel = async (data, total) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Thống kê theo bằng cấp');
  
  // Định dạng tiêu đề
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 10 },
    { header: 'Tên bằng cấp', key: 'name', width: 40 },
    { header: 'Viết tắt', key: 'shortName', width: 15 },
    { header: 'Số lượng giáo viên', key: 'count', width: 20 },
    { header: 'Tỷ lệ (%)', key: 'percentage', width: 15 }
  ];
  
  // Style cho header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Thêm dữ liệu
  data.forEach((item, index) => {
    worksheet.addRow({
      stt: index + 1,
      name: item.label,
      shortName: item.shortName,
      count: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(2) : '0.00'
    });
  });
  
  // Thêm hàng tổng cộng
  worksheet.addRow({
    stt: '',
    name: 'Tổng cộng',
    shortName: '',
    count: total,
    percentage: '100.00'
  });
  
  // Style cho hàng tổng cộng
  const lastRow = worksheet.rowCount;
  worksheet.getRow(lastRow).font = { bold: true };
  
  // Định dạng các ô số liệu
  for (let i = 2; i <= lastRow; i++) {
    worksheet.getCell(`D${i}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`E${i}`).alignment = { horizontal: 'center' };
  }
  
  // Tạo buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Xuất dữ liệu thống kê độ tuổi ra file Excel
 * @param {Array} data Dữ liệu thống kê độ tuổi
 * @param {Number} total Tổng số giáo viên
 */
export const exportAgeStatisticsToExcel = async (data, total) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Thống kê theo độ tuổi');
  
  // Định dạng tiêu đề
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 10 },
    { header: 'Độ tuổi', key: 'ageRange', width: 20 },
    { header: 'Số lượng giáo viên', key: 'count', width: 20 },
    { header: 'Tỷ lệ (%)', key: 'percentage', width: 15 }
  ];
  
  // Style cho header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Thêm dữ liệu
  data.forEach((item, index) => {
    worksheet.addRow({
      stt: index + 1,
      ageRange: item.label,
      count: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(2) : '0.00'
    });
  });
  
  // Thêm hàng tổng cộng
  worksheet.addRow({
    stt: '',
    ageRange: 'Tổng cộng',
    count: total,
    percentage: '100.00'
  });
  
  // Style cho hàng tổng cộng
  const lastRow = worksheet.rowCount;
  worksheet.getRow(lastRow).font = { bold: true };
  
  // Định dạng các ô số liệu
  for (let i = 2; i <= lastRow; i++) {
    worksheet.getCell(`C${i}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`D${i}`).alignment = { horizontal: 'center' };
  }
  
  // Tạo buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Xuất dữ liệu thống kê tổng hợp ra file Excel
 * @param {Object} data Dữ liệu thống kê tổng hợp
 */
export const exportSummaryStatisticsToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  
  // Trang tổng quan
  const overviewSheet = workbook.addWorksheet('Tổng quan');
  overviewSheet.columns = [
    { header: 'Chỉ số', key: 'metric', width: 30 },
    { header: 'Giá trị', key: 'value', width: 20 }
  ];
  
  overviewSheet.getRow(1).font = { bold: true };
  overviewSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  overviewSheet.addRow({ metric: 'Tổng số giáo viên', value: data.counts.teachers });
  overviewSheet.addRow({ metric: 'Tổng số khoa', value: data.counts.departments });
  overviewSheet.addRow({ metric: 'Tổng số bằng cấp', value: data.counts.degrees });
  
  // Trang thống kê theo khoa
  const deptSheet = workbook.addWorksheet('Thống kê theo khoa');
  deptSheet.columns = [
    { header: 'STT', key: 'stt', width: 10 },
    { header: 'Tên khoa', key: 'name', width: 40 },
    { header: 'Viết tắt', key: 'shortName', width: 15 },
    { header: 'Số lượng giáo viên', key: 'count', width: 20 },
    { header: 'Tỷ lệ (%)', key: 'percentage', width: 15 }
  ];
  
  deptSheet.getRow(1).font = { bold: true };
  deptSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  data.byDepartment.forEach((item, index) => {
    deptSheet.addRow({
      stt: index + 1,
      name: item.label,
      shortName: item.shortName,
      count: item.count,
      percentage: data.counts.teachers > 0 ? ((item.count / data.counts.teachers) * 100).toFixed(2) : '0.00'
    });
  });
  
  deptSheet.addRow({
    stt: '',
    name: 'Tổng cộng',
    shortName: '',
    count: data.counts.teachers,
    percentage: '100.00'
  });
  
  // Trang thống kê theo bằng cấp
  const degreeSheet = workbook.addWorksheet('Thống kê theo bằng cấp');
  degreeSheet.columns = [
    { header: 'STT', key: 'stt', width: 10 },
    { header: 'Tên bằng cấp', key: 'name', width: 40 },
    { header: 'Viết tắt', key: 'shortName', width: 15 },
    { header: 'Số lượng giáo viên', key: 'count', width: 20 },
    { header: 'Tỷ lệ (%)', key: 'percentage', width: 15 }
  ];
  
  degreeSheet.getRow(1).font = { bold: true };
  degreeSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  data.byDegree.forEach((item, index) => {
    degreeSheet.addRow({
      stt: index + 1,
      name: item.label,
      shortName: item.shortName,
      count: item.count,
      percentage: data.counts.teachers > 0 ? ((item.count / data.counts.teachers) * 100).toFixed(2) : '0.00'
    });
  });
  
  degreeSheet.addRow({
    stt: '',
    name: 'Tổng cộng',
    shortName: '',
    count: data.counts.teachers,
    percentage: '100.00'
  });
  
  // Trang thống kê theo độ tuổi
  const ageSheet = workbook.addWorksheet('Thống kê theo độ tuổi');
  ageSheet.columns = [
    { header: 'STT', key: 'stt', width: 10 },
    { header: 'Độ tuổi', key: 'ageRange', width: 20 },
    { header: 'Số lượng giáo viên', key: 'count', width: 20 },
    { header: 'Tỷ lệ (%)', key: 'percentage', width: 15 }
  ];
  
  ageSheet.getRow(1).font = { bold: true };
  ageSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  data.byAge.forEach((item, index) => {
    ageSheet.addRow({
      stt: index + 1,
      ageRange: item.label,
      count: item.count,
      percentage: data.counts.teachers > 0 ? ((item.count / data.counts.teachers) * 100).toFixed(2) : '0.00'
    });
  });
  
  ageSheet.addRow({
    stt: '',
    ageRange: 'Tổng cộng',
    count: data.counts.teachers,
    percentage: '100.00'
  });
  
  // Format all sheets
  const sheets = [deptSheet, degreeSheet, ageSheet];
  sheets.forEach(sheet => {
    const lastRow = sheet.rowCount;
    sheet.getRow(lastRow).font = { bold: true };
    
    for (let i = 2; i <= lastRow; i++) {
      // Định dạng cột số lượng và phần trăm
      const countCell = String.fromCharCode(65 + sheet.columns.length - 2) + i; // Cột count
      const percentCell = String.fromCharCode(65 + sheet.columns.length - 1) + i; // Cột percent
      
      sheet.getCell(countCell).alignment = { horizontal: 'center' };
      sheet.getCell(percentCell).alignment = { horizontal: 'center' };
    }
  });
  
  // Tạo buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Xuất dữ liệu thống kê lớp học phần ra file Excel
 * @param {Array} data Dữ liệu thống kê lớp học phần
 * @param {String} academicYear Năm học
 */
export const exportCourseClassStatisticsToExcel = async (data, academicYear) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Thống kê lớp học phần ${academicYear}`);
  
  // Định dạng tiêu đề
  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 10 },
    { header: 'Mã học phần', key: 'subjectCode', width: 15 },
    { header: 'Tên học phần', key: 'subjectName', width: 40 },
    { header: 'Khoa', key: 'departmentName', width: 30 },
    { header: 'Số lớp mở', key: 'classCount', width: 15 },
    { header: 'Tổng số sinh viên', key: 'totalStudents', width: 20 }
  ];
  
  // Style cho header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Thêm dữ liệu
  let totalClasses = 0;
  let totalStudents = 0;
  
  data.forEach((item, index) => {
    totalClasses += item.classCount;
    totalStudents += item.totalStudents;
    
    worksheet.addRow({
      stt: index + 1,
      subjectCode: item.subjectCode,
      subjectName: item.subjectName,
      departmentName: item.departmentName,
      classCount: item.classCount,
      totalStudents: item.totalStudents
    });
  });
  
  // Thêm hàng tổng cộng
  const summaryRow = worksheet.addRow({
    stt: '',
    subjectCode: '',
    subjectName: 'TỔNG CỘNG',
    departmentName: '',
    classCount: totalClasses,
    totalStudents: totalStudents
  });
  
  // Style cho hàng tổng cộng
  summaryRow.font = { bold: true };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFEAA7' }
  };
  
  // Định dạng các ô số liệu và thêm border
  const lastRow = worksheet.rowCount;
  for (let i = 1; i <= lastRow; i++) {
    for (let j = 1; j <= 6; j++) {
      const cell = worksheet.getCell(i, j);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Căn giữa cho các cột số liệu
      if (j === 1 || j === 5 || j === 6) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    }
  }
  
  // Tạo buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Xuất báo cáo tiền dạy giáo viên theo năm ra file Excel
 * @param {Object} reportData Dữ liệu báo cáo tiền dạy giáo viên
 */
export const exportTeacherYearlyPayrollToExcel = async (reportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo cáo tiền dạy giáo viên');
  
  // Thêm tiêu đề báo cáo
  worksheet.mergeCells('A1:F3');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `BÁO CÁO TIỀN DẠY GIÁO VIÊN THEO NĂM\n${reportData.teacher.fullName} (${reportData.teacher.code})\nNăm học: ${reportData.academicYear}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  
  // Thêm thông tin giáo viên
  worksheet.addRow([]);
  worksheet.addRow(['Thông tin giáo viên:']);
  worksheet.addRow(['Mã giáo viên:', reportData.teacher.code]);
  worksheet.addRow(['Họ và tên:', reportData.teacher.fullName]);
  worksheet.addRow(['Bằng cấp:', reportData.teacher.degree.fullName]);
  worksheet.addRow(['Khoa:', reportData.teacher.department.fullName]);
  worksheet.addRow([]);
  
  // Thêm thông tin hệ số
  worksheet.addRow(['Các hệ số áp dụng:']);
  worksheet.addRow(['Hệ số giáo viên:', reportData.coefficients.teacherCoefficient]);
  worksheet.addRow(['Đơn giá theo tiết:', reportData.coefficients.hourlyRate.toLocaleString('vi-VN') + ' VNĐ']);
  worksheet.addRow(['Quy chuẩn sĩ số:', reportData.coefficients.standardStudentRange]);
  worksheet.addRow([]);
  
  // Tiêu đề bảng
  const headerRow = worksheet.addRow([
    'STT', 'Kỳ học', 'Số lớp', 'Tổng số tiết', 'Số tiết quy đổi', 'Tiền dạy (VNĐ)'
  ]);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Định dạng cột
  worksheet.columns = [
    { key: 'stt', width: 8 },
    { key: 'semester', width: 20 },
    { key: 'classes', width: 12 },
    { key: 'periods', width: 15 },
    { key: 'convertedPeriods', width: 18 },
    { key: 'salary', width: 20 }
  ];
  
  // Thêm dữ liệu từng kỳ
  reportData.semesters.forEach((semester, index) => {
    worksheet.addRow([
      index + 1,
      semester.semesterName,
      semester.classCount,
      semester.totalPeriods,
      semester.totalConvertedPeriods,
      semester.totalSalary.toLocaleString('vi-VN')
    ]);
  });
  
  // Thêm hàng tổng kết
  const summaryRow = worksheet.addRow([
    '',
    'TỔNG CỘNG',
    reportData.summary.totalClasses,
    reportData.summary.totalPeriods,
    reportData.summary.totalConvertedPeriods,
    reportData.summary.totalSalary.toLocaleString('vi-VN')
  ]);
  summaryRow.font = { bold: true };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFEAA7' }
  };
  
  // Định dạng border cho bảng
  const lastRow = worksheet.rowCount;
  const startDataRow = lastRow - reportData.semesters.length;
  
  for (let i = startDataRow; i <= lastRow; i++) {
    for (let j = 1; j <= 6; j++) {
      const cell = worksheet.getCell(i, j);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Căn giữa cho các cột số
      if (j !== 2) {
        cell.alignment = { horizontal: 'center' };
      }
    }
  }
  
  // Tạo buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Xuất báo cáo tiền dạy theo khoa ra file Excel
 * @param {Object} reportData Dữ liệu báo cáo tiền dạy theo khoa
 */
export const exportDepartmentPayrollToExcel = async (reportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo cáo tiền dạy theo khoa');
  
  // Thêm tiêu đề báo cáo
  const semesterInfo = reportData.semester 
    ? `Kỳ ${reportData.semester.termNumber}${reportData.semester.isSupplementary ? ' (Phụ)' : ''}`
    : 'Toàn năm học';
  
  worksheet.mergeCells('A1:H3');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `BÁO CÁO TIỀN DẠY THEO KHOA\n${reportData.department.fullName}\n${semesterInfo} năm học ${reportData.academicYear}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  
  // Thêm thông tin khoa
  worksheet.addRow([]);
  worksheet.addRow(['Thông tin khoa:']);
  worksheet.addRow(['Tên khoa:', reportData.department.fullName]);
  worksheet.addRow(['Năm học:', reportData.academicYear]);
  if (reportData.semester) {
    worksheet.addRow(['Kỳ học:', `Kỳ ${reportData.semester.termNumber}${reportData.semester.isSupplementary ? ' (Phụ)' : ''}`]);
  }
  worksheet.addRow([]);
  
  // Thêm thông tin hệ số
  worksheet.addRow(['Các hệ số áp dụng:']);
  worksheet.addRow(['Đơn giá theo tiết:', reportData.coefficients.hourlyRate.toLocaleString('vi-VN') + ' VNĐ']);
  worksheet.addRow(['Quy chuẩn sĩ số:', reportData.coefficients.standardStudentRange]);
  worksheet.addRow([]);
  
  // Tiêu đề bảng
  const headerRow = worksheet.addRow([
    'STT', 'Mã GV', 'Họ và tên', 'Bằng cấp', 'Hệ số GV', 'Số lớp', 'Tổng số tiết', 'Số tiết quy đổi', 'Tiền dạy (VNĐ)'
  ]);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Định dạng cột
  worksheet.columns = [
    { key: 'stt', width: 8 },
    { key: 'teacherCode', width: 12 },
    { key: 'teacherName', width: 25 },
    { key: 'degree', width: 20 },
    { key: 'coefficient', width: 12 },
    { key: 'classes', width: 10 },
    { key: 'periods', width: 15 },
    { key: 'convertedPeriods', width: 18 },
    { key: 'salary', width: 20 }
  ];
  
  // Thêm dữ liệu giáo viên
  reportData.teachers.forEach((teacher, index) => {
    worksheet.addRow([
      index + 1,
      teacher.teacherCode,
      teacher.teacherName,
      teacher.degree.fullName,
      teacher.teacherCoefficient,
      teacher.classCount,
      teacher.totalPeriods,
      teacher.totalConvertedPeriods,
      teacher.totalSalary.toLocaleString('vi-VN')
    ]);
  });
  
  // Thêm hàng tổng kết
  const summaryRow = worksheet.addRow([
    '',
    '',
    'TỔNG CỘNG',
    '',
    '',
    reportData.summary.totalClasses,
    reportData.summary.totalPeriods,
    reportData.summary.totalConvertedPeriods,
    reportData.summary.totalSalary.toLocaleString('vi-VN')
  ]);
  summaryRow.font = { bold: true };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFEAA7' }
  };
  
  // Định dạng border cho bảng
  const lastRow = worksheet.rowCount;
  const startDataRow = lastRow - reportData.teachers.length;
  
  for (let i = startDataRow; i <= lastRow; i++) {
    for (let j = 1; j <= 9; j++) {
      const cell = worksheet.getCell(i, j);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Căn giữa cho các cột số
      if (j !== 3 && j !== 4) {
        cell.alignment = { horizontal: 'center' };
      }
    }
  }
  
  // Tạo buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Xuất báo cáo tiền dạy toàn trường ra file Excel
 * @param {Object} reportData Dữ liệu báo cáo tiền dạy toàn trường
 */
export const exportSchoolPayrollToExcel = async (reportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo cáo tiền dạy toàn trường');
  
  // Thêm tiêu đề báo cáo
  const semesterInfo = reportData.semester 
    ? `Kỳ ${reportData.semester.termNumber}${reportData.semester.isSupplementary ? ' (Phụ)' : ''}`
    : 'Toàn năm học';
  
  worksheet.mergeCells('A1:F3');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `BÁO CÁO TIỀN DẠY TOÀN TRƯỜNG\n${semesterInfo} năm học ${reportData.academicYear}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  
  // Thêm thông tin chung
  worksheet.addRow([]);
  worksheet.addRow(['Thông tin báo cáo:']);
  worksheet.addRow(['Năm học:', reportData.academicYear]);
  if (reportData.semester) {
    worksheet.addRow(['Kỳ học:', `Kỳ ${reportData.semester.termNumber}${reportData.semester.isSupplementary ? ' (Phụ)' : ''}`]);
  }
  worksheet.addRow([]);
  
  // Thêm thông tin hệ số
  worksheet.addRow(['Các hệ số áp dụng:']);
  worksheet.addRow(['Đơn giá theo tiết:', reportData.coefficients.hourlyRate.toLocaleString('vi-VN') + ' VNĐ']);
  worksheet.addRow(['Quy chuẩn sĩ số:', reportData.coefficients.standardStudentRange]);
  worksheet.addRow([]);
  
  // Tiêu đề bảng
  const headerRow = worksheet.addRow([
    'STT', 'Tên khoa', 'Số lớp', 'Tổng số tiết', 'Số tiết quy đổi', 'Tiền dạy (VNĐ)'
  ]);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Định dạng cột
  worksheet.columns = [
    { key: 'stt', width: 8 },
    { key: 'departmentName', width: 30 },
    { key: 'classes', width: 12 },
    { key: 'periods', width: 15 },
    { key: 'convertedPeriods', width: 18 },
    { key: 'salary', width: 20 }
  ];
  
  // Thêm dữ liệu từng khoa
  reportData.departments.forEach((department, index) => {
    worksheet.addRow([
      index + 1,
      department.departmentName,
      department.classCount,
      department.totalPeriods,
      department.totalConvertedPeriods,
      department.totalSalary.toLocaleString('vi-VN')
    ]);
  });
  
  // Thêm hàng tổng kết
  const summaryRow = worksheet.addRow([
    '',
    'TỔNG CỘNG',
    reportData.summary.totalClasses,
    reportData.summary.totalPeriods,
    reportData.summary.totalConvertedPeriods,
    reportData.summary.totalSalary.toLocaleString('vi-VN')
  ]);
  summaryRow.font = { bold: true };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFEAA7' }
  };
  
  // Định dạng border cho bảng
  const lastRow = worksheet.rowCount;
  const startDataRow = lastRow - reportData.departments.length;
  
  for (let i = startDataRow; i <= lastRow; i++) {
    for (let j = 1; j <= 6; j++) {
      const cell = worksheet.getCell(i, j);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Căn giữa cho các cột số
      if (j !== 2) {
        cell.alignment = { horizontal: 'center' };
      }
    }
  }
  
  // Tạo buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}; 