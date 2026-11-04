"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ShieldAlert, Zap, Dumbbell, Play, Square, Heart, AlertOctagon, Watch,
  RotateCcw, ShieldCheck, TriangleAlert, LogOut, TrendingUp, Target, Gauge, Lock,
  UserRound, Cpu, Trophy, Timer, Flame, CheckCircle2, Search, Flag,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { LIBRARY, GROUPS, INFO, ExPhoto, FormGuide, type Exercise, type Mode } from "./exercises";

/* ------------------------------ Types & data ------------------------------ */

type TrainingMode = Mode;
type SpotterStatus = "ARMED" | "TRIPPED" | "E-STOPPED";
type Phase = "IDLE" | "CONCENTRIC" | "ECCENTRIC";
type Page = "train" | "workouts" | "progress";
type RepTarget = number | "FAILURE";

interface TelemetryPoint { time: number; load: number; velocity: number; heartRate: number | null }
interface RepLog { repNum: number; peakForce: number; peakVelocity: number; duration: number; peakPower: number }
interface SetLog { exercise: string; group: string; reps: number; load: number; peakPower: number; failure: boolean }
interface Session {
  t: number; focus: string; volume: number; peakPower: number; topLoad: number;
  sets: number; reps: number; minutes: number; log?: SetLog[];
}
interface Profile { name: string; goal: string; baseLoad: number; growth: number; phase: number; color: string }

const TICK_MS = 200;
const MAX_POINTS = 40;
const STALL_TRIP_MS = 1000;
const GRAVITY = 9.81;
const ASYMMETRY_LIMIT = 6;
const DAY = 86400000;
const WEEK = 7 * DAY;

// DEMO ONLY: one shared password for every user. Replace with real auth later.
const DEMO_PASSWORD = "12345678";

// Each physical machine has its own number that members log in with.
const MACHINES = [
  { id: "AERS-001", name: "Cable Station 1" },
  { id: "AERS-002", name: "Cable Station 2" },
  { id: "AERS-003", name: "Cable Station 3" },
  { id: "AERS-004", name: "Cable Station 4" },
];

const USERS: Profile[] = [
  { name: "Lincoln M.", goal: "Build strength", baseLoad: 80, growth: 0.03, phase: 0.3, color: "#fb923c" },
  { name: "Andy Bala", goal: "Build chest", baseLoad: 70, growth: 0.035, phase: 1.1, color: "#38bdf8" },
  { name: "Melvin Siambi", goal: "Leg strength", baseLoad: 95, growth: 0.025, phase: 2.2, color: "#a78bfa" },
  { name: "Jeremy Adams", goal: "Lose fat", baseLoad: 60, growth: 0.045, phase: 3.0, color: "#34d399" },
  { name: "Ephy Buhere", goal: "Tone arms", baseLoad: 50, growth: 0.04, phase: 4.1, color: "#f472b6" },
];

const GOAL_GROUP: Record<string, string> = {
  "Build chest": "Chest", "Leg strength": "Legs", "Lose fat": "Legs", "Tone arms": "Arms", "Build strength": "Back",
};

const REP_OPTIONS: RepTarget[] = [8, 12, 15, 18, "FAILURE"];
const REST_OPTIONS = [30, 45, 60, 90, 120, 180];

const MODES: { id: TrainingMode; label: string }[] = [
  { id: "CONSTANT", label: "Constant" },
  { id: "ECCENTRIC_OVERLOAD", label: "Eccentric +20%" },
  { id: "ACCOMMODATING", label: "Accommodating" },
];

const newSim = () => ({
  t: 0, elapsed: 0, inRep: false, repStart: 0, peakForce: 0, peakVel: 0, peakPower: 0,
  stalled: false, stallMs: 0, logs: [] as RepLog[], hrSum: 0, hrN: 0,
  failAt: 9 + Math.floor(Math.random() * 4),
});

const loadFor = (u: Profile, ex: Exercise) => Math.min(180, Math.max(10, Math.round((u.baseLoad * ex.pct) / 5) * 5));
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/* Demo history: 8 weeks of sessions per user (replace with real data from your backend). */
const seedSessions = (u: Profile): Session[] => {
  const now = Date.now();
  const out: Session[] = [];
  for (let w = 7; w >= 0; w--) {
    const i = 7 - w;
    const load = Math.round((u.baseLoad * (1 + u.growth * i) * (1 + Math.sin(i * 1.7 + u.phase) * 0.04)) / 2.5) * 2.5;
    const n = w === 0 ? 2 : 3;
    for (let j = 0; j < n; j++) {
      out.push({
        t: now - w * WEEK - j * 2 * DAY - 3600000,
        focus: GROUPS[(i * 3 + j) % 6],
        volume: Math.round(load * 36 * (1 + j * 0.05)),
        peakPower: Math.round(load * GRAVITY * 0.75),
        topLoad: load, sets: 9, reps: 36, minutes: 45 + j * 5,
      });
    }
  }
  return out;
};

/* Sessions you finish are kept in this browser (localStorage). */
const loadSessions = (name: string): Session[] => {
  try { return JSON.parse(localStorage.getItem(`aers:sessions:${name}`) ?? "[]") as Session[]; } catch { return []; }
};
const saveSessions = (name: string, s: Session[]) => {
  try { localStorage.setItem(`aers:sessions:${name}`, JSON.stringify(s)); } catch { /* ignore */ }
};
const loadGoal = (name: string): number => {
  try { return Number(localStorage.getItem(`aers:goal:${name}`)) || 3; } catch { return 3; }
};

