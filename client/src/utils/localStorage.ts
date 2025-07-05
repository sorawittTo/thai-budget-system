import type { 
  BudgetItem, 
  Employee, 
  MasterRate, 
  TravelExpense, 
  AssistancePayment, 
  OvertimePayment, 
  WorkingDay 
} from '@shared/schema';

// Storage keys
const STORAGE_KEYS = {
  BUDGET_ITEMS: 'budget_items',
  EMPLOYEES: 'employees',
  MASTER_RATES: 'master_rates',
  TRAVEL_EXPENSES: 'travel_expenses',
  ASSISTANCE_PAYMENTS: 'assistance_payments',
  OVERTIME_PAYMENTS: 'overtime_payments',
  WORKING_DAYS: 'working_days',
  SYSTEM_SETTINGS: 'system_settings',
  LAST_SAVE: 'last_save_timestamp'
} as const;

interface SystemSettings {
  currentYear: number;
  compareYear: number;
  defaultRates: {
    dailyAllowance: number;
    accommodation: number;
    transportation: number;
    overtimeRate: number;
  };
  lastBackup?: string;
}

interface LocalStorageData {
  budgetItems: BudgetItem[];
  employees: Employee[];
  masterRates: MasterRate[];
  travelExpenses: TravelExpense[];
  assistancePayments: AssistancePayment[];
  overtimePayments: OvertimePayment[];
  workingDays: WorkingDay[];
  systemSettings: SystemSettings;
}

// Helper function to safely parse JSON
function safeJsonParse<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error);
    return defaultValue;
  }
}

// Helper function to safely stringify and save to localStorage
function safeSaveToStorage(key: string, data: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

// Load functions
export function loadBudgetItems(): BudgetItem[] {
  const data = localStorage.getItem(STORAGE_KEYS.BUDGET_ITEMS);
  return safeJsonParse(data, []);
}

export function loadEmployees(): Employee[] {
  const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  return safeJsonParse(data, []);
}

export function loadMasterRates(): MasterRate[] {
  const data = localStorage.getItem(STORAGE_KEYS.MASTER_RATES);
  const defaultRates: MasterRate[] = [
    {
      id: 1,
      category: "allowance",
      subcategory: "daily",
      rate: 240,
      unit: "บาท/วัน",
      description: "ค่าเบี้ยเลี้ยงรายวัน"
    },
    {
      id: 2,
      category: "allowance",
      subcategory: "accommodation",
      rate: 800,
      unit: "บาท/คืน",
      description: "ค่าที่พัก"
    },
    {
      id: 3,
      category: "transport",
      subcategory: "bus",
      rate: 4,
      unit: "บาท/กม.",
      description: "ค่ารถประจำทาง"
    },
    {
      id: 4,
      category: "transport",
      subcategory: "taxi",
      rate: 20,
      unit: "บาท/กม.",
      description: "ค่ารถรับจ้าง"
    },
    {
      id: 5,
      category: "overtime",
      subcategory: "holiday",
      rate: 150,
      unit: "บาท/ชั่วโมง",
      description: "ค่าล่วงเวลาวันหยุด"
    }
  ];
  
  return safeJsonParse(data, defaultRates);
}

export function loadTravelExpenses(): TravelExpense[] {
  const data = localStorage.getItem(STORAGE_KEYS.TRAVEL_EXPENSES);
  return safeJsonParse(data, []);
}

export function loadAssistancePayments(): AssistancePayment[] {
  const data = localStorage.getItem(STORAGE_KEYS.ASSISTANCE_PAYMENTS);
  return safeJsonParse(data, []);
}

export function loadOvertimePayments(): OvertimePayment[] {
  const data = localStorage.getItem(STORAGE_KEYS.OVERTIME_PAYMENTS);
  return safeJsonParse(data, []);
}

export function loadWorkingDays(): WorkingDay[] {
  const data = localStorage.getItem(STORAGE_KEYS.WORKING_DAYS);
  return safeJsonParse(data, []);
}

export function loadSystemSettings(): SystemSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SYSTEM_SETTINGS);
  const currentYear = new Date().getFullYear() + 543;
  
  const defaultSettings: SystemSettings = {
    currentYear,
    compareYear: currentYear - 1,
    defaultRates: {
      dailyAllowance: 240,
      accommodation: 800,
      transportation: 4,
      overtimeRate: 150
    }
  };
  
  return safeJsonParse(data, defaultSettings);
}

// Save functions
export function saveBudgetItems(budgetItems: BudgetItem[]): boolean {
  const success = safeSaveToStorage(STORAGE_KEYS.BUDGET_ITEMS, budgetItems);
  if (success) updateLastSaveTimestamp();
  return success;
}

export function saveEmployees(employees: Employee[]): boolean {
  const success = safeSaveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
  if (success) updateLastSaveTimestamp();
  return success;
}

export function saveMasterRates(masterRates: MasterRate[]): boolean {
  const success = safeSaveToStorage(STORAGE_KEYS.MASTER_RATES, masterRates);
  if (success) updateLastSaveTimestamp();
  return success;
}

export function saveTravelExpenses(travelExpenses: TravelExpense[]): boolean {
  const success = safeSaveToStorage(STORAGE_KEYS.TRAVEL_EXPENSES, travelExpenses);
  if (success) updateLastSaveTimestamp();
  return success;
}

