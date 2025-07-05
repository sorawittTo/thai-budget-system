import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Printer, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { BudgetItem } from "@shared/schema";

export default function BudgetModule() {
  const [currentYear, setCurrentYear] = useState(2568);
  const [compareYear, setCompareYear] = useState(2569);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const queryClient = useQueryClient();

  const { data: budgetData, isLoading } = useQuery({
    queryKey: ["/api/budget-items"],
    queryFn: async () => {
      const response = await fetch("/api/budget-items");
      return response.json();
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

  const createBudgetMutation = useMutation({
    mutationFn: async (item: Omit<BudgetItem, "id">) => {
      const response = await apiRequest("POST", "/api/budget-items", item);
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

  const handleUpdateBudgetItem = (id: number, field: string, value: any) => {
    updateBudgetMutation.mutate({ id, [field]: value });
  };

  const handleAddBudgetItem = () => {
    const newItem = {
      name: "รายการใหม่",
      currentYearAmount: 0,
      compareYearAmount: 0,
      currentYear,
      compareYear,
      category: "หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป",
    };
    createBudgetMutation.mutate(newItem);
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

  // Group budget items by category
  const groupedItems = budgetItems.reduce((groups, item) => {
    const category = item.category || 'อื่นๆ';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, BudgetItem[]>);

  const categories = [
    'หมวด 1 : ค่าใช้จ่ายเกี่ยวกับพนักงาน',
    'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป',
    'หมวด 4 : เงินช่วยเหลือภายนอกและเงินบริจาค',
    'หมวด 58: ค่าใช้จ่ายด้านการผลิต',
    'หมวด 7 : สินทรัพย์ถาวร'
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div id="view-budget" className="main-view">
      <header className="bg-white text-gray-800 p-4 rounded-t-xl flex flex-wrap justify-between items-center gap-4 border-b">
        <div>
          <h2 className="text-xl font-bold">ตารางงบประมาณประจำปี</h2>
          <p className="text-sm text-gray-500">จัดการและเปรียบเทียบงบประมาณรายจ่าย</p>
        </div>
        <div className="flex items-center gap-4 no-print">
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
            <button 
              onClick={() => handleYearChange("prev")}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors" 
              title="ปีก่อนหน้า"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <select 
                value={currentYear} 
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="bg-transparent border-none text-gray-700 focus:ring-0 p-0"
              >
                {Array.from({ length: 13 }, (_, i) => 2568 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <span>vs</span>
              <select 
                value={compareYear} 
                onChange={(e) => setCompareYear(parseInt(e.target.value))}
                className="bg-transparent border-none text-gray-700 focus:ring-0 p-0"
              >
                {Array.from({ length: 13 }, (_, i) => 2568 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => handleYearChange("next")}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors" 
              title="ปีถัดไป"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
          >
            พิมพ์
          </button>
        </div>
      </header>
      
      <div className="bg-white p-4 rounded-b-xl shadow-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-4 py-3 text-left border border-gray-300">รหัสบัญชี</th>
              <th className="px-4 py-3 text-left border border-gray-300">รายการ</th>
              <th className="px-4 py-3 text-right border border-gray-300">งบประมาณปี {currentYear}</th>
              <th className="px-4 py-3 text-right border border-gray-300">คำของบประมาณปี {compareYear}</th>
              <th className="px-4 py-3 text-right border border-gray-300">ผลต่าง (+/-)</th>
              <th className="px-4 py-3 text-left border border-gray-300">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody id="budget-table-body-new">
            {/* Main Header */}
            <tr className="bg-indigo-600 text-white font-bold">
              <td colSpan={6} className="px-4 py-3 border border-gray-300 text-lg">รวมงบประมาณรายจ่ายดำเนินงาน</td>
            </tr>
            
            {categories.map((category) => (
              groupedItems[category] && groupedItems[category].length > 0 && (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr className="bg-gray-200 font-semibold">
                    <td colSpan={6} className="px-4 py-2 border border-gray-300">{category}</td>
                  </tr>
                  
                  {/* Category Items */}
                  {groupedItems[category].map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-300">
                        <input 
                          type="text" 
                          className="flat-input text-left w-full"
                          placeholder="รหัสบัญชี"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <input 
                          type="text" 
                          value={item.name} 
                          onChange={(e) => handleUpdateBudgetItem(item.id, "name", e.target.value)}
                          className="flat-input text-left w-full"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-right">
                        <input
                          type="number"
                          value={item.currentYearAmount || 0}
                          onChange={(e) => handleUpdateBudgetItem(item.id, "currentYearAmount", parseFloat(e.target.value) || 0)}
                          className="flat-input text-right w-full"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-right">
                        <input
                          type="number"
                          value={item.compareYearAmount || 0}
                          onChange={(e) => handleUpdateBudgetItem(item.id, "compareYearAmount", parseFloat(e.target.value) || 0)}
                          className="flat-input text-right w-full"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-right">
                        {((item.currentYearAmount || 0) - (item.compareYearAmount || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <input 
                          type="text" 
                          placeholder="หมายเหตุ" 
                          className="flat-input text-left w-full"
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            ))}

            {/* Asset Section Header */}
            <tr className="bg-indigo-600 text-white font-bold">
              <td colSpan={6} className="px-4 py-3 border border-gray-300 text-lg">รวมงบประมาณรายจ่ายสินทรัพย์</td>
            </tr>
          </tbody>
          
          <tfoot className="font-bold bg-gray-100">
            <tr id="budget-table-footer-new">
              <td colSpan={2} className="px-4 py-3 text-lg border border-gray-300">รวมงบประมาณรายจ่ายทั้งสิ้น</td>
              <td className="px-4 py-3 text-right text-lg border border-gray-300" id="grand-total-current">
                {getTotalCurrent().toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right text-lg border border-gray-300" id="grand-total-next">
                {getTotalCompare().toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right text-lg border border-gray-300">
                {(getTotalCurrent() - getTotalCompare()).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 border border-gray-300"></td>
            </tr>
          </tfoot>
        </table>
        
        <div className="mt-4 flex justify-start">
          <button 
            onClick={handleAddBudgetItem} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm no-print"
          >
            เพิ่มรายการใหม่
          </button>
        </div>
      </div>
    </div>
  );
}