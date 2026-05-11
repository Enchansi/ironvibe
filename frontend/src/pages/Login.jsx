import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Dumbbell, ArrowRight, Loader2 } from "lucide-react";
import SynthBG from "../components/SynthBG";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) navigate("/app/dashboard");
    else setError(res.error);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 bg-[#07070a]">
      <SynthBG />
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00e5ff, #ff2bd6)", boxShadow: "0 0 18px rgba(0,229,255,0.55)" }}>
            <Dumbbell size={18} color="#07070a" strokeWidth={3} />
          </div>
          <span className="font-display font-black tracking-tighter text-xl">IRON<span className="text-glow-magenta">VIBE</span></span>
        </Link>

        <div className="rounded-xl border border-cyan-400/30 bg-black/70 backdrop-blur-md p-8 glow-cyan">
          <div className="font-mono-display text-[10px] tracking-[0.3em] uppercase text-cyan-300 mb-2">// access terminal</div>
          <h1 className="font-display font-black text-3xl tracking-tighter mb-6">WELCOME BACK.</h1>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block font-mono-display text-[10px] tracking-widest text-zinc-500 mb-2">EMAIL</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none rounded-md px-4 py-3 font-mono-display text-sm text-white transition"
                placeholder="you@gym.io" />
            </div>
            <div>
              <label className="block font-mono-display text-[10px] tracking-widest text-zinc-500 mb-2">PASSWORD</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none rounded-md px-4 py-3 font-mono-display text-sm text-white transition"
                placeholder="••••••••" />
            </div>

            {error && <div className="text-sm text-pink-400 font-mono-display border border-pink-400/30 bg-pink-400/5 rounded-md px-3 py-2">{error}</div>}

            <button type="submit" disabled={loading} className="btn-neon w-full justify-center">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <>SIGN IN <ArrowRight size={16}/></>}
            </button>
          </form>

          <div className="mt-6 text-center font-mono-display text-xs text-zinc-500">
            No account? <Link to="/register" className="text-glow-cyan">Join free</Link>
          </div>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <div className="font-mono-display text-[10px] tracking-widest text-zinc-600 mb-2">// DEMO ACCOUNTS</div>
            <div className="font-mono-display text-[11px] text-zinc-400 space-y-0.5">
              <div>neon@ironvibe.app · demo123</div>
              <div>blaze@ironvibe.app · demo123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
