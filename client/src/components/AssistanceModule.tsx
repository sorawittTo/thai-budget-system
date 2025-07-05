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
  const [specialAssistanceData, setSpecialAssistanceData] = useState([
    { id: 1, description: "ความคุ้มครองประกันภัยอุบัติเหตุกลุ่มพนักงาน", quantity: 1, days: 2, recipients: 1, amountPerPerson: 250, total: 500.00 },
    { id: 2, description: "ความคุ้มครองประกันภัยรถเจ้าหน้าที่แล้วเซ็นคุม", quantity: 2, days: 2, recipients: 1, amountPerPerson: 250, total: 1000.00 },
    { id: 3, description: "PM เครื่องดื่ม M7", quantity: 12, days: 2, recipients: 1, amountPerPerson: 250, total: 6000.00 },
    { id: 4, description: "Mini Overhaul เครื่อง M7", quantity: 1, days: 2, recipients: 1, amountPerPerson: 250, total: 500.00 },
    { id: 5, description: "พนักงานข้างแดด", quantity: 1, days: 242, recipients: 2, amountPerPerson: 300, total: 145200.00 },
    { id: 6, description: "พนักงานทำบุญการพระสงฆ์โบสถ์รูปพระสำราญ", quantity: 1, days: 20, recipients: 1, amountPerPerson: 300, total: 6000.00 },
    { id: 7, description: "ความคุ้มครองสมัยประธา", quantity: 1, days: 2, recipients: 1, amountPerPerson: 250, total: 500.00 }
  ]);
  const [specialAssistanceNotes, setSpecialAssistanceNotes] = useState("");

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

  const updateSpecialAssistanceData = (id: number, field: string, value: number | string) => {
    setSpecialAssistanceData(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Recalculate total when any field changes
          if (field !== 'description' && field !== 'total') {
            updated.total = updated.quantity * updated.days * updated.recipients * updated.amountPerPerson;
          }
          return updated;
        }
        return item;
      })
    );
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

  const [overtimeData, setOvertimeData] = useState([
    { id: 1, employeeType: "วันทำการ 3 วัน", employees: 0, hours: 8, hoursPerEmployee: 1, ratePerHour: 71.43, total: 0.00 },
    { id: 2, employeeType: "วันทำการ 4 วัน", employees: 0, hours: 8, hoursPerEmployee: 1, ratePerHour: 71.43, total: 0.00 },
    { id: 3, employeeType: "วันทำการ 5 วัน", employees: 0, hours: 8, hoursPerEmployee: 1, ratePerHour: 71.43, total: 0.00 }
  ]);
  
  const [overtimeRatePerHour, setOvertimeRatePerHour] = useState(15000);
  
  const updateOvertimeData = (id: number, field: string, value: number) => {
    setOvertimeData(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Recalculate total: employees × hours × hoursPerEmployee × ratePerHour
          updated.total = updated.employees * updated.hours * updated.hoursPerEmployee * updated.ratePerHour;
          return updated;
        }
        return item;
      })
    );
  };

  const assistanceData = calculateAssistanceData();

  const getTotalAssistance = () => {
    return assistanceData.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalOvertime = () => {
    return overtimeData.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalSpecialAssistance = () => {
    return specialAssistanceData.reduce((sum, item) => sum + item.total, 0);
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center border font-semibold">รายการ</TableHead>
                  <TableHead className="text-center border font-semibold">ครั้ง/ปี</TableHead>
                  <TableHead className="text-center border font-semibold">วัน/ครั้ง</TableHead>
                  <TableHead className="text-center border font-semibold">คน/ครั้ง</TableHead>
                  <TableHead className="text-center border font-semibold">อัตราเงินช่วยเหลือ/วัน</TableHead>
                  <TableHead className="text-center border font-semibold">รวมเงิน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialAssistanceData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-left border min-w-[300px]">
                      <Input
                        value={item.description}
                        onChange={(e) => updateSpecialAssistanceData(item.id, 'description', e.target.value)}
                        className="flat-input border-none bg-transparent w-full"
                      />
                    </TableCell>
                    <TableCell className="text-center border">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateSpecialAssistanceData(item.id, 'quantity', Number(e.target.value))}
                          className="w-16 text-center flat-input"
                        />
                        <Edit2 className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center border">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.days}
                          onChange={(e) => updateSpecialAssistanceData(item.id, 'days', Number(e.target.value))}
                          className="w-16 text-center flat-input"
                        />
                        <Edit2 className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center border">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.recipients}
                          onChange={(e) => updateSpecialAssistanceData(item.id, 'recipients', Number(e.target.value))}
                          className="w-16 text-center flat-input"
                        />
                        <Edit2 className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center border">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.amountPerPerson}
                          onChange={(e) => updateSpecialAssistanceData(item.id, 'amountPerPerson', Number(e.target.value))}
                          className="w-20 text-center flat-input"
                        />
                        <Edit2 className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right border font-semibold">{item.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={5} className="text-center border font-semibold">ยอดรวม</TableCell>
                  <TableCell className="text-right border font-semibold text-lg">
                    {getTotalSpecialAssistance().toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="mt-6">
            <div className="flex items-start gap-2">
              <p className="font-semibold pt-2">หมายเหตุ:</p>
              <div className="flex-1">
                <Input
                  value={specialAssistanceNotes}
                  onChange={(e) => setSpecialAssistanceNotes(e.target.value)}
                  placeholder="กรอกหมายเหตุเพิ่มเติม..."
                  className="flat-input w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "overtime" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">เงินล่วงเวลา</h2>
          
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">เงินเดือน (สำหรับคำนวณอัตราต่อชั่วโมง):</span>
              <Input
                type="number"
                value={overtimeRatePerHour}
                onChange={(e) => setOvertimeRatePerHour(Number(e.target.value))}
                className="w-32 flat-input"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center border font-semibold">ประเภทพนักงาน</TableHead>
                  <TableHead className="text-center border font-semibold">จำนวนคน</TableHead>
                  <TableHead className="text-center border font-semibold">ชม./วัน</TableHead>
                  <TableHead className="text-center border font-semibold">จำนวน</TableHead>
                  <TableHead className="text-center border font-semibold">อัตราชั่วโมง</TableHead>
                  <TableHead className="text-center border font-semibold">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overtimeData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-left border">{item.employeeType}</TableCell>
                    <TableCell className="text-center border">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.employees}
                          onChange={(e) => updateOvertimeData(item.id, 'employees', Number(e.target.value))}
                          className="w-16 text-center flat-input"
                        />
                        <Edit2 className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center border">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.hours}
                          onChange={(e) => updateOvertimeData(item.id, 'hours', Number(e.target.value))}
                          className="w-16 text-center flat-input"
                        />
                        <Edit2 className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center border">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.hoursPerEmployee}
                          onChange={(e) => updateOvertimeData(item.id, 'hoursPerEmployee', Number(e.target.value))}
                          className="w-16 text-center flat-input"
                        />
                        <Edit2 className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right border">{item.ratePerHour.toFixed(2)}</TableCell>
                    <TableCell className="text-right border font-semibold">{item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={5} className="text-center border font-semibold">ยอดรวมทั้งหมด</TableCell>
                  <TableCell className="text-right border font-semibold text-lg">
                    {getTotalOvertime().toFixed(2)}
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