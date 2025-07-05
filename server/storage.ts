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
    // Initialize with default master rates
    const defaultRates: InsertMasterRate[] = [
      { category: "allowance", subcategory: "daily", rate: 240, unit: "บาท/วัน", description: "ค่าเบี้ยเลี้ยงรายวัน" },
      { category: "allowance", subcategory: "accommodation", rate: 800, unit: "บาท/คืน", description: "ค่าที่พัก" },
      { category: "transport", subcategory: "bus", rate: 4, unit: "บาท/กม.", description: "ค่ารถประจำทาง" },
      { category: "transport", subcategory: "taxi", rate: 20, unit: "บาท/กม.", description: "ค่ารถรับจ้าง" },
      { category: "overtime", subcategory: "holiday", rate: 150, unit: "บาท/ชั่วโมง", description: "ค่าล่วงเวลาวันหยุด" },
    ];

    defaultRates.forEach(rate => {
      this.createMasterRate(rate);
    });
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
      compareYearAmount: item.compareYearAmount ?? 0
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