const beep = () => {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const o = ctx.createOscillator();
    o.frequency.value = 880;
    o.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.3);
  } catch { /* ignore */ }
};

/* --------------------------------- Root ---------------------------------- */

export default function Dashboard() {
  const [session, setSession] = useState<{ machine: (typeof MACHINES)[number]; user: Profile } | null>(null);
  if (!session) return <Login onLogin={(machine, user) => setSession({ machine, user })} />;
  return <Console machine={session.machine} user={session.user} onLogout={() => setSession(null)} />;
}

/* --------------------------------- Login --------------------------------- */

function Login({ onLogin }: { onLogin: (m: (typeof MACHINES)[number], u: Profile) => void }) {
  const [machineId, setMachineId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = MACHINES.find((m) => m.id === machineId.trim().toUpperCase());
    const q = name.trim().toLowerCase();
    const user = USERS.find((u) => u.name.toLowerCase() === q || u.name.toLowerCase().split(" ")[0] === q);
    if (!machine) return setError("Machine number not found. Check the label on the machine.");
    if (!user) return setError("We couldn't find that member. Try your first name.");
    if (password !== DEMO_PASSWORD) return setError("Wrong password. Try again.");
    onLogin(machine, user);
  };

  const field = "w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-11 pr-4 py-3.5 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-5">
      <form onSubmit={submit} className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-7 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-orange-500 flex items-center justify-center text-zinc-950">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">AERS Gym</h1>
            <p className="text-sm text-zinc-400">Sign in to start your session</p>
          </div>
        </div>

        <label className="block relative">
          <Cpu className="absolute left-4 top-4 h-5 w-5 text-zinc-500" />
          <input className={field} placeholder="Machine number (e.g. AERS-001)" value={machineId}
            onChange={(e) => setMachineId(e.target.value)} autoCapitalize="characters" aria-label="Machine number" />
        </label>
        <label className="block relative">
          <UserRound className="absolute left-4 top-4 h-5 w-5 text-zinc-500" />
          <input className={field} placeholder="Your name" value={name}
            onChange={(e) => setName(e.target.value)} aria-label="Your name" />
        </label>
        <label className="block relative">
          <Lock className="absolute left-4 top-4 h-5 w-5 text-zinc-500" />
          <input className={field} type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} aria-label="Password" />
        </label>

        {error && <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">{error}</p>}

        <button className="w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-base rounded-xl py-3.5 transition">
          Sign in
        </button>

        <p className="text-xs text-zinc-500 leading-relaxed">
          Demo: machines AERS-001 to AERS-004. Members: Lincoln, Andy, Melvin, Jeremy, Ephy. Password 12345678.
        </p>
      </form>
    </main>
  );
}

/* -------------------------------- Console -------------------------------- */

