import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { refresh } = useAuth();
  const { t } = useLang();
  const loginMutation = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await loginMutation.mutateAsync({ data: form });
      refresh();
      navigate("/");
    } catch {
      setError(t.invalidCredentials);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t.welcomeBack}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.signInToAccount}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">{t.email}</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" required />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">{t.password}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" required />
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loginMutation.isPending}
            className="w-full bg-primary text-white font-semibold py-2.5 rounded-full hover:bg-primary/90 transition disabled:opacity-60">
            {loginMutation.isPending ? t.signingIn : t.signIn}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {t.noAccount}{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">{t.register}</Link>
        </p>
      </div>
    </div>
  );
}
