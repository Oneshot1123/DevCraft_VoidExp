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

function Login({ onLogin, onBack }: { onLogin: (token: string, role: string) => void, onBack: () => void }) {
  const [email, setEmail] = useState("citizen@example.com");
  const [password, setPassword] = useState("password123");
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
      onLogin(data.access_token, data.role);
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
              <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="citizen@example.com" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {err && <p className="text-sm text-red-500 font-medium text-center">{err}</p>}
            <Button type="submit" className="w-full h-11 text-base font-semibold">Sign In</Button>
            <div className="pt-4 mt-4 border-t text-center space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Demo Credentials</p>
              <div className="flex justify-between text-[10px] text-muted-foreground px-4">
                <span>Citizen: citizen@example.com</span>
                <span>password123</span>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground px-4">
                <span>Admin: admin@city.gov</span>
                <span>adminpassword</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role") || "citizen");
  const [view, setView] = useState<"landing" | "login">("landing");

  const handleLogin = (newToken: string, newRole: string) => {
    setToken(newToken);
    setRole(newRole);
  };

  if (!token) {
    if (view === "landing") return <LandingPage onGetStarted={() => setView("login")} />;
    return <Login onLogin={handleLogin} onBack={() => setView("landing")} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground">
        <nav className="border-b sticky top-0 bg-background/80 backdrop-blur-xl z-50">
          <div className="flex h-16 items-center px-6 container mx-auto">
            <div className="font-extrabold text-2xl mr-12 bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">CivicSense</div>
            <div className="flex gap-8 text-sm font-semibold">
              {role === 'citizen' ? (
                <>
                  <Link to="/" className="transition-all hover:text-blue-600">New Report</Link>
                  <Link to="/status" className="transition-all hover:text-blue-600">My Feed</Link>
                </>
              ) : (
                <Link to="/admin" className="transition-all hover:text-blue-600 border-b-2 border-blue-600 pb-1">Admin Dashboard</Link>
              )}
            </div>
            <div className="ml-auto flex items-center gap-6">
              <Badge variant="secondary" className="capitalize px-4 py-1 font-mono text-[10px] tracking-widest bg-blue-50 text-blue-700">
                {role.replace('_', ' ')}
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
