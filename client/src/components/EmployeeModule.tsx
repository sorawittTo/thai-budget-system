import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Users, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Employee, MasterRate } from "@shared/schema";

export default function EmployeeModule() {
  const [activeTab, setActiveTab] = useState<"list" | "rates">("list");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [masterRates, setMasterRates] = useState<MasterRate[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    employeeCode: "",
    fullName: "",
    status: "Active",
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
        status: "Active",
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

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, ...employee }: Partial<Employee> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/employees/${id}`, employee);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
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

  const handleUpdateEmployee = (id: number, field: string, value: any) => {
    updateEmployeeMutation.mutate({ id, [field]: value });
  };

  const handleDeleteEmployee = (id: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานคนนี้?")) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  const tabs = [
    { id: "list", label: "รายชื่อพนักงาน", icon: Users },
    { id: "rates", label: "อัตรามาตรฐาน", icon: Settings },
  ];

  if (employeeLoading || rateLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div id="view-config" className="main-view bg-white rounded-xl shadow-lg">
      <header className="bg-white text-gray-800 p-4 rounded-t-xl border-b">
        <div>
          <h2 className="text-xl font-bold">ข้อมูลพนักงานและอัตรามาตรฐาน</h2>
          <p className="text-sm text-gray-500">จัดการข้อมูลพนักงานและอัตราค่าใช้จ่าย</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex gap-1 p-4">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? "bg-violet-100 text-violet-700 border border-violet-200"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === "list" && (
          <div>
            {/* Add Employee Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">เพิ่มพนักงานใหม่</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="รหัสพนักงาน"
                  value={newEmployee.employeeCode}
                  onChange={(e) => setNewEmployee({ ...newEmployee, employeeCode: e.target.value })}
                  className="flat-input border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  value={newEmployee.fullName}
                  onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                  className="flat-input border border-gray-300 rounded-md"
                />
                <select
                  value={newEmployee.gender}
                  onChange={(e) => setNewEmployee({ ...newEmployee, gender: e.target.value })}
                  className="flat-input border border-gray-300 rounded-md"
                >
                  <option value="">เพศ</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                </select>
                <input
                  type="number"
                  placeholder="ปี พ.ศ. เริ่มงาน"
                  value={newEmployee.startYear}
                  onChange={(e) => setNewEmployee({ ...newEmployee, startYear: parseInt(e.target.value) || 0 })}
                  className="flat-input border border-gray-300 rounded-md"
                />
                <select
                  value={newEmployee.level}
                  onChange={(e) => setNewEmployee({ ...newEmployee, level: e.target.value })}
                  className="flat-input border border-gray-300 rounded-md"
                >
                  <option value="">ระดับ</option>
                  <option value="7">7 - ผู้บริหารส่วน</option>
                  <option value="6">6 - ผู้บริหารทีม</option>
                  <option value="5.5">5.5 - เจ้าหน้าที่ชำนาญงาน (ควบ)</option>
                  <option value="5">5 - เจ้าหน้าที่ชำนาญงาน</option>
                  <option value="4.5">4.5 - เจ้าหน้าที่ (ควบ)</option>
                  <option value="4">4 - เจ้าหน้าที่</option>
                  <option value="3">3 - พนักงานปฏิบัติการ</option>
                </select>
                <input
                  type="text"
                  placeholder="จังหวัดเยี่ยมบ้าน"
                  value={newEmployee.province}
                  onChange={(e) => setNewEmployee({ ...newEmployee, province: e.target.value })}
                  className="flat-input border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  placeholder="ค่ารถทัวร์เยี่ยมบ้าน"
                  value={newEmployee.tourCost}
                  onChange={(e) => setNewEmployee({ ...newEmployee, tourCost: parseFloat(e.target.value) || 0 })}
                  className="flat-input border border-gray-300 rounded-md"
                />
                <button
                  onClick={handleAddEmployee}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มพนักงาน
                </button>
              </div>
            </div>

            {/* Employee List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left border border-gray-300">รหัสพนักงาน</th>
                    <th className="px-4 py-3 text-left border border-gray-300">ชื่อ-สกุล</th>
                    <th className="px-4 py-3 text-center border border-gray-300">สถานะ</th>
                    <th className="px-4 py-3 text-center border border-gray-300">เพศ</th>
                    <th className="px-4 py-3 text-center border border-gray-300">ปี พ.ศ. เริ่มงาน</th>
                    <th className="px-4 py-3 text-center border border-gray-300">ระดับ</th>
                    <th className="px-4 py-3 text-left border border-gray-300">จังหวัดเยี่ยมบ้าน</th>
                    <th className="px-4 py-3 text-right border border-gray-300">ค่ารถทัวร์เยี่ยมบ้าน</th>
                    <th className="px-4 py-3 text-center border border-gray-300">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-300">
                        <input
                          type="text"
                          value={employee.employeeCode}
                          onChange={(e) => handleUpdateEmployee(employee.id, "employeeCode", e.target.value)}
                          className="flat-input w-full"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <input
                          type="text"
                          value={employee.fullName}
                          onChange={(e) => handleUpdateEmployee(employee.id, "fullName", e.target.value)}
                          className="flat-input w-full"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-center">
                        <select
                          value={employee.status}
                          onChange={(e) => handleUpdateEmployee(employee.id, "status", e.target.value)}
                          className="flat-input w-full text-center"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-center">
                        <select
                          value={employee.gender}
                          onChange={(e) => handleUpdateEmployee(employee.id, "gender", e.target.value)}
                          className="flat-input w-full text-center"
                        >
                          <option value="">-</option>
                          <option value="ชาย">ชาย</option>
                          <option value="หญิง">หญิง</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-center">
                        <input
                          type="number"
                          value={employee.startYear}
                          onChange={(e) => handleUpdateEmployee(employee.id, "startYear", parseInt(e.target.value) || 0)}
                          className="flat-input w-full text-center"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-center">
                        <select
                          value={employee.level}
                          onChange={(e) => handleUpdateEmployee(employee.id, "level", e.target.value)}
                          className="flat-input w-full text-center"
                        >
                          <option value="">-</option>
                          <option value="7">7</option>
                          <option value="6">6</option>
                          <option value="5.5">5.5</option>
                          <option value="5">5</option>
                          <option value="4.5">4.5</option>
                          <option value="4">4</option>
                          <option value="3">3</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <input
                          type="text"
                          value={employee.province}
                          onChange={(e) => handleUpdateEmployee(employee.id, "province", e.target.value)}
                          className="flat-input w-full"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-right">
                        <input
                          type="number"
                          value={employee.tourCost || 0}
                          onChange={(e) => handleUpdateEmployee(employee.id, "tourCost", parseFloat(e.target.value) || 0)}
                          className="flat-input w-full text-right"
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-300 text-center">
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "rates" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">อัตรามาตรฐานค่าใช้จ่าย</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-violet-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left border border-gray-300">ประเภท</th>
                    <th className="px-4 py-3 text-left border border-gray-300">รายละเอียด</th>
                    <th className="px-4 py-3 text-right border border-gray-300">อัตรา</th>
                    <th className="px-4 py-3 text-left border border-gray-300">หน่วย</th>
                    <th className="px-4 py-3 text-left border border-gray-300">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {masterRates.map((rate) => (
                    <tr key={rate.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-300">{rate.category}</td>
                      <td className="px-4 py-3 border border-gray-300">{rate.subcategory}</td>
                      <td className="px-4 py-3 border border-gray-300 text-right">{rate.rate.toLocaleString('th-TH')}</td>
                      <td className="px-4 py-3 border border-gray-300">{rate.unit}</td>
                      <td className="px-4 py-3 border border-gray-300">{rate.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}