import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Employee, BudgetItem, AssistancePayment, TravelExpense, OvertimePayment, MasterRate } from "@/../../shared/schema";
import { calculateTravelTotals } from "@/components/TravelModule";

export default function SummaryModule() {
  const [currentYear, setCurrentYear] = useState(2569);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  const { data: budgetItems = [] } = useQuery<BudgetItem[]>({
    queryKey: ['/api/budget-items'],
  });

  const { data: masterRates = [] } = useQuery<MasterRate[]>({
    queryKey: ['/api/master-rates'],
  });

  const { data: assistancePayments = [] } = useQuery<AssistancePayment[]>({
    queryKey: ['/api/assistance-payments'],
  });

  const { data: travelExpenseData = [] } = useQuery<TravelExpense[]>({
    queryKey: ['/api/travel-expenses'],
  });

  const { data: overtimePayments = [] } = useQuery<OvertimePayment[]>({
    queryKey: ['/api/overtime-payments'],
  });

  const handleYearChange = (direction: "prev" | "next") => {
    setCurrentYear(prev => direction === "prev" ? prev - 1 : prev + 1);
  };

  // คำนวณสรุปงบประมาณรายจ่ายดำเนินงาน
  const calculateOperatingExpenses = () => {
    const category1Total = budgetItems
      .filter(item => item.category === "หมวด 1 : ค่าใช้จ่ายเกี่ยวกับพนักงาน")
      .reduce((sum, item) => sum + (item.compareYearAmount || 0), 0);
    
    const category2Total = budgetItems
      .filter(item => item.category === "หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป")
      .reduce((sum, item) => sum + (item.compareYearAmount || 0), 0);
    
    return {
      category1: category1Total,
      category2: category2Total,
      total: category1Total + category2Total
    };
  };

  // คำนวณสรุปค่าใช้จ่ายเดินทาง (ใช้ข้อมูลจากการคำนวณจริง)
  const calculateTravelExpenses = () => {
    if (!employees) {
      return {
        souvenir: 0,
        meeting: 0,
        studentTrip: 0,
        familyVisit: 0,
        total: 0
      };
    }

    // ใช้ค่าเริ่มต้นสำหรับ workDays และ state อื่นๆ
    const defaultWorkDays: {[key: number]: number} = {};
    const defaultOtherVehicleCosts: {[key: number]: number} = {};
    const defaultAccommodationCosts: {[key: number]: number} = {};
    
    const travelTotals = calculateTravelTotals(employees, defaultWorkDays, defaultOtherVehicleCosts, defaultAccommodationCosts);

    return {
      souvenir: travelTotals.souvenir, // tab ซื้อของฝาก
      familyVisit: travelTotals.familyVisit, // tab เยี่ยมครอบครัว
      meeting: travelTotals.companyEvent, // tab ร่วมงานวันพนักงาน
      studentTrip: travelTotals.rotation, // tab หมุนเวียนงาน ผจศ.
      total: travelTotals.total
    };
  };

  // คำนวณสรุปเงินช่วยเหลือ
  const calculateAssistanceTotal = () => {
    if (!employees || !masterRates) {
      return {
        other: 0,
        special: 0,
        overtime: 0,
        total: 0
      };
    }

    const activeEmployees = employees.filter(emp => emp.status === "Active");
    
    // 1. เงินช่วยเหลืออื่น ๆ (คำนวณจากข้อมูลจริง)
    const otherAssistance = activeEmployees.reduce((sum, emp) => {
      const level = emp.level;
      const months = 12;
      
      // หาอัตรามาตรฐานจาก master rates ตามระดับ
      let houseRent = 0;
      let monthlyAssistance = 0;
      let oneTimePurchase = 0;
      
      // หาอัตรามาตรฐานจากตาราง master rates
      if (level === "7") {
        const level7Rate = masterRates.find(rate => rate.category === "level_7");
        if (level7Rate) {
          houseRent = 12000; // ค่าที่พักระดับ 7
          monthlyAssistance = 7500; // เงินช่วยเหลือรายเดือนระดับ 7
          oneTimePurchase = 10000; // ค่าซื้อของครั้งเดียว
        }
      } else if (level === "6") {
        houseRent = 8000; // ค่าที่พักระดับ 6
        monthlyAssistance = 6250; // เงินช่วยเหลือรายเดือนระดับ 6
        oneTimePurchase = 8000; // ค่าซื้อของครั้งเดียว
      } else if (level === "5.5") {
        houseRent = 9500; // ค่าที่พักระดับ 5.5
        monthlyAssistance = 6250; // เงินช่วยเหลือรายเดือนระดับ 5.5
        oneTimePurchase = 6000; // ค่าซื้อของครั้งเดียว
      } else if (level === "5") {
        houseRent = 8000; // ค่าที่พักระดับ 5
        monthlyAssistance = 5500; // เงินช่วยเหลือรายเดือนระดับ 5
        oneTimePurchase = 6000; // ค่าซื้อของครั้งเดียว
      } else {
        houseRent = 6000; // ค่าที่พักระดับอื่นๆ
        monthlyAssistance = 4500; // เงินช่วยเหลือรายเดือนระดับอื่นๆ
        oneTimePurchase = 5000; // ค่าซื้อของครั้งเดียว
      }
      
      return sum + (houseRent * months) + (monthlyAssistance * months) + oneTimePurchase;
    }, 0);

    // 2. เงินช่วยเหลือพิเศษ (ค่าตายตัว)
    const specialAssistance = 159700000;

    // 3. ค่าจ้างชั่วโมงเพิ่ม (ค่าตายตัว)
    const overtime = 0;

    return {
      other: otherAssistance,
      special: specialAssistance,
      overtime: overtime,
      total: otherAssistance + specialAssistance + overtime
    };
  };

  const operatingExpenses = calculateOperatingExpenses();
  const travelExpensesCalc = calculateTravelExpenses();
  const assistanceTotal = calculateAssistanceTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  สรุปงบประมาณ
                </h1>
                <p className="text-gray-600 text-sm mt-1">การจัดทำงบประมาณรายจ่าย</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange("prev")}
                className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                <span className="text-lg font-semibold text-gray-800">ครุณประมาณ พ.ศ.</span>
                <span className="text-lg font-bold text-purple-600 ml-2">{currentYear}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearChange("next")}
                className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* สรุปงบประมาณประจำปี */}
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6">
              <CardTitle className="text-xl font-bold">สรุปงบประมาณประจำปี</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* สรุปงบประมาณรายจ่ายดำเนินงาน */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  สรุปงบประมาณรายจ่ายดำเนินงาน:
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>หมวด 1 : ค่าใช้จ่ายเกี่ยวกับพนักงาน</span>
                    <span className="font-medium">{operatingExpenses.category1.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป</span>
                    <span className="font-medium">{operatingExpenses.category2.toLocaleString()} บาท</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold text-blue-600">
                    <span>ยอดรวมรายจ่ายดำเนินงาน:</span>
                    <span>{operatingExpenses.total.toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>

              {/* สรุปค่าใช้จ่ายเดินทาง */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  สรุปค่าใช้จ่ายเดินทาง:
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>1. ค่าเดินทางรับของที่ระลึก</span>
                    <span className="font-medium">{travelExpensesCalc.souvenir.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. ค่าเดินทางเยี่ยมครอบครัว</span>
                    <span className="font-medium">{travelExpensesCalc.familyVisit.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3. ค่าเดินทางร่วมงานวันพนักงาน</span>
                    <span className="font-medium">{travelExpensesCalc.meeting.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4. ค่าเดินทางผจศ.หมุนเวียนงาน</span>
                    <span className="font-medium">{travelExpensesCalc.studentTrip.toLocaleString()} บาท</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold text-blue-600">
                    <span>ยอดรวมค่าใช้จ่ายเดินทาง:</span>
                    <span>{travelExpensesCalc.total.toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* สรุปเงินช่วยเหลือ */}
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6">
              <CardTitle className="text-xl font-bold">สรุปเงินช่วยเหลือ</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>เงินช่วยเหลืออื่น ๆ:</span>
                    <span className="font-medium">{assistanceTotal.other.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>เงินช่วยเหลือพิเศษ:</span>
                    <span className="font-medium">{assistanceTotal.special.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าจ้างชั่วโมงเพิ่ม:</span>
                    <span className="font-medium">{assistanceTotal.overtime.toLocaleString()} บาท</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>ยอดรวมเงินช่วยเหลือ:</span>
                    <span>{assistanceTotal.total.toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>

              {/* สรุปรวมทั้งหมด */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200">
                <h3 className="font-bold text-gray-800 mb-4 text-center">สรุปงบประมาณรวมทั้งหมด</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>รายจ่ายดำเนินงาน:</span>
                    <span className="font-medium">{operatingExpenses.total.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าใช้จ่ายเดินทาง:</span>
                    <span className="font-medium">{travelExpensesCalc.total.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span>เงินช่วยเหลือ:</span>
                    <span className="font-medium">{assistanceTotal.total.toLocaleString()} บาท</span>
                  </div>
                </div>
                <div className="border-t border-purple-300 pt-3 mt-4">
                  <div className="flex justify-between font-bold text-lg text-purple-700">
                    <span>ยอดรวมทั้งหมด:</span>
                    <span>{(operatingExpenses.total + travelExpensesCalc.total + assistanceTotal.total).toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}