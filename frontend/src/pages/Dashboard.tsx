import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function openCreateModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      imageUrl: product.imageUrl,
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
  }

  function updateField(field: keyof ProductForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        imageUrl: form.imageUrl.trim(),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post("/products", payload);
      }

      await loadProducts();
      closeModal();
    } catch {
      setError("Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Deseja excluir "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${product._id}`);
      await loadProducts();
    } catch {
      window.alert("Não foi possível excluir o produto.");
    }
  }

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div>
          <strong>AI Commerce</strong>
          <span>{user?.email}</span>
        </div>

        <nav>
          <button onClick={() => navigate("/chat")}>Chat IA</button>
          <button onClick={handleLogout}>Sair</button>
        </nav>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <h1>Produtos</h1>
            <p>Produtos disponíveis para sua empresa.</p>
          </div>

          {user?.role === "admin" && (
            <button
              className="primary-button"
              onClick={openCreateModal}
            >
              + Novo produto
            </button>
          )}
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product._id}>
                <img src={product.imageUrl} alt={product.name} />

                <div className="product-card-content">
                  <span className="category">{product.category}</span>

                  <h2>{product.name}</h2>

                  <p>{product.description}</p>

                  <strong>
                    {product.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>

                  {user?.role === "admin" && (
                    <div className="product-actions">
                      <button onClick={() => openEditModal(product)}>
                        Editar
                      </button>

                      <button onClick={() => handleDelete(product)}>
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingProduct ? "Editar produto" : "Novo produto"}
                </h2>
                <p>
                  {editingProduct
                    ? "Atualize os dados do produto."
                    : "Cadastre um novo produto para sua empresa."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
              <label>
                Nome
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </label>

              <label>
                Descrição
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Preço
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    required
                  />
                </label>

                <label>
                  Categoria
                  <input
                    value={form.category}
                    onChange={(e) =>
                      updateField("category", e.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <label>
                URL da imagem
                <input
                  value={form.imageUrl}
                  onChange={(e) =>
                    updateField("imageUrl", e.target.value)
                  }
                  required
                />
              </label>

              {error && <span className="error">{error}</span>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Salvando..."
                    : editingProduct
                    ? "Salvar alterações"
                    : "Criar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}