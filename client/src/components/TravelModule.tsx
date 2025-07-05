import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { Employee, TravelExpense, InsertTravelExpense } from "@shared/schema";

export default function TravelModule() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear() + 543);
  const [activeTab, setActiveTab] = useState("souvenir");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [travelProvince, setTravelProvince] = useState("กรุงเทพมหานคร");
  const [workDays, setWorkDays] = useState<{[key: number]: number}>({});
  const [showInfo, setShowInfo] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
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

  // Filter level 7 employees (for rotation work)
  const level7Employees = employees.filter((employee: any) => employee.level === "7");

  // Handle edit/delete functions
  const handleEdit = (employeeId: number, tabType: string) => {
    const employee = (employees as any[]).find(emp => emp.id === employeeId);
    if (!employee) return;
    
    // Set form data based on tab type
    let formData = {
      employeeId,
      employeeName: employee.fullName,
      tabType,
      workDays: workDays[employeeId] || 1,
      tripCount: employee.tripCount || 1,
    };
    
    setEditFormData(formData);
    setShowEditDialog(true);
  };

  const handleDelete = (employeeId: number, tabType: string) => {
    if (confirm('ต้องการลบรายการนี้หรือไม่?')) {
      toast({
        title: "ลบรายการเรียบร้อย",
        description: `ลบรายการ${tabType}สำหรับพนักงาน ID ${employeeId}`,
      });
    }
  };

  const handleSaveEdit = () => {
    if (editFormData.tabType === "souvenir") {
      setWorkDays(prev => ({ ...prev, [editFormData.employeeId]: editFormData.workDays }));
    } else if (editFormData.tabType === "family") {
      // Update trip count (this could be stored in localStorage or state)
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const updatedEmployees = employees.map((emp: any) => 
        emp.id === editFormData.employeeId 
          ? { ...emp, tripCount: editFormData.tripCount }
          : emp
      );
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    }
    
    setShowEditDialog(false);
    toast({
      title: "บันทึกสำเร็จ",
      description: "ข้อมูลถูกอัปเดตแล้ว",
    });
  };

  const handleAdd = (tabType: string) => {
    const sampleExpense: InsertTravelExpense = {
      employeeId: 1,
      travelType: tabType,
      allowance: 500,
      accommodation: 2100,
      transportation: 8000,
      total: 10600,
      year: currentYear
    };
    
    createTravelExpense.mutate(sampleExpense);
  };

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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">สรุปค่าใช้จ่ายเดินทางเพื่อรับของที่ระลึก</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                <span className="text-xs">เงื่อนไข</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold">เกณฑ์อายุงานที่ได้รับของที่ระลึก: 20, 25, 30, 35, 40 ปี</p>
                <p className="text-sm text-gray-600">คำนวณจากปีที่กำหนด - ปีที่เริ่มงาน</p>
                <div className="text-sm bg-yellow-50 p-2 rounded">
                  <p className="font-semibold">สูตรคำนวณ:</p>
                  <p>วันทำงาน 1 วัน = เบี้ยเลี้ยง 3 วัน + ที่พัก 2 วัน</p>
                  <p>วันทำงาน 2 วัน = เบี้ยเลี้ยง 4 วัน + ที่พัก 3 วัน (เพิ่มทีละ 1 วัน)</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">ลำดับ</th>
              <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-center border border-gray-300">อายุงาน (ปี)</th>
              <th className="px-4 py-3 text-center border border-gray-300">วันทำงาน</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าเบี้ยเลี้ยง</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าที่พัก</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่ารถโดยสาร<br/>โคราช-กทม ไปกลับ</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่ารถรับจ้าง<br/>ไป-กลับ</th>
              <th className="px-4 py-3 text-center border border-gray-300">รวม</th>
              <th className="px-4 py-3 text-center border border-gray-300">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {eligibleEmployees.map((employee: Employee, index: number) => {
              const serviceYears = currentYear - employee.startYear;
              const currentWorkDays = workDays[employee.id] || 1; // Default 1 day, can be edited
              const allowanceDays = 2 + currentWorkDays; // Base 3 days for 1 work day
              const accommodationDays = 1 + currentWorkDays; // Base 2 days for 1 work day
              const allowanceCost = allowanceDays * (employee.level === "7" || employee.level === "6" ? 500 : 450);
              const accommodationCost = accommodationDays * (employee.level === "7" || employee.level === "6" ? 2100 : 1800);
              const busCost = 300 * 2; // ค่ารถโดยสาร โคราช-กทม ไปกลับ (x2)
              const taxiCost = 250 * 2; // ค่ารถรับจ้าง ไป-กลับ (x2)
              const total = allowanceCost + accommodationCost + busCost + taxiCost;
              
              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border border-gray-300">{index + 1}</td>
                  <td className="px-4 py-3 border border-gray-300">{employee.fullName}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{serviceYears}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    <Input 
                      type="number" 
                      value={currentWorkDays} 
                      onChange={(e) => setWorkDays(prev => ({
                        ...prev,
                        [employee.id]: parseInt(e.target.value) || 1
                      }))}
                      className="w-16 text-center" 
                      min="1"
                    />
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    {allowanceCost.toLocaleString()}<br/>
                    <span className="text-xs text-gray-500">({allowanceDays} วัน)</span>
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    {accommodationCost.toLocaleString()}<br/>
                    <span className="text-xs text-gray-500">({accommodationDays} วัน)</span>
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{busCost.toLocaleString()}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{taxiCost.toLocaleString()}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center font-semibold">{total.toLocaleString()}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(employee.id, "souvenir")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => handleDelete(employee.id, "souvenir")}
                      >
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
        <Button 
          className="flex items-center gap-2"
          onClick={() => handleAdd("souvenir")}
        >
          <Plus className="h-4 w-4" />
          เพิ่มรายการ
        </Button>
        <div className="text-lg font-semibold">
          รวมทั้งสิ้น: {eligibleEmployees.reduce((sum: number, emp: any) => {
            const currentWorkDays = workDays[emp.id] || 1;
            const allowanceDays = 2 + currentWorkDays;
            const accommodationDays = 1 + currentWorkDays;
            const allowanceCost = allowanceDays * (emp.level === "7" || emp.level === "6" ? 500 : 450);
            const accommodationCost = accommodationDays * (emp.level === "7" || emp.level === "6" ? 2100 : 1800);
            const busCost = 300 * 2;
            const taxiCost = 250 * 2;
            return sum + allowanceCost + accommodationCost + busCost + taxiCost;
          }, 0).toLocaleString()} บาท
        </div>
      </div>
    </div>
  );

  const renderFamilyTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">สรุปค่าเดินทางเยี่ยมครอบครัว</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                <span className="text-xs">เงื่อนไข</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold">เงื่อนไข: แสดงเฉพาะพนักงานที่มีสถานะ Active เท่านั้น</p>
                <p className="text-sm text-gray-600">หมายเหตุ: ไม่ได้รับเบี้ยเลี้ยง ไม่ได้ค่าที่พัก มีเฉพาะค่ารถทัวร์เยี่ยมบ้าน</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">ลำดับ</th>
              <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-center border border-gray-300">สถานะ</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่ารถทัวร์<br/>ไป-กลับ</th>
              <th className="px-4 py-3 text-center border border-gray-300">จำนวนครั้ง</th>
              <th className="px-4 py-3 text-center border border-gray-300">รวม</th>
              <th className="px-4 py-3 text-center border border-gray-300">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {activeEmployees.map((employee: any, index: number) => {
              const baseTourCost = employee.tourCost || 5000; // ค่ารถเที่ยวเยี่ยมบ้าน จากตารางพนักงาน
              const roundTripCost = baseTourCost * 2; // ค่ารถทัวร์ไป-กลับ (x2)
              const tripCount = employee.tripCount || 1; // จำนวนครั้ง (default 1)
              const totalCost = roundTripCost * tripCount; // รวม
              
              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border border-gray-300">{index + 1}</td>
                  <td className="px-4 py-3 border border-gray-300">{employee.fullName}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{roundTripCost.toLocaleString()}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{tripCount}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center font-semibold">{totalCost.toLocaleString()}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(employee.id, "family")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => handleDelete(employee.id, "family")}
                      >
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
        <Button 
          className="flex items-center gap-2"
          onClick={() => handleAdd("family")}
        >
          <Plus className="h-4 w-4" />
          เพิ่มรายการ
        </Button>
        <div className="text-lg font-semibold">
          รวมทั้งสิ้น: {activeEmployees.reduce((sum: number, emp: any) => {
            const baseTourCost = emp.tourCost || 5000;
            const roundTripCost = baseTourCost * 2;
            const tripCount = emp.tripCount || 1;
            return sum + (roundTripCost * tripCount);
          }, 0).toLocaleString()} บาท
        </div>
      </div>
    </div>
  );

  const renderCompanyTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">สรุปค่าเดินทางร่วมงานวันพนักงาน</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                <span className="text-xs">เงื่อนไข</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold">เงื่อนไขค่าที่พัก:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ระดับ 7: พักคนเดียว</li>
                  <li>• ระดับอื่น: แยกชาย/หญิง พักคู่ (หารค่าที่พัก)</li>
                  <li>• ไม่ได้ค่าที่พัก: ถ้าจังหวัดที่เดินทางไป = จังหวัดที่เยี่ยมบ้าน</li>
                  <li>• <strong>ไม่ได้ค่าเบี้ยเลี้ยง</strong></li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">จังหวัดที่เดินทางไป:</label>
        <Input 
          value={travelProvince}
          onChange={(e) => setTravelProvince(e.target.value)}
          className="w-48"
          placeholder="ระบุจังหวัด"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">ลำดับ</th>
              <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-center border border-gray-300">ระดับ</th>
              <th className="px-4 py-3 text-center border border-gray-300">เพศ</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าที่พัก</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าพาหนะ</th>
              <th className="px-4 py-3 text-center border border-gray-300">รวม</th>
              <th className="px-4 py-3 text-center border border-gray-300">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {(employees as any[]).map((employee: any, index: number) => {
              // Check if travel province matches home province
              const sameProvince = travelProvince === employee.province;
              const accommodation = sameProvince ? 0 : 
                                  employee.level === "7" ? 2100 : 1050;
              const transport = 300;
              const total = accommodation + transport;
              
              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border border-gray-300">{index + 1}</td>
                  <td className="px-4 py-3 border border-gray-300">{employee.fullName}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{employee.level}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{employee.gender}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    {sameProvince ? (
                      <span className="text-gray-400">ไม่ได้</span>
                    ) : (
                      accommodation.toLocaleString()
                    )}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{transport.toLocaleString()}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center font-semibold">
                    {total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(employee.id, "company")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => handleDelete(employee.id, "company")}
                      >
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
        <Button 
          className="flex items-center gap-2"
          onClick={() => handleAdd("company")}
        >
          <Plus className="h-4 w-4" />
          เพิ่มรายการ
        </Button>
        <div className="text-lg font-semibold">
          รวมทั้งสิ้น: {(employees as any[]).reduce((total: number, emp: any) => {
            const sameProvince = travelProvince === emp.province;
            const accommodation = sameProvince ? 0 : 
                                emp.level === "7" ? 2100 : 1050;
            return total + accommodation + 300;
          }, 0).toLocaleString()} บาท
        </div>
      </div>
    </div>
  );

  const renderRotationTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">สรุปค่าเดินทางหมุนเวียนงาน ผจศ.</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                <span className="text-xs">เงื่อนไข</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold">เงื่อนไข: แสดงเฉพาะพนักงานระดับ 7 เท่านั้น</p>
                <p className="text-sm text-gray-600">หมายเหตุ: ไม่มีช่องอายุงาน แต่เพิ่มช่องค่าพาหนะอื่นๆ</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-orange-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">ลำดับ</th>
              <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 text-center border border-gray-300">ระดับ</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าเบี้ยเลี้ยง</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าที่พัก</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าพาหนะ</th>
              <th className="px-4 py-3 text-center border border-gray-300">ค่าพาหนะอื่นๆ</th>
              <th className="px-4 py-3 text-center border border-gray-300">รวม</th>
              <th className="px-4 py-3 text-center border border-gray-300">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {level7Employees.map((employee: any, index: number) => {
              const total = 500 + 2100 + 8000 + 2000; // Including other vehicle costs
              
              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border border-gray-300">{index + 1}</td>
                  <td className="px-4 py-3 border border-gray-300">{employee.fullName}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">{employee.level}</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">500</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">2,100</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">8,000</td>
                  <td className="px-4 py-3 border border-gray-300 text-center">2,000</td>
                  <td className="px-4 py-3 border border-gray-300 text-center font-semibold">
                    {total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border border-gray-300 text-center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(employee.id, "rotation")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => handleDelete(employee.id, "rotation")}
                      >
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
        <Button 
          className="flex items-center gap-2"
          onClick={() => handleAdd("rotation")}
        >
          <Plus className="h-4 w-4" />
          เพิ่มรายการ
        </Button>
        <div className="text-lg font-semibold">
          รวมทั้งสิ้น: {(level7Employees.length * 12600).toLocaleString()} บาท
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูล - {editFormData.employeeName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editFormData.tabType === "souvenir" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workDays" className="text-right">
                  วันทำงาน
                </Label>
                <Input
                  id="workDays"
                  type="number"
                  value={editFormData.workDays || 1}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, workDays: parseInt(e.target.value) || 1 }))}
                  className="col-span-3"
                />
              </div>
            )}
            {editFormData.tabType === "family" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tripCount" className="text-right">
                  จำนวนครั้ง
                </Label>
                <Input
                  id="tripCount"
                  type="number"
                  value={editFormData.tripCount || 1}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, tripCount: parseInt(e.target.value) || 1 }))}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveEdit}>
              บันทึก
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}