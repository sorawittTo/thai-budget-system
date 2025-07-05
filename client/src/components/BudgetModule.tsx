import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown, Edit3, Save, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { BudgetItem, InsertBudgetItem } from "@shared/schema";

interface BudgetGroup {
  category: string;
  items: BudgetItem[];
}

export default function BudgetModule() {
  const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    budgetCode: "",
    accountCode: "",
    currentYearAmount: 0,
    compareYearAmount: 0,
    currentYear: 2568,
    compareYear: 2569,
    category: "",
    notes: "",
    sortOrder: 0
  });
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: budgetData, isLoading } = useQuery({
    queryKey: ["/api/budget-items"],
    queryFn: async () => {
      const response = await fetch("/api/budget-items");
      return response.json();
    },
  });

  const createBudgetItemMutation = useMutation({
    mutationFn: async (item: InsertBudgetItem) => {
      const response = await apiRequest("POST", "/api/budget-items", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget-items"] });
      setNewItem({
        name: "",
        budgetCode: "",
        accountCode: "",
        currentYearAmount: 0,
        compareYearAmount: 0,
        currentYear: 2568,
        compareYear: 2569,
        category: "",
        notes: "",
        sortOrder: 0
      });
      setShowAddForm(false);
    },
  });

  const updateBudgetItemMutation = useMutation({
    mutationFn: async ({ id, ...item }: Partial<BudgetItem> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/budget-items/${id}`, item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget-items"] });
    },
  });

  const deleteBudgetItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/budget-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget-items"] });
    },
  });

  useEffect(() => {
    if (budgetData) {
      // Group budget items by category
      const grouped = budgetData.reduce((acc: { [key: string]: BudgetItem[] }, item: BudgetItem) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});

      const groups: BudgetGroup[] = Object.keys(grouped).map(category => ({
        category,
        items: grouped[category].sort((a: BudgetItem, b: BudgetItem) => (a.sortOrder || 0) - (b.sortOrder || 0))
      }));

      setBudgetGroups(groups);
    }
  }, [budgetData]);

  const handleAddItem = () => {
    if (newItem.name && newItem.category) {
      createBudgetItemMutation.mutate({
        ...newItem,
        budgetCode: newItem.budgetCode || null,
        accountCode: newItem.accountCode || null,
        notes: newItem.notes || null,
        sortOrder: newItem.sortOrder || 0
      });
    }
  };

  const handleUpdateItem = (id: number, field: string, value: any) => {
    updateBudgetItemMutation.mutate({ id, [field]: value });
  };

  const handleDeleteItem = (id: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      deleteBudgetItemMutation.mutate(id);
    }
  };

  const handleMoveItem = (id: number, direction: "up" | "down") => {
    const allItems = budgetGroups.flatMap(group => group.items);
    const currentIndex = allItems.findIndex(item => item.id === id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < allItems.length) {
      const currentItem = allItems[currentIndex];
      const targetItem = allItems[targetIndex];
      
      // Swap sort orders
      updateBudgetItemMutation.mutate({ id: currentItem.id, sortOrder: targetItem.sortOrder });
      updateBudgetItemMutation.mutate({ id: targetItem.id, sortOrder: currentItem.sortOrder });
    }
  };

  const categories = [
    "หมวด 1 : ค่าใช้จ่ายเกี่ยวกับพนักงาน",
    "หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป",
    "หมวด 4 : เงินช่วยเหลือภายนอกและเงินบริจาค",
    "หมวด 58: ค่าใช้จ่ายด้านการผลิต",
    "หมวด 7 : สินทรัพย์ถาวร"
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
    <div id="view-budget" className="main-view bg-white rounded-xl shadow-lg">
      <header className="bg-white text-gray-800 p-4 rounded-t-xl border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">งบประมาณประจำปี {new Date().getFullYear() + 543}</h2>
            <p className="text-sm text-gray-500">จัดการรายการงบประมาณและเปรียบเทียบรายปี</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มรายการ
          </Button>
        </div>
      </header>

      <div className="p-4">
        {/* Add Item Form */}
        {showAddForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">เพิ่มรายการงบประมาณใหม่</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="ชื่อรายการ"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="flat-input border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="รหัสงบประมาณ"
                value={newItem.budgetCode}
                onChange={(e) => setNewItem({ ...newItem, budgetCode: e.target.value })}
                className="flat-input border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="รหัสบัญชี"
                value={newItem.accountCode}
                onChange={(e) => setNewItem({ ...newItem, accountCode: e.target.value })}
                className="flat-input border border-gray-300 rounded-md"
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="flat-input border border-gray-300 rounded-md"
              >
                <option value="">เลือกหมวด</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="จำนวนเงินปีปัจจุบัน"
                value={newItem.currentYearAmount}
                onChange={(e) => setNewItem({ ...newItem, currentYearAmount: parseFloat(e.target.value) || 0 })}
                className="flat-input border border-gray-300 rounded-md"
              />
              <input
                type="number"
                placeholder="จำนวนเงินปีเปรียบเทียบ"
                value={newItem.compareYearAmount}
                onChange={(e) => setNewItem({ ...newItem, compareYearAmount: parseFloat(e.target.value) || 0 })}
                className="flat-input border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="หมายเหตุ"
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                className="flat-input border border-gray-300 rounded-md col-span-2"
              />
              <div className="flex gap-2 col-span-2">
                <button
                  onClick={handleAddItem}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  บันทึก
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Budget Groups */}
        {budgetGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-8">
            <h3 className="text-lg font-semibold mb-4 bg-indigo-100 px-4 py-2 rounded-lg border-l-4 border-indigo-600">
              {group.category}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left border border-gray-300">ลำดับ</th>
                    <th className="px-4 py-3 text-left border border-gray-300">รหัสงบประมาณ</th>
                    <th className="px-4 py-3 text-left border border-gray-300">รหัสบัญชี</th>
                    <th className="px-4 py-3 text-left border border-gray-300">รายการ</th>
                    <th className="px-4 py-3 text-right border border-gray-300">ปี 2568</th>
                    <th className="px-4 py-3 text-right border border-gray-300">ปี 2569</th>
                    <th className="px-4 py-3 text-right border border-gray-300">เปลี่ยนแปลง</th>
                    <th className="px-4 py-3 text-left border border-gray-300">หมายเหตุ</th>
                    <th className="px-4 py-3 text-center border border-gray-300">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item, itemIndex) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-300 text-center">
                        {itemIndex + 1}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <input
                          type="text"
                          value={item.budgetCode || ""}
                          onChange={(e) => handleUpdateItem(item.id, "budgetCode", e.target.value)}
                          className="flat-input w-full"
                          placeholder="รหัสงบประมาณ"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <input
                          type="text"
                          value={item.accountCode || ""}
                          onChange={(e) => handleUpdateItem(item.id, "accountCode", e.target.value)}
                          className="flat-input w-full"
                          placeholder="รหัสบัญชี"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                          className="flat-input w-full"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-right">
                        <input
                          type="number"
                          value={item.currentYearAmount || 0}
                          onChange={(e) => handleUpdateItem(item.id, "currentYearAmount", parseFloat(e.target.value) || 0)}
                          className="flat-input w-full text-right"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-right">
                        <input
                          type="number"
                          value={item.compareYearAmount || 0}
                          onChange={(e) => handleUpdateItem(item.id, "compareYearAmount", parseFloat(e.target.value) || 0)}
                          className="flat-input w-full text-right"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-right">
                        <span className={`font-medium ${
                          ((item.compareYearAmount || 0) - (item.currentYearAmount || 0)) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {((item.compareYearAmount || 0) - (item.currentYearAmount || 0)).toLocaleString('th-TH')}
                        </span>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <input
                          type="text"
                          value={item.notes || ""}
                          onChange={(e) => handleUpdateItem(item.id, "notes", e.target.value)}
                          className="flat-input w-full"
                          placeholder="หมายเหตุ"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleMoveItem(item.id, "up")}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="เลื่อนขึ้น"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveItem(item.id, "down")}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="เลื่อนลง"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mt-6">
          <h3 className="text-lg font-semibold mb-4">สรุปงบประมาณ</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {budgetGroups.reduce((sum, group) => 
                  sum + group.items.reduce((itemSum, item) => itemSum + (item.currentYearAmount || 0), 0), 0
                ).toLocaleString('th-TH')}
              </div>
              <div className="text-sm text-gray-600">รวมปี 2568</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {budgetGroups.reduce((sum, group) => 
                  sum + group.items.reduce((itemSum, item) => itemSum + (item.compareYearAmount || 0), 0), 0
                ).toLocaleString('th-TH')}
              </div>
              <div className="text-sm text-gray-600">รวมปี 2569</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                (budgetGroups.reduce((sum, group) => 
                  sum + group.items.reduce((itemSum, item) => itemSum + (item.compareYearAmount || 0), 0), 0) - 
                budgetGroups.reduce((sum, group) => 
                  sum + group.items.reduce((itemSum, item) => itemSum + (item.currentYearAmount || 0), 0), 0)) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {(budgetGroups.reduce((sum, group) => 
                  sum + group.items.reduce((itemSum, item) => itemSum + (item.compareYearAmount || 0), 0), 0) - 
                budgetGroups.reduce((sum, group) => 
                  sum + group.items.reduce((itemSum, item) => itemSum + (item.currentYearAmount || 0), 0), 0)
                ).toLocaleString('th-TH')}
              </div>
              <div className="text-sm text-gray-600">ผลต่าง</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}