import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = input.trim();

    setMessages((current) => [
      ...current,
      { role: "user", content: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/chat", {
        message: userMessage,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Não consegui processar sua pergunta.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-page">
      <header className="topbar">
        <div>
          <strong>AI Commerce</strong>
          <span>Assistente de produtos</span>
        </div>

        <button onClick={() => navigate("/dashboard")}>
          Voltar aos produtos
        </button>
      </header>

      <main className="chat-container">
        <div className="chat-header">
          <h1>Assistente IA</h1>
          <p>
            Pergunte sobre produtos, categorias ou faixas de preço.
          </p>
        </div>

        <div className="messages">
          {messages.length === 0 && (
            <div className="empty-chat">
              Experimente perguntar:
              <br />
              “Quais produtos custam menos de R$ 300?”
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role}`}
            >
              {message.content}
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              Buscando produtos...
            </div>
          )}
        </div>

        <form className="chat-form" onSubmit={sendMessage}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta..."
          />

          <button type="submit" disabled={loading}>
            Enviar
          </button>
        </form>
      </main>
    </div>
  );
}