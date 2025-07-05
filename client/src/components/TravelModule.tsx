import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Plane, Car, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Employee, TravelExpense } from "@shared/schema";

export default function TravelModule() {
  const [activeTab, setActiveTab] = useState<"local" | "outside" | "students">("local");
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

  const tabs = [
    { id: "local", label: "เดินทางในพื้นที่", icon: MapPin, description: "การเดินทางในพื้นที่ราชการ" },
    { id: "outside", label: "เดินทางนอกพื้นที่", icon: Car, description: "การเดินทางนอกพื้นที่ราชการ" },
    { id: "students", label: "นำนักเรียน", icon: Plane, description: "การเดินทางพานักเรียนทัศนศึกษา" },
  ];

  if (employeeLoading || travelLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div id="view-travel" className="main-view bg-white rounded-xl shadow-lg">
      <header className="bg-white text-gray-800 p-4 rounded-t-xl border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">ค่าใช้จ่ายการเดินทาง</h2>
            <p className="text-sm text-gray-500">จัดการค่าใช้จ่ายการเดินทางประเภทต่างๆ</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleYearChange("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold px-4">
              ปี พ.ศ. {currentYear}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleYearChange("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b bg-gray-50">
        <div className="flex gap-0 p-4">
          {tabs.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all ${
                activeTab === id
                  ? "bg-white text-blue-700 border-l border-t border-r border-blue-200 shadow-sm -mb-px"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">{label}</div>
                <div className="text-xs opacity-70">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === "local" && (
          <LocalTravelTab 
            employees={employees} 
            currentYear={currentYear}
            travelExpenses={travelExpenses}
          />
        )}

        {activeTab === "outside" && (
          <OutsideTravelTab 
            employees={employees} 
            currentYear={currentYear}
            travelExpenses={travelExpenses}
          />
        )}

        {activeTab === "students" && (
          <StudentTravelTab 
            employees={employees} 
            currentYear={currentYear}
            companyTripBusFare={companyTripBusFare}
            setCompanyTripBusFare={setCompanyTripBusFare}
          />
        )}
      </div>
    </div>
  );
}

// Local Travel Tab Component
function LocalTravelTab({ employees, currentYear, travelExpenses }: {
  employees: Employee[];
  currentYear: number;
  travelExpenses: TravelExpense[];
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">การเดินทางในพื้นที่ราชการ</h3>
      <p className="text-gray-600 mb-6">
        การเดินทางภายในพื้นที่ปฏิบัติงานประจำ เช่น การไปราชการ ประชุม ติดต่อหน่วยงาน
      </p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">รหัสพนักงาน</th>
              <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-สกุล</th>
              <th className="px-4 py-3 text-center border border-gray-300">จำนวนครั้ง</th>
              <th className="px-4 py-3 text-right border border-gray-300">ค่าน้ำมัน</th>
              <th className="px-4 py-3 text-right border border-gray-300">ค่าเบี้ยเลี้ยง</th>
              <th className="px-4 py-3 text-right border border-gray-300">รวม</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 border border-gray-300">{employee.employeeCode}</td>
                <td className="px-4 py-3 border border-gray-300">{employee.fullName}</td>
                <td className="px-4 py-3 border border-gray-300 text-center">
                  <Input type="number" defaultValue="0" className="w-20 text-center" />
                </td>
                <td className="px-4 py-3 border border-gray-300 text-right">
                  <Input type="number" defaultValue="0" className="w-24 text-right" />
                </td>
                <td className="px-4 py-3 border border-gray-300 text-right">
                  <Input type="number" defaultValue="0" className="w-24 text-right" />
                </td>
                <td className="px-4 py-3 border border-gray-300 text-right font-semibold">
                  0
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Outside Travel Tab Component  
function OutsideTravelTab({ employees, currentYear, travelExpenses }: {
  employees: Employee[];
  currentYear: number;
  travelExpenses: TravelExpense[];
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">การเดินทางนอกพื้นที่ราชการ</h3>
      <p className="text-gray-600 mb-6">
        การเดินทางไปปฏิบัติงานนอกพื้นที่ เช่น อบรม สัมมนา ดูงาน ประชุมภายนอก
      </p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">รหัสพนักงาน</th>
              <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-สกุล</th>
              <th className="px-4 py-3 text-center border border-gray-300">จำนวนครั้ง</th>
              <th className="px-4 py-3 text-right border border-gray-300">ค่าเดินทาง</th>
              <th className="px-4 py-3 text-right border border-gray-300">ค่าเบี้ยเลี้ยง</th>
              <th className="px-4 py-3 text-right border border-gray-300">ค่าที่พัก</th>
              <th className="px-4 py-3 text-right border border-gray-300">รวม</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 border border-gray-300">{employee.employeeCode}</td>
                <td className="px-4 py-3 border border-gray-300">{employee.fullName}</td>
                <td className="px-4 py-3 border border-gray-300 text-center">
                  <Input type="number" defaultValue="0" className="w-20 text-center" />
                </td>
                <td className="px-4 py-3 border border-gray-300 text-right">
                  <Input type="number" defaultValue="0" className="w-24 text-right" />
                </td>
                <td className="px-4 py-3 border border-gray-300 text-right">
                  <Input type="number" defaultValue="0" className="w-24 text-right" />
                </td>
                <td className="px-4 py-3 border border-gray-300 text-right">
                  <Input type="number" defaultValue="0" className="w-24 text-right" />
                </td>
                <td className="px-4 py-3 border border-gray-300 text-right font-semibold">
                  0
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Student Travel Tab Component
function StudentTravelTab({ employees, currentYear, companyTripBusFare, setCompanyTripBusFare }: {
  employees: Employee[];
  currentYear: number;
  companyTripBusFare: number;
  setCompanyTripBusFare: (value: number) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">การเดินทางพานักเรียนทัศนศึกษา</h3>
      <p className="text-gray-600 mb-6">
        ค่าใช้จ่ายในการพานักเรียนไปทัศนศึกษา ดูงาน หรือกิจกรรมนอกสถานที่
      </p>

      {/* Company Trip Bus Fare Setting */}
      <div className="bg-orange-50 p-4 rounded-lg mb-6 border border-orange-200">
        <h4 className="font-medium text-orange-800 mb-2">ค่ารถทัวร์เยี่ยมบ้าน</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={companyTripBusFare}
            onChange={(e) => setCompanyTripBusFare(Number(e.target.value))}
            className="w-32"
            placeholder="0"
          />
          <span className="text-gray-600">บาท</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-orange-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border border-gray-300">รหัสพนักงาน</th>
              <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-สกุล</th>
              <th className="px-4 py-3 text-left border border-gray-300">จังหวัดเยี่ยมบ้าน</th>
              <th className="px-4 py-3 text-right border border-gray-300">ค่ารถทัวร์</th>
              <th className="px-4 py-3 text-center border border-gray-300">จำนวนครั้ง</th>
              <th className="px-4 py-3 text-right border border-gray-300">รวม</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 border border-gray-300">{employee.employeeCode}</td>
                <td className="px-4 py-3 border border-gray-300">{employee.fullName}</td>
                <td className="px-4 py-3 border border-gray-300">{employee.province || '-'}</td>
                <td className="px-4 py-3 border border-gray-300 text-right">
                  {employee.tourCost?.toLocaleString('th-TH') || '0'}
                </td>
                <td className="px-4 py-3 border border-gray-300 text-center">
                  <Input type="number" defaultValue="0" className="w-20 text-center" />
                </td>
                <td className="px-4 py-3 border border-gray-300 text-right font-semibold">
                  0
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}