import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Quais produtos custam menos de R$ 300?",
  "Quais acessórios temos?",
  "Qual é o produto mais barato?",
  "Quais produtos você recomenda?",
];

export function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitMessage(userMessage: string) {
    const trimmedMessage = userMessage.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const history = messages.slice(-20);

    const userEntry: Message = {
      role: "user",
      content: trimmedMessage,
    };

    setMessages((current) => [
      ...current,
      userEntry,
    ]);

    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/chat", {
        message: trimmedMessage,
        history,
      });

      const assistantResponse =
        data.response ??
        data.message ??
        "Não recebi uma resposta válida do assistente.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: assistantResponse,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Não consegui processar sua pergunta.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(
    e: React.FormEvent
  ) {
    e.preventDefault();

    await submitMessage(input);
  }

  return (
    <div className="chat-page">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand">
            <span className="brand-ai">
              AI
            </span>
            <span>Commerce</span>
          </div>

          <nav className="topbar-tabs">
            <button
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Produtos
            </button>

            <button className="active">
              Assistente IA
            </button>
          </nav>
        </div>

        <div className="user-menu">
          <div className="avatar">
            {user?.name?.[0]?.toUpperCase() ||
              "A"}
          </div>

          <div className="user-meta">
            <strong>
              {user?.name || "Admin"}
            </strong>

            <span>{user?.email}</span>
          </div>
        </div>
      </header>

      <main className="chat-shell">
        <aside className="chat-sidebar">
          <span className="eyebrow">
            ASSISTENTE
          </span>

          <h2>
            Converse com
            <br />
            seu catálogo
          </h2>

          <p>
            Consulte preços, categorias e
            produtos usando linguagem natural.
          </p>

          <div className="sidebar-info">
            <span>
              ✓ Dados reais do catálogo
            </span>
            <span>
              ✓ Isolamento por empresa
            </span>
            <span>✓ Consulta via IA</span>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              className="clear-chat"
              onClick={() =>
                setMessages([])
              }
            >
              Nova conversa
            </button>
          )}
        </aside>

        <section className="chat-container">
          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-chat">
                <div className="ai-orb">
                  ✦
                </div>

                <h1>
                  Como posso ajudar?
                </h1>

                <p>
                  Pergunte sobre seus produtos,
                  categorias ou faixas de preço.
                </p>

                <div className="suggestions">
                  {suggestions.map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() =>
                          submitMessage(
                            suggestion
                          )
                        }
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {messages.map(
              (message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`message ${message.role}`}
                >
                  {message.content}
                </div>
              )
            )}

            {loading && (
              <div className="message assistant">
                Consultando o catálogo...
              </div>
            )}
          </div>

          <form
            className="chat-form"
            onSubmit={sendMessage}
          >
            <input
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder="Pergunte sobre seus produtos..."
            />

            <button
              type="submit"
              disabled={
                loading || !input.trim()
              }
            >
              {loading
                ? "Consultando..."
                : "Enviar"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}