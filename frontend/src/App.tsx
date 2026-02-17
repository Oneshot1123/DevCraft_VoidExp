import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ComplaintForm from './pages/ComplaintForm';
import ComplaintStatus from './pages/ComplaintStatus';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';

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
      if (!res.ok) throw new Error("Incorrect email or password");
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("department", data.department || "");
      onLogin(data.access_token, data.role, data.department || "");
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message);
      else setErr("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      <Button variant="ghost" className="absolute top-8 left-8" onClick={onBack}>← Back to Home</Button>
      <Card className="w-full max-w-sm shadow-2xl border-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CivicSense</CardTitle>
          <p className="text-center text-sm text-muted-foreground italic">Sign in to your portal</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {err && <p className="text-sm text-red-500 font-medium text-center">{err}</p>}
            <Button type="submit" className="w-full h-11 text-base font-semibold">Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Register({ onRegister, onBack }: { onRegister: () => void, onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [department, setDepartment] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const departments = ["sanitation", "roads", "water", "electricity", "safety", "traffic", "general"];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, department: role === 'officer' ? department : null })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registration failed");
      }
      onRegister();
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message);
      else setErr("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative p-4">
      <Button variant="ghost" className="absolute top-8 left-8" onClick={onBack}>← Back</Button>
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Join CivicSense</CardTitle>
          <p className="text-center text-sm text-muted-foreground italic">Create your municipal account</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>Account Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={role === 'citizen' ? 'default' : 'outline'}
                  onClick={() => setRole('citizen')}
                  className="h-10"
                >Citizen</Button>
                <Button
                  type="button"
                  variant={role === 'officer' ? 'default' : 'outline'}
                  onClick={() => setRole('officer')}
                  className="h-10"
                >Officer</Button>
              </div>
            </div>
            {role === 'officer' && (
              <div className="grid gap-2">
                <Label htmlFor="dept">Department</Label>
                <select
                  id="dept"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                </select>
              </div>
            )}
            {err && <p className="text-sm text-red-500 font-medium text-center">{err}</p>}
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
              {loading ? "Creating account..." : "Register Account"}
            </Button>
            <p className="text-center text-xs text-muted-foreground pt-2">
              Already have an account? <button type="button" onClick={onBack} className="text-blue-600 font-bold hover:underline">Sign In</button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role") || "citizen");
  const [department, setDepartment] = useState(localStorage.getItem("department") || "");
  const [view, setView] = useState<"landing" | "login" | "signup">("landing");

  const handleLogin = (newToken: string, newRole: string, newDept: string) => {
    setToken(newToken);
    setRole(newRole);
    setDepartment(newDept);
  };

  if (!token) {
    if (view === "landing") return <LandingPage
      onGetStarted={() => setView("signup")}
      onLogin={() => setView("login")}
    />;
    if (view === "signup") return <Register onRegister={() => setView("login")} onBack={() => setView("login")} />;
    return <Login onLogin={handleLogin} onBack={() => setView("landing")} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground">
        <nav className="border-b sticky top-0 bg-background/80 backdrop-blur-xl z-50">
          <div className="flex h-16 items-center px-6 container mx-auto">
            <div className="font-extrabold text-2xl mr-12 bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">CivicSense</div>
            <div className="flex gap-8 text-sm font-semibold">
              {role === 'citizen' && (
                <>
                  <Link to="/" className="transition-all hover:text-blue-600">New Report</Link>
                  <Link to="/status" className="transition-all hover:text-blue-600">My Feed</Link>
                </>
              )}
              {role !== 'citizen' && (
                <Link to="/admin" className="transition-all hover:text-blue-600 border-b-2 border-blue-600 pb-1">Admin Dashboard</Link>
              )}
            </div>
            <div className="ml-auto flex items-center gap-6">
              <Badge variant="secondary" className="capitalize px-4 py-1 font-mono text-[10px] tracking-widest bg-blue-50 text-blue-700">
                {role.replace('_', ' ')} {department && `(${department})`}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                setToken(null);
                setView("landing");
              }}>Logout</Button>
            </div>
          </div>
        </nav>

        <main className="min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<ComplaintForm />} />
            <Route path="/status" element={<ComplaintStatus />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
