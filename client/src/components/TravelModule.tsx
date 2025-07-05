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
  const [companyEventDestination, setCompanyEventDestination] = useState("กรุงเทพมหานคร");
  const [busFareRate, setBusFareRate] = useState(600);
  const [otherVehicleCosts, setOtherVehicleCosts] = useState<{[key: number]: number}>({});
  const [rotationNotes, setRotationNotes] = useState<{[key: number]: string}>({});
  const [accommodationCosts, setAccommodationCosts] = useState<{[key: number]: number}>({});
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
    },
  });

  const handleYearChange = (direction: "prev" | "next") => {
    setCurrentYear(prev => direction === "prev" ? prev - 1 : prev + 1);
  };

  const renderTabs = () => {
    const tabs = [
      { key: "souvenir", label: "ของที่ระลึก", icon: "🎁", color: "from-green-500 to-emerald-600" },
      { key: "family", label: "เยี่ยมบ้าน", icon: "🏠", color: "from-blue-500 to-cyan-600" },
      { key: "company", label: "งานบริษัท", icon: "🏢", color: "from-purple-500 to-violet-600" },
      { key: "rotation", label: "ร่วมงานวันพนักงาน", icon: "🔄", color: "from-orange-500 to-amber-600" }
    ];

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.key 
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105` 
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    const activeEmployees = (employees as Employee[]).filter((employee: Employee) => employee.status === "Active");
    const level7Employees = (employees as Employee[]).filter((employee: Employee) => employee.level === "7");

    if (activeTab === "souvenir") {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <h3 className="font-bold text-lg text-green-800 mb-4 flex items-center gap-2">
              <div className="bg-green-500 p-2 rounded-lg">
                <div className="h-5 w-5 text-white">🎁</div>
              </div>
              ค่าเดินทางเพื่อรับของที่ระลึก
            </h3>
            <Table className="bg-white rounded-lg overflow-hidden shadow-sm">
              <TableHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
                <TableRow>
                  <TableHead className="text-center font-semibold text-green-800">ลำดับ</TableHead>
                  <TableHead className="text-center font-semibold text-green-800">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="text-center font-semibold text-green-800">จังหวัด</TableHead>
                  <TableHead className="text-center font-semibold text-green-800">ค่ารถทัวร์ ไป-กลับ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmployees.map((employee: Employee, index: number) => {
                  const baseTourCost = (employee as any).tourCost || 0;
                  const roundTripCost = baseTourCost * 2;
                  
                  return (
                    <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{employee.fullName}</TableCell>
                      <TableCell className="text-center">{employee.province || "-"}</TableCell>
                      <TableCell className="text-center font-semibold text-green-700">
                        {roundTripCost.toLocaleString()}<br/>
                        <span className="text-xs text-gray-500">({baseTourCost.toLocaleString()} × 2)</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-200">
                  <TableCell colSpan={3} className="text-center font-bold text-green-800">รวมทั้งหมด</TableCell>
                  <TableCell className="text-center font-bold text-lg text-green-700">
                    {activeEmployees.reduce((sum: number, emp: Employee) => {
                      const baseTourCost = (emp as any).tourCost || 0;
                      return sum + (baseTourCost * 2);
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
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
            <h3 className="font-bold text-lg text-blue-800 mb-4 flex items-center gap-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <div className="h-5 w-5 text-white">🏠</div>
              </div>
              ค่าเดินทางเยี่ยมบ้าน
            </h3>
            <Table className="bg-white rounded-lg overflow-hidden shadow-sm">
              <TableHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
                <TableRow>
                  <TableHead className="text-center font-semibold text-blue-800">ลำดับ</TableHead>
                  <TableHead className="text-center font-semibold text-blue-800">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="text-center font-semibold text-blue-800">จังหวัด</TableHead>
                  <TableHead className="text-center font-semibold text-blue-800">จำนวนครั้ง</TableHead>
                  <TableHead className="text-center font-semibold text-blue-800">ค่ารถทัวร์ไป-กลับ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmployees.map((employee: Employee, index: number) => {
                  const baseTourCost = (employee as any).tourCost || 5000;
                  const roundTripCost = baseTourCost * 2;
                  const tripCount = workDays[`trip_${employee.id}`] || 1;
                  const total = roundTripCost * tripCount;
                  
                  return (
                    <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{employee.fullName}</TableCell>
                      <TableCell className="text-center">{employee.province || "-"}</TableCell>
                      <TableCell className="text-center">
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
                      <TableCell className="text-center font-semibold text-blue-700">
                        {total.toLocaleString()}<br/>
                        <span className="text-xs text-gray-500">({roundTripCost.toLocaleString()} × {tripCount})</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50 border-t-2 border-blue-200">
                  <TableCell colSpan={4} className="text-center font-bold text-blue-800">รวมทั้งหมด</TableCell>
                  <TableCell className="text-center font-bold text-lg text-blue-700">
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
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
            <h3 className="font-bold text-lg text-purple-800 mb-4 flex items-center gap-2">
              <div className="bg-purple-500 p-2 rounded-lg">
                <div className="h-5 w-5 text-white">🏢</div>
              </div>
              ค่าเดินทางงานบริษัท
            </h3>
            <Table className="bg-white rounded-lg overflow-hidden shadow-sm">
              <TableHeader className="bg-gradient-to-r from-purple-100 to-violet-100">
                <TableRow>
                  <TableHead className="text-center font-semibold text-purple-800">ลำดับ</TableHead>
                  <TableHead className="text-center font-semibold text-purple-800">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="text-center font-semibold text-purple-800">ค่าเบี้ยเลี้ยง</TableHead>
                  <TableHead className="text-center font-semibold text-purple-800">ค่าที่พัก</TableHead>
                  <TableHead className="text-center font-semibold text-purple-800">ค่ารถโดยสาร ไป-กลับ</TableHead>
                  <TableHead className="text-center font-semibold text-purple-800">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEmployees.map((employee: Employee, index: number) => {
                  const level = employee.level;
                  const allowanceCost = level === "7" || level === "6" ? 500 : 450;
                  const accommodationCost = level === "7" || level === "6" ? 2100 : 1800;
                  const busCost = busFareRate * 2;
                  const total = allowanceCost + accommodationCost + busCost;
                  
                  return (
                    <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{employee.fullName}</TableCell>
                      <TableCell className="text-center">{allowanceCost.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{accommodationCost.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{busCost.toLocaleString()}</TableCell>
                      <TableCell className="text-center font-semibold text-purple-700">{total.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    if (activeTab === "rotation") {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
            <h3 className="font-bold text-lg text-orange-800 mb-4 flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-lg">
                <div className="h-5 w-5 text-white">🔄</div>
              </div>
              ร่วมงานวันพนักงาน (ระดับ 7 เท่านั้น)
            </h3>
            <Table className="bg-white rounded-lg overflow-hidden shadow-sm">
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
                  const customAccommodationCost = accommodationCosts[employee.id];
                  const accommodationCost = customAccommodationCost !== undefined 
                    ? customAccommodationCost 
                    : accommodationDays * 2100;
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
                        <Input 
                          type="number" 
                          value={customAccommodationCost !== undefined ? customAccommodationCost : accommodationDays * 2100} 
                          onChange={(e) => setAccommodationCosts(prev => ({
                            ...prev,
                            [employee.id]: parseInt(e.target.value) || 0
                          }))}
                          className="w-24 text-center mx-auto bg-gray-50 border-gray-300" 
                          min="0"
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-500 block mt-1">({accommodationDays} วัน)</span>
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
                      const customAccommodationCost = accommodationCosts[emp.id];
                      const accommodationCost = customAccommodationCost !== undefined 
                        ? customAccommodationCost 
                        : accommodationDays * 2100;
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