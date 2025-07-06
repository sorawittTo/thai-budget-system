import express, { type Request, Response, NextFunction } from "express";
import { setupAuth } from "../server/auth";
import { storage } from "../server/storage";
import { 
  budgetItems, employees, masterRates, travelExpenses, 
  assistancePayments, overtimePayments, workingDays,
  insertBudgetItemSchema, insertEmployeeSchema, insertMasterRateSchema,
  insertTravelExpenseSchema, insertAssistancePaymentSchema, 
  insertOvertimePaymentSchema, insertWorkingDaySchema
} from "../shared/schema";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup authentication
setupAuth(app);

// API Routes
app.get("/api/budget-items", async (req, res) => {
  try {
    const items = await storage.getBudgetItems();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/budget-items", async (req, res) => {
  try {
    const validatedData = insertBudgetItemSchema.parse(req.body);
    const item = await storage.createBudgetItem(validatedData);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/budget-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertBudgetItemSchema.partial().parse(req.body);
    const item = await storage.updateBudgetItem(id, validatedData);
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/budget-items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBudgetItem(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Employees
app.get("/api/employees", async (req, res) => {
  try {
    const items = await storage.getEmployees();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const validatedData = insertEmployeeSchema.parse(req.body);
    const item = await storage.createEmployee(validatedData);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/employees/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertEmployeeSchema.partial().parse(req.body);
    const item = await storage.updateEmployee(id, validatedData);
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteEmployee(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Master Rates
app.get("/api/master-rates", async (req, res) => {
  try {
    const items = await storage.getMasterRates();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/master-rates", async (req, res) => {
  try {
    const validatedData = insertMasterRateSchema.parse(req.body);
    const item = await storage.createMasterRate(validatedData);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/master-rates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertMasterRateSchema.partial().parse(req.body);
    const item = await storage.updateMasterRate(id, validatedData);
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Travel Expenses
app.get("/api/travel-expenses", async (req, res) => {
  try {
    const items = await storage.getTravelExpenses();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/travel-expenses", async (req, res) => {
  try {
    const validatedData = insertTravelExpenseSchema.parse(req.body);
    const item = await storage.createTravelExpense(validatedData);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/travel-expenses/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertTravelExpenseSchema.partial().parse(req.body);
    const item = await storage.updateTravelExpense(id, validatedData);
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Assistance Payments
app.get("/api/assistance-payments", async (req, res) => {
  try {
    const items = await storage.getAssistancePayments();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/assistance-payments", async (req, res) => {
  try {
    const validatedData = insertAssistancePaymentSchema.parse(req.body);
    const item = await storage.createAssistancePayment(validatedData);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/assistance-payments/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertAssistancePaymentSchema.partial().parse(req.body);
    const item = await storage.updateAssistancePayment(id, validatedData);
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Overtime Payments
app.get("/api/overtime-payments", async (req, res) => {
  try {
    const items = await storage.getOvertimePayments();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/overtime-payments", async (req, res) => {
  try {
    const validatedData = insertOvertimePaymentSchema.parse(req.body);
    const item = await storage.createOvertimePayment(validatedData);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/overtime-payments/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertOvertimePaymentSchema.partial().parse(req.body);
    const item = await storage.updateOvertimePayment(id, validatedData);
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Working Days
app.get("/api/working-days", async (req, res) => {
  try {
    const items = await storage.getWorkingDays();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/working-days", async (req, res) => {
  try {
    const validatedData = insertWorkingDaySchema.parse(req.body);
    const item = await storage.createWorkingDay(validatedData);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/working-days/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertWorkingDaySchema.partial().parse(req.body);
    const item = await storage.updateWorkingDay(id, validatedData);
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Serve static files for non-API routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ message: "API endpoint not found" });
  } else {
    // For frontend routes, serve the main HTML
    res.send(`
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ระบบจัดการงบประมาณไทย</title>
</head>
<body>
    <div id="root"></div>
    <script>
        // Redirect to your actual frontend URL
        window.location.href = "https://thai-budget-system.vercel.app";
    </script>
</body>
</html>
    `);
  }
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default app;