import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, LIFT_LABELS } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Trophy, Flame, TrendingUp, Users, Sparkles } from "lucide-react";
import PRForm from "./PRForm";

export default function Dashboard() {
  const { user } = useAuth();
  const [prs, setPRs] = useState([]);
  const [friends, setFriends] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api.get("/prs/me").then((r) => setPRs(r.data)).catch(() => {});
    api.get("/friends").then((r) => setFriends(r.data)).catch(() => {});
  }, [refresh]);

  const bestByLift = {};
  prs.forEach((p) => {
    if (!bestByLift[p.lift] || p.one_rm > bestByLift[p.lift].one_rm) bestByLift[p.lift] = p;
  });

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900/60 to-black p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 synthwave-grid pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono-display text-[10px] tracking-[0.3em] uppercase text-cyan-300 mb-2">// session active</div>
            <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tighter">
              YO, <span className="text-glow-cyan">@{user?.username}</span>.
            </h1>
            <p className="text-zinc-400 mt-2">{prs.length} PRs logged · {friends.length} friends in your crew</p>
          </div>
          <div className="flex gap-2">
            <Link to="/app/leaderboard" className="btn-ghost-neon text-xs"><Trophy size={14} /> LEADERBOARD</Link>
            <Link to="/app/exercises" className="btn-neon text-xs"><Sparkles size={14} /> AI COACH</Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-xl tracking-tighter flex items-center gap-2"><Flame size={18} className="text-glow-magenta" /> YOUR BEST PRs</h2>
            <span className="font-mono-display text-[10px] text-zinc-500 tracking-widest">EST. 1RM · EPLEY</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.keys(LIFT_LABELS).map((lift) => {
              const p = bestByLift[lift];
              return (
                <div key={lift} className="neon-border rounded-md p-4 bg-black/40">
                  <div className="font-mono-display text-[10px] tracking-widest text-zinc-500 mb-1">{LIFT_LABELS[lift].toUpperCase()}</div>
                  {p ? (
                    <>
                      <div className="font-display font-black text-3xl text-glow-cyan">{p.weight_kg}<span className="text-base text-zinc-500 ml-1">kg × {p.reps}</span></div>
                      <div className="text-xs text-zinc-400 mt-1">1RM ≈ <span className="text-glow-magenta">{p.one_rm} kg</span></div>
                    </>
                  ) : (
                    <div className="text-zinc-500 text-sm font-mono-display">— no PR yet —</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <PRForm onCreated={() => setRefresh((r) => r + 1)} />
          <div className="neon-border rounded-md p-4 bg-black/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-black text-sm tracking-tighter flex items-center gap-2"><Users size={14} /> YOUR CREW</h3>
              <Link to="/app/leaderboard" className="font-mono-display text-[10px] text-cyan-300 hover:text-white">MANAGE →</Link>
            </div>
            {friends.length === 0 ? (
              <div className="text-zinc-500 text-sm">No friends yet. Add some on the leaderboard.</div>
            ) : (
              <div className="space-y-2">
                {friends.slice(0, 5).map((f) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono-display text-[10px] font-bold"
                         style={{ background: f.avatar_color || "#00e5ff", color: "#07070a" }}>{f.username[0].toUpperCase()}</div>
                    <span className="font-mono-display text-sm">@{f.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display font-black text-xl tracking-tighter flex items-center gap-2 mb-3"><TrendingUp size={18} className="text-glow-cyan" /> RECENT LOG</h2>
        <div className="rounded-md border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-zinc-500 font-mono-display text-[10px] tracking-widest">
              <tr>
                <th className="text-left px-4 py-2">DATE</th>
                <th className="text-left px-4 py-2">LIFT</th>
                <th className="text-left px-4 py-2">WEIGHT × REPS</th>
                <th className="text-left px-4 py-2">1RM</th>
              </tr>
            </thead>
            <tbody>
              {prs.length === 0 && (
                <tr><td colSpan="4" className="px-4 py-6 text-center text-zinc-500">No PRs logged yet.</td></tr>
              )}
              {prs.slice(0, 10).map((p) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="px-4 py-2 font-mono-display text-xs text-zinc-400">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 font-display">{LIFT_LABELS[p.lift]}</td>
                  <td className="px-4 py-2 font-mono-display">{p.weight_kg} kg × {p.reps}</td>
                  <td className="px-4 py-2 text-glow-cyan font-display font-bold">{p.one_rm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
