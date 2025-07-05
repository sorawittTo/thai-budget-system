import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Employee, MasterRate } from "@shared/schema";

export default function EmployeeModule() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [masterRates, setMasterRates] = useState<MasterRate[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    employeeCode: "",
    fullName: "",
    status: "",
    gender: "",
    startYear: new Date().getFullYear() + 543,
    level: "",
    province: "",
    tourCost: 0,
    salary: 0,
    allowance: 0,
  });
  const queryClient = useQueryClient();

  const { data: employeeData, isLoading: employeeLoading } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      return response.json();
    },
  });

  const { data: rateData, isLoading: rateLoading } = useQuery({
    queryKey: ["/api/master-rates"],
    queryFn: async () => {
      const response = await fetch("/api/master-rates");
      return response.json();
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (employee: Omit<Employee, "id">) => {
      const response = await apiRequest("POST", "/api/employees", employee);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setNewEmployee({
        employeeCode: "",
        fullName: "",
        status: "",
        gender: "",
        startYear: new Date().getFullYear() + 543,
        level: "",
        province: "",
        tourCost: 0,
        salary: 0,
        allowance: 0,
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    },
  });

  useEffect(() => {
    if (employeeData) {
      setEmployees(employeeData);
    }
  }, [employeeData]);

  useEffect(() => {
    if (rateData) {
      setMasterRates(rateData);
    }
  }, [rateData]);

  const handleAddEmployee = () => {
    if (newEmployee.employeeCode && newEmployee.fullName) {
      createEmployeeMutation.mutate(newEmployee);
    }
  };

  const handleDeleteEmployee = (id: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานคนนี้?")) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  if (employeeLoading || rateLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg space-y-8 p-6">
      {/* Master Rates Table */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ตารางอัตราค่าใช้จ่ายมาตรฐาน</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ประเภท</TableHead>
                <TableHead>รายการ</TableHead>
                <TableHead className="text-right">อัตรา</TableHead>
                <TableHead>หน่วย</TableHead>
                <TableHead>คำอธิบาย</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {masterRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.category}</TableCell>
                  <TableCell>{rate.subcategory}</TableCell>
                  <TableCell className="text-right">{rate.rate.toLocaleString()}</TableCell>
                  <TableCell>{rate.unit}</TableCell>
                  <TableCell>{rate.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Employee Management */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">จัดการพนักงาน</h2>
        
        {/* Add Employee Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <Input
            placeholder="รหัสพนักงาน"
            value={newEmployee.employeeCode}
            onChange={(e) => setNewEmployee({ ...newEmployee, employeeCode: e.target.value })}
          />
          <Input
            placeholder="ชื่อ-นามสกุล"
            value={newEmployee.fullName}
            onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
          />
          <Select value={newEmployee.status} onValueChange={(value) => setNewEmployee({ ...newEmployee, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">ปฏิบัติงาน</SelectItem>
              <SelectItem value="inactive">ไม่ปฏิบัติงาน</SelectItem>
            </SelectContent>
          </Select>
          <Select value={newEmployee.gender} onValueChange={(value) => setNewEmployee({ ...newEmployee, gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="เพศ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">ชาย</SelectItem>
              <SelectItem value="female">หญิง</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="ปีที่เริ่มงาน"
            value={newEmployee.startYear}
            onChange={(e) => setNewEmployee({ ...newEmployee, startYear: parseInt(e.target.value) || 0 })}
          />
          <Input
            placeholder="ระดับ"
            value={newEmployee.level}
            onChange={(e) => setNewEmployee({ ...newEmployee, level: e.target.value })}
          />
          <Input
            placeholder="จังหวัดเยี่ยมบ้าน"
            value={newEmployee.province}
            onChange={(e) => setNewEmployee({ ...newEmployee, province: e.target.value })}
          />
          <Input
            type="number"
            placeholder="ค่ารถทัวร์เยี่ยมบ้าน"
            value={newEmployee.tourCost}
            onChange={(e) => setNewEmployee({ ...newEmployee, tourCost: parseFloat(e.target.value) || 0 })}
          />
          <div className="md:col-span-2 lg:col-span-1">
            <Button
              onClick={handleAddEmployee}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!newEmployee.employeeCode || !newEmployee.fullName}
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มพนักงาน
            </Button>
          </div>
        </div>

        {/* Employee List */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสพนักงาน</TableHead>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-center">เพศ</TableHead>
                <TableHead>ปีเริ่มงาน</TableHead>
                <TableHead>ระดับ</TableHead>
                <TableHead>จังหวัดเยี่ยมบ้าน</TableHead>
                <TableHead className="text-right">ค่ารถทัวร์เยี่ยมบ้าน</TableHead>
                <TableHead className="text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.employeeCode}</TableCell>
                  <TableCell>{employee.fullName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      employee.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {employee.status === "active" ? "ปฏิบัติงาน" : "ไม่ปฏิบัติงาน"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {employee.gender === "male" ? "ชาย" : "หญิง"}
                  </TableCell>
                  <TableCell>{employee.startYear}</TableCell>
                  <TableCell>{employee.level}</TableCell>
                  <TableCell>{employee.province}</TableCell>
                  <TableCell className="text-right">
                    {employee.tourCost.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
