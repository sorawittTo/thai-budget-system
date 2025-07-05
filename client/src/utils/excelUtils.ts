import * as XLSX from 'xlsx';
import type { BudgetItem, Employee, TravelExpense, AssistancePayment, OvertimePayment, WorkingDay } from '@shared/schema';

interface ExcelExportData {
  budgetItems: BudgetItem[];
  employees: Employee[];
  travelExpenses: TravelExpense[];
  assistancePayments: AssistancePayment[];
  overtimePayments: OvertimePayment[];
  workingDays: WorkingDay[];
}

export function exportToExcel(data?: Partial<ExcelExportData>) {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Get current year for filename
    const currentYear = new Date().getFullYear() + 543;
    
    // Export Budget Items
    if (data?.budgetItems && data.budgetItems.length > 0) {
      const budgetWorksheet = createBudgetWorksheet(data.budgetItems);
      XLSX.utils.book_append_sheet(workbook, budgetWorksheet, 'งบประมาณ');
    }
    
    // Export Employees
    if (data?.employees && data.employees.length > 0) {
      const employeeWorksheet = createEmployeeWorksheet(data.employees);
      XLSX.utils.book_append_sheet(workbook, employeeWorksheet, 'พนักงาน');
    }
    
    // Export Travel Expenses
    if (data?.travelExpenses && data.travelExpenses.length > 0) {
      const travelWorksheet = createTravelWorksheet(data.travelExpenses);
      XLSX.utils.book_append_sheet(workbook, travelWorksheet, 'ค่าเดินทาง');
    }
    
    // Export Assistance Payments
    if (data?.assistancePayments && data.assistancePayments.length > 0) {
      const assistanceWorksheet = createAssistanceWorksheet(data.assistancePayments);
      XLSX.utils.book_append_sheet(workbook, assistanceWorksheet, 'เงินช่วยเหลือ');
    }
    
    // Export Overtime Payments
    if (data?.overtimePayments && data.overtimePayments.length > 0) {
      const overtimeWorksheet = createOvertimeWorksheet(data.overtimePayments);
      XLSX.utils.book_append_sheet(workbook, overtimeWorksheet, 'ค่าล่วงเวลา');
    }
    
    // Export Working Days
    if (data?.workingDays && data.workingDays.length > 0) {
      const workingDaysWorksheet = createWorkingDaysWorksheet(data.workingDays);
      XLSX.utils.book_append_sheet(workbook, workingDaysWorksheet, 'วันทำงาน');
    }
    
    // If no data provided, create a summary sheet
    if (!data || Object.keys(data).length === 0) {
      const summaryWorksheet = createSummaryWorksheet();
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'สรุป');
    }
    
    // Generate filename with current date and time
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${currentYear}`;
    const timeStr = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
    const filename = `งบประมาณประจำปี_${dateStr}_${timeStr}.xlsx`;
    
    // Write and download the file
    XLSX.writeFile(workbook, filename);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('ไม่สามารถส่งออกไฟล์ Excel ได้');
  }
}

function createBudgetWorksheet(budgetItems: BudgetItem[]) {
  // Prepare data for Excel
  const data = [
    ['ตารางงบประมาณประจำปี'],
    [],
    ['รายการ', 'ปีปัจจุบัน', 'ปีเปรียบเทียบ', 'ผลต่าง', 'เปอร์เซ็นต์'],
    ...budgetItems.map(item => {
      const difference = (item.currentYearAmount || 0) - (item.compareYearAmount || 0);
      const percentage = item.compareYearAmount ? ((difference / item.compareYearAmount) * 100) : 0;
      
      return [
        item.name,
        item.currentYearAmount || 0,
        item.compareYearAmount || 0,
        difference,
        `${percentage.toFixed(2)}%`
      ];
    }),
    [],
    [
      'รวมทั้งหมด',
      budgetItems.reduce((sum, item) => sum + (item.currentYearAmount || 0), 0),
      budgetItems.reduce((sum, item) => sum + (item.compareYearAmount || 0), 0),
      budgetItems.reduce((sum, item) => sum + ((item.currentYearAmount || 0) - (item.compareYearAmount || 0)), 0),
      (() => {
        const totalCurrent = budgetItems.reduce((sum, item) => sum + (item.currentYearAmount || 0), 0);
        const totalCompare = budgetItems.reduce((sum, item) => sum + (item.compareYearAmount || 0), 0);
        const totalDiff = totalCurrent - totalCompare;
        const totalPercent = totalCompare ? ((totalDiff / totalCompare) * 100) : 0;
        return `${totalPercent.toFixed(2)}%`;
      })()
    ]
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 30 }, // รายการ
    { width: 15 }, // ปีปัจจุบัน
    { width: 15 }, // ปีเปรียบเทียบ
    { width: 15 }, // ผลต่าง
    { width: 12 }  // เปอร์เซ็นต์
  ];
  
  return worksheet;
}

function createEmployeeWorksheet(employees: Employee[]) {
  const data = [
    ['รายชื่อพนักงาน'],
    [],
    ['รหัสพนักงาน', 'ชื่อ-นามสกุล', 'สถานะ', 'เพศ', 'ปีเริ่มงาน', 'ระดับ', 'จังหวัดเยี่ยมบ้าน', 'ค่ารถทัวร์เยี่ยมบ้าน', 'เงินเดือน', 'ค่าตอบแทน'],
    ...employees.map(emp => [
      emp.employeeCode,
      emp.fullName,
      emp.status === 'active' ? 'ปฏิบัติงาน' : 'ไม่ปฏิบัติงาน',
      emp.gender === 'male' ? 'ชาย' : 'หญิง',
      emp.startYear,
      emp.level,
      emp.province,
      emp.tourCost,
      emp.salary || 0,
      emp.allowance || 0
    ])
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  worksheet['!cols'] = [
    { width: 15 }, // รหัสพนักงาน
    { width: 25 }, // ชื่อ-นามสกุล
    { width: 12 }, // สถานะ
    { width: 8 },  // เพศ
    { width: 12 }, // ปีเริ่มงาน
    { width: 20 }, // ระดับ
    { width: 20 }, // จังหวัดเยี่ยมบ้าน
    { width: 18 }, // ค่ารถทัวร์เยี่ยมบ้าน
    { width: 12 }, // เงินเดือน
    { width: 12 }  // ค่าตอบแทน
  ];
  
  return worksheet;
}

function createTravelWorksheet(travelExpenses: TravelExpense[]) {
  const data = [
    ['ค่าเดินทาง'],
    [],
    ['รหัสพนักงาน', 'ประเภทการเดินทาง', 'ปี', 'ค่าที่พัก', 'ค่าเบี้ยเลี้ยง', 'ค่าขนส่ง', 'ค่าแท็กซี่', 'รวม'],
    ...travelExpenses.map(expense => [
      expense.employeeId,
      expense.travelType,
      expense.year,
      expense.accommodation || 0,
      expense.allowance || 0,
      expense.transportation || 0,
      expense.taxi || 0,
      expense.total || 0
    ])
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  worksheet['!cols'] = [
    { width: 15 }, // รหัสพนักงาน
    { width: 20 }, // ประเภทการเดินทาง
    { width: 8 },  // ปี
    { width: 12 }, // ค่าที่พัก
    { width: 12 }, // ค่าเบี้ยเลี้ยง
    { width: 12 }, // ค่าขนส่ง
    { width: 12 }, // ค่าแท็กซี่
    { width: 12 }  // รวม
  ];
  
  return worksheet;
}

function createAssistanceWorksheet(assistancePayments: AssistancePayment[]) {
  const data = [
    ['เงินช่วยเหลือ'],
    [],
    ['รหัสพนักงาน', 'ปี', 'ค่าเช่า', 'จำนวนเดือน', 'เงินช่วยเหลือรายปี', 'เงินช่วยเหลือครั้งเดียว', 'รวม'],
    ...assistancePayments.map(payment => [
      payment.employeeId,
      payment.year,
      payment.rentAssistance || 0,
      payment.months || 0,
      payment.yearlyAssistance || 0,
      payment.oneTimeAssistance || 0,
      payment.total || 0
    ])
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  worksheet['!cols'] = [
    { width: 15 }, // รหัสพนักงาน
    { width: 8 },  // ปี
    { width: 12 }, // ค่าเช่า
    { width: 12 }, // จำนวนเดือน
    { width: 18 }, // เงินช่วยเหลือรายปี
    { width: 20 }, // เงินช่วยเหลือครั้งเดียว
    { width: 12 }  // รวม
  ];
  
  return worksheet;
}

function createOvertimeWorksheet(overtimePayments: OvertimePayment[]) {
  const data = [
    ['ค่าล่วงเวลา'],
    [],
    ['รหัสพนักงาน', 'ปี', 'จำนวนชั่วโมง', 'อัตราต่อชั่วโมง', 'รวม'],
    ...overtimePayments.map(payment => [
      payment.employeeId,
      payment.year,
      payment.hours || 0,
      payment.hourlyRate || 0,
      payment.total || 0
    ])
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  worksheet['!cols'] = [
    { width: 15 }, // รหัสพนักงาน
    { width: 8 },  // ปี
    { width: 15 }, // จำนวนชั่วโมง
    { width: 15 }, // อัตราต่อชั่วโมง
    { width: 12 }  // รวม
  ];
  
  return worksheet;
}

function createWorkingDaysWorksheet(workingDays: WorkingDay[]) {
  const data = [
    ['วันทำงาน'],
    [],
    ['ปี', 'วันในปี', 'วันหยุดสุดสัปดาห์', 'วันหยุดนักขัตฤกษ์', 'วันหยุดเพิ่มเติม', 'วันทำงาน'],
    ...workingDays.map(wd => [
      wd.year,
      wd.totalDays,
      wd.weekendDays,
      wd.holidays,
      wd.additionalHolidays || 0,
      wd.workingDays
    ])
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  worksheet['!cols'] = [
    { width: 8 },  // ปี
    { width: 12 }, // วันในปี
    { width: 18 }, // วันหยุดสุดสัปดาห์
    { width: 18 }, // วันหยุดนักขัตฤกษ์
    { width: 15 }, // วันหยุดเพิ่มเติม
    { width: 12 }  // วันทำงาน
  ];
  
  return worksheet;
}

function createSummaryWorksheet() {
  const currentYear = new Date().getFullYear() + 543;
  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const data = [
    ['รายงานสรุประบบจัดทำงบประมาณประจำปี'],
    [`ณ วันที่ ${currentDate}`],
    [],
    ['รายการ', 'สถานะ'],
    ['งบประมาณ', 'พร้อมใช้งาน'],
    ['ข้อมูลพนักงาน', 'พร้อมใช้งาน'],
    ['ค่าเดินทาง', 'พร้อมใช้งาน'],
    ['เงินช่วยเหลือ', 'พร้อมใช้งาน'],
    ['ค่าล่วงเวลา', 'พร้อมใช้งาน'],
    ['วันทำงาน', 'พร้อมใช้งาน'],
    [],
    ['หมายเหตุ:'],
    ['- ระบบสามารถส่งออกข้อมูลในรูปแบบ Excel ได้'],
    ['- ข้อมูลได้รับการบันทึกในระบบแล้ว'],
    ['- สามารถพิมพ์รายงานได้จากหน้าจอแต่ละโมดูล']
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  worksheet['!cols'] = [
    { width: 30 }, // รายการ
    { width: 20 }  // สถานะ
  ];
  
  return worksheet;
}

export function importFromExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        resolve(jsonData);
      } catch (error) {
        reject(new Error('ไม่สามารถอ่านไฟล์ Excel ได้'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export function validateExcelEmployeeData(data: any[]): boolean {
  if (!Array.isArray(data) || data.length < 2) {
    return false;
  }
  
  // Check if header row contains expected columns
  const headerRow = data[0];
  const requiredColumns = ['รหัสพนักงาน', 'ชื่อ-นามสกุล'];
  
  return requiredColumns.every(col => 
    headerRow.some((header: string) => 
      header && header.toString().includes(col)
    )
  );
}
