import {
  budgetItems,
  employees,
  masterRates,
  travelExpenses,
  assistancePayments,
  overtimePayments,
  workingDays,
  users,
  type BudgetItem,
  type InsertBudgetItem,
  type Employee,
  type InsertEmployee,
  type MasterRate,
  type InsertMasterRate,
  type TravelExpense,
  type InsertTravelExpense,
  type AssistancePayment,
  type InsertAssistancePayment,
  type OvertimePayment,
  type InsertOvertimePayment,
  type WorkingDay,
  type InsertWorkingDay,
  type User,
  type InsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Budget Items
  getBudgetItems(): Promise<BudgetItem[]>;
  createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: number, item: Partial<InsertBudgetItem>): Promise<BudgetItem>;
  deleteBudgetItem(id: number): Promise<void>;

  // Employees
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: number): Promise<void>;

  // Master Rates
  getMasterRates(): Promise<MasterRate[]>;
  createMasterRate(rate: InsertMasterRate): Promise<MasterRate>;
  updateMasterRate(id: number, rate: Partial<InsertMasterRate>): Promise<MasterRate>;

  // Travel Expenses
  getTravelExpenses(): Promise<TravelExpense[]>;
  createTravelExpense(expense: InsertTravelExpense): Promise<TravelExpense>;
  updateTravelExpense(id: number, expense: Partial<InsertTravelExpense>): Promise<TravelExpense>;

  // Assistance Payments
  getAssistancePayments(): Promise<AssistancePayment[]>;
  createAssistancePayment(payment: InsertAssistancePayment): Promise<AssistancePayment>;
  updateAssistancePayment(id: number, payment: Partial<InsertAssistancePayment>): Promise<AssistancePayment>;

  // Overtime Payments
  getOvertimePayments(): Promise<OvertimePayment[]>;
  createOvertimePayment(payment: InsertOvertimePayment): Promise<OvertimePayment>;
  updateOvertimePayment(id: number, payment: Partial<InsertOvertimePayment>): Promise<OvertimePayment>;

  // Working Days
  getWorkingDays(): Promise<WorkingDay[]>;
  createWorkingDay(workingDay: InsertWorkingDay): Promise<WorkingDay>;
  updateWorkingDay(id: number, workingDay: Partial<InsertWorkingDay>): Promise<WorkingDay>;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Utility methods
  resetAllData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private budgetItems: Map<number, BudgetItem>;
  private employees: Map<number, Employee>;
  private masterRates: Map<number, MasterRate>;
  private travelExpenses: Map<number, TravelExpense>;
  private assistancePayments: Map<number, AssistancePayment>;
  private overtimePayments: Map<number, OvertimePayment>;
  private workingDays: Map<number, WorkingDay>;
  private users: Map<number, User>;
  private currentId: number;

  constructor() {
    this.budgetItems = new Map();
    this.employees = new Map();
    this.masterRates = new Map();
    this.travelExpenses = new Map();
    this.assistancePayments = new Map();
    this.overtimePayments = new Map();
    this.workingDays = new Map();
    this.users = new Map();
    this.currentId = 1;
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Original budget items from HTML file
    const defaultBudgetItems = [
      { currentYear: 2568, compareYear: 2569, name: 'ค่าใช้จ่ายกิจกรรมส่งเสริมค่านิยมร่วมขององค์กร', budgetCode: '52021100', accountCode: '5201110001', category: 'หมวด 1 : ค่าใช้จ่ายเกี่ยวกับพนักงาน', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 1 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าไฟฟ้า', budgetCode: '52021200', accountCode: '5202120001', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 2 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าน้ำประปา', budgetCode: '52021201', accountCode: '5202120002', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 3 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าโทรศัพท์', budgetCode: '52021202', accountCode: '5202120003', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 4 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าวัสดุทั่วไป', budgetCode: '52021203', accountCode: '5202120004', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 5 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าวัสดุงานบ้านงานครัว', budgetCode: '52021204', accountCode: '5202120005', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 6 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าจ้าง', budgetCode: '52021205', accountCode: '5202120006', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 7 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าไปรษณียากรและพัสดุไปรษณีย์', budgetCode: '52021206', accountCode: '5202120007', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 8 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าขนส่ง', budgetCode: '52021207', accountCode: '5202120008', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 9 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าซ่อมแซมและบำรุงรักษา', budgetCode: '52021208', accountCode: '5202120009', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 10 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าตอบแทน', budgetCode: '52021209', accountCode: '5202120010', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 11 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าเช่า', budgetCode: '52021210', accountCode: '5202120011', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 12 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่ารับรอง', budgetCode: '52021211', accountCode: '5202120012', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 13 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าใช้จ่ายในการเดินทาง', budgetCode: '52021212', accountCode: '5202120013', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 14 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าทรัพยากรสาสนเทศห้องสมุด', budgetCode: '52021213', accountCode: '5202120014', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 15 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าจัดประชุม/ชี้แจง', budgetCode: '52021214', accountCode: '5202120015', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 16 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าใช้จ่ายในการจัดงานและพิธีต่าง ๆ', budgetCode: '52021215', accountCode: '5202120016', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 17 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าใช้จ่ายเบ็ดเตล็ด', budgetCode: '52021216', accountCode: '5202120017', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 18 },
      { currentYear: 2568, compareYear: 2569, name: 'เงินบริจาค', budgetCode: '54021001', accountCode: '5402100001', category: 'หมวด 4 : เงินช่วยเหลือภายนอกและเงินบริจาค', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 19 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าวัสดุผลิต - ทั่วไป', budgetCode: '58021001', accountCode: '5802100001', category: 'หมวด 58: ค่าใช้จ่ายด้านการผลิต', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 20 },
      { currentYear: 2568, compareYear: 2569, name: 'ครุภัณฑ์เครื่องใช้ไฟฟ้าและประปา', budgetCode: '71021001', accountCode: '7102100001', category: 'หมวด 7 : สินทรัพย์ถาวร', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 21 },
      { currentYear: 2568, compareYear: 2569, name: 'ครุภัณฑ์เบ็ดเตล็ด', budgetCode: '71021002', accountCode: '7102100002', category: 'หมวด 7 : สินทรัพย์ถาวร', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 22 },
      { currentYear: 2568, compareYear: 2569, name: 'ครุภัณฑ์ยานพาหนะและขนส่ง', budgetCode: '71021003', accountCode: '7102100003', category: 'หมวด 7 : สินทรัพย์ถาวร', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 23 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าเสริมสร้างปรับปรุงอาคารสถานที่', budgetCode: '71021004', accountCode: '7102100004', category: 'หมวด 7 : สินทรัพย์ถาวร', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 24 },
    ];

    defaultBudgetItems.forEach((item, index) => {
      const budgetItem: BudgetItem = { 
        ...item, 
        id: index + 1,
        budgetCode: item.budgetCode || null,
        accountCode: item.accountCode || null,
        notes: item.notes || null,
        sortOrder: item.sortOrder || index + 1
      };
      this.budgetItems.set(index + 1, budgetItem);
    });

    // Original employee data from HTML file
    const defaultEmployees = [
      { employeeCode: '62539086', fullName: 'พัทธดนย์ ทรัพย์ประสม', status: 'Active', gender: 'ชาย', startYear: 2539, level: '7', province: 'พิษณุโลก', tourCost: 1200, salary: 45000, allowance: 10000 },
      { employeeCode: '52531175', fullName: 'พีรนุช ธนบดีภัทร', status: 'Active', gender: 'หญิง', startYear: 2531, level: '6', province: 'ขอนแก่น', tourCost: 600, salary: 40000, allowance: 9000 },
      { employeeCode: '82532130', fullName: 'นลินรัตน์ ตรีไพศาลศักดิ์', status: 'Active', gender: 'หญิง', startYear: 2532, level: '5.5', province: 'ขอนแก่น', tourCost: 0, salary: 38000, allowance: 8500 },
      { employeeCode: '42538115', fullName: 'อุมารักษ์ เตลันยืน', status: 'Active', gender: 'หญิง', startYear: 2538, level: '4', province: '', tourCost: 0, salary: 30000, allowance: 6000 },
      { employeeCode: '42538092', fullName: 'สมควร กลิ่นสุคนธ์', status: 'Active', gender: 'หญิง', startYear: 2538, level: '4', province: '', tourCost: 0, salary: 30000, allowance: 6000 },
      { employeeCode: '52542046', fullName: 'สรวิชญ์ ธรรศเดชา', status: 'Active', gender: 'ชาย', startYear: 2542, level: '5', province: '', tourCost: 600, salary: 35000, allowance: 7000 },
      { employeeCode: '22538173', fullName: 'ประภัสสร เล็กศรีสกุล', status: 'Active', gender: 'หญิง', startYear: 2538, level: '5', province: 'ขอนแก่น', tourCost: 600, salary: 35000, allowance: 7000 },
      { employeeCode: '82542011', fullName: 'มลธิรา สุขสำราญ', status: 'Active', gender: 'หญิง', startYear: 2542, level: '5', province: 'ขอนแก่น', tourCost: 1200, salary: 35000, allowance: 7000 },
      { employeeCode: '42539087', fullName: 'สุภาณี จำปานุ้ย', status: 'Active', gender: 'หญิง', startYear: 2539, level: '5', province: 'ขอนแก่น', tourCost: 600, salary: 35000, allowance: 7000 },
      { employeeCode: '62537025', fullName: 'วิชญ อุปันนัทธ์', status: 'Active', gender: 'ชาย', startYear: 2537, level: '5', province: 'เชียงใหม่', tourCost: 600, salary: 35000, allowance: 7000 },
      { employeeCode: '82536096', fullName: 'นุสรา อัศวโชคชัย', status: 'Active', gender: 'หญิง', startYear: 2536, level: '5', province: 'ขอนแก่น', tourCost: 600, salary: 35000, allowance: 7000 },
      { employeeCode: '72539071', fullName: 'สันติภาพ ทองประดี', status: 'Active', gender: 'ชาย', startYear: 2539, level: '5', province: 'ขอนแก่น', tourCost: 0, salary: 35000, allowance: 7000 },
      { employeeCode: '82538194', fullName: 'ขวัญญาณัฐ จุลเกษม', status: 'Active', gender: 'หญิง', startYear: 2538, level: '4.5', province: 'ขอนแก่น', tourCost: 600, salary: 32000, allowance: 6500 },
      { employeeCode: '52538087', fullName: 'สงวน ร้องเกาะเกิด', status: 'Active', gender: 'ชาย', startYear: 2538, level: '3', province: '', tourCost: 0, salary: 25000, allowance: 5000 },
      { employeeCode: '2539140', fullName: 'สุมาพร จงภู่', status: 'Active', gender: 'หญิง', startYear: 2539, level: '3', province: 'ขอนแก่น', tourCost: 0, salary: 25000, allowance: 5000 },
      { employeeCode: '42540033', fullName: 'คมสันติ์ นุชนารถ', status: 'Active', gender: 'ชาย', startYear: 2540, level: '3', province: '', tourCost: 0, salary: 25000, allowance: 5000 },
      { employeeCode: '82540031', fullName: 'พิชิต แจ่มศรี', status: 'Active', gender: 'ชาย', startYear: 2540, level: '3', province: '', tourCost: 0, salary: 25000, allowance: 5000 },
    ];

    defaultEmployees.forEach((employee, index) => {
      const emp: Employee = { ...employee, id: index + 1 + 25 };
      this.employees.set(index + 1 + 25, emp);
    });

    // Master rates from original HTML
    const defaultRates: InsertMasterRate[] = [
      { category: "level_7", subcategory: "ผู้บริหารส่วน", rate: 9500, unit: "บาท", description: "ค่าเช่า" },
      { category: "level_7", subcategory: "ผู้บริหารส่วน", rate: 6250, unit: "บาท", description: "เงินช่วยเหลือรายเดือน" },
      { category: "level_7", subcategory: "ผู้บริหารส่วน", rate: 8000, unit: "บาท", description: "ค่าซื้อของเหมาจ่าย" },
      { category: "level_7", subcategory: "ผู้บริหารส่วน", rate: 300, unit: "บาท", description: "ค่ารถโดยสาร โคราช-กทม./เที่ยว" },
      { category: "level_7", subcategory: "ผู้บริหารส่วน", rate: 250, unit: "บาท", description: "ค่ารถรับจ้าง/เที่ยว" },
      { category: "level_6", subcategory: "ผู้บริหารทีม", rate: 9500, unit: "บาท", description: "ค่าเช่า" },
      { category: "level_6", subcategory: "ผู้บริหารทีม", rate: 6250, unit: "บาท", description: "เงินช่วยเหลือรายเดือน" },
      { category: "level_6", subcategory: "ผู้บริหารทีม", rate: 8000, unit: "บาท", description: "ค่าซื้อของเหมาจ่าย" },
      { category: "level_6", subcategory: "ผู้บริหารทีม", rate: 300, unit: "บาท", description: "ค่ารถโดยสาร โคราช-กทม./เที่ยว" },
      { category: "level_6", subcategory: "ผู้บริหารทีม", rate: 250, unit: "บาท", description: "ค่ารถรับจ้าง/เที่ยว" },
      { category: "level_5_5", subcategory: "เจ้าหน้าที่ชำนาญงาน (ควบ)", rate: 9500, unit: "บาท", description: "ค่าเช่า" },
      { category: "level_5_5", subcategory: "เจ้าหน้าที่ชำนาญงาน (ควบ)", rate: 6250, unit: "บาท", description: "เงินช่วยเหลือรายเดือน" },
      { category: "level_5_5", subcategory: "เจ้าหน้าที่ชำนาญงาน (ควบ)", rate: 6000, unit: "บาท", description: "ค่าซื้อของเหมาจ่าย" },
      { category: "level_5_5", subcategory: "เจ้าหน้าที่ชำนาญงาน (ควบ)", rate: 300, unit: "บาท", description: "ค่ารถโดยสาร โคราช-กทม./เที่ยว" },
      { category: "level_5_5", subcategory: "เจ้าหน้าที่ชำนาญงาน (ควบ)", rate: 250, unit: "บาท", description: "ค่ารถรับจ้าง/เที่ยว" },
      { category: "level_5", subcategory: "เจ้าหน้าที่ชำนาญงาน", rate: 8000, unit: "บาท", description: "ค่าเช่า" },
      { category: "level_5", subcategory: "เจ้าหน้าที่ชำนาญงาน", rate: 5500, unit: "บาท", description: "เงินช่วยเหลือรายเดือน" },
      { category: "level_5", subcategory: "เจ้าหน้าที่ชำนาญงาน", rate: 6000, unit: "บาท", description: "ค่าซื้อของเหมาจ่าย" },
      { category: "level_5", subcategory: "เจ้าหน้าที่ชำนาญงาน", rate: 300, unit: "บาท", description: "ค่ารถโดยสาร โคราช-กทม./เที่ยว" },
      { category: "level_5", subcategory: "เจ้าหน้าที่ชำนาญงาน", rate: 250, unit: "บาท", description: "ค่ารถรับจ้าง/เที่ยว" },
      { category: "level_4", subcategory: "เจ้าหน้าที่", rate: 8000, unit: "บาท", description: "ค่าเช่า" },
      { category: "level_4", subcategory: "เจ้าหน้าที่", rate: 5500, unit: "บาท", description: "เงินช่วยเหลือรายเดือน" },
      { category: "level_4", subcategory: "เจ้าหน้าที่", rate: 6000, unit: "บาท", description: "ค่าซื้อของเหมาจ่าย" },
      { category: "level_4", subcategory: "เจ้าหน้าที่", rate: 300, unit: "บาท", description: "ค่ารถโดยสาร โคราช-กทม./เที่ยว" },
      { category: "level_4", subcategory: "เจ้าหน้าที่", rate: 250, unit: "บาท", description: "ค่ารถรับจ้าง/เที่ยว" },
      { category: "level_3", subcategory: "พนักงานปฏิบัติการ", rate: 6500, unit: "บาท", description: "ค่าเช่า" },
      { category: "level_3", subcategory: "พนักงานปฏิบัติการ", rate: 4750, unit: "บาท", description: "เงินช่วยเหลือรายเดือน" },
      { category: "level_3", subcategory: "พนักงานปฏิบัติการ", rate: 4500, unit: "บาท", description: "ค่าซื้อของเหมาจ่าย" },
      { category: "level_3", subcategory: "พนักงานปฏิบัติการ", rate: 300, unit: "บาท", description: "ค่ารถโดยสาร โคราช-กทม./เที่ยว" },
      { category: "level_3", subcategory: "พนักงานปฏิบัติการ", rate: 250, unit: "บาท", description: "ค่ารถรับจ้าง/เที่ยว" },
      { category: "travel", subcategory: "perDiem", rate: 500, unit: "บาท/วัน", description: "ค่าเบี้ยเลี้ยง (ระดับ 7-6)" },
      { category: "travel", subcategory: "perDiem", rate: 450, unit: "บาท/วัน", description: "ค่าเบี้ยเลี้ยง (ระดับ 5-3)" },
      { category: "travel", subcategory: "hotel", rate: 2100, unit: "บาท/คืน", description: "ค่าที่พัก (ระดับ 7-6)" },
      { category: "travel", subcategory: "hotel", rate: 1800, unit: "บาท/คืน", description: "ค่าที่พัก (ระดับ 5-3)" },
    ];

    let rateId = 100;
    defaultRates.forEach(rate => {
      const masterRate: MasterRate = { ...rate, id: rateId++, description: rate.description ?? null };
      this.masterRates.set(masterRate.id, masterRate);
    });

    // Initialize default user for korat123
    const defaultUser: User = {
      id: 1,
      username: "korat123",
      password: "72ccb4c1825e0f8c87e2af946d7fb9e5f67b4b1a6e4e1b2a6bf8b8d5b8f9c2e3.7f5c1d9e2a6b8f4e", // korat123
      createdAt: new Date()
    };
    this.users.set(1, defaultUser);

    this.currentId = Math.max(
      Math.max(...Array.from(this.budgetItems.keys())) + 1,
      Math.max(...Array.from(this.employees.keys())) + 1,
      Math.max(...Array.from(this.masterRates.keys())) + 1,
      Math.max(...Array.from(this.users.keys())) + 1
    );
  }

  // Budget Items
  async getBudgetItems(): Promise<BudgetItem[]> {
    return Array.from(this.budgetItems.values());
  }

  async createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem> {
    const id = this.currentId++;
    const budgetItem: BudgetItem = { 
      ...item, 
      id,
      currentYearAmount: item.currentYearAmount ?? 0,
      compareYearAmount: item.compareYearAmount ?? 0,
      budgetCode: item.budgetCode ?? null,
      accountCode: item.accountCode ?? null,
      notes: item.notes ?? null,
      sortOrder: item.sortOrder ?? 0
    };
    this.budgetItems.set(id, budgetItem);
    return budgetItem;
  }

  async updateBudgetItem(id: number, item: Partial<InsertBudgetItem>): Promise<BudgetItem> {
    const existing = this.budgetItems.get(id);
    if (!existing) {
      throw new Error("Budget item not found");
    }
    const updated = { ...existing, ...item };
    this.budgetItems.set(id, updated);
    return updated;
  }

  async deleteBudgetItem(id: number): Promise<void> {
    this.budgetItems.delete(id);
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentId++;
    const emp: Employee = { 
      ...employee, 
      id,
      tourCost: employee.tourCost ?? 0,
      salary: employee.salary ?? 0,
      allowance: employee.allowance ?? 0
    };
    this.employees.set(id, emp);
    return emp;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee> {
    const existing = this.employees.get(id);
    if (!existing) {
      throw new Error("Employee not found");
    }
    const updated = { ...existing, ...employee };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: number): Promise<void> {
    this.employees.delete(id);
  }

  // Master Rates
  async getMasterRates(): Promise<MasterRate[]> {
    return Array.from(this.masterRates.values());
  }

  async createMasterRate(rate: InsertMasterRate): Promise<MasterRate> {
    const id = this.currentId++;
    const masterRate: MasterRate = { 
      ...rate, 
      id,
      description: rate.description ?? null
    };
    this.masterRates.set(id, masterRate);
    return masterRate;
  }

  async updateMasterRate(id: number, rate: Partial<InsertMasterRate>): Promise<MasterRate> {
    const existing = this.masterRates.get(id);
    if (!existing) {
      throw new Error("Master rate not found");
    }
    const updated = { ...existing, ...rate };
    this.masterRates.set(id, updated);
    return updated;
  }

  // Travel Expenses
  async getTravelExpenses(): Promise<TravelExpense[]> {
    return Array.from(this.travelExpenses.values());
  }

  async createTravelExpense(expense: InsertTravelExpense): Promise<TravelExpense> {
    const id = this.currentId++;
    const travelExpense: TravelExpense = { 
      ...expense, 
      id,
      employeeId: expense.employeeId ?? null,
      accommodation: expense.accommodation ?? 0,
      allowance: expense.allowance ?? 0,
      transportation: expense.transportation ?? 0,
      taxi: expense.taxi ?? 0,
      total: expense.total ?? 0
    };
    this.travelExpenses.set(id, travelExpense);
    return travelExpense;
  }

  async updateTravelExpense(id: number, expense: Partial<InsertTravelExpense>): Promise<TravelExpense> {
    const existing = this.travelExpenses.get(id);
    if (!existing) {
      throw new Error("Travel expense not found");
    }
    const updated = { ...existing, ...expense };
    this.travelExpenses.set(id, updated);
    return updated;
  }

  // Assistance Payments
  async getAssistancePayments(): Promise<AssistancePayment[]> {
    return Array.from(this.assistancePayments.values());
  }

  async createAssistancePayment(payment: InsertAssistancePayment): Promise<AssistancePayment> {
    const id = this.currentId++;
    const assistancePayment: AssistancePayment = { 
      ...payment, 
      id,
      employeeId: payment.employeeId ?? null,
      rentAssistance: payment.rentAssistance ?? 0,
      months: payment.months ?? 0,
      yearlyAssistance: payment.yearlyAssistance ?? 0,
      oneTimeAssistance: payment.oneTimeAssistance ?? 0,
      total: payment.total ?? 0
    };
    this.assistancePayments.set(id, assistancePayment);
    return assistancePayment;
  }

  async updateAssistancePayment(id: number, payment: Partial<InsertAssistancePayment>): Promise<AssistancePayment> {
    const existing = this.assistancePayments.get(id);
    if (!existing) {
      throw new Error("Assistance payment not found");
    }
    const updated = { ...existing, ...payment };
    this.assistancePayments.set(id, updated);
    return updated;
  }

  // Overtime Payments
  async getOvertimePayments(): Promise<OvertimePayment[]> {
    return Array.from(this.overtimePayments.values());
  }

  async createOvertimePayment(payment: InsertOvertimePayment): Promise<OvertimePayment> {
    const id = this.currentId++;
    const overtimePayment: OvertimePayment = { 
      ...payment, 
      id,
      employeeId: payment.employeeId ?? null,
      hours: payment.hours ?? 0,
      hourlyRate: payment.hourlyRate ?? 0,
      total: payment.total ?? 0
    };
    this.overtimePayments.set(id, overtimePayment);
    return overtimePayment;
  }

  async updateOvertimePayment(id: number, payment: Partial<InsertOvertimePayment>): Promise<OvertimePayment> {
    const existing = this.overtimePayments.get(id);
    if (!existing) {
      throw new Error("Overtime payment not found");
    }
    const updated = { ...existing, ...payment };
    this.overtimePayments.set(id, updated);
    return updated;
  }

  // Working Days
  async getWorkingDays(): Promise<WorkingDay[]> {
    return Array.from(this.workingDays.values());
  }

  async createWorkingDay(workingDay: InsertWorkingDay): Promise<WorkingDay> {
    const id = this.currentId++;
    const wd: WorkingDay = { 
      ...workingDay, 
      id,
      additionalHolidays: workingDay.additionalHolidays ?? 0
    };
    this.workingDays.set(id, wd);
    return wd;
  }

  async updateWorkingDay(id: number, workingDay: Partial<InsertWorkingDay>): Promise<WorkingDay> {
    const existing = this.workingDays.get(id);
    if (!existing) {
      throw new Error("Working day not found");
    }
    const updated = { ...existing, ...workingDay };
    this.workingDays.set(id, updated);
    return updated;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId++;
    const newUser: User = { 
      ...user, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Utility methods
  async resetAllData(): Promise<void> {
    this.budgetItems.clear();
    this.employees.clear();
    this.masterRates.clear();
    this.travelExpenses.clear();
    this.assistancePayments.clear();
    this.overtimePayments.clear();
    this.workingDays.clear();
    this.users.clear();
    this.currentId = 1;
    this.initializeDefaultData();
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  private initialized = false;

  private async ensureInitialized() {
    if (!this.initialized) {
      const existingItems = await db.select().from(budgetItems);
      if (existingItems.length === 0) {
        await this.initializeDefaultData();
      }
      this.initialized = true;
    }
  }

  async getBudgetItems(): Promise<BudgetItem[]> {
    await this.ensureInitialized();
    return await db.select().from(budgetItems);
  }

  async createBudgetItem(item: InsertBudgetItem): Promise<BudgetItem> {
    const [created] = await db.insert(budgetItems).values(item).returning();
    return created;
  }

  async updateBudgetItem(id: number, item: Partial<InsertBudgetItem>): Promise<BudgetItem> {
    const [updated] = await db.update(budgetItems).set(item).where(eq(budgetItems.id, id)).returning();
    return updated;
  }

  async deleteBudgetItem(id: number): Promise<void> {
    await db.delete(budgetItems).where(eq(budgetItems.id, id));
  }

  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [created] = await db.insert(employees).values(employee).returning();
    return created;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee> {
    const [updated] = await db.update(employees).set(employee).where(eq(employees.id, id)).returning();
    return updated;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  async getMasterRates(): Promise<MasterRate[]> {
    return await db.select().from(masterRates);
  }

  async createMasterRate(rate: InsertMasterRate): Promise<MasterRate> {
    const [created] = await db.insert(masterRates).values(rate).returning();
    return created;
  }

  async updateMasterRate(id: number, rate: Partial<InsertMasterRate>): Promise<MasterRate> {
    const [updated] = await db.update(masterRates).set(rate).where(eq(masterRates.id, id)).returning();
    return updated;
  }

  async getTravelExpenses(): Promise<TravelExpense[]> {
    return await db.select().from(travelExpenses);
  }

  async createTravelExpense(expense: InsertTravelExpense): Promise<TravelExpense> {
    const [created] = await db.insert(travelExpenses).values(expense).returning();
    return created;
  }

  async updateTravelExpense(id: number, expense: Partial<InsertTravelExpense>): Promise<TravelExpense> {
    const [updated] = await db.update(travelExpenses).set(expense).where(eq(travelExpenses.id, id)).returning();
    return updated;
  }

  async getAssistancePayments(): Promise<AssistancePayment[]> {
    return await db.select().from(assistancePayments);
  }

  async createAssistancePayment(payment: InsertAssistancePayment): Promise<AssistancePayment> {
    const [created] = await db.insert(assistancePayments).values(payment).returning();
    return created;
  }

  async updateAssistancePayment(id: number, payment: Partial<InsertAssistancePayment>): Promise<AssistancePayment> {
    const [updated] = await db.update(assistancePayments).set(payment).where(eq(assistancePayments.id, id)).returning();
    return updated;
  }

  async getOvertimePayments(): Promise<OvertimePayment[]> {
    return await db.select().from(overtimePayments);
  }

  async createOvertimePayment(payment: InsertOvertimePayment): Promise<OvertimePayment> {
    const [created] = await db.insert(overtimePayments).values(payment).returning();
    return created;
  }

  async updateOvertimePayment(id: number, payment: Partial<InsertOvertimePayment>): Promise<OvertimePayment> {
    const [updated] = await db.update(overtimePayments).set(payment).where(eq(overtimePayments.id, id)).returning();
    return updated;
  }

  async getWorkingDays(): Promise<WorkingDay[]> {
    return await db.select().from(workingDays);
  }

  async createWorkingDay(workingDay: InsertWorkingDay): Promise<WorkingDay> {
    const [created] = await db.insert(workingDays).values(workingDay).returning();
    return created;
  }

  async updateWorkingDay(id: number, workingDay: Partial<InsertWorkingDay>): Promise<WorkingDay> {
    const [updated] = await db.update(workingDays).set(workingDay).where(eq(workingDays.id, id)).returning();
    return updated;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async resetAllData(): Promise<void> {
    // Clear all tables
    await db.delete(budgetItems);
    await db.delete(employees);
    await db.delete(masterRates);
    await db.delete(travelExpenses);
    await db.delete(assistancePayments);
    await db.delete(overtimePayments);
    await db.delete(workingDays);
    
    // Initialize with default data
    await this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Initialize MemStorage to get default data
    const memStorage = new MemStorage();
    
    // Get default data from MemStorage
    const defaultBudgetItems = await memStorage.getBudgetItems();
    const defaultEmployees = await memStorage.getEmployees();
    const defaultMasterRates = await memStorage.getMasterRates();
    
    // Insert default data into database
    if (defaultBudgetItems.length > 0) {
      await db.insert(budgetItems).values(defaultBudgetItems.map(item => ({
        currentYear: item.currentYear,
        compareYear: item.compareYear,
        name: item.name,
        budgetCode: item.budgetCode,
        accountCode: item.accountCode,
        currentYearAmount: item.currentYearAmount,
        compareYearAmount: item.compareYearAmount,
        category: item.category,
        notes: item.notes,
        sortOrder: item.sortOrder
      })));
    }
    
    if (defaultEmployees.length > 0) {
      await db.insert(employees).values(defaultEmployees.map(emp => ({
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        level: emp.level,
        salary: emp.salary || 0,
        allowance: (emp as any).positionAllowance || 0,
        startYear: (emp as any).workExperience || 2020,
        status: emp.status,
        gender: emp.gender,
        province: emp.province,
        tourCost: emp.tourCost || 0
      })));
    }
    
    if (defaultMasterRates.length > 0) {
      await db.insert(masterRates).values(defaultMasterRates.map(rate => ({
        category: rate.category,
        subcategory: rate.subcategory,
        rate: rate.rate,
        unit: (rate as any).unit || "บาท",
        description: rate.description
      })));
    }
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
