import { pgTable, text, serial, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  budgetCode: text("budget_code"),
  accountCode: text("account_code"),
  currentYearAmount: real("current_year_amount").default(0),
  compareYearAmount: real("compare_year_amount").default(0),
  currentYear: integer("current_year").notNull(),
  compareYear: integer("compare_year").notNull(),
  category: text("category").notNull(),
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeCode: text("employee_code").notNull(),
  fullName: text("full_name").notNull(),
  status: text("status").notNull(),
  gender: text("gender").notNull(),
  startYear: integer("start_year").notNull(),
  level: text("level").notNull(),
  province: text("province").notNull(),
  tourCost: real("tour_cost").default(0),
  salary: real("salary").default(0),
  allowance: real("allowance").default(0),
});

export const masterRates = pgTable("master_rates", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  rate: real("rate").notNull(),
  unit: text("unit").notNull(),
  description: text("description"),
});

export const travelExpenses = pgTable("travel_expenses", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  travelType: text("travel_type").notNull(),
  year: integer("year").notNull(),
  accommodation: real("accommodation").default(0),
  allowance: real("allowance").default(0),
  transportation: real("transportation").default(0),
  taxi: real("taxi").default(0),
  total: real("total").default(0),
});

export const assistancePayments = pgTable("assistance_payments", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  year: integer("year").notNull(),
  rentAssistance: real("rent_assistance").default(0),
  months: integer("months").default(0),
  yearlyAssistance: real("yearly_assistance").default(0),
  oneTimeAssistance: real("one_time_assistance").default(0),
  total: real("total").default(0),
});

export const overtimePayments = pgTable("overtime_payments", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  year: integer("year").notNull(),
  hours: real("hours").default(0),
  hourlyRate: real("hourly_rate").default(0),
  total: real("total").default(0),
});

export const workingDays = pgTable("working_days", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  totalDays: integer("total_days").notNull(),
  weekendDays: integer("weekend_days").notNull(),
  holidays: integer("holidays").notNull(),
  additionalHolidays: integer("additional_holidays").default(0),
  workingDays: integer("working_days").notNull(),
});

export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({
  id: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});

export const insertMasterRateSchema = createInsertSchema(masterRates).omit({
  id: true,
});

export const insertTravelExpenseSchema = createInsertSchema(travelExpenses).omit({
  id: true,
});

export const insertAssistancePaymentSchema = createInsertSchema(assistancePayments).omit({
  id: true,
});

export const insertOvertimePaymentSchema = createInsertSchema(overtimePayments).omit({
  id: true,
});

export const insertWorkingDaySchema = createInsertSchema(workingDays).omit({
  id: true,
});

export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type MasterRate = typeof masterRates.$inferSelect;
export type InsertMasterRate = z.infer<typeof insertMasterRateSchema>;

export type TravelExpense = typeof travelExpenses.$inferSelect;
export type InsertTravelExpense = z.infer<typeof insertTravelExpenseSchema>;

export type AssistancePayment = typeof assistancePayments.$inferSelect;
export type InsertAssistancePayment = z.infer<typeof insertAssistancePaymentSchema>;

export type OvertimePayment = typeof overtimePayments.$inferSelect;
export type InsertOvertimePayment = z.infer<typeof insertOvertimePaymentSchema>;

export type WorkingDay = typeof workingDays.$inferSelect;
export type InsertWorkingDay = z.infer<typeof insertWorkingDaySchema>;
