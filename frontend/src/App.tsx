import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import ComplaintForm from './pages/ComplaintForm';
import ComplaintStatus from './pages/ComplaintStatus';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import { LocalizationProvider, useLocalization } from './context/LocalizationContext';
import type { Language } from './utils/translations';
import { motion } from 'framer-motion';
import { Zap, LogOut, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

function Login({ onLogin, onBack }: { onLogin: (token: string, role: string, dept: string) => void, onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Incorrect keys/credentials");
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("department", data.department || "");
      onLogin(data.access_token, data.role, data.department || "");
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message);
      else setErr("Access Denied");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground neural-noise selection:bg-primary/20">
      <div className="fixed inset-0 z-0 mesh-gradient opacity-60 pointer-events-none" />
      <Button
        variant="ghost"
        className="fixed top-8 left-8 text-[9px] font-black uppercase tracking-[0.4em] z-20 text-primary hover:text-primary/70"
        onClick={onBack}
      >
        ← Return to Origin
      </Button>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm z-10">
        <Card className="glass-card border-none rounded-3xl overflow-hidden shadow-xl bg-card">
          <CardHeader className="space-y-4 py-12 border-b border-border bg-primary items-center">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-2 shadow-lg rotate-12">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-4xl font-black tracking-tighter text-white uppercase italic">Initialize</CardTitle>
            <p className="text-center text-[10px] font-black text-blue-100/60 uppercase tracking-[0.3em]">Authorized Access Only</p>
          </CardHeader>
          <CardContent className="p-10 pt-12 space-y-8">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="login-email" className="text-[9px] font-black uppercase tracking-[0.2em] text-primary pl-1">Registry Email</Label>
                <Input id="login-email" data-testid="login-email" className="h-16 rounded-2xl border-border bg-muted focus:ring-2 focus:ring-primary text-sm font-bold tracking-tight" value={email} onChange={e => setEmail(e.target.value)} placeholder="officer@civic.gov" type="email" required />
              </div>
              <div className="space-y-3">
                <Label htmlFor="login-password" className="text-[9px] font-black uppercase tracking-[0.2em] text-primary pl-1">Security Key</Label>
                <Input id="login-password" data-testid="login-password" type="password" className="h-16 rounded-2xl border-border bg-muted focus:ring-2 focus:ring-primary text-sm font-bold tracking-tight" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {err && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest text-center italic">{err}</p>}
              <Button id="login-submit" data-testid="login-submit" type="submit" className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-lg transition-all">
                Initialize Session
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function Register({ onRegister, onBack }: { onRegister: () => void, onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registry Update Failed");
      }
      onRegister();
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message);
      else setErr("Registration Inhibited");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground neural-noise selection:bg-primary/20">
      <div className="fixed inset-0 z-0 mesh-gradient opacity-60 pointer-events-none" />
      <Button
        variant="ghost"
        className="fixed top-8 left-8 text-[9px] font-black uppercase tracking-[0.4em] z-20 text-primary hover:text-primary/70"
        onClick={onBack}
      >
        ← Return
      </Button>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm z-10">
        <Card className="glass-card border-none rounded-3xl overflow-hidden shadow-xl bg-card">
          <CardHeader className="space-y-4 py-12 border-b border-border bg-primary items-center">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-2 shadow-lg -rotate-6">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-4xl font-black tracking-tighter text-white uppercase italic">Registry</CardTitle>
            <p className="text-center text-[10px] font-black text-blue-100/60 uppercase tracking-[0.3em]">New Citizen Enrollment</p>
          </CardHeader>
          <CardContent className="p-10 pt-12 space-y-8">
            <form onSubmit={handleRegister} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="reg-email" className="text-[9px] font-black uppercase tracking-[0.2em] text-primary pl-1">Email Identity</Label>
                <Input id="reg-email" data-testid="reg-email" className="h-16 rounded-2xl border-border bg-muted focus:ring-2 focus:ring-primary text-sm font-bold tracking-tight" value={email} onChange={e => setEmail(e.target.value)} placeholder="citizen@civic.net" type="email" required />
              </div>
              <div className="space-y-3">
                <Label htmlFor="reg-password" className="text-[9px] font-black uppercase tracking-[0.2em] text-primary pl-1">Access Passcode</Label>
                <Input id="reg-password" data-testid="reg-password" type="password" className="h-16 rounded-2xl border-border bg-muted focus:ring-2 focus:ring-primary text-sm font-bold tracking-tight" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {err && <p className="text-[10px] text-destructive font-bold uppercase tracking-widest text-center italic">{err}</p>}
              <Button id="reg-submit" data-testid="reg-submit" type="submit" disabled={loading} className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-lg transition-all">
                {loading ? "INITIALIZING..." : "Enact Registry"}
              </Button>
              <button type="button" onClick={onBack} className="w-full text-[9px] font-black text-primary hover:text-primary/70 uppercase tracking-widest text-center">
                Already Enlisted? Return to Origin
              </button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role") || "citizen");
  const [, setDepartment] = useState(localStorage.getItem("department") || "");
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const { setLanguage, language } = useLocalization();
  const navigate = useNavigate();

  // Define route protection components
  const CitizenRoute = ({ children }: { children: React.ReactNode }) => {
    if (!token) return <Navigate to="/login" state={{ from: '/report' }} replace />;
    if (role !== 'citizen') return <Navigate to="/admin" replace />;
    return <>{children}</>;
  };

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!token) return <Navigate to="/login" replace />;
    if (role !== 'city_admin' && role !== 'officer') return <Navigate to="/report" replace />;
    return <>{children}</>;
  };

  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    if (token) return <Navigate to={role === 'citizen' ? "/report" : "/admin"} replace />;
    return <>{children}</>;
  };

  const handleLogin = (newToken: string, newRole: string, newDept: string) => {
    setToken(newToken);
    setRole(newRole);
    setDepartment(newDept);
    if (redirectPath) {
      navigate(redirectPath);
      setRedirectPath(null);
    } else {
      navigate(newRole === 'citizen' ? '/report' : '/admin');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("department");
    setToken(null);
    setRedirectPath(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 neural-noise overflow-hidden">
      <div className="fixed inset-0 z-0 mesh-gradient opacity-30 pointer-events-none" />

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-24 bg-primary text-white border-b border-primary/20">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg rotate-12">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic translate-y-[1px]">CivicSense</span>
          </Link>
          <div className="hidden md:flex gap-10">
            {role === 'citizen' ? (
              <>
                <Link to="/report" className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100 hover:text-white transition-colors">Dispatch Report</Link>
                <Link to="/status" className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100 hover:text-white transition-colors">Sector Pulse</Link>
              </>
            ) : (
              <Link to="/admin" className="text-[10px] font-black uppercase tracking-[0.3em] text-white underline decoration-2 underline-offset-8">Executive Oversight</Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex bg-white/10 p-1.5 rounded-xl border border-white/10 gap-1.5 backdrop-blur-md">
            {(['en', 'hi', 'mr'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-3 py-1 text-[8px] font-black rounded-lg transition-all ${language === l ? 'bg-white text-primary shadow-lg' : 'text-blue-200 hover:text-white'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <Badge variant="outline" className="h-10 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest border-white/20 text-white flex gap-2">
              <User className="w-3 h-3 text-blue-200" /> {role.replace('_', ' ')}
            </Badge>
            <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 min-h-screen pt-24">
        <Routes>
          <Route path="/" element={<LandingPage
            onGetStarted={() => navigate(token ? (role === 'citizen' ? '/report' : '/admin') : '/signup')}
            onLogin={() => navigate('/login')}
            onTrack={() => {
              if (token) {
                navigate('/status');
              } else {
                setRedirectPath("/status");
                navigate('/login');
              }
            }}
            isAuthenticated={!!token}
            userRole={role}
          />} />
          <Route path="/login" element={<AuthRoute><Login onLogin={handleLogin} onBack={() => navigate('/')} /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Register onRegister={() => navigate('/login')} onBack={() => navigate('/')} /></AuthRoute>} />
          <Route path="/report" element={<CitizenRoute><ComplaintForm /></CitizenRoute>} />
          <Route path="/status" element={<CitizenRoute><ComplaintStatus /></CitizenRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function Root() {
  return (
    <Router>
      <LocalizationProvider>
        <App />
      </LocalizationProvider>
    </Router>
  );
}
