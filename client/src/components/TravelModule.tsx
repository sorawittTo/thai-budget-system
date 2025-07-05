import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Employee, TravelExpense, InsertTravelExpense } from "@shared/schema";

export default function TravelModule() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear() + 543);
  const [activeTab, setActiveTab] = useState("souvenir");
  const [editingItem, setEditingItem] = useState<TravelExpense | null>(null);
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading: employeeLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: travelExpenses = [], isLoading: travelLoading } = useQuery({
    queryKey: ["/api/travel-expenses"],
  });

  const createTravelExpense = useMutation({
    mutationFn: async (expense: InsertTravelExpense) => {
      return await apiRequest("/api/travel-expenses", "POST", expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel-expenses"] });
    },
  });

  const updateTravelExpense = useMutation({
    mutationFn: async ({ id, ...expense }: Partial<TravelExpense> & { id: number }) => {
      return await apiRequest(`/api/travel-expenses/${id}`, "PUT", expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel-expenses"] });
      setEditingItem(null);
    },
  });

  const deleteTravelExpense = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/travel-expenses/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel-expenses"] });
    },
  });

  const handleYearChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentYear(prev => prev + 1);
    }
  };

  // Filter employees who have service years of 20, 25, 30, 35, or 40 years
  const eligibleEmployees = employees.filter((employee: Employee) => {
    const serviceYears = currentYear - employee.startYear;
    return [20, 25, 30, 35, 40].includes(serviceYears);
  });

  // Calculate active employees (for family visit)
  const activeEmployees = employees.filter((employee: Employee) => employee.status === "Active");

  const renderTabs = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={activeTab === "souvenir" ? "default" : "outline"}
        onClick={() => setActiveTab("souvenir")}
        className="text-sm"
      >
        รับของที่ระลึก
      </Button>
      <Button
        variant={activeTab === "family" ? "default" : "outline"}
        onClick={() => setActiveTab("family")}
        className="text-sm"
      >
        เยี่ยมครอบครัว
      </Button>
      <Button
        variant={activeTab === "company" ? "default" : "outline"}
        onClick={() => setActiveTab("company")}
        className="text-sm"
      >
        ร่วมงานวันพนักงาน
      </Button>
      <Button
        variant={activeTab === "rotation" ? "default" : "outline"}
        onClick={() => setActiveTab("rotation")}
        className="text-sm"
      >
        หมุนเวียนงาน ผจศ.
      </Button>
    </div>
  );

  const renderSouvenirTab = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4">สรุปค่าใช้จ่ายเดินทางเพื่อรับของที่ระลึก</h3>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700 mb-2">
          <strong>เกณฑ์อายุงานที่ได้รับของที่ระลึก:</strong> 20, 25, 30, 35, 40 ปี
        </p>
        <p className="text-sm text-gray-600">
          คำนวณจากปีที่กำหนด - ปีที่เริ่มงาน
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">ลำดับ</th>
              <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-center border border-gray-300">อายุงาน (ปี)</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าเบี้ยเลี้ยง</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าที่พัก</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าพาหนะ</th>
              <th className="px-4 py-3 text-center border border-gray-300">รวม</th>
              <th className="px-4 py-3 text-center border border-gray-300">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {eligibleEmployees.map((employee: Employee, index: number) => {
              const serviceYears = currentYear - employee.startYear;
              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border border-gray-300">{index + 1}</td>
                  <td className="px-4 py-3 border border-gray-300">{employee.fullName}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{serviceYears}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">500</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">2,100</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">8,000</td>
                  <td className="px-4 py-3 border border-gray-300 text-center font-semibold">10,600</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มรายการ
        </Button>
        <div className="text-lg font-semibold">
          รวมทั้งสิ้น: {(eligibleEmployees.length * 10600).toLocaleString()} บาท
        </div>
      </div>
    </div>
  );

  const renderFamilyTab = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4">สรุปค่าเดินทางเยี่ยมครอบครัว</h3>
      
      <div className="mb-4 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>เงื่อนไข:</strong> แสดงเฉพาะพนักงานที่มีสถานะ Active เท่านั้น
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">ลำดับ</th>
              <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-center border border-gray-300">สถานะ</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าเบี้ยเลี้ยง</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าที่พัก</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าพาหนะ</th>
              <th className="px-4 py-3 text-center border border-gray-300">รวม</th>
              <th className="px-4 py-3 text-center border border-gray-300">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {activeEmployees.map((employee: Employee, index: number) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 border border-gray-300">{index + 1}</td>
                <td className="px-4 py-3 border border-gray-300">{employee.fullName}</td>
                <td className="px-4 py-3 border border-gray-300 text-center">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {employee.status}
                  </span>
                </td>
                <td className="px-4 py-3 border border-gray-300 text-center">450</td>
                <td className="px-4 py-3 border border-gray-300 text-center">1,800</td>
                <td className="px-4 py-3 border border-gray-300 text-center">6,000</td>
                <td className="px-4 py-3 border border-gray-300 text-center font-semibold">8,250</td>
                <td className="px-4 py-3 border border-gray-300 text-center">
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มรายการ
        </Button>
        <div className="text-lg font-semibold">
          รวมทั้งสิ้น: {(activeEmployees.length * 8250).toLocaleString()} บาท
        </div>
      </div>
    </div>
  );

  const renderCompanyTab = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4">สรุปค่าเดินทางร่วมงานวันพนักงาน</h3>
      
      <div className="mb-4 p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-gray-700 mb-2">
          <strong>เงื่อนไขค่าที่พัก:</strong>
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• ระดับ 7: พักคนเดียว</li>
          <li>• ระดับอื่น: แยกชาย/หญิง พักคู่ (หารค่าที่พัก)</li>
          <li>• ไม่ได้ค่าที่พัก: ถ้าจังหวัดที่ทำงาน = จังหวัดบ้าน</li>
        </ul>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">ลำดับ</th>
              <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-center border border-gray-300">ระดับ</th>
              <th className="px-4 py-3 text-center border border-gray-300">เพศ</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าเบี้ยเลี้ยง</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าที่พัก</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าพาหนะ</th>
              <th className="px-4 py-3 text-center border border-gray-300">รวม</th>
              <th className="px-4 py-3 text-center border border-gray-300">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee: Employee, index: number) => {
              const accommodation = employee.province === employee.homeProvince ? 0 : 
                                  employee.level === 7 ? 2100 : 1050;
              const total = 450 + accommodation + 300;
              
              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border border-gray-300">{index + 1}</td>
                  <td className="px-4 py-3 border border-gray-300">{employee.fullName}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{employee.level}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{employee.gender}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">450</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    {accommodation.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">300</td>
                  <td className="px-4 py-3 border border-gray-300 text-center font-semibold">
                    {total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มรายการ
        </Button>
        <div className="text-lg font-semibold">
          รวมทั้งสิ้น: {employees.reduce((total: number, emp: Employee) => {
            const accommodation = emp.province === emp.homeProvince ? 0 : 
                                emp.level === 7 ? 2100 : 1050;
            return total + 450 + accommodation + 300;
          }, 0).toLocaleString()} บาท
        </div>
      </div>
    </div>
  );

  const renderRotationTab = () => (
    <div>
      <h3 className="text-lg font-semibold mb-4">สรุปค่าเดินทางหมุนเวียนงาน ผจศ.</h3>
      
      <div className="mb-4 p-4 bg-orange-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>หมายเหตุ:</strong> ไม่มีช่องอายุงาน แต่เพิ่มช่องค่าพาหนะอื่นๆ
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-orange-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">ลำดับ</th>
              <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าเบี้ยเลี้ยง</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าที่พัก</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าพาหนะ</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าพาหนะอื่นๆ</th>
              <th className="px-4 py-3 text-center border border-gray-300">รวม</th>
              <th className="px-4 py-3 text-center border border-gray-300">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee: Employee, index: number) => {
              const total = 500 + 2100 + 8000 + 2000; // Including other vehicle costs
              
              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border border-gray-300">{index + 1}</td>
                  <td className="px-4 py-3 border border-gray-300">{employee.fullName}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">500</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">2,100</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">8,000</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">2,000</td>
                  <td className="px-4 py-3 border border-gray-300 text-center font-semibold">
                    {total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มรายการ
        </Button>
        <div className="text-lg font-semibold">
          รวมทั้งสิ้น: {(employees.length * 12600).toLocaleString()} บาท
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "souvenir":
        return renderSouvenirTab();
      case "family":
        return renderFamilyTab();
      case "company":
        return renderCompanyTab();
      case "rotation":
        return renderRotationTab();
      default:
        return renderSouvenirTab();
    }
  };

  if (employeeLoading || travelLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ค่าเดินทาง</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleYearChange("prev")}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
              พ.ศ. {currentYear}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleYearChange("next")}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {renderTabs()}
      {renderTabContent()}
    </div>
  );
}