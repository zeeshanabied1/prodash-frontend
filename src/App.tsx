import "./App.css";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  Target,
  Settings,
  Search,
  Plus,
  Clock,
  BarChart3,
} from "lucide-react";

function App() {
  const wupTime = "3:30 am";
  const sdnTime = "9:30 pm";

  return (
    <>
      <section className="flex flex-row m-2.5">
        <div className="basis-1/2 flex flex-row gap-2.5">
          <div>
            W-up:{" "}
            <span className="underline underline-offset-4">{wupTime}</span>
          </div>
          <div>
            S-dn:{" "}
            <span className="underline underline-offset-4">{sdnTime}</span>
          </div>
        </div>
        <div className="basis-1/2 flex flex-row gap-2.5">
          <div>5:10:43 AM</div>
          <div>
            <button>
              <i className=""></i>
            </button>
            <button>
              <i></i>
            </button>
            <button>
              <i></i>
            </button>
          </div>
        </div>
      </section>
      <aside className="w-64 border-r p-4">
        <nav className="space-y-3">
          <LayoutDashboard size={20} />
          <FolderKanban size={20} />
          <CheckSquare size={20} />
          <CalendarDays size={20} />
          <Target size={20} />
          <BarChart3 size={20} />
          <Settings size={20} />
        </nav>
      </aside>
    </>
  );
}

export default App;
