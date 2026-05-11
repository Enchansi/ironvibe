import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Dumbbell, Trophy, Sparkles, Flame, Activity, ArrowRight } from "lucide-react";
import SynthBG from "../components/SynthBG";

export default function Landing() {
  const [topBench, setTopBench] = useState([]);

  useEffect(() => {
    setTopBench([
      { rank: 1, username: "blaze", best: 105 },
      { rank: 2, username: "neon", best: 90 },
      { rank: 3, username: "vapor", best: 77.5 },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-200 overflow-x-hidden">
      <header className="relative z-40 flex items-center justify-between px-6 sm:px-12 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00e5ff, #ff2bd6)", boxShadow: "0 0 18px rgba(0,229,255,0.55)" }}>
            <Dumbbell size={18} color="#07070a" strokeWidth={3} />
          </div>
          <span className="font-display font-black tracking-tighter text-xl">IRON<span className="text-glow-magenta">VIBE</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-2 font-display text-xs uppercase tracking-wider">
          <a href="#features" className="px-4 py-2 text-zinc-400 hover:text-cyan-300 transition">Features</a>
          <a href="#leaderboard" className="px-4 py-2 text-zinc-400 hover:text-cyan-300 transition">Leaderboard</a>
          <a href="#ai" className="px-4 py-2 text-zinc-400 hover:text-cyan-300 transition">AI Coach</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="font-display text-xs uppercase tracking-wider text-zinc-300 hover:text-white">Login</Link>
          <Link to="/register" className="btn-neon text-xs">Join Free <ArrowRight size={14} /></Link>
        </div>
      </header>

      <section className="relative min-h-[88vh] flex items-center px-6 sm:px-12 pb-20">
        <SynthBG />
        <div className="relative z-10 max-w-6xl mx-auto w-full grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 fade-up">
            <div className="inline-flex items-center gap-2 font-mono-display text-[10px] tracking-[0.3em] uppercase text-cyan-300 border border-cyan-400/40 px-3 py-1 rounded-full mb-6 pulse-glow">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" /> RUN. LIFT. RANK.
            </div>
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tighter">
              YOUR <span className="text-glow-cyan">PR</span> IS NOTHING<br/>
              UNTIL YOUR <span className="text-glow-magenta">CREW</span> SEES IT.
            </h1>
            <p className="mt-6 max-w-xl text-zinc-400 text-base sm:text-lg">
              Log your lifts, climb the friends leaderboard, and let our AI coach pick the exercises that actually move your numbers.
              Built for late-night gym rats with too much soundtrack energy.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-neon">START LIFTING <ArrowRight size={16}/></Link>
              <Link to="/login" className="btn-ghost-neon">I HAVE AN ACCOUNT</Link>
            </div>
            <div className="mt-10 grid grid-cols-3 max-w-md gap-4">
              {[
                { k: "DAILY PRs", v: "1,284" },
                { k: "MEMBERS", v: "642" },
                { k: "LIFTS TRACKED", v: "6" },
              ].map((s) => (
                <div key={s.k} className="neon-border rounded-md p-3 bg-black/40">
                  <div className="font-display font-black text-2xl text-glow-cyan">{s.v}</div>
                  <div className="font-mono-display text-[10px] text-zinc-500 tracking-widest">{s.k}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative rounded-xl bg-black/60 backdrop-blur-md border border-cyan-400/30 p-6 glow-cyan">
              <div className="flex items-center justify-between mb-5">
                <div className="font-display text-xs uppercase tracking-[0.25em] text-zinc-400">Bench · Friends</div>
                <Trophy size={16} className="text-glow-magenta" />
              </div>
              <div className="space-y-3">
                {topBench.map((r) => (
                  <div key={r.rank} className="flex items-center justify-between border border-white/5 rounded-md px-3 py-2.5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="font-display font-black text-lg w-6 text-glow-cyan">#{r.rank}</div>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono-display font-bold"
                        style={{ background: r.rank === 1 ? "#ff2bd6" : r.rank === 2 ? "#00e5ff" : "#ffb020", color: "#07070a" }}>
                        {r.username[0].toUpperCase()}
                      </div>
                      <div className="font-mono-display text-sm">@{r.username}</div>
                    </div>
                    <div className="font-display font-black text-lg">{r.best}<span className="text-xs text-zinc-500 ml-1">kg</span></div>
                  </div>
                ))}
              </div>
              <div className="mt-5 font-mono-display text-[10px] tracking-widest text-zinc-500">// PREVIEW · LIVE ON LOGIN</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative px-6 sm:px-12 py-24 bg-[#07070a]">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono-display text-[10px] tracking-[0.3em] uppercase text-cyan-300 mb-3">// 03 features</div>
          <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mb-12 max-w-3xl">
            BUILT TO MAKE NUMBERS GO <span className="text-glow-cyan">UP.</span>
          </h2>
          <div className="grid grid-cols-6 grid-rows-2 gap-4 min-h-[460px]">
            <div className="col-span-6 md:col-span-4 row-span-2 rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/80 p-8 relative overflow-hidden neon-border">
              <Trophy size={28} className="text-glow-magenta mb-4" />
              <h3 className="font-display font-black text-2xl mb-2">FRIENDS LEADERBOARD</h3>
              <p className="text-zinc-400 max-w-md">Add your gym crew by @username. Every PR you log shoves you up the ladder — or down. Growth-per-week tells you who's actually getting stronger.</p>
              <div className="absolute right-6 bottom-6 font-display font-black text-[6rem] leading-none text-white/[0.04] select-none">01</div>
            </div>
            <div className="col-span-6 md:col-span-2 rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/80 p-6 relative overflow-hidden neon-border">
              <Activity size={24} className="text-glow-cyan mb-3" />
              <h3 className="font-display font-black text-lg mb-1">PR TRACKER</h3>
              <p className="text-zinc-400 text-sm">Log weight × reps. We auto-calc your 1-rep-max with Epley.</p>
            </div>
            <div className="col-span-6 md:col-span-2 rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black/80 p-6 relative overflow-hidden neon-border" id="ai">
              <Sparkles size={24} className="text-glow-magenta mb-3" />
              <h3 className="font-display font-black text-lg mb-1">AI COACH</h3>
              <p className="text-zinc-400 text-sm">"Biceps day, no clue what to do." → 6 sharp picks with sets & form tips.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-10 border-y border-white/10 overflow-hidden bg-black">
        <div className="flex marquee whitespace-nowrap font-display font-black text-5xl tracking-tighter">
          {[..."HIT • THE • RACK • LOG • THE • LIFT • SHAME • THE • CREW • REPEAT • ".repeat(6)].map((c, i) => (
            <span key={i} className={i % 7 === 0 ? "text-glow-cyan" : i % 11 === 0 ? "text-glow-magenta" : "text-white/40"}>{c}</span>
          ))}
        </div>
      </section>

      <section id="leaderboard" className="relative px-6 sm:px-12 py-24">
        <div className="max-w-3xl mx-auto text-center fade-up">
          <Flame size={32} className="mx-auto text-glow-magenta mb-4" />
          <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mb-4">
            STOP TRAINING IN <span className="text-glow-cyan">SILENCE.</span>
          </h2>
          <p className="text-zinc-400 mb-8">Pull your boys in. Pull your numbers up. Free forever.</p>
          <Link to="/register" className="btn-neon">CREATE YOUR PROFILE <ArrowRight size={16} /></Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10 text-center font-mono-display text-[11px] text-zinc-600 tracking-widest">
        © IRONVIBE · LIFT LOUDER
      </footer>
    </div>
  );
}
