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