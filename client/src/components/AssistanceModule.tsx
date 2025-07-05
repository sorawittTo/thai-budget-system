import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, HelpCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Employee, MasterRate } from "@/../../shared/schema";

interface AssistanceItem {
  id: number;
  description: string;
  months: number;
  houseRent: number;
  monthlyAssistance: number;
  oneTimePurchase: number;
  total: number;
}

interface SpecialAssistanceItem {
  id: number;
  description: string;
  timesPerYear: number;
  daysPerTime: number;
  peoplePerTime: number;
  assistanceRatePerDay: number;
  total: number;
}

interface OvertimeItem {
  id: number;
  days: number;
  hours: number;
  ratePerHour: number;
  total: number;
}

export default function AssistanceModule() {
  const [activeTab, setActiveTab] = useState<"other" | "special" | "overtime">("other");
  const [currentYear, setCurrentYear] = useState(2025);
  const [overtimeRatePerHour, setOvertimeRatePerHour] = useState(18000);
  const [otherNotes, setOtherNotes] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [overtimeNotes, setOvertimeNotes] = useState("");

  const { data: employees, isLoading: employeeLoading } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  const { data: masterRates, isLoading: ratesLoading } = useQuery<MasterRate[]>({
    queryKey: ['/api/master-rates'],
  });

  const [assistanceData, setAssistanceData] = useState<{[key: number]: AssistanceItem}>({});

  // โหลดข้อมูลเริ่มต้นจากตารางมาตรฐานเมื่อมีข้อมูลพนักงานและตารางมาตรฐาน
  useEffect(() => {
    if (employees && masterRates && employees.length > 0 && masterRates.length > 0) {
      const activeEmployees = (employees as Employee[]).filter(emp => emp.status === "Active");
      const newAssistanceData: {[key: number]: AssistanceItem} = {};
      
      activeEmployees.forEach(employee => {
        if (!assistanceData[employee.id]) {
          const level = employee.level;
          const standardHouseRent = getStandardRate(level, "ค่าเช่า");
          const standardMonthlyAssistance = getStandardRate(level, "เงินช่วยเหลือรายเดือน");
          
          newAssistanceData[employee.id] = {
            id: employee.id,
            description: employee.fullName,
            months: 12,
            houseRent: standardHouseRent,
            monthlyAssistance: standardMonthlyAssistance,
            oneTimePurchase: 0,
            total: (12 * (standardHouseRent + standardMonthlyAssistance)) + 0
          };
        }
      });
      
      if (Object.keys(newAssistanceData).length > 0) {
        setAssistanceData(prev => ({ ...prev, ...newAssistanceData }));
      }
    }
  }, [employees, masterRates]);

  const [specialAssistanceItems, setSpecialAssistanceItems] = useState<SpecialAssistanceItem[]>([
    {
      id: 1,
      description: "งานบุญประจำปี",
      timesPerYear: 5,
      daysPerTime: 1,
      peoplePerTime: 5,
      assistanceRatePerDay: 300,
      total: 7500
    },
    {
      id: 2,
      description: "งานบุญปีใหม่",
      timesPerYear: 1,
      daysPerTime: 1,
      peoplePerTime: 5,
      assistanceRatePerDay: 300,
      total: 1500
    },
    {
      id: 3,
      description: "งานบุญสงกรานต์",
      timesPerYear: 1,
      daysPerTime: 3,
      peoplePerTime: 5,
      assistanceRatePerDay: 300,
      total: 4500
    },
    {
      id: 4,
      description: "งานบุญผู้สูงอายุ",
      timesPerYear: 1,
      daysPerTime: 1,
      peoplePerTime: 5,
      assistanceRatePerDay: 300,
      total: 1500
    },
    {
      id: 5,
      description: "งานบุญท้าวเวสสุวรรณ",
      timesPerYear: 1,
      daysPerTime: 1,
      peoplePerTime: 5,
      assistanceRatePerDay: 300,
      total: 1500
    },
    {
      id: 6,
      description: "งานบุญลอยกระทง",
      timesPerYear: 1,
      daysPerTime: 1,
      peoplePerTime: 5,
      assistanceRatePerDay: 300,
      total: 1500
    },
    {
      id: 7,
      description: "งานบุญเข้าพรรษา",
      timesPerYear: 1,
      daysPerTime: 1,
      peoplePerTime: 5,
      assistanceRatePerDay: 300,
      total: 1500
    }
  ]);

  const [overtimeItems, setOvertimeItems] = useState<OvertimeItem[]>([
    {
      id: 1,
      days: 30,
      hours: 120,
      ratePerHour: 75,
      total: 9000
    }
  ]);

  // ฟังก์ชันดึงอัตรามาตรฐานจากตารางมาตรฐาน
  const getStandardRate = (employeeLevel: string, description: string): number => {
    // แปลงระดับพนักงานให้ตรงกับ category ในตารางมาตรฐาน
    let category = "";
    const level = parseFloat(employeeLevel);
    
    if (level >= 7) {
      category = "level_7";
    } else if (level >= 6) {
      category = "level_6";
    } else if (level >= 5) {
      category = "level_5";
    } else if (level >= 4) {
      category = "level_4";
    } else {
      category = "level_3";
    }
    
    const rate = masterRates?.find(r => r.category === category && r.description === description);
    return rate?.rate || 0;
  };

  const updateAssistanceItem = (employeeId: number, field: string, value: any) => {
    setAssistanceData(prev => {
      const employee = employees?.find((emp: Employee) => emp.id === employeeId) as Employee;
      const level = employee?.level || "1";
      
      // ดึงค่าจากตารางมาตรฐาน - ตามระดับของแต่ละคน
      const standardHouseRent = getStandardRate(level, "ค่าเช่า");
      const standardMonthlyAssistance = getStandardRate(level, "เงินช่วยเหลือรายเดือน");
      
      const currentData = prev[employeeId] || {
        id: employeeId,
        description: "",
        months: 12,
        houseRent: standardHouseRent,
        monthlyAssistance: standardMonthlyAssistance,
        oneTimePurchase: 0,
        total: 0
      };
      
      const updatedItem = { ...currentData, [field]: value };
      if (field === 'months' || field === 'houseRent' || field === 'monthlyAssistance' || field === 'oneTimePurchase') {
        updatedItem.total = (updatedItem.months * (updatedItem.houseRent + updatedItem.monthlyAssistance)) + updatedItem.oneTimePurchase;
      }
      
      return {
        ...prev,
        [employeeId]: updatedItem
      };
    });
  };

  const updateSpecialAssistanceItem = (id: number, field: keyof SpecialAssistanceItem, value: any) => {
    setSpecialAssistanceItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'timesPerYear' || field === 'daysPerTime' || field === 'peoplePerTime' || field === 'assistanceRatePerDay') {
            updatedItem.total = updatedItem.timesPerYear * updatedItem.daysPerTime * updatedItem.peoplePerTime * updatedItem.assistanceRatePerDay;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const updateOvertimeItem = (id: number, field: keyof OvertimeItem, value: any) => {
    setOvertimeItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'hours' || field === 'ratePerHour') {
            updatedItem.total = updatedItem.hours * updatedItem.ratePerHour;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const getTotalAssistance = () => {
    return Object.values(assistanceData).reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalSpecialAssistance = () => {
    return specialAssistanceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalOvertime = () => {
    return overtimeItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleYearChange = (direction: "prev" | "next") => {
    setCurrentYear(prev => direction === "prev" ? prev - 1 : prev + 1);
  };

  if (employeeLoading || ratesLoading) {
    return <div className="flex justify-center items-center h-64">กำลังโหลด...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100" style={{ fontFamily: 'Sarabun' }}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  เงินช่วยเหลือ
                </h1>
                <p className="text-gray-600 text-sm mt-1">ระบบจัดการเงินช่วยเหลือและสวัสดิการพนักงาน</p>
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
                <span className="text-lg font-semibold text-gray-800">ปีงบประมาณ พ.ศ. {currentYear}</span>
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
          <div className="flex gap-2">
            <Button
              variant={activeTab === "other" ? "default" : "ghost"}
              onClick={() => setActiveTab("other")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "other" 
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105" 
                  : "hover:bg-green-50 hover:text-green-700"
              }`}
            >
              <Heart className="h-4 w-4" />
              เงินช่วยเหลืออื่น ๆ
            </Button>
            <Button
              variant={activeTab === "special" ? "default" : "ghost"}
              onClick={() => setActiveTab("special")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "special" 
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105" 
                  : "hover:bg-purple-50 hover:text-purple-700"
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              เงินช่วยเหลือพิเศษ
            </Button>
            <Button
              variant={activeTab === "overtime" ? "default" : "ghost"}
              onClick={() => setActiveTab("overtime")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                activeTab === "overtime" 
                  ? "bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-lg transform scale-105" 
                  : "hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              <Clock className="h-4 w-4" />
              ค่าล่วงเวลา
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "other" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border-l-4 border-green-500 shadow-sm">
              <h2 className="text-xl font-semibold text-green-800 mb-2">เงินช่วยเหลืออื่น ๆ</h2>
              <p className="text-green-600 text-sm">ข้อมูลการช่วยเหลือรายเดือนและค่าใช้จ่ายอื่นๆ สำหรับพนักงาน</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-green-100 to-blue-100">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">ชื่อ-นามสกุล</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">ระดับ</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">จำนวนเดือน</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">ค่าเช่าบ้าน</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">เงินช่วยเหลือรายเดือน</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-green-800">ค่าซื้อของเหมาจ่าย</TableHead>
                    <TableHead className="text-center font-semibold text-green-800">รวม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(employees as Employee[]).filter(emp => emp.status === "Active").map((employee: Employee) => {
                    const level = employee.level;
                    // ดึงค่าจากตารางมาตรฐาน - ตามระดับของแต่ละคน
                    const standardHouseRent = getStandardRate(level, "ค่าเช่า");
                    const standardMonthlyAssistance = getStandardRate(level, "เงินช่วยเหลือรายเดือน");
                    
                    // ตรวจสอบว่ามีข้อมูลแล้วหรือยัง ถ้าไม่มีให้ใช้ค่าจากตารางมาตรฐาน
                    const assistanceItem = assistanceData[employee.id] || {
                      id: employee.id,
                      description: employee.fullName,
                      months: 12,
                      houseRent: standardHouseRent,
                      monthlyAssistance: standardMonthlyAssistance,
                      oneTimePurchase: 0,
                      total: (12 * (standardHouseRent + standardMonthlyAssistance)) + 0
                    };
                    
                    return (
                      <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="border-r border-gray-200 font-medium">{employee.fullName}</TableCell>
                        <TableCell className="border-r border-gray-200 text-center font-medium">{employee.level}</TableCell>
                        <TableCell className="border-r border-gray-200 text-center">
                          <Input
                            type="number"
                            value={assistanceItem.months}
                            onChange={(e) => updateAssistanceItem(employee.id, 'months', Number(e.target.value))}
                            className="text-center w-20 mx-auto bg-gray-50 border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="border-r border-gray-200 text-center">
                          <Input
                            type="number"
                            value={assistanceItem.houseRent}
                            onChange={(e) => updateAssistanceItem(employee.id, 'houseRent', Number(e.target.value))}
                            className="text-center w-24 mx-auto bg-gray-50 border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="border-r border-gray-200 text-center">
                          <Input
                            type="number"
                            value={assistanceItem.monthlyAssistance}
                            onChange={(e) => updateAssistanceItem(employee.id, 'monthlyAssistance', Number(e.target.value))}
                            className="text-center w-24 mx-auto bg-gray-50 border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="border-r border-gray-200 text-center">
                          <Input
                            type="number"
                            value={assistanceItem.oneTimePurchase}
                            onChange={(e) => updateAssistanceItem(employee.id, 'oneTimePurchase', Number(e.target.value))}
                            className="text-center w-24 mx-auto bg-gray-50 border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-700">{assistanceItem.total.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-gradient-to-r from-green-50 to-blue-50 border-t-2 border-green-200">
                    <TableCell colSpan={6} className="text-center font-bold text-green-800">ยอดรวมทั้งหมด</TableCell>
                    <TableCell className="text-right font-bold text-lg text-green-700">
                      {getTotalAssistance().toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border">
              <div className="flex items-start gap-3">
                <p className="font-semibold text-gray-700 pt-2">หมายเหตุ:</p>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">ค่าเช่าบ้านและเงินช่วยเหลือรายเดือน มาจากตารางอัตรามาตรฐานตามระดับพนักงาน</p>
                  <Input
                    value={otherNotes}
                    onChange={(e) => setOtherNotes(e.target.value)}
                    placeholder="กรอกหมายเหตุเพิ่มเติม..."
                    className="w-full bg-white border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "special" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500 shadow-sm">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">เงินช่วยเหลือพิเศษ</h2>
              <p className="text-purple-600 text-sm">รายการเงินช่วยเหลือพิเศษในกรณีต่างๆ และค่าใช้จ่ายเฉพาะกิจ</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-purple-800">รายการ</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-purple-800">จำนวนครั้ง/ปี</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-purple-800">จำนวนวัน/ครั้ง</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-purple-800">จำนวนคน/ครั้ง</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-purple-800">อัตราค่าช่วยเหลือ/วัน</TableHead>
                    <TableHead className="text-center font-semibold text-purple-800">รวม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specialAssistanceItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="border-r border-gray-200">
                        <Input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateSpecialAssistanceItem(item.id, 'description', e.target.value)}
                          className="w-full bg-gray-50 border-gray-300 font-medium"
                        />
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input
                          type="number"
                          value={item.timesPerYear}
                          onChange={(e) => updateSpecialAssistanceItem(item.id, 'timesPerYear', Number(e.target.value))}
                          className="text-center w-20 mx-auto bg-gray-50 border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input
                          type="number"
                          value={item.daysPerTime}
                          onChange={(e) => updateSpecialAssistanceItem(item.id, 'daysPerTime', Number(e.target.value))}
                          className="text-center w-20 mx-auto bg-gray-50 border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input
                          type="number"
                          value={item.peoplePerTime}
                          onChange={(e) => updateSpecialAssistanceItem(item.id, 'peoplePerTime', Number(e.target.value))}
                          className="text-center w-20 mx-auto bg-gray-50 border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input
                          type="number"
                          value={item.assistanceRatePerDay}
                          onChange={(e) => updateSpecialAssistanceItem(item.id, 'assistanceRatePerDay', Number(e.target.value))}
                          className="text-center w-20 mx-auto bg-gray-50 border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold text-purple-700">{item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-200">
                    <TableCell colSpan={5} className="text-center font-bold text-purple-800">ยอดรวมทั้งหมด</TableCell>
                    <TableCell className="text-right font-bold text-lg text-purple-700">
                      {getTotalSpecialAssistance().toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border">
              <div className="flex items-start gap-3">
                <p className="font-semibold text-gray-700 pt-2">หมายเหตุ:</p>
                <div className="flex-1">
                  <Input
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="กรอกหมายเหตุเพิ่มเติม..."
                    className="w-full bg-white border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "overtime" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border-l-4 border-orange-500 shadow-sm">
              <h2 className="text-xl font-semibold text-orange-800 mb-2">ค่าล่วงเวลา</h2>
              <p className="text-orange-600 text-sm">การคำนวณค่าล่วงเวลาสำหรับพนักงานตามชั่วโมงการทำงาน</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-blue-800">เงินเดือน (สำหรับคำนวณอัตราต่อชั่วโมง):</span>
                <Input
                  type="number"
                  value={overtimeRatePerHour}
                  onChange={(e) => setOvertimeRatePerHour(Number(e.target.value))}
                  className="w-32 bg-white border-blue-300"
                />
                <span className="text-blue-600 text-sm font-medium">บาท</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">จำนวนวัน</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">จำนวนชั่วโมง</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">อัตราต่อชั่วโมง</TableHead>
                    <TableHead className="border-r border-gray-200 text-center font-semibold text-orange-800">หมายเหตุ</TableHead>
                    <TableHead className="text-center font-semibold text-orange-800">รวม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overtimeItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input
                          type="number"
                          value={item.days}
                          onChange={(e) => updateOvertimeItem(item.id, 'days', Number(e.target.value))}
                          className="text-center w-20 mx-auto bg-gray-50 border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input
                          type="number"
                          value={item.hours}
                          onChange={(e) => updateOvertimeItem(item.id, 'hours', Number(e.target.value))}
                          className="text-center w-20 mx-auto bg-gray-50 border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input
                          type="number"
                          value={item.ratePerHour}
                          onChange={(e) => updateOvertimeItem(item.id, 'ratePerHour', Number(e.target.value))}
                          className="text-center w-20 mx-auto bg-gray-50 border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="border-r border-gray-200 text-center">
                        <Input
                          value={overtimeNotes}
                          onChange={(e) => setOvertimeNotes(e.target.value)}
                          placeholder="หมายเหตุ..."
                          className="w-full bg-gray-50 border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold text-orange-700">{item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gradient-to-r from-orange-50 to-yellow-50 border-t-2 border-orange-200">
                    <TableCell colSpan={4} className="text-center font-bold text-orange-800">ยอดรวมทั้งหมด</TableCell>
                    <TableCell className="text-right font-bold text-lg text-orange-700">
                      {getTotalOvertime().toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border">
              <div className="flex items-start gap-3">
                <p className="font-semibold text-gray-700 pt-2">หมายเหตุ:</p>
                <div className="flex-1">
                  <Input
                    value={overtimeNotes}
                    onChange={(e) => setOvertimeNotes(e.target.value)}
                    placeholder="กรอกหมายเหตุเพิ่มเติม..."
                    className="w-full bg-white border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}