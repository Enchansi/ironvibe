import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Dumbbell, Trophy, Sparkles, LogOut, User } from "lucide-react";

const links = [
  { to: "/app/dashboard", label: "Dashboard", icon: Dumbbell },
  { to: "/app/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/app/exercises", label: "AI Coach", icon: Sparkles },
  { to: "/app/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
        <Link to="/app/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #00e5ff, #ff2bd6)", boxShadow: "0 0 16px rgba(0,229,255,0.5)" }}>
            <Dumbbell size={16} color="#07070a" strokeWidth={3} />
          </div>
          <span className="font-display font-black text-lg tracking-tighter">
            IRON<span className="text-glow-magenta">VIBE</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full font-display text-xs uppercase tracking-wider flex items-center gap-2 transition ${
                  isActive ? "text-glow-cyan bg-cyan-400/10 border border-cyan-400/40" : "text-zinc-400 hover:text-white"
                }`
              }>
              <Icon size={14} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono-display text-[10px] font-bold"
                 style={{ background: user?.avatar_color || "#00e5ff", color: "#07070a" }}>
              {user?.username?.[0]?.toUpperCase() || "?"}
            </div>
            <span className="font-mono-display text-xs text-zinc-400">@{user?.username}</span>
          </div>
          <button onClick={() => { logout(); navigate("/"); }}
            className="text-zinc-500 hover:text-glow-magenta transition" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <nav className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full font-display text-[10px] uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap transition ${
                isActive ? "text-glow-cyan bg-cyan-400/10 border border-cyan-400/40" : "text-zinc-400 border border-white/10"
              }`
            }>
            <Icon size={12} /> {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