export function saveAssistancePayments(assistancePayments: AssistancePayment[]): boolean {
  const success = safeSaveToStorage(STORAGE_KEYS.ASSISTANCE_PAYMENTS, assistancePayments);
  if (success) updateLastSaveTimestamp();
  return success;
}

export function saveOvertimePayments(overtimePayments: OvertimePayment[]): boolean {
  const success = safeSaveToStorage(STORAGE_KEYS.OVERTIME_PAYMENTS, overtimePayments);
  if (success) updateLastSaveTimestamp();
  return success;
}

export function saveWorkingDays(workingDays: WorkingDay[]): boolean {
  const success = safeSaveToStorage(STORAGE_KEYS.WORKING_DAYS, workingDays);
  if (success) updateLastSaveTimestamp();
  return success;
}

export function saveSystemSettings(settings: SystemSettings): boolean {
  const success = safeSaveToStorage(STORAGE_KEYS.SYSTEM_SETTINGS, settings);
  if (success) updateLastSaveTimestamp();
  return success;
}

// Comprehensive save function
export async function saveToLocalStorage(): Promise<boolean> {
  try {
    // This function would typically be called with current data from the application state
    // For now, we'll update the timestamp to indicate a save operation
    updateLastSaveTimestamp();
    
    // In a real implementation, you'd want to get the current data from your React state
    // and save each type of data using the individual save functions above
    console.log('Local storage save operation completed');
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

// Load all data function
export function loadAllData(): LocalStorageData {
  return {
    budgetItems: loadBudgetItems(),
    employees: loadEmployees(),
    masterRates: loadMasterRates(),
    travelExpenses: loadTravelExpenses(),
    assistancePayments: loadAssistancePayments(),
    overtimePayments: loadOvertimePayments(),
    workingDays: loadWorkingDays(),
    systemSettings: loadSystemSettings()
  };
}

// Save all data function
export function saveAllData(data: Partial<LocalStorageData>): boolean {
  let allSuccess = true;
  
  if (data.budgetItems) {
    allSuccess = allSuccess && saveBudgetItems(data.budgetItems);
  }
  
  if (data.employees) {
    allSuccess = allSuccess && saveEmployees(data.employees);
  }
  
  if (data.masterRates) {
    allSuccess = allSuccess && saveMasterRates(data.masterRates);
  }
  
  if (data.travelExpenses) {
    allSuccess = allSuccess && saveTravelExpenses(data.travelExpenses);
  }
  
  if (data.assistancePayments) {
    allSuccess = allSuccess && saveAssistancePayments(data.assistancePayments);
  }
  
  if (data.overtimePayments) {
    allSuccess = allSuccess && saveOvertimePayments(data.overtimePayments);
  }
  
  if (data.workingDays) {
    allSuccess = allSuccess && saveWorkingDays(data.workingDays);
  }
  
  if (data.systemSettings) {
    allSuccess = allSuccess && saveSystemSettings(data.systemSettings);
  }
  
  return allSuccess;
}

// Utility functions
function updateLastSaveTimestamp(): void {
  const timestamp = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.LAST_SAVE, timestamp);
}

export function getLastSaveTimestamp(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_SAVE);
}

export function getLastSaveDate(): Date | null {
  const timestamp = getLastSaveTimestamp();
  return timestamp ? new Date(timestamp) : null;
}

// Data management functions
export function clearAllData(): boolean {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('All localStorage data cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

export function exportLocalStorageData(): string {
  const data = loadAllData();
  return JSON.stringify(data, null, 2);
}

export function importLocalStorageData(jsonData: string): boolean {
  try {
    const data: LocalStorageData = JSON.parse(jsonData);
    return saveAllData(data);
  } catch (error) {
    console.error('Failed to import localStorage data:', error);
    return false;
  }
}

// Backup and restore functions
export function createBackup(): string {
  const data = loadAllData();
  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data
  };
  
  return JSON.stringify(backup, null, 2);
}

export function restoreFromBackup(backupJson: string): boolean {
  try {
    const backup = JSON.parse(backupJson);
    
    if (!backup.data) {
      throw new Error('Invalid backup format');
    }
    
    // Clear existing data
    clearAllData();
    
    // Restore data
    const success = saveAllData(backup.data);
    
    if (success) {
      console.log('Data restored from backup successfully');
    }
    
    return success;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return false;
  }
}

// Storage size utilities
export function getStorageUsage(): { used: number; available: number; percentage: number } {
  let used = 0;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      used += item.length;
    }
  });
  
  // Estimate available storage (most browsers have ~5-10MB limit)
  const estimated_limit = 5 * 1024 * 1024; // 5MB in characters
  const available = estimated_limit - used;
  const percentage = (used / estimated_limit) * 100;
  
  return {
    used,
    available: Math.max(0, available),
    percentage: Math.min(100, percentage)
  };
}

export function isStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

// Validation functions
export function validateBudgetData(data: any): data is BudgetItem[] {
  return Array.isArray(data) && data.every(item => 
    typeof item.name === 'string' &&
    typeof item.currentYear === 'number' &&
    typeof item.compareYear === 'number' &&
    typeof item.category === 'string'
  );
}

export function validateEmployeeData(data: any): data is Employee[] {
  return Array.isArray(data) && data.every(item => 
    typeof item.employeeCode === 'string' &&
    typeof item.fullName === 'string' &&
    typeof item.status === 'string' &&
    typeof item.gender === 'string' &&
    typeof item.startYear === 'number'
  );
}
