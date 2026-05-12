import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, LIFT_LABELS } from "../lib/api";

export default function Profile() {
  const { user } = useAuth();
  const [prs, setPRs] = useState([]);

  useEffect(() => { api.get("/prs/me").then((r) => setPRs(r.data)).catch(() => {}); }, []);

  const grouped = {};
  prs.forEach((p) => {
    if (!grouped[p.lift]) grouped[p.lift] = [];
    grouped[p.lift].push(p);
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-md flex items-center justify-center font-display font-black text-3xl"
          style={{ background: user?.avatar_color || "#00e5ff", color: "#07070a", boxShadow: `0 0 24px ${user?.avatar_color || "#00e5ff"}55` }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-mono-display text-[10px] tracking-[0.3em] uppercase text-cyan-300 mb-1">// profile</div>
          <h1 className="font-display font-black text-3xl tracking-tighter">@{user?.username}</h1>
          <div className="text-zinc-500 font-mono-display text-xs">{user?.email} · joined {user?.created_at?.slice(0, 10)}</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(LIFT_LABELS).map(([k, label]) => {
          const list = grouped[k] || [];
          const best = list.length ? list.reduce((m, p) => (p.one_rm > m.one_rm ? p : m), list[0]) : null;
          return (
            <div key={k} className="neon-border rounded-md p-4 bg-black/40">
              <div className="font-mono-display text-[10px] tracking-widest text-zinc-500 mb-1">{label.toUpperCase()}</div>
              {best ? (
                <>
                  <div className="font-display font-black text-2xl text-glow-cyan">{best.one_rm}<span className="text-xs text-zinc-500 ml-1">1RM</span></div>
                  <div className="font-mono-display text-[11px] text-zinc-500">{best.weight_kg} kg × {best.reps} · {list.length} entr{list.length === 1 ? "y" : "ies"}</div>
                </>
              ) : <div className="text-sm text-zinc-600">— none —</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
