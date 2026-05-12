import { useState } from "react";
import { api, formatApiError } from "../lib/api";
import { Sparkles, Loader2, Dumbbell } from "lucide-react";
import { toast } from "sonner";

const MUSCLES = ["biceps", "triceps", "chest", "back", "shoulders", "quads", "hamstrings", "glutes", "calves", "core", "forearms"];
const EQUIPMENT = ["any", "barbell", "dumbbell", "bodyweight", "cable", "machine"];

export default function AIExercises() {
  const [muscle, setMuscle] = useState("biceps");
  const [equipment, setEquipment] = useState("any");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.post("/ai/exercises", { muscle, equipment });
      setData(res);
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setLoading(false); }
  };

  const diffColor = (d) => {
    const k = (d || "").toLowerCase();
    if (k.includes("begin")) return "#aaff00";
    if (k.includes("inter")) return "#00e5ff";
    if (k.includes("adv")) return "#ff2bd6";
    return "#9ea0b4";
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono-display text-[10px] tracking-[0.3em] uppercase text-pink-300 mb-2">// ai coach</div>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">PICK A MUSCLE. <span className="text-glow-magenta">GET COOKED.</span></h1>
        <p className="text-zinc-400 mt-3 max-w-2xl">Tell us what you want to torch today. The AI returns 6 sharp picks with sets/reps and a coach tip.</p>
      </div>

      <div className="neon-border rounded-md p-5 bg-black/40 space-y-4">
        <div>
          <label className="block font-mono-display text-[10px] tracking-widest text-zinc-500 mb-2">MUSCLE GROUP</label>
          <div className="flex flex-wrap gap-1.5">
            {MUSCLES.map((m) => (
              <button key={m} onClick={() => setMuscle(m)}
                className={`px-3 py-1.5 rounded-full font-display text-[11px] uppercase tracking-wider border transition ${
                  muscle === m ? "border-pink-400/60 text-glow-magenta bg-pink-400/10" : "border-white/10 text-zinc-400 hover:text-white"
                }`}>{m}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-mono-display text-[10px] tracking-widest text-zinc-500 mb-2">EQUIPMENT</label>
          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENT.map((eq) => (
              <button key={eq} onClick={() => setEquipment(eq)}
                className={`px-3 py-1.5 rounded-full font-display text-[11px] uppercase tracking-wider border transition ${
                  equipment === eq ? "border-cyan-400/60 text-glow-cyan bg-cyan-400/10" : "border-white/10 text-zinc-400 hover:text-white"
                }`}>{eq}</button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={loading} className="btn-neon">
          {loading ? <><Loader2 size={14} className="animate-spin" /> COOKING…</> : <><Sparkles size={14} /> SUGGEST 6 EXERCISES</>}
        </button>
      </div>

      {data && (
        <div className="space-y-3">
          <h2 className="font-display font-black text-xl tracking-tighter">
            FOR <span className="text-glow-cyan">{data.muscle.toUpperCase()}</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.exercises.map((ex, i) => (
              <div key={i} className="rounded-md border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/80 p-4 neon-border">
                <div className="flex items-start justify-between mb-2">
                  <Dumbbell size={16} className="text-glow-cyan" />
                  <span className="font-mono-display text-[10px] uppercase tracking-widest" style={{ color: diffColor(ex.difficulty) }}>{ex.difficulty}</span>
                </div>
                <h3 className="font-display font-black text-base tracking-tighter mb-1">{ex.name}</h3>
                <p className="text-zinc-400 text-sm mb-3">{ex.description}</p>
                <div className="font-mono-display text-[11px] text-zinc-500 mb-2">{ex.sets_reps}</div>
                <div className="border-t border-white/5 pt-2 text-[11px] text-zinc-400"><span className="text-glow-magenta">TIP · </span>{ex.tip}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
