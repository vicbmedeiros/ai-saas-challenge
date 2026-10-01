
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@techstore.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      login(data.token, data.user);
      navigate("/dashboard");
    } catch {
      setError("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-shell">
        <div className="auth-intro">
          <div className="brand">
            <span className="brand-ai">AI</span>
            <span>Commerce</span>
          </div>

          <div className="auth-copy">
            <span className="eyebrow">CATÁLOGO INTELIGENTE</span>
            <h1>
              Seus produtos,
              <br />
              acessíveis por IA.
            </h1>

            <p>
              Gerencie o catálogo da sua empresa e consulte
              informações reais usando linguagem natural.
            </p>
          </div>

          <div className="auth-features">
            <div><span>01</span> Gestão de produtos</div>
            <div><span>02</span> Assistente com IA</div>
            <div><span>03</span> Ambiente multi-tenant</div>
          </div>
        </div>

        <div className="auth-panel">
          <form className="auth-card" onSubmit={handleSubmit}>
            <span className="eyebrow">BEM-VINDO</span>
            <h2>Entrar</h2>
            <p>Acesse o ambiente da sua empresa.</p>

            <label>
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
              />
            </label>

            <label>
              Senha
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </label>

            {error && <span className="error">{error}</span>}

            <button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <span className="auth-demo">Ambiente de demonstração</span>
          </form>
        </div>
      </section>
    </div>
  );
}