function Console({ machine, user, onLogout }: { machine: (typeof MACHINES)[number]; user: Profile; onLogout: () => void }) {
  const [page, setPage] = useState<Page>("train");

  const [exercise, setExercise] = useState("Bench Press");
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("CONSTANT");
  const [targetWeight, setTargetWeight] = useState(Math.max(10, Math.round((user.baseLoad * 0.8) / 5) * 5));
  const [repTarget, setRepTarget] = useState<RepTarget>(12);
  const [restSeconds, setRestSeconds] = useState(60);
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(60);
  const [wearable, setWearable] = useState(true);
  const [plannedSets, setPlannedSets] = useState<number | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [spotter, setSpotter] = useState<SpotterStatus>("ARMED");

  const [data, setData] = useState<TelemetryPoint[]>([]);
  const [currentLoad, setCurrentLoad] = useState(0);
  const [currentVelocity, setCurrentVelocity] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [movementPhase, setMovementPhase] = useState<Phase>("IDLE");
  const [leftBalance, setLeftBalance] = useState(50);
  const [currentSet, setCurrentSet] = useState(1);
  const [repHistory, setRepHistory] = useState<RepLog[]>([]);
  const [setLogs, setSetLogs] = useState<SetLog[]>([]);
  const [lastSet, setLastSet] = useState<SetLog | null>(null);

  const [sessions, setSessions] = useState<Session[]>(() => loadSessions(user.name));
  const [weeklyGoal, setWeeklyGoal] = useState<number>(() => loadGoal(user.name));
  const [summary, setSummary] = useState<{ s: Session; prs: string[] } | null>(null);

  const startedAt = useRef<number | null>(null);
  const prevRest = useRef(0);
  const sim = useRef(newSim());
  const cfg = useRef({ targetWeight, trainingMode, wearable, repTarget, restSeconds, exercise });
  useEffect(() => {
    cfg.current = { targetWeight, trainingMode, wearable, repTarget, restSeconds, exercise };
  }, [targetWeight, trainingMode, wearable, repTarget, restSeconds, exercise]);

  const locked = restLeft > 0;
  const rightBalance = 100 - leftBalance;
  const repCount = repHistory.length;

  /* Finish a set: log it, then lock the machine for the chosen rest time. */
  const completeSet = useCallback((failure: boolean) => {
    const s = sim.current;
    const c = cfg.current;
    const reps = s.logs.length;
    setIsRunning(false);
    setCurrentLoad(0); setCurrentVelocity(0); setMovementPhase("IDLE"); setRepHistory([]);
    if (reps > 0) {
      const group = LIBRARY.find((e) => e.name === c.exercise)?.group ?? "Chest";
      const log: SetLog = {
        exercise: c.exercise, group, reps, load: c.targetWeight,
        peakPower: Math.max(...s.logs.map((r) => r.peakPower)), failure,
      };
      setSetLogs((p) => [...p, log]);
      setLastSet(log);
      setCurrentSet((n) => n + 1);
      setRestTotal(c.restSeconds);
      setRestLeft(c.restSeconds);
    }
    Object.assign(sim.current, { t: 0, inRep: false, stalled: false, stallMs: 0, logs: [], failAt: 9 + Math.floor(Math.random() * 4) });
  }, []);

  /* Simulation loop (state lives here so it keeps running when you switch pages) */
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      const s = sim.current;
      const c = cfg.current;
      s.t += 0.4;
      s.elapsed += TICK_MS / 1000;

      // In "to failure" mode the lifter slowly tires, so the bar gets slower each rep.
      const amp = c.repTarget === "FAILURE" ? Math.max(0.3, 0.9 - 0.05 * s.logs.length) : 0.9;
      const vel = s.stalled ? 0 : Math.sin(s.t) * amp;
      const speed = Math.abs(vel);
      const phase: Phase = s.stalled ? "CONCENTRIC" : vel > 0.1 ? "CONCENTRIC" : vel < -0.1 ? "ECCENTRIC" : "IDLE";

      let load = c.targetWeight;
      if (c.trainingMode === "ECCENTRIC_OVERLOAD" && phase === "ECCENTRIC") load = Math.round(load * 1.2);
      else if (c.trainingMode === "ACCOMMODATING") load = Math.round(load + speed * 15);

      // Digital spotter: bar stalled under load for too long -> unload and stop
      if (s.stalled) {
        s.stallMs += TICK_MS;
        if (s.stallMs >= STALL_TRIP_MS) {
          s.stalled = false; s.stallMs = 0; s.inRep = false;
          setSpotter("TRIPPED"); setIsRunning(false);
          setCurrentLoad(0); setCurrentVelocity(0); setMovementPhase("IDLE");
          return;
        }
      }

      // Rep detection (one rep = one concentric phase)
      if (!s.inRep && vel > 0.2) {
        s.inRep = true; s.repStart = s.elapsed; s.peakForce = load; s.peakVel = speed; s.peakPower = load * GRAVITY * speed;
      } else if (s.inRep) {
        s.peakForce = Math.max(s.peakForce, load);
        s.peakVel = Math.max(s.peakVel, speed);
        s.peakPower = Math.max(s.peakPower, load * GRAVITY * speed);
        if (vel <= 0.05) {
          s.inRep = false;
          s.logs.push({
            repNum: s.logs.length + 1,
            peakForce: s.peakForce,
            peakVelocity: Number(s.peakVel.toFixed(2)),
            duration: Number((s.elapsed - s.repStart).toFixed(1)),
            peakPower: Math.round(s.peakPower),
          });
          setRepHistory([...s.logs]);
          const done = c.repTarget === "FAILURE" ? s.logs.length >= s.failAt : s.logs.length >= c.repTarget;
          if (done) {
            completeSet(c.repTarget === "FAILURE");
            return;
          }
        }
      }

      setLeftBalance(Math.round(48 + Math.sin(s.t * 2) * 4));
      let bpm: number | null = null;
      if (c.wearable) {
        bpm = Math.round(125 + Math.sin(s.t * 0.4) * 12 + (load / 180) * 15);
        setHeartRate(bpm);
        s.hrSum += bpm; s.hrN += 1;
      }
      setMovementPhase(phase);
      setCurrentLoad(load);
      setCurrentVelocity(Number(speed.toFixed(2)));
      setData((prev) => [
        ...prev.slice(-(MAX_POINTS - 1)),
        { time: Number(s.elapsed.toFixed(1)), load, velocity: Number(speed.toFixed(2)), heartRate: bpm },
      ]);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [isRunning, completeSet]);

  /* Rest countdown: the machine stays locked until it reaches zero. */
  useEffect(() => {
    if (restLeft <= 0) return;
    const id = setTimeout(() => setRestLeft((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [restLeft]);
  useEffect(() => {
    if (restLeft === 0 && prevRest.current > 0) beep();
    prevRest.current = restLeft;
  }, [restLeft]);

  /* Actions */
  const clearSet = useCallback(() => {
    sim.current = newSim();
    setRepHistory([]); setData([]); setCurrentLoad(0); setCurrentVelocity(0); setMovementPhase("IDLE");
  }, []);

  const toggleRun = () => {
    if (!isRunning && !startedAt.current) startedAt.current = Date.now();
    setIsRunning((v) => !v);
  };

  const triggerEStop = () => {
    sim.current.stalled = false; sim.current.stallMs = 0;
    setSpotter("E-STOPPED"); setIsRunning(false);
    setCurrentLoad(0); setCurrentVelocity(0); setMovementPhase("IDLE");
  };

  const changeExercise = (name: string) => {
    if (locked) return;
    setIsRunning(false); setExercise(name); setPlannedSets(null); clearSet();
  };

  const startWorkout = (ex: Exercise) => {
    setPage("train");
    if (locked) return;
    setIsRunning(false); setExercise(ex.name); setTrainingMode(ex.mode);
    setTargetWeight(loadFor(user, ex)); setPlannedSets(3); clearSet();
  };

  const finishWorkout = () => {
    if (!setLogs.length) return;
    setIsRunning(false);
    const est = (l: { load: number; reps: number }) => l.load * (1 + l.reps / 30);
    const past = sessions.flatMap((s) => s.log ?? []);
    const prs = Array.from(new Set(setLogs.map((l) => l.exercise))).filter((n) => {
      const before = past.filter((p) => p.exercise === n).map(est);
      if (!before.length) return false;
      return Math.max(...setLogs.filter((l) => l.exercise === n).map(est)) > Math.max(...before);
    });
    const counts: Record<string, number> = {};
    setLogs.forEach((l) => { counts[l.group] = (counts[l.group] ?? 0) + 1; });
    const s: Session = {
      t: Date.now(),
      focus: Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0],
      volume: setLogs.reduce((a, l) => a + l.load * l.reps, 0),
      peakPower: Math.max(...setLogs.map((l) => l.peakPower)),
      topLoad: Math.max(...setLogs.map((l) => l.load)),
      sets: setLogs.length,
      reps: setLogs.reduce((a, l) => a + l.reps, 0),
      minutes: Math.max(1, Math.round((Date.now() - (startedAt.current ?? Date.now())) / 60000)),
      log: setLogs,
    };
    const next = [...sessions, s];
    setSessions(next);
    saveSessions(user.name, next);
    setSummary({ s, prs });
    setSetLogs([]); setLastSet(null); setCurrentSet(1); setPlannedSets(null); startedAt.current = null;
  };

  const updateGoal = (g: number) => {
    setWeeklyGoal(g);
    try { localStorage.setItem(`aers:goal:${user.name}`, String(g)); } catch { /* ignore */ }
  };

  /* Derived */
  const livePower = Math.round(currentLoad * GRAVITY * currentVelocity);
  const sessionPeakPower = useMemo(() => setLogs.reduce((m, l) => Math.max(m, l.peakPower), 0), [setLogs]);
  const asymmetry = Math.abs(leftBalance - rightBalance);
  const canStart = spotter === "ARMED" && !locked;
  const ex = LIBRARY.find((e) => e.name === exercise);

  const lastForEx = useMemo(() => {
    for (let i = sessions.length - 1; i >= 0; i--) {
      const l = (sessions[i].log ?? []).filter((x) => x.exercise === exercise);
      if (l.length) return l[l.length - 1];
    }
    return null;
  }, [sessions, exercise]);
  const tip = !lastForEx
    ? "First time on this exercise: pick a weight you can lift at least 12 times."
    : repTarget === "FAILURE"
    ? `Last time: ${lastForEx.load} kg x ${lastForEx.reps}. Try to beat that many reps.`
    : lastForEx.reps >= repTarget
    ? `Last time: ${lastForEx.load} kg x ${lastForEx.reps}. You hit your reps, so try ${lastForEx.load + 5} kg today.`
    : `Last time: ${lastForEx.load} kg x ${lastForEx.reps}. Stay at this weight until you reach ${repTarget} reps.`;

  const seed = useMemo(() => seedSessions(user), [user]);
  const all = useMemo(() => [...seed, ...sessions], [seed, sessions]);
  const crew = useMemo(() => {
    const now = Date.now();
    return USERS.map((u) => {
      const list = u.name === user.name ? all : [...seedSessions(u), ...loadSessions(u.name)];
      return { u, v: list.filter((s) => now - s.t < WEEK).reduce((a, s) => a + s.volume, 0) };
    }).sort((a, b) => b.v - a.v);
  }, [all, user.name]);

  const NAV: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: "train", label: "Train", icon: <Gauge className="h-5 w-5" /> },
    { id: "workouts", label: "Workouts", icon: <Target className="h-5 w-5" /> },
    { id: "progress", label: "Progress", icon: <TrendingUp className="h-5 w-5" /> },
  ];
  const seg = (on: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${on ? "bg-orange-500 text-zinc-950" : "text-zinc-400 hover:text-white"}`;
  const btn = "flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 md:pb-8">
      <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-500 flex items-center justify-center text-zinc-950"><Dumbbell className="h-5 w-5" /></div>
          <div className="min-w-0">
            <p className="font-extrabold leading-tight truncate">{user.name}</p>
            <p className="text-xs text-zinc-400 truncate">{machine.id} - {machine.name}</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setPage(n.id)} aria-current={page === n.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${page === n.id ? "bg-orange-500 text-zinc-950" : "text-zinc-400 hover:text-white"}`}>
              {n.icon} {n.label}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="flex items-center gap-2 text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-3 py-2 rounded-xl">
          <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
        </button>
      </header>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-zinc-900 border-t border-zinc-800 grid grid-cols-3">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setPage(n.id)} aria-current={page === n.id}
            className={`flex flex-col items-center gap-1 py-3 text-xs font-semibold ${page === n.id ? "text-orange-400" : "text-zinc-500"}`}>
            {n.icon} {n.label}
          </button>
        ))}
      </nav>

      <div className="px-4 md:px-6 pt-5 max-w-6xl mx-auto">
        {page === "workouts" && <WorkoutsPage user={user} onStart={startWorkout} />}
        {page === "progress" && (
          <ProgressPage user={user} all={all} logged={sessions} goal={weeklyGoal} onGoal={updateGoal} crew={crew} />
        )}

        {page === "train" && (
          <div className="space-y-5">
            {locked && (
              <section role="status" className="bg-zinc-900 border-2 border-orange-500 rounded-2xl p-6 text-center space-y-3">
                <p className="text-sm text-orange-300 font-bold flex items-center justify-center gap-2"><Lock className="h-4 w-4" /> MACHINE LOCKED - RESTING</p>
                <p className="text-6xl font-extrabold tabular-nums">{fmt(restLeft)}</p>
                <div className="h-2 bg-zinc-950 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 transition-all" style={{ width: `${(restLeft / restTotal) * 100}%` }} />
                </div>
                <p className="text-sm text-zinc-400">The next set unlocks when the timer ends. Breathe, sip water, shake out your arms.</p>
              </section>
            )}

            {plannedSets !== null && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl px-4 py-3 text-sm flex flex-wrap justify-between gap-2">
                <span><b className="text-orange-300">{exercise}</b> - plan: {plannedSets} sets of {repTarget === "FAILURE" ? "failure" : repTarget} reps</span>
                <span className="font-semibold">
                  {setLogs.length >= plannedSets ? "Plan complete. Finish workout to log it." : `Set ${Math.min(currentSet, plannedSets)} of ${plannedSets}`}
                </span>
              </div>
            )}

            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <select value={exercise} onChange={(e) => changeExercise(e.target.value)} disabled={locked || isRunning}
                  className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-orange-500 disabled:opacity-40" aria-label="Exercise">
                  {GROUPS.map((g) => (
                    <optgroup key={g} label={g}>
                      {LIBRARY.filter((e) => e.group === g).map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
                    </optgroup>
                  ))}
                </select>
                <button onClick={() => setWearable((v) => !v)} aria-pressed={wearable}
                  className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl border ${wearable ? "border-zinc-700 text-zinc-200" : "border-amber-500/40 text-amber-300"}`}>
                  <Watch className="h-4 w-4 text-rose-400" />
                  {wearable ? "Watch paired" : "Pair watch"}
                  {wearable && (
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <Heart className="h-3.5 w-3.5 fill-current animate-pulse" />
                      {heartRate > 0 ? `${heartRate} bpm` : "-- bpm"}
                    </span>
                  )}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1.5">REPS PER SET</p>
                  <div className="flex flex-wrap bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-fit">
                    {REP_OPTIONS.map((r) => (
                      <button key={String(r)} disabled={locked || isRunning} onClick={() => setRepTarget(r)} aria-pressed={repTarget === r} className={seg(repTarget === r)}>
                        {r === "FAILURE" ? "Failure" : r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1.5">REST BETWEEN SETS</p>
                  <div className="flex flex-wrap bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-fit">
                    {REST_OPTIONS.map((r) => (
                      <button key={r} disabled={locked || isRunning} onClick={() => setRestSeconds(r)} aria-pressed={restSeconds === r} className={seg(restSeconds === r)}>
                        {r >= 60 ? `${r / 60 === Math.floor(r / 60) ? r / 60 : (r / 60).toFixed(1)} min` : `${r}s`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {MODES.map((m) => (
                    <button key={m.id} disabled={locked || isRunning} onClick={() => setTrainingMode(m.id)} aria-pressed={trainingMode === m.id} className={seg(trainingMode === m.id)}>
                      {m.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-[220px]">
                  <label htmlFor="target-load" className="text-sm text-zinc-400 whitespace-nowrap">
                    Load <b className="text-orange-400 text-lg">{targetWeight} kg</b>
                  </label>
                  <input id="target-load" type="range" min={10} max={180} step={5} value={targetWeight} disabled={locked || isRunning}
                    onChange={(e) => setTargetWeight(Number(e.target.value))} className="flex-1 h-2 accent-orange-500 cursor-pointer disabled:opacity-40" />
                </div>
              </div>

              <p className="text-sm text-sky-300 bg-sky-400/10 rounded-xl px-3 py-2 flex items-center gap-2"><Flame className="h-4 w-4 shrink-0" /> {tip}</p>

              {lastSet && repCount === 0 && !isRunning && (
                <p className="text-sm text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Last set: {lastSet.reps} reps at {lastSet.load} kg{lastSet.failure ? " (to failure)" : ""}, peak {lastSet.peakPower} W
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {spotter !== "ARMED" ? (
                  <button onClick={() => setSpotter("ARMED")} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <ShieldCheck className="h-5 w-5" /> Re-arm spotter
                  </button>
                ) : (
                  <button onClick={toggleRun} disabled={!canStart}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition disabled:opacity-40 disabled:cursor-not-allowed ${isRunning ? "bg-zinc-800 text-white border border-zinc-600" : "bg-orange-500 text-zinc-950 hover:bg-orange-400"}`}>
                    {isRunning ? <><Square className="h-5 w-5 fill-current" /> Pause</> : <><Play className="h-5 w-5 fill-current" /> {locked ? "Locked" : `Start set ${currentSet}`}</>}
                  </button>
                )}
                <button onClick={() => completeSet(false)} disabled={repCount === 0 || locked} className={btn}><Flag className="h-4 w-4" /> End set</button>
                <button onClick={() => { setIsRunning(false); clearSet(); }} disabled={locked} className={btn}><RotateCcw className="h-4 w-4" /> Reset set</button>
                <button onClick={finishWorkout} disabled={setLogs.length === 0} className={btn}><Trophy className="h-4 w-4" /> Finish workout</button>
                <button onClick={() => isRunning && (sim.current.stalled = true)} disabled={!isRunning} className={`${btn} text-amber-300`} title="Freeze the bar under load to test the spotter">
                  <TriangleAlert className="h-4 w-4" /> Test stall
                </button>
                <button onClick={triggerEStop} className="ml-auto flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-red-600/20">
                  <AlertOctagon className="h-5 w-5" /> E-STOP
                </button>
              </div>
            </section>

            {currentSet === 1 && setLogs.length === 0 && (
              <details className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300">
                <summary className="cursor-pointer font-bold">Warm up first (3-5 minutes)</summary>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Jog or march in place for 1-2 minutes to raise your heart rate.</li>
                  <li>Circle each joint you will use for 5-10 seconds.</li>
                  <li>Do one light set of about 10 reps at roughly half your working load ({Math.max(10, Math.round(targetWeight / 2 / 5) * 5)} kg).</li>
                </ul>
              </details>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Card title="Load" icon={<Zap className="h-4 w-4 text-orange-400" />}>{currentLoad} <Unit>kg</Unit></Card>
              <Card title="Speed" icon={<Activity className="h-4 w-4 text-sky-400" />}>{currentVelocity.toFixed(2)} <Unit>m/s</Unit></Card>
              <Card title={`Reps - ${movementPhase.toLowerCase()}`} icon={<Dumbbell className="h-4 w-4 text-zinc-400" />}
                foot={repTarget === "FAILURE" ? "Going to failure" : `Target ${repTarget}`}>
                {repCount} <Unit>/ {repTarget === "FAILURE" ? "fail" : repTarget}</Unit>
              </Card>
              <Card title="Power" icon={<Timer className="h-4 w-4 text-amber-400" />} foot={`Best this workout: ${sessionPeakPower} W`}>
                {livePower} <Unit>W</Unit>
              </Card>
              <div className="col-span-2 lg:col-span-1 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
                <div className="flex justify-between text-zinc-400 text-sm">
                  <span>Spotter</span>
                  <ShieldAlert className={`h-4 w-4 ${spotter === "ARMED" ? "text-emerald-400" : "text-red-400"}`} />
                </div>
                <div role="status" className={`text-2xl font-extrabold mt-2 ${spotter === "ARMED" ? "text-emerald-400" : "text-red-400 animate-pulse"}`}>{spotter}</div>
                <p className="text-xs text-zinc-500 mt-1">{spotter === "ARMED" ? "Watching the bar for you" : "Load released. Re-arm to continue"}</p>
              </div>
            </div>

            <FormGuide name={exercise} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <section className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
                <h3 className="font-bold">Left and right balance</h3>
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-orange-400">Left {leftBalance}%</span>
                    <span className="text-sky-400">Right {rightBalance}%</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden flex">
                    <div className="bg-orange-500 h-full transition-all duration-200" style={{ width: `${leftBalance}%` }} />
                    <div className="bg-sky-400 h-full transition-all duration-200" style={{ width: `${rightBalance}%` }} />
                  </div>
                </div>
                <p className={`text-sm font-semibold ${asymmetry <= ASYMMETRY_LIMIT ? "text-emerald-400" : "text-amber-400"}`}>
                  {asymmetry <= ASYMMETRY_LIMIT ? "Nicely balanced" : `One side is working harder (${asymmetry}% gap)`}
                </p>
              </section>

              <section className="lg:col-span-3 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                  <h2 className="font-bold">Live movement - {exercise}</h2>
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <Legend color="#f97316" label="Load (kg)" />
                    <Legend color="#38bdf8" label="Speed (m/s)" />
                    {wearable && <Legend color="#fb7185" label="Heart rate" />}
                  </div>
                </div>
                <div className="h-56 w-full min-w-0">
                  {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="time" stroke="#71717a" fontSize={10} unit="s" />
                        <YAxis yAxisId="load" stroke="#fb923c" fontSize={10} domain={[0, "auto"]} />
                        <YAxis yAxisId="vel" orientation="right" stroke="#38bdf8" fontSize={10} domain={[0, 1]} />
                        <YAxis yAxisId="hr" hide domain={[60, 200]} />
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px", fontSize: "12px" }} />
                        <Line yAxisId="load" type="monotone" dataKey="load" name="Load (kg)" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line yAxisId="vel" type="monotone" dataKey="velocity" name="Speed (m/s)" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                        {wearable && <Line yAxisId="hr" type="monotone" dataKey="heartRate" name="Heart rate (bpm)" stroke="#fb7185" strokeWidth={1.5} strokeDasharray="3 3" dot={false} connectNulls isAnimationActive={false} />}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full border border-dashed border-zinc-700 rounded-xl flex items-center justify-center text-zinc-500 text-sm text-center px-4">
                      Press Start set and begin your first rep.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <h3 className="font-bold mb-3">Set {currentSet} reps</h3>
              {repHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="text-zinc-500 border-b border-zinc-800">
                      <tr><th className="p-2">Rep</th><th className="p-2">Peak force</th><th className="p-2">Peak speed</th><th className="p-2">Time</th><th className="p-2">Peak power</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {repHistory.map((r) => (
                        <tr key={r.repNum}>
                          <td className="p-2 font-bold text-orange-400">{r.repNum}</td>
                          <td className="p-2">{r.peakForce} kg</td>
                          <td className="p-2">{r.peakVelocity} m/s</td>
                          <td className="p-2">{r.duration} s</td>
                          <td className="p-2 font-semibold text-amber-400">{r.peakPower} W</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 py-2">No reps yet. Your reps appear here as you lift.</p>
              )}
            </section>
          </div>
        )}
      </div>

      {summary && (
        <div className="fixed inset-0 z-30 bg-black/70 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-2xl font-extrabold flex items-center gap-2"><Trophy className="h-6 w-6 text-amber-400" /> Workout done</h2>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Sets" value={String(summary.s.sets)} />
              <Stat label="Reps" value={String(summary.s.reps)} />
              <Stat label="Volume" value={`${summary.s.volume} kg`} />
              <Stat label="Peak power" value={`${summary.s.peakPower} W`} />
            </div>
            {summary.prs.length > 0 && <p className="text-amber-300 text-sm font-semibold">New personal best: {summary.prs.join(", ")}</p>}
            <div className="text-sm text-zinc-300 space-y-1">
              <p className="font-bold">Cool down now</p>
              <ul className="list-disc pl-5 space-y-1">{(INFO[summary.s.focus] ?? INFO.All).actions.map((a) => <li key={a}>{a}</li>)}</ul>
              <p className="font-bold pt-2">Eat and drink</p>
              <ul className="list-disc pl-5 space-y-1">{(INFO[summary.s.focus] ?? INFO.All).diet.map((a) => <li key={a}>{a}</li>)}</ul>
            </div>
            <button onClick={() => setSummary(null)} className="w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold rounded-xl py-3">Done</button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ----------------------------- Workouts page ----------------------------- */

function WorkoutsPage({ user, onStart }: { user: Profile; onStart: (e: Exercise) => void }) {
  const mine = GOAL_GROUP[user.goal] ?? "Chest";
  const [group, setGroup] = useState(mine);
  const [q, setQ] = useState("");
  const list = LIBRARY.filter((e) => (group === "All" || e.group === group) && e.name.toLowerCase().includes(q.trim().toLowerCase()));
  const info = INFO[group] ?? INFO.All;
  const modeLabel = (m: TrainingMode) => MODES.find((x) => x.id === m)?.label ?? m;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Workouts</h2>
        <p className="text-zinc-400 text-sm mt-1">
          {LIBRARY.length} exercises for this machine. Opened on {mine} for your goal ({user.goal.toLowerCase()}). Loads start from your recent lifts.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {["All", ...GROUPS].map((g) => (
          <button key={g} onClick={() => setGroup(g)} aria-pressed={group === g}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition ${group === g ? "bg-orange-500 text-zinc-950 border-orange-500" : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500"}`}>
            {g} ({g === "All" ? LIBRARY.length : LIBRARY.filter((e) => e.group === g).length})
          </button>
        ))}
        <label className="relative ml-auto">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search exercises"
            className="bg-zinc-900 border border-zinc-700 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-orange-500 w-40" />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((e) => (
          <article key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <ExPhoto ex={e} />
            <div>
              <h3 className="text-lg font-bold">{e.name}</h3>
              <p className="text-sm text-zinc-400">{e.muscles}</p>
            </div>
            <p className="text-sm text-zinc-300 flex-1">{e.how}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1">Start at <b className="text-orange-400">{loadFor(user, e)} kg</b></span>
              <span className="bg-sky-400/10 text-sky-300 rounded-lg px-2.5 py-1">{modeLabel(e.mode)}</span>
            </div>
            <button onClick={() => onStart(e)} className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold rounded-xl py-3 flex items-center justify-center gap-2">
              <Play className="h-4 w-4 fill-current" /> Start this workout
            </button>
          </article>
        ))}
        {list.length === 0 && <p className="text-zinc-500 text-sm">No exercises match your search.</p>}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold mb-3">Eat and drink after {group === "All" ? "training" : group.toLowerCase()}</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-zinc-300">{info.diet.map((d) => <li key={d}>{d}</li>)}</ul>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold mb-3">Do next</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-zinc-300">{info.actions.map((d) => <li key={d}>{d}</li>)}</ul>
        </div>
        <p className="md:col-span-2 text-xs text-zinc-500">General guidance only. If you have allergies, an injury or a medical condition, check with a doctor or coach. Exercise photos are from the Bodycraft exercise guide.</p>
      </section>
    </div>
  );
}

/* ------------------------------ Progress page ------------------------------ */

type MetricKey = "volume" | "power" | "load" | "sessions";
const METRICS: Record<MetricKey, { label: string; unit: string }> = {
  volume: { label: "Weekly volume", unit: "kg" },
  power: { label: "Peak power", unit: "W" },
  load: { label: "Top load", unit: "kg" },
  sessions: { label: "Sessions", unit: "" },
};

function ProgressPage({ user, all, logged, goal, onGoal, crew }: {
  user: Profile; all: Session[]; logged: Session[]; goal: number; onGoal: (g: number) => void;
  crew: { u: Profile; v: number }[];
}) {
  const [metric, setMetric] = useState<MetricKey>("volume");
  const now = Date.now();

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const w = 7 - i;
    const inW = all.filter((s) => Math.floor((now - s.t) / WEEK) === w);
    return {
      label: w === 0 ? "This wk" : `${w}w ago`,
      volume: inW.reduce((a, s) => a + s.volume, 0),
      power: Math.max(0, ...inW.map((s) => s.peakPower)),
      load: Math.max(0, ...inW.map((s) => s.topLoad)),
      sessions: inW.length,
    };
  });
  const cur = weeks[7];
  const prev = weeks[6];
  const volDelta = prev.volume ? Math.round(((cur.volume - prev.volume) / prev.volume) * 100) : 0;
  let streak = 0;
  for (let i = weeks[7].sessions >= goal ? 7 : 6; i >= 0 && weeks[i].sessions >= goal; i--) streak++;

  const est = (l: SetLog) => l.load * (1 + l.reps / 30);
  const records = Object.values(
    logged.flatMap((s) => s.log ?? []).reduce<Record<string, SetLog>>((m, l) => {
      if (!m[l.exercise] || est(l) > est(m[l.exercise])) m[l.exercise] = l;
      return m;
    }, {})
  ).sort((a, b) => est(b) - est(a)).slice(0, 6);

  const month = all.filter((s) => now - s.t < 4 * WEEK);
  const balance = GROUPS.slice(0, 6).map((g) => ({ g, n: month.filter((s) => s.focus === g).length }));
  const maxBal = Math.max(1, ...balance.map((b) => b.n));
  const recent = [...all].sort((a, b) => b.t - a.t).slice(0, 5);
  const topCrew = Math.max(1, ...crew.map((c) => c.v));
  const m = METRICS[metric];

  return (
    <div className="space-y-5">
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">{user.name}</h2>
          <p className="text-sm text-zinc-400">Goal: {user.goal}</p>
        </div>
        <div className="min-w-[240px] flex-1 max-w-sm">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-zinc-400">Sessions this week</span>
            <b className={cur.sessions >= goal ? "text-emerald-400" : "text-orange-400"}>{cur.sessions} / {goal}</b>
          </div>
          <div className="h-3 bg-zinc-950 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${cur.sessions >= goal ? "bg-emerald-400" : "bg-orange-500"}`} style={{ width: `${Math.min(100, (cur.sessions / goal) * 100)}%` }} />
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
            Weekly goal:
            {[2, 3, 4, 5, 6].map((g) => (
              <button key={g} onClick={() => onGoal(g)} aria-pressed={goal === g}
                className={`h-6 w-6 rounded-md font-bold ${goal === g ? "bg-orange-500 text-zinc-950" : "bg-zinc-950 text-zinc-400"}`}>{g}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card title="Volume this week" icon={<Zap className="h-4 w-4 text-orange-400" />} foot={`${volDelta >= 0 ? "+" : ""}${volDelta}% vs last week`}>{cur.volume} <Unit>kg</Unit></Card>
        <Card title="Best power" icon={<Timer className="h-4 w-4 text-amber-400" />} foot="Last 8 weeks">{Math.max(...weeks.map((w) => w.power))} <Unit>W</Unit></Card>
        <Card title="Top load" icon={<Dumbbell className="h-4 w-4 text-sky-400" />} foot="Last 8 weeks">{Math.max(...weeks.map((w) => w.load))} <Unit>kg</Unit></Card>
        <Card title="Goal streak" icon={<Flame className="h-4 w-4 text-rose-400" />} foot="Weeks in a row hitting your goal">{streak} <Unit>wk</Unit></Card>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(METRICS) as MetricKey[]).map((k) => (
            <button key={k} onClick={() => setMetric(k)} aria-pressed={metric === k}
              className={`px-4 py-2 rounded-xl text-sm font-bold border ${metric === k ? "bg-orange-500 text-zinc-950 border-orange-500" : "bg-zinc-950 text-zinc-300 border-zinc-700"}`}>
              {METRICS[k].label}
            </button>
          ))}
        </div>
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeks} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} domain={[0, "auto"]} width={55} unit={m.unit ? ` ${m.unit}` : ""} />
              <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey={metric} name={m.label} stroke="#f97316" strokeWidth={3} dot isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-400" /> Personal records</h3>
          {records.length ? (
            <ul className="space-y-2 text-sm">
              {records.map((r) => (
                <li key={r.exercise} className="flex justify-between border-b border-zinc-800 pb-2">
                  <span>{r.exercise}</span><b className="text-orange-400">{r.load} kg x {r.reps}</b>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-zinc-500">Finish a workout on the Train page to set your first records.</p>}
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold mb-1">Training balance</h3>
          <p className="text-xs text-zinc-500 mb-3">Sessions per muscle group, last 4 weeks. Gaps show what to train next.</p>
          <ul className="space-y-2">
            {balance.map((b) => (
              <li key={b.g} className="flex items-center gap-3 text-sm">
                <span className="w-20 text-zinc-300">{b.g}</span>
                <div className="flex-1 h-2.5 bg-zinc-950 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: `${(b.n / maxBal) * 100}%` }} />
                </div>
                <span className="w-5 text-right text-zinc-400">{b.n}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h3 className="font-bold mb-3">Recent sessions</h3>
        <ul className="divide-y divide-zinc-800 text-sm">
          {recent.map((s) => (
            <li key={s.t} className="py-2.5 flex flex-wrap justify-between gap-2">
              <span className="font-semibold">{s.focus} <span className="text-zinc-500 font-normal">- {new Date(s.t).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</span></span>
              <span className="text-zinc-400">{s.sets} sets, {s.reps} reps, {s.volume} kg, {s.minutes} min</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3 text-zinc-300">Gym crew - volume this week</h3>
        <ul className="space-y-2">
          {crew.map(({ u, v }) => (
            <li key={u.name} className="flex items-center gap-3 text-xs">
              <span className={`w-28 truncate ${u.name === user.name ? "font-bold text-white" : "text-zinc-400"}`}>{u.name}</span>
              <div className="flex-1 h-2 bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(v / topCrew) * 100}%`, backgroundColor: u.color }} />
              </div>
              <span className="w-16 text-right text-zinc-400">{v} kg</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------------------------- Small components ---------------------------- */

function Card({ title, icon, foot, children }: { title: string; icon: React.ReactNode; foot?: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
      <div className="flex justify-between items-center text-zinc-400 text-sm"><span>{title}</span>{icon}</div>
      <div className="text-3xl font-extrabold mt-2">{children}</div>
      {foot && <p className="text-xs text-zinc-500 mt-1">{foot}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );
}

function Unit({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-normal text-zinc-400">{children}</span>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /> {label}
    </span>
  );
}