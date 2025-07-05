import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Printer, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { BudgetItem } from "@shared/schema";

export default function BudgetModule() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear() + 543);
  const [compareYear, setCompareYear] = useState(new Date().getFullYear() + 542);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const queryClient = useQueryClient();

  const { data: budgetData, isLoading } = useQuery({
    queryKey: ["/api/budget-items"],
    queryFn: async () => {
      const response = await fetch("/api/budget-items");
      return response.json();
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (item: Omit<BudgetItem, "id">) => {
      const response = await apiRequest("POST", "/api/budget-items", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget-items"] });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, ...item }: Partial<BudgetItem> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/budget-items/${id}`, item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget-items"] });
    },
  });

  useEffect(() => {
    if (budgetData) {
      setBudgetItems(budgetData);
    }
  }, [budgetData]);

  const handleYearChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentYear(prev => prev - 1);
      setCompareYear(prev => prev - 1);
    } else {
      setCurrentYear(prev => prev + 1);
      setCompareYear(prev => prev + 1);
    }
  };

  const handleAddBudgetItem = () => {
    const newItem = {
      name: "รายการใหม่",
      currentYearAmount: 0,
      compareYearAmount: 0,
      currentYear,
      compareYear,
      category: "อื่นๆ",
    };
    createBudgetMutation.mutate(newItem);
  };

  const handleUpdateBudgetItem = (id: number, field: string, value: number) => {
    updateBudgetMutation.mutate({ id, [field]: value });
  };

  const calculateDifference = (current: number, compare: number) => {
    return current - compare;
  };

  const calculatePercentage = (current: number, compare: number) => {
    if (compare === 0) return 0;
    return ((current - compare) / compare) * 100;
  };

  const getTotalCurrent = () => {
    return budgetItems.reduce((sum, item) => sum + (item.currentYearAmount || 0), 0);
  };

  const getTotalCompare = () => {
    return budgetItems.reduce((sum, item) => sum + (item.compareYearAmount || 0), 0);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="print-area">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <header className="bg-white text-gray-800 p-4 rounded-t-xl flex flex-wrap justify-between items-center gap-4 border-b">
          <div>
            <h2 className="text-xl font-bold">ตารางงบประมาณประจำปี</h2>
            <p className="text-sm text-gray-500">จัดการและเปรียบเทียบงบประมาณรายจ่าย</p>
          </div>
          <div className="flex items-center gap-4 no-print">
            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleYearChange("prev")}
                className="p-1 rounded-md hover:bg-gray-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Select value={currentYear.toString()} onValueChange={(value) => setCurrentYear(parseInt(value))}>
                  <SelectTrigger className="w-20 bg-transparent border-none p-0 h-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => {
                      const year = new Date().getFullYear() + 543 - 5 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <span>vs</span>
                <Select value={compareYear.toString()} onValueChange={(value) => setCompareYear(parseInt(value))}>
                  <SelectTrigger className="w-20 bg-transparent border-none p-0 h-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => {
                      const year = new Date().getFullYear() + 543 - 5 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleYearChange("next")}
                className="p-1 rounded-md hover:bg-gray-200"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Printer className="h-5 w-5" />
              พิมพ์
            </Button>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="py-3 px-4 text-left font-semibold">รายการ</th>
                <th className="py-3 px-4 text-right font-semibold">
                  ปี {currentYear}
                </th>
                <th className="py-3 px-4 text-right font-semibold">
                  ปี {compareYear}
                </th>
                <th className="py-3 px-4 text-right font-semibold">ผลต่าง</th>
                <th className="py-3 px-4 text-right font-semibold">%</th>
              </tr>
            </thead>
            <tbody>
              {budgetItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-right">
                    <Input
                      type="number"
                      value={item.currentYearAmount || 0}
                      onChange={(e) => handleUpdateBudgetItem(item.id, "currentYearAmount", parseFloat(e.target.value) || 0)}
                      className="flat-input text-right border-none bg-transparent"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Input
                      type="number"
                      value={item.compareYearAmount || 0}
                      onChange={(e) => handleUpdateBudgetItem(item.id, "compareYearAmount", parseFloat(e.target.value) || 0)}
                      className="flat-input text-right border-none bg-transparent"
                    />
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {calculateDifference(item.currentYearAmount || 0, item.compareYearAmount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {calculatePercentage(item.currentYearAmount || 0, item.compareYearAmount || 0).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-200 font-bold">
                <td className="py-3 px-4">รวมทั้งหมด</td>
                <td className="py-3 px-4 text-right">{getTotalCurrent().toLocaleString()}</td>
                <td className="py-3 px-4 text-right">{getTotalCompare().toLocaleString()}</td>
                <td className="py-3 px-4 text-right">
                  {calculateDifference(getTotalCurrent(), getTotalCompare()).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right">
                  {calculatePercentage(getTotalCurrent(), getTotalCompare()).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 no-print">
          <Button
            onClick={handleAddBudgetItem}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="h-5 w-5" />
            เพิ่มรายการใหม่
          </Button>
        </div>
      </div>
    </div>
  );
}
