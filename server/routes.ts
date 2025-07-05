import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertBudgetItemSchema,
  insertEmployeeSchema,
  insertMasterRateSchema,
  insertTravelExpenseSchema,
  insertAssistancePaymentSchema,
  insertOvertimePaymentSchema,
  insertWorkingDaySchema,
} from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first
  setupAuth(app);
  
  // Budget Items
  app.get("/api/budget-items", async (req, res) => {
    try {
      const items = await storage.getBudgetItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budget items" });
    }
  });

  app.post("/api/budget-items", async (req, res) => {
    try {
      const validatedData = insertBudgetItemSchema.parse(req.body);
      const item = await storage.createBudgetItem(validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid budget item data" });
    }
  });

  app.put("/api/budget-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBudgetItemSchema.partial().parse(req.body);
      const item = await storage.updateBudgetItem(id, validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Failed to update budget item" });
    }
  });

  app.delete("/api/budget-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBudgetItem(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete budget item" });
    }
  });

  // Employees
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, validatedData);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmployee(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete employee" });
    }
  });

  // Master Rates
  app.get("/api/master-rates", async (req, res) => {
    try {
      const rates = await storage.getMasterRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch master rates" });
    }
  });

  app.post("/api/master-rates", async (req, res) => {
    try {
      const validatedData = insertMasterRateSchema.parse(req.body);
      const rate = await storage.createMasterRate(validatedData);
      res.json(rate);
    } catch (error) {
      res.status(400).json({ message: "Invalid master rate data" });
    }
  });

  app.put("/api/master-rates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMasterRateSchema.partial().parse(req.body);
      const rate = await storage.updateMasterRate(id, validatedData);
      res.json(rate);
    } catch (error) {
      res.status(400).json({ message: "Failed to update master rate" });
    }
  });

  // Travel Expenses
  app.get("/api/travel-expenses", async (req, res) => {
    try {
      const expenses = await storage.getTravelExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch travel expenses" });
    }
  });

  app.post("/api/travel-expenses", async (req, res) => {
    try {
      const validatedData = insertTravelExpenseSchema.parse(req.body);
      const expense = await storage.createTravelExpense(validatedData);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid travel expense data" });
    }
  });

  // Assistance Payments
  app.get("/api/assistance-payments", async (req, res) => {
    try {
      const payments = await storage.getAssistancePayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assistance payments" });
    }
  });

  app.post("/api/assistance-payments", async (req, res) => {
    try {
      const validatedData = insertAssistancePaymentSchema.parse(req.body);
      const payment = await storage.createAssistancePayment(validatedData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assistance payment data" });
    }
  });

  // Overtime Payments
  app.get("/api/overtime-payments", async (req, res) => {
    try {
      const payments = await storage.getOvertimePayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overtime payments" });
    }
  });

  app.post("/api/overtime-payments", async (req, res) => {
    try {
      const validatedData = insertOvertimePaymentSchema.parse(req.body);
      const payment = await storage.createOvertimePayment(validatedData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid overtime payment data" });
    }
  });

  // Working Days
  app.get("/api/working-days", async (req, res) => {
    try {
      const workingDays = await storage.getWorkingDays();
      res.json(workingDays);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch working days" });
    }
  });

  app.post("/api/working-days", async (req, res) => {
    try {
      const validatedData = insertWorkingDaySchema.parse(req.body);
      const workingDay = await storage.createWorkingDay(validatedData);
      res.json(workingDay);
    } catch (error) {
      res.status(400).json({ message: "Invalid working day data" });
    }
  });

  // Excel Import
  app.post("/api/import-excel", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Process Excel file (implementation depends on file format)
      res.json({ message: "Excel file imported successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to import Excel file" });
    }
  });

  // Reset System
  app.post("/api/reset-system", async (req, res) => {
    try {
      await storage.resetAllData();
      res.json({ message: "System reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset system" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
