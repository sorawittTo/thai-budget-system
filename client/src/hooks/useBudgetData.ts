import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { BudgetItem, Employee } from "@shared/schema";

export function useBudgetData() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const budgetQuery = useQuery({
    queryKey: ["/api/budget-items"],
    queryFn: async () => {
      const response = await fetch("/api/budget-items");
      return response.json();
    },
  });

  const employeeQuery = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      return response.json();
    },
  });

  useEffect(() => {
    if (budgetQuery.data) {
      setBudgetItems(budgetQuery.data);
    }
  }, [budgetQuery.data]);

  useEffect(() => {
    if (employeeQuery.data) {
      setEmployees(employeeQuery.data);
    }
  }, [employeeQuery.data]);

  return {
    budgetItems,
    employees,
    isLoading: budgetQuery.isLoading || employeeQuery.isLoading,
    error: budgetQuery.error || employeeQuery.error,
  };
}
