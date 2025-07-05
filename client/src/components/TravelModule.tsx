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

// ฟังก์ชันคำนวณยอดรวมของแต่ละ tab
export function calculateTravelTotals(employees: Employee[] = [], workDays: {[key: number]: number} = {}, otherVehicleCosts: {[key: number]: number} = {}, accommodationCosts: {[key: number]: number} = {}) {
  const activeEmployees = employees.filter(emp => emp.status === "Active");
  const level7Employees = employees.filter(emp => emp.level === "7");
  const eligibleEmployees = employees.filter((employee: Employee) => {
    const currentYear = new Date().getFullYear() + 543;
    const serviceYears = currentYear - employee.startYear;
    return [20, 25, 30, 35, 40].includes(serviceYears);
  });

  // 1. ซื้อของฝาก
  const souvenirTotal = eligibleEmployees.reduce((sum: number, emp: Employee) => {
    const currentWorkDays = workDays[emp.id] || 1;
    const allowanceDays = 2 + currentWorkDays;
    const accommodationDays = 1 + currentWorkDays;
    const allowanceCost = allowanceDays * (emp.level === "7" || emp.level === "6" ? 500 : 450);
    const accommodationCost = accommodationDays * (emp.level === "7" || emp.level === "6" ? 2100 : 1800);
    const busCost = 300 * 2;
    const taxiCost = 250 * 2;
    return sum + allowanceCost + accommodationCost + busCost + taxiCost;
  }, 0);

  // 2. เยี่ยมครอบครัว
  const familyVisitTotal = activeEmployees.reduce((sum: number, emp: Employee) => {
    const baseTourCost = emp.tourCost || 5000;
    const roundTripCost = baseTourCost * 2;
    const tripCount = workDays[`trip_${emp.id}` as keyof typeof workDays] || 1;
    return sum + (roundTripCost * tripCount);
  }, 0);

  // 3. ร่วมงานวันพนักงาน
  const companyEventTotal = activeEmployees.reduce((sum: number, emp: Employee) => {
    const busCost = 600 * 2; // ค่าเริ่มต้น
    const customAccommodation = accommodationCosts[emp.id];
    let accommodationCost = 0;
    
    if (customAccommodation !== undefined) {
      accommodationCost = customAccommodation;
    } else {
      const maleCount = activeEmployees.filter(e => e.gender === "ชาย").length;
      const femaleCount = activeEmployees.filter(e => e.gender === "หญิง").length;
      accommodationCost = emp.gender === "ชาย" ? 
        (maleCount > 1 ? 600 : 1200) : (femaleCount > 1 ? 600 : 1200);
    }
    
    return sum + busCost + accommodationCost;
  }, 0);

  // 4. หมุนเวียนงาน ผจศ.
  const rotationTotal = level7Employees.reduce((sum: number, emp: Employee) => {
    const currentWorkDays = workDays[emp.id] || 1;
    const allowanceDays = 2 + currentWorkDays;
    const accommodationDays = 1 + currentWorkDays;
    const allowanceCost = allowanceDays * 500;
    const accommodationCost = accommodationDays * 2100;
    const busCost = 300 * 2;
    const taxiCost = 250 * 2;
    const otherVehicle = otherVehicleCosts[emp.id] || 0;
    
    return sum + allowanceCost + accommodationCost + busCost + taxiCost + otherVehicle;
  }, 0);

  return {
    souvenir: souvenirTotal,
    familyVisit: familyVisitTotal,
    companyEvent: companyEventTotal,
    rotation: rotationTotal,
    total: souvenirTotal + familyVisitTotal + companyEventTotal + rotationTotal
  };
}

