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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      login(data.token, data.user);
      navigate("/dashboard");
    } catch {
      setError("Email ou senha inválidos");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Entrar</h1>
        <p>Acesse sua empresa</p>

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />

        <label>Senha</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />

        {error && <span className="error">{error}</span>}

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}