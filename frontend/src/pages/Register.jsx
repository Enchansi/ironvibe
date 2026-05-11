import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Dumbbell, ArrowRight, Loader2 } from "lucide-react";
import SynthBG from "../components/SynthBG";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await register(email, username, password);
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

        <div className="rounded-xl border border-pink-400/30 bg-black/70 backdrop-blur-md p-8 glow-magenta">
          <div className="font-mono-display text-[10px] tracking-[0.3em] uppercase text-pink-300 mb-2">// initialize lifter</div>
          <h1 className="font-display font-black text-3xl tracking-tighter mb-6">CLAIM YOUR HANDLE.</h1>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block font-mono-display text-[10px] tracking-widest text-zinc-500 mb-2">USERNAME</label>
              <input required minLength={3} maxLength={20} pattern="[a-zA-Z0-9_]+" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 focus:border-pink-400/60 focus:ring-2 focus:ring-pink-400/20 outline-none rounded-md px-4 py-3 font-mono-display text-sm text-white transition"
                placeholder="@yourhandle" />
            </div>
            <div>
              <label className="block font-mono-display text-[10px] tracking-widest text-zinc-500 mb-2">EMAIL</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 focus:border-pink-400/60 focus:ring-2 focus:ring-pink-400/20 outline-none rounded-md px-4 py-3 font-mono-display text-sm text-white transition"
                placeholder="you@gym.io" />
            </div>
            <div>
              <label className="block font-mono-display text-[10px] tracking-widest text-zinc-500 mb-2">PASSWORD</label>
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 focus:border-pink-400/60 focus:ring-2 focus:ring-pink-400/20 outline-none rounded-md px-4 py-3 font-mono-display text-sm text-white transition"
                placeholder="6+ characters" />
            </div>

            {error && <div className="text-sm text-pink-400 font-mono-display border border-pink-400/30 bg-pink-400/5 rounded-md px-3 py-2">{error}</div>}

            <button type="submit" disabled={loading} className="btn-neon w-full justify-center">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <>JOIN THE RUN <ArrowRight size={16}/></>}
            </button>
          </form>

          <div className="mt-6 text-center font-mono-display text-xs text-zinc-500">
            Already lifting? <Link to="/login" className="text-glow-magenta">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