export default function TravelModule() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear() + 543);
  const [activeTab, setActiveTab] = useState("souvenir");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [travelProvince, setTravelProvince] = useState("กรุงเทพมหานคร");
  const [workDays, setWorkDays] = useState<{[key: number]: number}>({});
  const [showInfo, setShowInfo] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [companyEventDestination, setCompanyEventDestination] = useState("กรุงเทพมหานคร");
  const [busFareRate, setBusFareRate] = useState(600);
  const [otherVehicleCosts, setOtherVehicleCosts] = useState<{[key: number]: number}>({});
  const [rotationNotes, setRotationNotes] = useState<{[key: number]: string}>({});
  const [accommodationCosts, setAccommodationCosts] = useState<{[key: number]: number}>({});

  // ฟังก์ชันคำนวณค่าที่พักอัตโนมัติ
  const getAutoAccommodationCost = (employee: Employee, maleCount: number, femaleCount: number) => {
    const level = employee.level;
    const employeeProvince = employee.province;
    
    // ถ้าระดับ 7 พักคนเดียว
    if (level === "7") {
      if (employeeProvince === companyEventDestination) {
        return 0; // ไม่ได้ค่าที่พักถ้าจังหวัดเดียวกัน
      }
      return 2100; // อัตรามาตรฐานระดับ 7
    }
    
    // ระดับอื่นๆ
    if (employeeProvince === companyEventDestination) {
      return 0; // ไม่ได้ค่าที่พักถ้าจังหวัดเดียวกัน
    }
    
    // แยกชาย หญิง แล้วจับคู่หารค่าที่พัก
    const standardRate = level === "6" ? 2100 : 1800;
    if (employee.gender === "ชาย") {
      return Math.ceil(maleCount / 2) > 0 ? standardRate / 2 : standardRate;
    } else {
      return Math.ceil(femaleCount / 2) > 0 ? standardRate / 2 : standardRate;
    }
  };
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
  const eligibleEmployees = (employees as Employee[]).filter((employee: Employee) => {
    const serviceYears = currentYear - employee.startYear;
    return [20, 25, 30, 35, 40].includes(serviceYears);
  });

  // Calculate active employees (for family visit)
  const activeEmployees = (employees as Employee[]).filter((employee: Employee) => employee.status === "Active");

  // Filter level 7 employees (for rotation work)
  const level7Employees = (employees as Employee[]).filter((employee: Employee) => employee.level === "7");

  const renderTabs = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === "souvenir" ? "default" : "ghost"}
          onClick={() => setActiveTab("souvenir")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === "souvenir" 
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105" 
              : "hover:bg-green-50 hover:text-green-700"
          }`}
        >
          🎁 รับของที่ระลึก
        </Button>
        <Button
          variant={activeTab === "family" ? "default" : "ghost"}
          onClick={() => setActiveTab("family")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === "family" 
              ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105" 
              : "hover:bg-purple-50 hover:text-purple-700"
          }`}
        >
          👨‍👩‍👧‍👦 เยี่ยมครอบครัว
        </Button>
        <Button
          variant={activeTab === "company" ? "default" : "ghost"}
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === "company" 
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105" 
              : "hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          🎉 ร่วมงานวันพนักงาน
        </Button>
        <Button
          variant={activeTab === "rotation" ? "default" : "ghost"}
          onClick={() => setActiveTab("rotation")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === "rotation" 
              ? "bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-lg transform scale-105" 
              : "hover:bg-orange-50 hover:text-orange-700"
          }`}
        >
          🔄 หมุนเวียนงาน ผจศ.
        </Button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === "souvenir") {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border-l-4 border-green-500 shadow-sm">
            <h2 className="text-xl font-semibold text-green-800 mb-2">สรุปค่าใช้จ่ายเดินทางเพื่อรับของที่ระลึก</h2>
            <p className="text-green-600 text-sm">พนักงานที่มีอายุงาน 20, 25, 30, 35, 40 ปี</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-green-100 to-blue-100">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">ลำดับ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">อายุงาน (ปี)</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">วันทำงาน</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">ค่าเบี้ยเลี้ยง</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">ค่าที่พัก</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">ค่ารถโดยสาร<br/>โคราช-กทม ไปกลับ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">ค่ารถรับจ้าง<br/>ไป-กลับ</TableHead>
                  <TableHead className="text-center font-semibold text-green-800">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligibleEmployees.map((employee: Employee, index: number) => {
                  const serviceYears = currentYear - employee.startYear;
                  const currentWorkDays = workDays[employee.id] || 1;
                  const allowanceDays = 2 + currentWorkDays;
                  const accommodationDays = 1 + currentWorkDays;
                  const allowanceCost = allowanceDays * (employee.level === "7" || employee.level === "6" ? 500 : 450);
                  const accommodationCost = accommodationDays * (employee.level === "7" || employee.level === "6" ? 2100 : 1800);
                  const busCost = 300 * 2;
                  const taxiCost = 250 * 2;
                  const total = allowanceCost + accommodationCost + busCost + taxiCost;
                  
                  return (
                    <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="border-r border-gray-200 text-center">{index + 1}</TableCell>
                      <TableCell className="border-r border-gray-200">{employee.fullName}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{serviceYears}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input 
                          type="number" 
                          value={currentWorkDays} 
                          onChange={(e) => setWorkDays(prev => ({
                            ...prev,
                            [employee.id]: parseInt(e.target.value) || 1
                          }))}
                          className="w-16 text-center mx-auto bg-gray-50 border-gray-300" 
                          min="1"
                        />
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        {allowanceCost.toLocaleString()}<br/>
                        <span className="text-xs text-gray-500">({allowanceDays} วัน)</span>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        {accommodationCost.toLocaleString()}<br/>
                        <span className="text-xs text-gray-500">({accommodationDays} วัน)</span>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{busCost.toLocaleString()}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{taxiCost.toLocaleString()}</TableCell>
                      <TableCell className="text-center font-semibold text-green-700">{total.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-gradient-to-r from-green-50 to-blue-50 border-t-2 border-green-200">
                  <TableCell colSpan={8} className="text-center font-bold text-green-800">รวมทั้งหมด</TableCell>
                  <TableCell className="text-center font-bold text-lg text-green-700">
                    {eligibleEmployees.reduce((sum: number, emp: Employee) => {
                      const currentWorkDays = workDays[emp.id] || 1;
                      const allowanceDays = 2 + currentWorkDays;
                      const accommodationDays = 1 + currentWorkDays;
                      const allowanceCost = allowanceDays * (emp.level === "7" || emp.level === "6" ? 500 : 450);
                      const accommodationCost = accommodationDays * (emp.level === "7" || emp.level === "6" ? 2100 : 1800);
                      const busCost = 300 * 2;
                      const taxiCost = 250 * 2;
                      return sum + allowanceCost + accommodationCost + busCost + taxiCost;
                    }, 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    if (activeTab === "family") {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500 shadow-sm">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">เยี่ยมครอบครัว</h2>
            <p className="text-purple-600 text-sm">ค่าใช้จ่ายเดินทางเยี่ยมครอบครัวสำหรับพนักงานที่มีสถานะ Active</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-purple-800">ลำดับ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-purple-800">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-purple-800">ค่ารถทัวร์ไป-กลับ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-purple-800">จำนวนครั้ง</TableHead>
                  <TableHead className="text-center font-semibold text-purple-800">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmployees.map((employee: Employee, index: number) => {
                  // ดึงค่ารถทัวร์จากข้อมูลพนักงาน (tourCost) และคูณ 2 สำหรับไป-กลับ
                  const baseTourCost = (employee as any).tourCost || 5000; // ค่า default หากไม่มีข้อมูล
                  const roundTripCost = baseTourCost * 2; // ไป-กลับ
                  const tripCount = workDays[`trip_${employee.id}`] || 1;
                  const totalCost = roundTripCost * tripCount;
                  
                  return (
                    <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="border-r border-gray-200 text-center">{index + 1}</TableCell>
                      <TableCell className="border-r border-gray-200">{employee.fullName}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        {roundTripCost.toLocaleString()}
                        <br/>
                        <span className="text-xs text-gray-500">({baseTourCost.toLocaleString()} × 2)</span>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input 
                          type="number" 
                          value={tripCount} 
                          onChange={(e) => setWorkDays(prev => ({ 
                            ...prev, 
                            [`trip_${employee.id}`]: parseInt(e.target.value) || 1 
                          }))}
                          className="w-16 text-center mx-auto bg-gray-50 border-gray-300"
                          min="1"
                        />
                      </TableCell>
                      <TableCell className="text-center font-semibold text-purple-700">{totalCost.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-200">
                  <TableCell colSpan={4} className="text-center font-bold text-purple-800">รวมทั้งหมด</TableCell>
                  <TableCell className="text-center font-bold text-lg text-purple-700">
                    {activeEmployees.reduce((sum: number, emp: Employee) => {
                      const baseTourCost = (emp as any).tourCost || 5000;
                      const roundTripCost = baseTourCost * 2;
                      const tripCount = workDays[`trip_${emp.id}`] || 1;
                      return sum + roundTripCost * tripCount;
                    }, 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    if (activeTab === "company") {
      // คำนวณค่าที่พักตามเงื่อนไข
      const calculateAccommodation = (employee: Employee, maleCount: number, femaleCount: number) => {
        const level = employee.level;
        const employeeProvince = employee.province;
        
        // ถ้าระดับ 7 พักคนเดียว
        if (level === "7") {
          if (employeeProvince === companyEventDestination) {
            return 0; // ไม่ได้ค่าที่พักถ้าจังหวัดเดียวกัน
          }
          return level === "7" ? 2100 : 1800; // อัตรามาตรฐานตามระดับ
        }
        
        // ระดับอื่นๆ
        if (employeeProvince === companyEventDestination) {
          return 0; // ไม่ได้ค่าที่พักถ้าจังหวัดเดียวกัน
        }
        
        // แยกชาย หญิง แล้วจับคู่หารค่าที่พัก
        const standardRate = level === "7" || level === "6" ? 2100 : 1800;
        if (employee.gender === "ชาย") {
          return Math.ceil(maleCount / 2) > 0 ? standardRate / 2 : standardRate;
        } else {
          return Math.ceil(femaleCount / 2) > 0 ? standardRate / 2 : standardRate;
        }
      };

      // นับจำนวนชาย หญิง
      const maleEmployees = activeEmployees.filter((emp: Employee) => emp.gender === "ชาย");
      const femaleEmployees = activeEmployees.filter((emp: Employee) => emp.gender === "หญิง");

      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500 shadow-sm">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">ร่วมงานวันพนักงาน</h2>
            <p className="text-blue-600 text-sm">ค่าใช้จ่ายเดินทางร่วมงานวันพนักงานประจำปี</p>
          </div>
          
          {/* การตั้งค่า */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-blue-800 mb-2">จังหวัดปลายทาง:</label>
                <Input
                  value={companyEventDestination}
                  onChange={(e) => setCompanyEventDestination(e.target.value)}
                  className="bg-white border-blue-300"
                  placeholder="กรุงเทพมหานคร"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-800 mb-2">อัตราค่าโดยสาร (ไป-กลับ):</label>
                <Input
                  type="number"
                  value={busFareRate}
                  onChange={(e) => setBusFareRate(Number(e.target.value))}
                  className="bg-white border-blue-300"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-blue-100 to-indigo-100">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-blue-800">ลำดับ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-blue-800">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-blue-800">ระดับ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-blue-800">เพศ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-blue-800">จังหวัดเยี่ยมบ้าน</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-blue-800">ค่ารถโดยสาร ไป-กลับ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-blue-800">ค่าที่พัก</TableHead>
                  <TableHead className="text-center font-semibold text-blue-800">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmployees.map((employee: Employee, index: number) => {
                  const busCost = busFareRate;
                  const autoAccommodationCost = getAutoAccommodationCost(employee, maleEmployees.length, femaleEmployees.length);
                  const accommodationCost = accommodationCosts[employee.id] !== undefined ? accommodationCosts[employee.id] : autoAccommodationCost;
                  const total = busCost + accommodationCost;
                  
                  return (
                    <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="border-r border-gray-200 text-center">{index + 1}</TableCell>
                      <TableCell className="border-r border-gray-200">{employee.fullName}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{employee.level}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{employee.gender}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{employee.province}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{busCost.toLocaleString()}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input 
                          type="number" 
                          value={accommodationCost}
                          onChange={(e) => setAccommodationCosts(prev => ({
                            ...prev,
                            [employee.id]: parseInt(e.target.value) || 0
                          }))}
                          className="w-20 text-center mx-auto bg-gray-50 border-gray-300" 
                          min="0"
                          placeholder="0"
                        />
                        {employee.province === companyEventDestination && (
                          <div className="text-xs text-red-500">(จังหวัดเดียวกัน)</div>
                        )}
                        {employee.level !== "7" && employee.province !== companyEventDestination && (
                          <div className="text-xs text-gray-500">(หารคู่)</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-blue-700">{total.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
                  <TableCell colSpan={7} className="text-center font-bold text-blue-800">รวมทั้งหมด</TableCell>
                  <TableCell className="text-center font-bold text-lg text-blue-700">
                    {activeEmployees.reduce((sum: number, emp: Employee) => {
                      const busCost = busFareRate;
                      const autoAccommodationCost = getAutoAccommodationCost(emp, maleEmployees.length, femaleEmployees.length);
                      const accommodationCost = accommodationCosts[emp.id] !== undefined ? accommodationCosts[emp.id] : autoAccommodationCost;
                      return sum + busCost + accommodationCost;
                    }, 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">หมายเหตุ:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• ระดับ 7 พักคนเดียวตามอัตรามาตรฐาน</li>
              <li>• ระดับอื่นๆ แยกชาย-หญิง จับคู่หารค่าที่พัก</li>
              <li>• ถ้าจังหวัดปลายทางตรงกับจังหวัดเยี่ยมบ้าน จะไม่ได้ค่าที่พัก</li>
              <li>• พนักงานชาย: {maleEmployees.length} คน, พนักงานหญิง: {femaleEmployees.length} คน</li>
            </ul>
          </div>
        </div>
      );
    }

    if (activeTab === "rotation") {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border-l-4 border-orange-500 shadow-sm">
            <h2 className="text-xl font-semibold text-orange-800 mb-2">หมุนเวียนงาน ผจศ.</h2>
            <p className="text-orange-600 text-sm">ค่าใช้จ่ายเดินทางหมุนเวียนงานสำหรับผู้จัดการศูนย์ (ระดับ 7)</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">ลำดับ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">วันทำงาน</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">ค่าเบี้ยเลี้ยง</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">ค่าที่พัก</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">ค่ารถโดยสาร<br/>โคราช-กทม ไปกลับ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">ค่ารถรับจ้าง<br/>ไป-กลับ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">ค่าพาหนะอื่นๆ</TableHead>
                  <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">หมายเหตุ</TableHead>
                  <TableHead className="text-center font-semibold text-orange-800">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {level7Employees.map((employee: Employee, index: number) => {
                  const currentWorkDays = workDays[employee.id] || 1;
                  const allowanceDays = 2 + currentWorkDays;
                  const accommodationDays = 1 + currentWorkDays;
                  const allowanceCost = allowanceDays * 500;
                  const accommodationCost = accommodationDays * 2100;
                  const busCost = 300 * 2;
                  const taxiCost = 250 * 2;
                  const otherVehicleCost = otherVehicleCosts[employee.id] || 0;
                  const total = allowanceCost + accommodationCost + busCost + taxiCost + otherVehicleCost;
                  
                  return (
                    <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="border-r border-gray-200 text-center">{index + 1}</TableCell>
                      <TableCell className="border-r border-gray-200">{employee.fullName}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input 
                          type="number" 
                          value={currentWorkDays} 
                          onChange={(e) => setWorkDays(prev => ({
                            ...prev,
                            [employee.id]: parseInt(e.target.value) || 1
                          }))}
                          className="w-16 text-center mx-auto bg-gray-50 border-gray-300" 
                          min="1"
                        />
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        {allowanceCost.toLocaleString()}<br/>
                        <span className="text-xs text-gray-500">({allowanceDays} วัน)</span>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        {accommodationCost.toLocaleString()}<br/>
                        <span className="text-xs text-gray-500">({accommodationDays} วัน)</span>
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{busCost.toLocaleString()}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">{taxiCost.toLocaleString()}</TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input 
                          type="number" 
                          value={otherVehicleCost} 
                          onChange={(e) => setOtherVehicleCosts(prev => ({
                            ...prev,
                            [employee.id]: parseInt(e.target.value) || 0
                          }))}
                          className="w-20 text-center mx-auto bg-gray-50 border-gray-300" 
                          min="0"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input 
                          type="text" 
                          value={rotationNotes[employee.id] || ""} 
                          onChange={(e) => setRotationNotes(prev => ({
                            ...prev,
                            [employee.id]: e.target.value
                          }))}
                          className="w-32 text-center mx-auto bg-gray-50 border-gray-300" 
                          placeholder="หมายเหตุ..."
                        />
                      </TableCell>
                      <TableCell className="text-center font-semibold text-orange-700">{total.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-gradient-to-r from-orange-50 to-yellow-50 border-t-2 border-orange-200">
                  <TableCell colSpan={9} className="text-center font-bold text-orange-800">รวมทั้งหมด</TableCell>
                  <TableCell className="text-center font-bold text-lg text-orange-700">
                    {level7Employees.reduce((sum: number, emp: Employee) => {
                      const currentWorkDays = workDays[emp.id] || 1;
                      const allowanceDays = 2 + currentWorkDays;
                      const accommodationDays = 1 + currentWorkDays;
                      const allowanceCost = allowanceDays * 500;
                      const accommodationCost = accommodationDays * 2100;
                      const busCost = 300 * 2;
                      const taxiCost = 250 * 2;
                      const otherVehicleCost = otherVehicleCosts[emp.id] || 0;
                      return sum + allowanceCost + accommodationCost + busCost + taxiCost + otherVehicleCost;
                    }, 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    return null;
  };

  if (employeeLoading || travelLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100" style={{ fontFamily: 'Sarabun' }}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
                <div className="h-7 w-7 text-white text-2xl">🚗</div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  ค่าเดินทาง
                </h1>
                <p className="text-gray-600 text-sm mt-1">ระบบจัดการค่าเดินทางและค่าใช้จ่ายในการปฏิบัติงาน</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange("prev")}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                ปีก่อน
              </Button>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                <span className="text-lg font-semibold text-gray-800">ปีงบประมาณ {currentYear}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange("next")}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                ปีหน้า
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        {renderTabs()}

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}