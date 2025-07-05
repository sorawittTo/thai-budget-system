import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, HelpCircle, Heart, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Employee } from "@shared/schema";

export default function AssistanceModule() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear() + 543);
  const [activeTab, setActiveTab] = useState<"other" | "special" | "overtime">("other");
  const [employees, setEmployees] = useState<Employee[]>([]);

  const { data: employeeData, isLoading: employeeLoading } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      return response.json();
    },
  });

  useEffect(() => {
    if (employeeData) {
      setEmployees(employeeData);
    }
  }, [employeeData]);

  const handleYearChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentYear(prev => prev + 1);
    }
  };

  const calculateAssistanceData = () => {
    return employees.map(employee => {
      const rentAssistance = 3000; // Fixed rent assistance
      const months = 12; // 12 months
      const yearlyAssistance = 5000; // Yearly assistance
      const oneTimeAssistance = 2000; // One-time assistance
      const total = (rentAssistance * months) + yearlyAssistance + oneTimeAssistance;
      
      return {
        id: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        rentAssistance,
        months,
        yearlyAssistance,
        oneTimeAssistance,
        total,
      };
    });
  };

  const calculateOvertimeData = () => {
    return employees.map(employee => {
      const hours = 20; // Default 20 hours
      const hourlyRate = 150; // 150 baht per hour
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

  const getKPIData = () => {
    return [
      {
        title: "เงินช่วยเหลืออื่นๆ",
        value: getTotalAssistance(),
        icon: HelpCircle,
        color: "bg-blue-500",
      },
      {
        title: "เงินช่วยเหลือพิเศษ",
        value: 0,
        icon: Heart,
        color: "bg-green-500",
      },
      {
        title: "ค่าล่วงเวลาวันหยุด",
        value: getTotalOvertime(),
        icon: Clock,
        color: "bg-orange-500",
      },
      {
        title: "รวมทั้งหมด",
        value: getTotalAssistance() + getTotalOvertime(),
        icon: HelpCircle,
        color: "bg-purple-500",
      },
    ];
  };

  const tabs = [
    { id: "other", label: "เงินช่วยเหลืออื่นๆ", icon: HelpCircle },
    { id: "special", label: "เงินช่วยเหลือพิเศษ", icon: Heart },
    { id: "overtime", label: "ค่าล่วงเวลาวันหยุด", icon: Clock },
  ];

  if (employeeLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-violet-700 text-white p-6 rounded-t-xl">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">จัดการเงินช่วยเหลือและค่าต่างเวลา</h2>
            <p className="text-violet-200">คำนวณและจัดการเงินช่วยเหลือประเภทต่างๆ</p>
          </div>
          <div className="flex items-center justify-end flex-grow gap-4 bg-violet-600/50 p-2 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange("prev")}
              className="p-2 rounded-full hover:bg-violet-500 text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="text-center">
              <div className="text-sm text-violet-200">คำนวณสำหรับปี พ.ศ.</div>
              <div className="text-2xl font-bold">{currentYear}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange("next")}
              className="p-2 rounded-full hover:bg-violet-500 text-white"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-white p-4 border-b-2">
        <nav className="flex justify-center gap-4 sm:gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id as any)}
                className={`sub-nav-button flex items-center gap-2 py-2 px-1 border-b-2 font-semibold ${
                  activeTab === tab.id
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-gray-600"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-lg">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {getKPIData().map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-full ${kpi.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{kpi.value.toLocaleString()}</p>
              </div>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "other" && (
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสพนักงาน</TableHead>
                    <TableHead>ชื่อ-สกุล</TableHead>
                    <TableHead className="text-right">ค่าเช่า (ต่อปี)</TableHead>
                    <TableHead className="text-center">จำนวนเดือน</TableHead>
                    <TableHead className="text-right">เงินช่วยเหลือ (ต่อปี)</TableHead>
                    <TableHead className="text-right">ค่าซื้อของ (ครั้งเดียว)</TableHead>
                    <TableHead className="text-right font-bold">รวม (บาท)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assistanceData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.employeeCode}</TableCell>
                      <TableCell>{item.fullName}</TableCell>
                      <TableCell className="text-right">{item.rentAssistance.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{item.months}</TableCell>
                      <TableCell className="text-right">{item.yearlyAssistance.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{item.oneTimeAssistance.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">{item.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6 pt-6 border-t-2 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold">ยอดรวม:</span>
                <span className="text-2xl font-bold text-indigo-600">{getTotalAssistance().toLocaleString()} บาท</span>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">นำยอดรวมไปตั้งงบ</Button>
            </div>
          </div>
        )}

        {activeTab === "special" && (
          <div className="text-center py-8">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">เงินช่วยเหลือพิเศษ</h3>
            <p className="text-gray-500">ยังไม่มีข้อมูลเงินช่วยเหลือพิเศษ</p>
          </div>
        )}

        {activeTab === "overtime" && (
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสพนักงาน</TableHead>
                    <TableHead>ชื่อ-สกุล</TableHead>
                    <TableHead className="text-right">จำนวนชั่วโมง</TableHead>
                    <TableHead className="text-right">อัตราต่อชั่วโมง</TableHead>
                    <TableHead className="text-right font-bold">รวม (บาท)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overtimeData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.employeeCode}</TableCell>
                      <TableCell>{item.fullName}</TableCell>
                      <TableCell className="text-right">{item.hours}</TableCell>
                      <TableCell className="text-right">{item.hourlyRate.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">{item.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6 pt-6 border-t-2 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold">ยอดรวม:</span>
                <span className="text-2xl font-bold text-indigo-600">{getTotalOvertime().toLocaleString()} บาท</span>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">นำยอดรวมไปตั้งงบ</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
