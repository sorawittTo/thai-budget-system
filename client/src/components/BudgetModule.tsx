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
    // หา item ที่จะเลื่อนและหมวดหมู่ที่อยู่
    let currentItem: BudgetItem | null = null;
    let currentGroup: BudgetGroup | null = null;
    let currentIndex = -1;
    
    for (const group of budgetGroups) {
      const itemIndex = group.items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        currentItem = group.items[itemIndex];
        currentGroup = group;
        currentIndex = itemIndex;
        break;
      }
    }
    
    if (!currentItem || !currentGroup) return;
    
    // คำนวณตำแหน่งใหม่
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    // ตรวจสอบว่าตำแหน่งใหม่อยู่ในขอบเขตของหมวดหมู่เดียวกัน
    if (targetIndex >= 0 && targetIndex < currentGroup.items.length) {
      const targetItem = currentGroup.items[targetIndex];
      
      // สลับ sort orders
      const currentSortOrder = currentItem.sortOrder || 0;
      const targetSortOrder = targetItem.sortOrder || 0;
      
      updateBudgetItemMutation.mutate({ 
        id: currentItem.id, 
        sortOrder: targetSortOrder 
      });
      updateBudgetItemMutation.mutate({ 
        id: targetItem.id, 
        sortOrder: currentSortOrder 
      });
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
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold">งบประมาณประจำปี</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">ปีปัจจุบัน:</span>
              <select
                value={newItem.currentYear}
                onChange={(e) => setNewItem({ ...newItem, currentYear: parseInt(e.target.value) })}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {Array.from({ length: 10 }, (_, i) => 2568 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <span className="text-sm">เปรียบเทียบ:</span>
              <select
                value={newItem.compareYear}
                onChange={(e) => setNewItem({ ...newItem, compareYear: parseInt(e.target.value) })}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {Array.from({ length: 10 }, (_, i) => 2568 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
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
              <table className="budget-table text-sm border-collapse border border-gray-300">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-2 py-3 text-center border border-gray-300" style={{ width: '60px' }}>ลำดับ</th>
                    <th className="px-2 py-3 text-center border border-gray-300" style={{ width: '120px' }}>รหัสงบประมาณ</th>
                    <th className="px-2 py-3 text-center border border-gray-300" style={{ width: '120px' }}>รหัสบัญชี</th>
                    <th className="px-4 py-3 text-left border border-gray-300 item-name-cell" style={{ width: '350px' }}>รายการ</th>
                    <th className="px-2 py-3 text-center border border-gray-300" style={{ width: '100px' }}>ปี {newItem.currentYear}</th>
                    <th className="px-2 py-3 text-center border border-gray-300" style={{ width: '100px' }}>ปี {newItem.compareYear}</th>
                    <th className="px-2 py-3 text-center border border-gray-300" style={{ width: '100px' }}>เปลี่ยนแปลง</th>
                    <th className="px-4 py-3 text-left border border-gray-300" style={{ width: '150px' }}>หมายเหตุ</th>
                    <th className="px-2 py-3 text-center border border-gray-300" style={{ width: '100px' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item, itemIndex) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-3 border border-gray-300 text-center w-16">
                        {itemIndex + 1}
                      </td>
                      <td className="px-2 py-3 border border-gray-300 w-28">
                        <input
                          type="text"
                          value={item.budgetCode || ""}
                          onChange={(e) => handleUpdateItem(item.id, "budgetCode", e.target.value)}
                          className="flat-input w-full text-center"
                          placeholder="รหัสงบประมาณ"
                        />
                      </td>
                      <td className="px-2 py-3 border border-gray-300 w-28">
                        <input
                          type="text"
                          value={item.accountCode || ""}
                          onChange={(e) => handleUpdateItem(item.id, "accountCode", e.target.value)}
                          className="flat-input w-full text-center"
                          placeholder="รหัสบัญชี"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 item-name-cell">
                        <textarea
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                          className="flat-input item-name-input resize-none"
                          rows={2}
                          style={{ width: '100%', height: 'auto', minHeight: '2.5rem' }}
                        />
                      </td>
                      <td className="px-2 py-3 border border-gray-300 text-right w-24">
                        <input
                          type="number"
                          value={item.currentYearAmount || 0}
                          onChange={(e) => handleUpdateItem(item.id, "currentYearAmount", parseFloat(e.target.value) || 0)}
                          className="flat-input w-full text-right"
                        />
                      </td>
                      <td className="px-2 py-3 border border-gray-300 text-right w-24">
                        <input
                          type="number"
                          value={item.compareYearAmount || 0}
                          onChange={(e) => handleUpdateItem(item.id, "compareYearAmount", parseFloat(e.target.value) || 0)}
                          className="flat-input w-full text-right"
                        />
                      </td>
                      <td className="px-2 py-3 border border-gray-300 text-right w-24">
                        <span className={`font-medium text-sm ${
                          ((item.compareYearAmount || 0) - (item.currentYearAmount || 0)) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {((item.compareYearAmount || 0) - (item.currentYearAmount || 0)).toLocaleString('th-TH')}
                        </span>
                      </td>
                      <td className="px-4 py-3 border border-gray-300 w-32">
                        <input
                          type="text"
                          value={item.notes || ""}
                          onChange={(e) => handleUpdateItem(item.id, "notes", e.target.value)}
                          className="flat-input w-full text-left"
                          placeholder="หมายเหตุ"
                        />
                      </td>
                      <td className="px-2 py-3 border border-gray-300 text-center w-20">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleMoveItem(item.id, "up")}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="เลื่อนขึ้น"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleMoveItem(item.id, "down")}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="เลื่อนลง"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="ลบ"
                          >
                            <Trash2 className="h-3 w-3" />
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
              <div className="text-sm text-gray-600">รวมปี {newItem.currentYear}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {budgetGroups.reduce((sum, group) => 
                  sum + group.items.reduce((itemSum, item) => itemSum + (item.compareYearAmount || 0), 0), 0
                ).toLocaleString('th-TH')}
              </div>
              <div className="text-sm text-gray-600">รวมปี {newItem.compareYear}</div>
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