import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { WorkingDay } from "@shared/schema";

export default function WorkdayModule() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + 543);
  const [additionalHolidays, setAdditionalHolidays] = useState(0);
  const [calculatedData, setCalculatedData] = useState<WorkingDay | null>(null);
  const queryClient = useQueryClient();

  const { data: workingDaysData, isLoading } = useQuery({
    queryKey: ["/api/working-days"],
    queryFn: async () => {
      const response = await fetch("/api/working-days");
      return response.json();
    },
  });

  const createWorkingDayMutation = useMutation({
    mutationFn: async (workingDay: Omit<WorkingDay, "id">) => {
      const response = await apiRequest("POST", "/api/working-days", workingDay);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/working-days"] });
    },
  });

  const calculateWorkingDays = () => {
    const isLeapYear = (year: number) => {
      const gregorianYear = year - 543;
      return (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || (gregorianYear % 400 === 0);
    };

    const totalDays = isLeapYear(selectedYear) ? 366 : 365;
    const weekendDays = Math.floor(totalDays / 7) * 2; // Approximate weekend days
    // วันหยุดนักขัตฤกษ์ตามประกาศ ธปท. 
    // ปี 2568 มี 18 วัน รวมวันหยุดพิเศษ 2 วัน
    // ปีอื่นๆ ใช้วันหยุดปกติจากปีก่อนหน้า (ไม่รวมวันหยุดพิเศษ)
    const holidays = selectedYear === 2568 ? 18 : 16; // Bank of Thailand holidays (base 16 from 2568 without special holidays)
    const workingDays = totalDays - weekendDays - holidays - additionalHolidays;

    const calculatedWorkingDay: WorkingDay = {
      id: 0,
      year: selectedYear,
      totalDays,
      weekendDays,
      holidays,
      additionalHolidays,
      workingDays,
    };

    setCalculatedData(calculatedWorkingDay);
    
    // Save to database
    createWorkingDayMutation.mutate({
      year: selectedYear,
      totalDays,
      weekendDays,
      holidays,
      additionalHolidays,
      workingDays,
    });
  };

  // Get existing calculation for selected year
  const existingCalculation = workingDaysData?.find((wd: WorkingDay) => wd.year === selectedYear);

  useEffect(() => {
    if (existingCalculation) {
      setCalculatedData(existingCalculation);
      setAdditionalHolidays(existingCalculation.additionalHolidays);
    }
  }, [existingCalculation]);

  const displayData = calculatedData || existingCalculation;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <header className="bg-white text-gray-800 p-4 rounded-t-xl border-b">
        <h2 className="text-xl font-bold">คำนวณวันทำงาน</h2>
        <p className="text-sm text-gray-500">คำนวณวันทำงานและวันหยุดประจำปี</p>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">ข้อมูลการคำนวณ</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปี พ.ศ.</label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + 543 - 5 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันหยุดเพิ่มเติม</label>
                <Input
                  type="number"
                  value={additionalHolidays}
                  onChange={(e) => setAdditionalHolidays(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <Button
                onClick={calculateWorkingDays}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Calculator className="h-4 w-4 mr-2" />
                คำนวณ
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">ผลการคำนวณ</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">วันในปี:</span>
                <span className="font-medium">{displayData?.totalDays || 0} วัน</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">วันหยุดสุดสัปดาห์:</span>
                <span className="font-medium">{displayData?.weekendDays || 0} วัน</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">วันหยุดนักขัตฤกษ์:</span>
                <span className="font-medium">
                  {displayData?.holidays || 0} วัน
                  {displayData?.year === 2568 && <span className="text-blue-600 ml-1">(ตามประกาศ ธปท.)</span>}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">วันหยุดเพิ่มเติม:</span>
                <span className="font-medium">{displayData?.additionalHolidays || 0} วัน</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between text-lg font-bold">
                <span>วันทำงาน:</span>
                <span className="text-indigo-600">{displayData?.workingDays || 0} วัน</span>
              </div>
            </div>

            {/* Thai Holidays Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                วันหยุดนักขัตฤกษ์ประจำปี {displayData?.year || 2569}
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                {displayData?.year === 2568 ? (
                  <>
                    <p>• วันขึ้นปีใหม่ (1 มกราคม)</p>
                    <p>• วันมาฆบูชา (12 กุมภาพันธ์)</p>
                    <p>• วันจักรีชดเชย (7 เมษายน)</p>
                    <p>• วันสงกรานต์ (14-15 เมษายน)</p>
                    <p>• วันแรงงาน (1 พฤษภาคม)</p>
                    <p>• วันฉัตรมงคลชดเชย (5 พฤษภาคม)</p>
                    <p>• วันวิสาขบูชาชดเชย (12 พฤษภาคม)</p>
                    <p>• วันหยุดพิเศษ (2 มิถุนายน)</p>
                    <p>• วันเฉลิมพระชนมพรรษา พระบรมราชินี (3 มิถุนายน)</p>
                    <p>• วันอาสาฬหบูชา (10 กรกฎาคม)</p>
                    <p>• วันเฉลิมพระชนมพรรษา ร.10 (28 กรกฎาคม)</p>
                    <p>• วันหยุดพิเศษ (11 สิงหาคม)</p>
                    <p>• วันแม่แห่งชาติ (12 สิงหาคม)</p>
                    <p>• วันนวมินทรมหาราช (13 ตุลาคม)</p>
                    <p>• วันปิยมหาราช (23 ตุลาคม)</p>
                    <p>• วันพ่อแห่งชาติ (5 ธันวาคม)</p>
                    <p>• วันรัฐธรรมนูญ (10 ธันวาคม)</p>
                    <p>• วันสิ้นปี (31 ธันวาคม)</p>
                    <p className="text-xs text-blue-600 mt-2">
                      รวม 18 วัน (ตามประกาศ ธปท. รวมวันหยุดพิเศษ 2 วัน)
                    </p>
                  </>
                ) : (
                  <>
                    <p>• วันขึ้นปีใหม่ (1 วัน)</p>
                    <p>• วันมาฆบูชา (1 วัน)</p>
                    <p>• วันจักรี/ชดเชย (1 วัน)</p>
                    <p>• วันสงกรานต์ (2 วัน)</p>
                    <p>• วันแรงงาน (1 วัน)</p>
                    <p>• วันฉัตรมงคล/ชดเชย (1 วัน)</p>
                    <p>• วันวิสาขบูชา/ชดเชย (1 วัน)</p>
                    <p>• วันเฉลิมพระชนมพรรษา พระบรมราชินี (1 วัน)</p>
                    <p>• วันอาสาฬหบูชา (1 วัน)</p>
                    <p>• วันเฉลิมพระชนมพรรษา ร.10 (1 วัน)</p>
                    <p>• วันแม่แห่งชาติ (1 วัน)</p>
                    <p>• วันนวมินทรมหาราช (1 วัน)</p>
                    <p>• วันปิยมหาราช (1 วัน)</p>
                    <p>• วันพ่อแห่งชาติ (1 วัน)</p>
                    <p>• วันรัฐธรรมนูญ (1 วัน)</p>
                    <p>• วันสิ้นปี (1 วัน)</p>
                    <p className="text-xs text-blue-600 mt-2">รวม 16 วัน (ไม่รวมวันหยุดพิเศษ)</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
