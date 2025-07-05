import {
  budgetItems,
  employees,
  masterRates,
  travelExpenses,
  assistancePayments,
  overtimePayments,
  workingDays,
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
} from "@shared/schema";

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
  private currentId: number;

  constructor() {
    this.budgetItems = new Map();
    this.employees = new Map();
    this.masterRates = new Map();
    this.travelExpenses = new Map();
    this.assistancePayments = new Map();
    this.overtimePayments = new Map();
    this.workingDays = new Map();
    this.currentId = 1;
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Original budget items from HTML file
    const defaultBudgetItems = [
      { currentYear: 2568, compareYear: 2569, name: 'ค่าใช้จ่ายกิจกรรมส่งเสริมค่านิยมร่วมขององค์กร', budgetCode: '52021100', category: 'หมวด 1 : ค่าใช้จ่ายเกี่ยวกับพนักงาน', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 1 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าไฟฟ้า', budgetCode: '52021200', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 2 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าน้ำประปา', budgetCode: '52021201', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 3 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าโทรศัพท์', budgetCode: '52021202', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 4 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าวัสดุทั่วไป', budgetCode: '52021203', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 5 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าวัสดุงานบ้านงานครัว', budgetCode: '52021204', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 6 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าจ้าง', budgetCode: '52021205', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 7 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าไปรษณียากรและพัสดุไปรษณีย์', budgetCode: '52021206', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 8 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าขนส่ง', budgetCode: '52021207', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 9 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าซ่อมแซมและบำรุงรักษา', budgetCode: '52021208', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 10 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าตอบแทน', budgetCode: '52021209', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 11 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าเช่า', budgetCode: '52021210', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 12 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่ารับรอง', budgetCode: '52021211', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 13 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าใช้จ่ายในการเดินทาง', budgetCode: '52021212', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 14 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าทรัพยากรสาสนเทศห้องสมุด', budgetCode: '52021213', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 15 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าจัดประชุม/ชี้แจง', budgetCode: '52021214', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 16 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าใช้จ่ายในการจัดงานและพิธีต่าง ๆ', budgetCode: '52021215', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 17 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าใช้จ่ายเบ็ดเตล็ด', budgetCode: '52021216', category: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 18 },
      { currentYear: 2568, compareYear: 2569, name: 'เงินบริจาค', budgetCode: '54021001', category: 'หมวด 4 : เงินช่วยเหลือภายนอกและเงินบริจาค', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 19 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าวัสดุผลิต - ทั่วไป', budgetCode: '58021001', category: 'หมวด 58: ค่าใช้จ่ายด้านการผลิต', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 20 },
      { currentYear: 2568, compareYear: 2569, name: 'ครุภัณฑ์เครื่องใช้ไฟฟ้าและประปา', budgetCode: '71021001', category: 'หมวด 7 : สินทรัพย์ถาวร', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 21 },
      { currentYear: 2568, compareYear: 2569, name: 'ครุภัณฑ์เบ็ดเตล็ด', budgetCode: '71021002', category: 'หมวด 7 : สินทรัพย์ถาวร', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 22 },
      { currentYear: 2568, compareYear: 2569, name: 'ครุภัณฑ์ยานพาหนะและขนส่ง', budgetCode: '71021003', category: 'หมวด 7 : สินทรัพย์ถาวร', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 23 },
      { currentYear: 2568, compareYear: 2569, name: 'ค่าเสริมสร้างปรับปรุงอาคารสถานที่', budgetCode: '71021004', category: 'หมวด 7 : สินทรัพย์ถาวร', currentYearAmount: 0, compareYearAmount: 0, notes: '', sortOrder: 24 },
    ];

    defaultBudgetItems.forEach((item, index) => {
      const budgetItem: BudgetItem = { 
        ...item, 
        id: index + 1,
        budgetCode: item.budgetCode || null,
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
      { category: "level_7", subcategory: "ผู้บริหารส่วน", rate: 8000, unit: "บาท", description: "เงินช่วยเหลือก้อน" },
      { category: "level_6", subcategory: "ผู้บริหารทีม", rate: 9500, unit: "บาท", description: "ค่าเช่า" },
      { category: "level_6", subcategory: "ผู้บริหารทีม", rate: 6250, unit: "บาท", description: "เงินช่วยเหลือรายเดือน" },
      { category: "level_5", subcategory: "เจ้าหน้าที่ชำนาญงาน", rate: 8000, unit: "บาท", description: "ค่าเช่า" },
      { category: "level_5", subcategory: "เจ้าหน้าที่ชำนาญงาน", rate: 5500, unit: "บาท", description: "เงินช่วยเหลือรายเดือน" },
      { category: "level_4", subcategory: "เจ้าหน้าที่", rate: 8000, unit: "บาท", description: "ค่าเช่า" },
      { category: "level_4", subcategory: "เจ้าหน้าที่", rate: 5500, unit: "บาท", description: "เงินช่วยเหลือรายเดือน" },
      { category: "level_3", subcategory: "พนักงานปฏิบัติการ", rate: 6500, unit: "บาท", description: "ค่าเช่า" },
      { category: "level_3", subcategory: "พนักงานปฏิบัติการ", rate: 4750, unit: "บาท", description: "เงินช่วยเหลือรายเดือน" },
      { category: "travel", subcategory: "perDiem", rate: 500, unit: "บาท/วัน", description: "ค่าเบี้ยเลี้ยง (ระดับ 7-6)" },
      { category: "travel", subcategory: "perDiem", rate: 450, unit: "บาท/วัน", description: "ค่าเบี้ยเลี้ยง (ระดับ 5-3)" },
      { category: "travel", subcategory: "hotel", rate: 2100, unit: "บาท/คืน", description: "ค่าที่พัก (ระดับ 7-6)" },
      { category: "travel", subcategory: "hotel", rate: 1800, unit: "บาท/คืน", description: "ค่าที่พัก (ระดับ 5-3)" },
      { category: "travel", subcategory: "transport", rate: 300, unit: "บาท", description: "ค่าเดินทาง" },
      { category: "travel", subcategory: "local", rate: 250, unit: "บาท", description: "ค่าเดินทางท้องถิ่น" },
    ];

    let rateId = 100;
    defaultRates.forEach(rate => {
      const masterRate: MasterRate = { ...rate, id: rateId++, description: rate.description ?? null };
      this.masterRates.set(masterRate.id, masterRate);
    });

    this.currentId = Math.max(
      Math.max(...Array.from(this.budgetItems.keys())) + 1,
      Math.max(...Array.from(this.employees.keys())) + 1,
      Math.max(...Array.from(this.masterRates.keys())) + 1
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

  // Utility methods
  async resetAllData(): Promise<void> {
    this.budgetItems.clear();
    this.employees.clear();
    this.masterRates.clear();
    this.travelExpenses.clear();
    this.assistancePayments.clear();
    this.overtimePayments.clear();
    this.workingDays.clear();
    this.currentId = 1;
    this.initializeDefaultData();
  }
}

export const storage = new MemStorage();
