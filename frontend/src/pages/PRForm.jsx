import { useState } from "react";
import { api, LIFT_LABELS, formatApiError } from "../lib/api";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PRForm({ onCreated }) {
  const [lift, setLift] = useState("bench");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/prs", { lift, weight_kg: parseFloat(weight), reps: parseInt(reps, 10) });
      toast.success("PR logged. The crew has been notified (sorta).");
      setWeight(""); setReps("");
      onCreated?.();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="neon-border rounded-md p-4 bg-black/40 space-y-3">
      <h3 className="font-display font-black text-sm tracking-tighter flex items-center gap-2"><Plus size={14} className="text-glow-cyan" /> LOG A PR</h3>
      <div>
        <label className="block font-mono-display text-[10px] tracking-widest text-zinc-500 mb-1">LIFT</label>
        <select value={lift} onChange={(e) => setLift(e.target.value)}
          className="w-full bg-black/60 border border-white/10 focus:border-cyan-400/60 outline-none rounded-md px-3 py-2 font-mono-display text-sm">
          {Object.entries(LIFT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block font-mono-display text-[10px] tracking-widest text-zinc-500 mb-1">WEIGHT (KG)</label>
          <input required type="number" step="0.5" min="1" max="999" value={weight} onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-black/60 border border-white/10 focus:border-cyan-400/60 outline-none rounded-md px-3 py-2 font-mono-display text-sm" />
        </div>
        <div>
          <label className="block font-mono-display text-[10px] tracking-widest text-zinc-500 mb-1">REPS</label>
          <input required type="number" min="1" max="20" value={reps} onChange={(e) => setReps(e.target.value)}
            className="w-full bg-black/60 border border-white/10 focus:border-cyan-400/60 outline-none rounded-md px-3 py-2 font-mono-display text-sm" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-neon w-full justify-center text-xs">
        {loading ? <Loader2 size={14} className="animate-spin" /> : "SLAM IT"}
      </button>
    </form>
  );
}
