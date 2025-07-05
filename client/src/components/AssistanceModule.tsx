import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, HelpCircle, Heart, Clock, Edit2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Employee, MasterRate } from "@shared/schema";

export default function AssistanceModule() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear() + 543);
  const [activeTab, setActiveTab] = useState<"other" | "special" | "overtime">("other");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assistanceSettings, setAssistanceSettings] = useState<{[key: string]: {months: number, oneTimeAmount: number}}>({});

  const { data: employeeData, isLoading: employeeLoading } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      return response.json();
    },
  });

  const { data: masterRatesData, isLoading: ratesLoading } = useQuery({
    queryKey: ["/api/master-rates"],
    queryFn: async () => {
      const response = await fetch("/api/master-rates");
      return response.json();
    },
  });

  useEffect(() => {
    if (employeeData) {
      setEmployees(employeeData);
      // Initialize assistance settings for each employee
      const initialSettings: {[key: string]: {months: number, oneTimeAmount: number}} = {};
      employeeData.forEach((emp: Employee) => {
        initialSettings[emp.id] = { months: 12, oneTimeAmount: 0 };
      });
      setAssistanceSettings(initialSettings);
    }
  }, [employeeData]);

  const handleYearChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentYear(prev => prev + 1);
    }
  };

  const getMasterRateValue = (level: string, description: string): number => {
    if (!masterRatesData) return 0;
    const rate = masterRatesData.find((r: MasterRate) => 
      r.category === `level_${level.replace('.', '_')}` && r.description === description
    );
    return rate ? rate.rate : 0;
  };

  const updateAssistanceSettings = (employeeId: number, field: 'months' | 'oneTimeAmount', value: number) => {
    setAssistanceSettings(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value
      }
    }));
  };

  const calculateAssistanceData = () => {
    return employees.map(employee => {
      const settings = assistanceSettings[employee.id] || { months: 12, oneTimeAmount: 0 };
      const rentAssistance = getMasterRateValue(employee.level, "ค่าเช่า");
      const monthlyAssistance = getMasterRateValue(employee.level, "เงินช่วยเหลือรายเดือน");
      const totalMonthlyAssistance = monthlyAssistance * settings.months;
      const total = (rentAssistance * settings.months) + totalMonthlyAssistance + settings.oneTimeAmount;
      
      return {
        id: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        level: employee.level,
        rentAssistance,
        monthlyAssistance,
        months: settings.months,
        totalMonthlyAssistance,
        oneTimeAmount: settings.oneTimeAmount,
        total,
      };
    });
  };

  const calculateOvertimeData = () => {
    return employees.map(employee => {
      const hours = 40;
      const hourlyRate = 150;
      const total = hours * hourlyRate;
      
      return {
        id: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        hours,
        hourlyRate,
        total,
      };
    });
  };

  const assistanceData = calculateAssistanceData();
  const overtimeData = calculateOvertimeData();

  const getTotalAssistance = () => {
    return assistanceData.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalOvertime = () => {
    return overtimeData.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalSpecialAssistance = () => {
    return 500000; // Fixed amount for special assistance
  };

  if (employeeLoading || ratesLoading) {
    return <div className="flex justify-center items-center h-64">กำลังโหลด...</div>;
  }

  return (
    <div className="w-full p-6 bg-white" style={{ fontFamily: 'Sarabun' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Heart className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">เงินช่วยเหลือ</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange("prev")}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            ปีก่อน
          </Button>
          <span className="text-lg font-semibold">ปีงบประมาณ {currentYear}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange("next")}
            className="flex items-center gap-2"
          >
            ปีหน้า
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "other" ? "default" : "outline"}
          onClick={() => setActiveTab("other")}
          className="flex items-center gap-2"
        >
          <Heart className="h-4 w-4" />
          เงินช่วยเหลืออื่น ๆ
        </Button>
        <Button
          variant={activeTab === "special" ? "default" : "outline"}
          onClick={() => setActiveTab("special")}
          className="flex items-center gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          เงินช่วยเหลือพิเศษ
        </Button>
        <Button
          variant={activeTab === "overtime" ? "default" : "outline"}
          onClick={() => setActiveTab("overtime")}
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          เงินล่วงเวลา
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "other" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">เงินช่วยเหลืออื่น ๆ</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center border font-semibold">ลำดับ</TableHead>
                  <TableHead className="text-center border font-semibold">รหัสพนักงาน</TableHead>
                  <TableHead className="text-center border font-semibold">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="text-center border font-semibold">ระดับ</TableHead>
                  <TableHead className="text-center border font-semibold">จำนวนเดือน</TableHead>
                  <TableHead className="text-center border font-semibold">ค่าเช่าบ้าน</TableHead>
                  <TableHead className="text-center border font-semibold">เงินช่วยเหลือรายเดือน</TableHead>
                  <TableHead className="text-center border font-semibold">ค่าซื้อของ ครั้งเดียว</TableHead>
                  <TableHead className="text-center border font-semibold">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assistanceData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center border">{index + 1}</TableCell>
                    <TableCell className="text-center border">{item.employeeCode}</TableCell>
                    <TableCell className="text-left border">{item.fullName}</TableCell>
                    <TableCell className="text-center border">{item.level}</TableCell>
                    <TableCell className="text-center border">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.months}
                          onChange={(e) => updateAssistanceSettings(item.id, 'months', Number(e.target.value))}
                          className="w-16 text-center flat-input"
                        />
                        <Edit2 className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right border">{item.rentAssistance.toLocaleString()}</TableCell>
                    <TableCell className="text-right border">{item.monthlyAssistance.toLocaleString()}</TableCell>
                    <TableCell className="text-center border">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.oneTimeAmount}
                          onChange={(e) => updateAssistanceSettings(item.id, 'oneTimeAmount', Number(e.target.value))}
                          className="w-24 text-center flat-input"
                        />
                        <Edit2 className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right border font-semibold">{item.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={8} className="text-center border font-semibold">รวมทั้งหมด</TableCell>
                  <TableCell className="text-right border font-semibold text-lg">
                    {getTotalAssistance().toLocaleString()} บาท
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "special" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">เงินช่วยเหลือพิเศษ</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 font-semibold">งบประมาณรวมสำหรับเงินช่วยเหลือพิเศษ</p>
            <p className="text-2xl font-bold text-blue-800 mt-2">
              {getTotalSpecialAssistance().toLocaleString()} บาท
            </p>
          </div>
        </div>
      )}

      {activeTab === "overtime" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">เงินล่วงเวลา</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center border font-semibold">ลำดับ</TableHead>
                  <TableHead className="text-center border font-semibold">รหัสพนักงาน</TableHead>
                  <TableHead className="text-center border font-semibold">ชื่อ-นามสกุล</TableHead>
                  <TableHead className="text-center border font-semibold">จำนวนชั่วโมง</TableHead>
                  <TableHead className="text-center border font-semibold">อัตราต่อชั่วโมง</TableHead>
                  <TableHead className="text-center border font-semibold">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overtimeData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center border">{index + 1}</TableCell>
                    <TableCell className="text-center border">{item.employeeCode}</TableCell>
                    <TableCell className="text-left border">{item.fullName}</TableCell>
                    <TableCell className="text-center border">{item.hours}</TableCell>
                    <TableCell className="text-right border">{item.hourlyRate.toLocaleString()}</TableCell>
                    <TableCell className="text-right border font-semibold">{item.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={5} className="text-center border font-semibold">รวมทั้งหมด</TableCell>
                  <TableCell className="text-right border font-semibold text-lg">
                    {getTotalOvertime().toLocaleString()} บาท
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}