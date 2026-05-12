import { useEffect, useState } from "react";
import { api, LIFT_LABELS, LIFT_KEYS, formatApiError } from "../lib/api";
import { UserPlus, X, Search, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";

export default function Leaderboard() {
  const [lift, setLift] = useState("bench");
  const [scope, setScope] = useState("friends");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState([]);

  const loadBoard = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/leaderboard/${lift}?scope=${scope}`);
      setRows(data);
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setLoading(false); }
  };

  const loadFriends = async () => {
    try { const { data } = await api.get("/friends"); setFriends(data); } catch {}
  };

  useEffect(() => { loadBoard(); }, [lift, scope]);
  useEffect(() => { loadFriends(); }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try { const { data } = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`); setResults(data); }
      catch {} finally { setSearching(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const addFriend = async (username) => {
    try {
      await api.post(`/friends/${username}`);
      toast.success(`Added @${username}`);
      setQuery(""); setResults([]);
      loadFriends();
      if (scope === "friends") loadBoard();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const removeFriend = async (friend_id, uname) => {
    try {
      await api.delete(`/friends/${friend_id}`);
      toast.success(`Removed @${uname}`);
      loadFriends();
      if (scope === "friends") loadBoard();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const medalColor = (rank) => rank === 0 ? "#ffb020" : rank === 1 ? "#00e5ff" : rank === 2 ? "#ff2bd6" : "#666";

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono-display text-[10px] tracking-[0.3em] uppercase text-cyan-300 mb-2">// who's strongest</div>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">THE LEADERBOARD.</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {LIFT_KEYS.map((k) => (
            <button key={k} onClick={() => setLift(k)}
              className={`px-3 py-1.5 rounded-full font-display text-[11px] uppercase tracking-wider border transition ${
                lift === k ? "border-cyan-400/60 text-glow-cyan bg-cyan-400/10" : "border-white/10 text-zinc-400 hover:text-white"
              }`}>
              {LIFT_LABELS[k]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          {[{ k: "friends", l: "Crew" }, { k: "global", l: "Global" }].map((s) => (
            <button key={s.k} onClick={() => setScope(s.k)}
              className={`px-3 py-1.5 rounded-full font-display text-[11px] uppercase tracking-wider border transition ${
                scope === s.k ? "border-pink-400/60 text-glow-magenta bg-pink-400/10" : "border-white/10 text-zinc-400 hover:text-white"
              }`}>
              {s.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading && <div className="text-zinc-500 font-mono-display animate-pulse">Loading…</div>}
          {!loading && rows.length === 0 && (
            <div className="border border-white/10 rounded-md p-8 text-center text-zinc-500 font-mono-display">
              No PRs yet. {scope === "friends" ? "Add friends and start logging." : "Be the first to log one."}
            </div>
          )}
          {rows.map((r, i) => (
            <div key={r.user_id}
              className={`flex items-center gap-3 sm:gap-4 p-4 rounded-md border ${i === 0 ? "border-amber-400/40 glow-amber" : "border-white/10"} bg-black/40 neon-border`}>
              <div className="w-10 flex items-center justify-center">
                {i < 3 ? <Crown size={22} style={{ color: medalColor(i) }} /> : <span className="font-display font-black text-zinc-500">#{i + 1}</span>}
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black"
                   style={{ background: r.avatar_color || "#00e5ff", color: "#07070a" }}>
                {r.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-base truncate">@{r.username}</div>
                <div className="font-mono-display text-[11px] text-zinc-500">{r.entries} entries · growth <span className="text-glow-cyan">{r.growth_per_week >= 0 ? "+" : ""}{r.growth_per_week}</span> kg/wk</div>
              </div>
              <div className="text-right">
                <div className="font-display font-black text-2xl text-glow-cyan">{r.best_one_rm}<span className="text-xs text-zinc-500 ml-1">1RM</span></div>
                <div className="font-mono-display text-[10px] text-zinc-500">{r.best_weight_kg} kg × {r.best_reps}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="neon-border rounded-md p-4 bg-black/40">
            <h3 className="font-display font-black text-sm tracking-tighter flex items-center gap-2 mb-3"><UserPlus size={14} className="text-glow-magenta" /> ADD FRIEND</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="search @username"
                className="w-full bg-black/60 border border-white/10 focus:border-pink-400/60 outline-none rounded-md pl-9 pr-3 py-2 font-mono-display text-sm" />
            </div>
            {searching && <div className="mt-2 text-xs text-zinc-500"><Loader2 size={12} className="inline animate-spin mr-1" /> searching…</div>}
            {results.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {results.map((u) => (
                  <button key={u.id} onClick={() => addFriend(u.username)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-white/5 hover:border-pink-400/40 bg-black/30 text-left transition">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center font-mono-display text-[9px] font-bold"
                        style={{ background: u.avatar_color || "#00e5ff", color: "#07070a" }}>{u.username[0].toUpperCase()}</span>
                      <span className="font-mono-display text-sm">@{u.username}</span>
                    </span>
                    <span className="text-glow-magenta text-xs font-display">+ ADD</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="neon-border rounded-md p-4 bg-black/40">
            <h3 className="font-display font-black text-sm tracking-tighter mb-3">YOUR CREW</h3>
            {friends.length === 0 && <div className="text-zinc-500 text-sm">No friends yet.</div>}
            <div className="space-y-1.5">
              {friends.map((f) => (
                <div key={f.id} className="flex items-center justify-between border border-white/5 rounded-md px-2.5 py-2">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center font-mono-display text-[9px] font-bold"
                      style={{ background: f.avatar_color || "#00e5ff", color: "#07070a" }}>{f.username[0].toUpperCase()}</span>
                    <span className="font-mono-display text-sm">@{f.username}</span>
                  </span>
                  <button onClick={() => removeFriend(f.id, f.username)} className="text-zinc-500 hover:text-pink-400">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
