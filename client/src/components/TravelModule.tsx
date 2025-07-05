import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Employee, TravelExpense } from "@shared/schema";

export default function TravelModule() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear() + 543);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [travelExpenses, setTravelExpenses] = useState<TravelExpense[]>([]);
  const [companyTripBusFare, setCompanyTripBusFare] = useState(0);

  const { data: employeeData, isLoading: employeeLoading } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      return response.json();
    },
  });

  const { data: travelData, isLoading: travelLoading } = useQuery({
    queryKey: ["/api/travel-expenses"],
    queryFn: async () => {
      const response = await fetch("/api/travel-expenses");
      return response.json();
    },
  });

  useEffect(() => {
    if (employeeData) {
      setEmployees(employeeData);
    }
  }, [employeeData]);

  useEffect(() => {
    if (travelData) {
      setTravelExpenses(travelData);
    }
  }, [travelData]);

  const handleYearChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentYear(prev => prev + 1);
    }
  };

  const calculateSouvenirTravel = () => {
    // Calculate souvenir travel expenses based on employee service years
    return employees.map(employee => {
      const serviceYears = currentYear - employee.startYear;
      const days = Math.min(serviceYears, 10); // Max 10 days
      const accommodation = days * 800; // 800 per night
      const allowance = days * 240; // 240 per day
      const transportation = 500; // Fixed transportation cost
      const taxi = 200; // Fixed taxi cost
      const total = accommodation + allowance + transportation + taxi;
      
      return {
        ...employee,
        serviceYears,
        days,
        accommodation,
        allowance,
        transportation,
        taxi,
        total,
      };
    });
  };

  const calculateFamilyVisit = () => {
    // Calculate family visit expenses
    return employees.map(employee => ({
      ...employee,
      total: employee.tourCost,
    }));
  };

  const calculateCompanyTrip = () => {
    // Calculate company trip expenses
    return employees.map(employee => ({
      ...employee,
      busFare: companyTripBusFare,
      accommodation: 800, // Fixed accommodation cost
      total: companyTripBusFare + 800,
    }));
  };

  const calculateManagerRotation = () => {
    // Calculate manager rotation travel expenses
    return employees.filter(emp => emp.level.includes("ผู้จัดการ") || emp.level.includes("ผู้อำนวยการ")).map(employee => {
      const allowance = 240 * 30; // 30 days per year
      const accommodation = 800 * 30; // 30 nights per year
      const transportation = 5000; // Fixed transportation cost
      const others = 2000; // Other vehicle costs
      const total = allowance + accommodation + transportation + others;
      
      return {
        ...employee,
        allowance,
        accommodation,
        transportation,
        others,
        total,
      };
    });
  };

  const souvenirTravelData = calculateSouvenirTravel();
  const familyVisitData = calculateFamilyVisit();
  const companyTripData = calculateCompanyTrip();
  const managerRotationData = calculateManagerRotation();

  const getTotalSouvenirTravel = () => {
    return souvenirTravelData.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalFamilyVisit = () => {
    return familyVisitData.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalCompanyTrip = () => {
    return companyTripData.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalManagerRotation = () => {
    return managerRotationData.reduce((sum, item) => sum + item.total, 0);
  };

  if (employeeLoading || travelLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Souvenir Travel */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">สรุปค่าใช้จ่ายเดินทางเพื่อรับของที่ระลึก</h2>
          <div className="flex items-center justify-end flex-grow gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange("prev")}
              className="p-2 rounded-full bg-gray-200 hover:bg-indigo-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="text-center">
              <div className="text-sm text-gray-600">คำนวณสำหรับปี พ.ศ.</div>
              <div className="text-2xl font-bold text-indigo-600">{currentYear}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange("next")}
              className="p-2 rounded-full bg-gray-200 hover:bg-indigo-200"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-สกุล</TableHead>
                <TableHead className="text-center">อายุงาน</TableHead>
                <TableHead className="text-center">วันตามกำหนดการ</TableHead>
                <TableHead className="text-right">ค่าที่พัก</TableHead>
                <TableHead className="text-right">ค่าเบี้ยเลี้ยง</TableHead>
                <TableHead className="text-right">ค่ารถประจำทาง</TableHead>
                <TableHead className="text-right">ค่ารถรับจ้าง</TableHead>
                <TableHead className="text-right font-bold">รวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {souvenirTravelData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.fullName}</TableCell>
                  <TableCell className="text-center">{item.serviceYears}</TableCell>
                  <TableCell className="text-center">{item.days}</TableCell>
                  <TableCell className="text-right">{item.accommodation.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.allowance.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.transportation.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.taxi.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold">{item.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 pt-6 border-t-2 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold">ยอดรวม:</span>
            <span className="text-2xl font-bold text-indigo-600">{getTotalSouvenirTravel().toLocaleString()} บาท</span>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">นำยอดรวมไปตั้งงบ</Button>
        </div>
      </div>

      {/* Family Visit */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">สรุปค่าเดินทางเยี่ยมครอบครัว</h2>
          <div className="flex items-center justify-end flex-grow gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange("prev")}
              className="p-2 rounded-full bg-gray-200 hover:bg-indigo-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="text-center">
              <div className="text-sm text-gray-600">คำนวณสำหรับปี พ.ศ.</div>
              <div className="text-2xl font-bold text-indigo-600">{currentYear}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange("next")}
              className="p-2 rounded-full bg-gray-200 hover:bg-indigo-200"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสพนักงาน</TableHead>
                <TableHead>ชื่อ-สกุล</TableHead>
                <TableHead>จังหวัด</TableHead>
                <TableHead className="text-right">ค่ารถทัวร์</TableHead>
                <TableHead className="text-right font-bold">รวม (บาท)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {familyVisitData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.employeeCode}</TableCell>
                  <TableCell>{item.fullName}</TableCell>
                  <TableCell>{item.province}</TableCell>
                  <TableCell className="text-right">{item.tourCost.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold">{item.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 pt-6 border-t-2 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold">ยอดรวม:</span>
            <span className="text-2xl font-bold text-indigo-600">{getTotalFamilyVisit().toLocaleString()} บาท</span>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">นำยอดรวมไปตั้งงบ</Button>
        </div>
      </div>

      {/* Company Trip */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">สรุปค่าเดินทางร่วมงานวันพนักงาน</h2>
          <div className="flex items-center gap-4">
            <label className="font-semibold">ค่ารถทัวร์ (ไป-กลับ):</label>
            <Input
              type="number"
              value={companyTripBusFare}
              onChange={(e) => setCompanyTripBusFare(parseFloat(e.target.value) || 0)}
              className="w-28"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-สกุล</TableHead>
                <TableHead className="text-right">ค่ารถทัวร์</TableHead>
                <TableHead className="text-right">ค่าที่พัก</TableHead>
                <TableHead className="text-right font-bold">รวม (บาท)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyTripData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.fullName}</TableCell>
                  <TableCell className="text-right">{item.busFare.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.accommodation.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold">{item.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 pt-6 border-t-2 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold">ยอดรวม:</span>
            <span className="text-2xl font-bold text-indigo-600">{getTotalCompanyTrip().toLocaleString()} บาท</span>
          </div>
        </div>
      </div>

      {/* Manager Rotation */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">สรุปค่าเดินทางหมุนเวียนงาน ผจศ.</h2>
          <div className="flex items-center justify-end flex-grow gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange("prev")}
              className="p-2 rounded-full bg-gray-200 hover:bg-indigo-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="text-center">
              <div className="text-sm text-gray-600">คำนวณสำหรับปี พ.ศ.</div>
              <div className="text-2xl font-bold text-indigo-600">{currentYear}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange("next")}
              className="p-2 rounded-full bg-gray-200 hover:bg-indigo-200"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-สกุล</TableHead>
                <TableHead className="text-right">ค่าเบี้ยเลี้ยง</TableHead>
                <TableHead className="text-right">ค่าที่พัก</TableHead>
                <TableHead className="text-right">ค่าเดินทาง (คงที่)</TableHead>
                <TableHead className="text-right">ค่าพาหนะอื่นๆ</TableHead>
                <TableHead className="text-right font-bold">รวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managerRotationData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.fullName}</TableCell>
                  <TableCell className="text-right">{item.allowance.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.accommodation.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.transportation.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.others.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold">{item.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 pt-6 border-t-2 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold">ยอดรวม:</span>
            <span className="text-2xl font-bold text-indigo-600">{getTotalManagerRotation().toLocaleString()} บาท</span>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">นำยอดรวมไปตั้งงบ</Button>
        </div>
      </div>
    </div>
  );
}
