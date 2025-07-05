import { FileText, Users, MapPin, DollarSign, Calendar, BarChart3 } from "lucide-react";

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export default function Navigation({ activeModule, setActiveModule }: NavigationProps) {
  const navItems = [
    {
      id: "budget",
      title: "งบประมาณ",
      subtitle: "จัดการรายการงบประมาณรายปี",
      icon: FileText,
    },
    {
      id: "config",
      title: "พนักงาน",
      subtitle: "จัดการข้อมูลและอัตราค่าใช้จ่าย",
      icon: Users,
    },
    {
      id: "travel",
      title: "ค่าเดินทาง",
      subtitle: "คำนวณค่าเดินทางประเภทต่างๆ",
      icon: MapPin,
    },
    {
      id: "assistance",
      title: "เงินช่วยเหลือ",
      subtitle: "เงินช่วยเหลือและค่าล่วงเวลา",
      icon: DollarSign,
    },
    {
      id: "workday",
      title: "วันทำงาน",
      subtitle: "คำนวณวันทำงานและวันหยุด",
      icon: Calendar,
    },
    {
      id: "summary",
      title: "สรุปงบประมาณ",
      subtitle: "สรุปงบประมาণประจำปี",
      icon: BarChart3,
    },
  ];

  return (
    <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 no-print">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`main-nav-card bg-white rounded-xl shadow-sm p-4 text-center cursor-pointer ${
              activeModule === item.id ? "active" : ""
            }`}
          >
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Icon className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-bold">{item.title}</h3>
            <p className="nav-card-subtitle text-xs text-gray-500">{item.subtitle}</p>
          </div>
        );
      })}
    </nav>
  );
}
