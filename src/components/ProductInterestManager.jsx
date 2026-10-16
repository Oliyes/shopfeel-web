import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const categories = [
  ["", "Sem categoria"],
  ["Tecnologia", "💻 Tecnologia"],
  ["Moda", "👕 Moda"],
  ["Beleza", "✨ Beleza"],
  ["Casa", "🏠 Casa"],
  ["Livros", "📚 Livros"],
  ["Games", "🎮 Games"],
];

export default function ProductInterestManager() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  async function loadProducts() {
    try {
      setLoading(true);
      setMessage("");

      const data = await apiRequest("/api/admin/products");
      setProducts(data.products || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateCategory(productId, value) {
    try {
      setSavingId(productId);
      setMessage("");

      const data = await apiRequest(
        `/api/admin/products/${productId}/interest-category`,
        {
          method: "PATCH",
          body: JSON.stringify({
            interest_category: value || null,
          }),
        }
      );

      setProducts((current) =>
        current.map((product) =>
          Number(product.id) === Number(productId)
            ? data.product
            : product
        )
      );

      setMessage("Categoria salva. O mobile já usará esse filtro.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={styles.floatingButton}
        title="Gerenciar categorias de interesse"
      >
        🏷️ Categorias
      </button>

      {open && (
        <div style={styles.overlay}>
          <section style={styles.modal}>
            <header style={styles.header}>
              <div>
                <span style={styles.kicker}>PERSONALIZAÇÃO</span>
                <h2 style={styles.title}>Categorias de interesse</h2>
                <p style={styles.description}>
                  Defina a categoria de cada produto. Essa informação é usada no mobile para filtrar as recomendações conforme os interesses escolhidos pelo usuário.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                style={styles.closeButton}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>

            {message && (
              <div style={styles.message}>{message}</div>
            )}

            {loading ? (
              <p style={styles.loading}>Carregando produtos...</p>
            ) : products.length === 0 ? (
              <p style={styles.loading}>Nenhum produto cadastrado.</p>
            ) : (
              <div style={styles.list}>
                {products.map((product) => (
                  <article key={product.id} style={styles.row}>
                    <div style={styles.productInfo}>
                      <strong style={styles.productName}>
                        {product.name}
                      </strong>
                      <small style={styles.storeName}>
                        {product.store_name || "Loja não informada"}
                      </small>
                    </div>

                    <select
                      value={product.interest_category || ""}
                      disabled={savingId === product.id}
                      onChange={(event) =>
                        updateCategory(product.id, event.target.value)
                      }
                      style={styles.select}
                    >
                      {categories.map(([value, label]) => (
                        <option key={value || "none"} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </article>
                ))}
              </div>
            )}

            <div style={styles.tip}>
              <strong>Dica:</strong> tente classificar todos os produtos ativos para que o filtro de interesses fique mais preciso.
            </div>
          </section>
        </div>
      )}
    </>
  );
}

const styles = {
  floatingButton: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 30,
    border: "none",
    borderRadius: 999,
    padding: "13px 18px",
    background: "#9B5DE5",
    color: "#FFFFFF",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(83, 52, 116, 0.28)",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    background: "rgba(45, 41, 38, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    width: "min(760px, 100%)",
    maxHeight: "86vh",
    overflow: "auto",
    background: "#FFFDF9",
    borderRadius: 24,
    padding: 26,
    boxShadow: "0 24px 70px rgba(45, 41, 38, 0.25)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
  },
  kicker: {
    color: "#9B5DE5",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 800,
  },
  title: {
    margin: "6px 0 4px",
    color: "#2D2926",
    fontSize: 30,
    fontFamily: "Georgia, serif",
  },
  description: {
    margin: 0,
    color: "#7D756D",
    lineHeight: 1.5,
    maxWidth: 610,
  },
  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: 30,
    cursor: "pointer",
    color: "#7D756D",
  },
  message: {
    marginTop: 18,
    padding: 12,
    borderRadius: 12,
    background: "#F5EEFB",
    color: "#6F3DA4",
    fontWeight: 600,
  },
  loading: {
    padding: "28px 0",
    color: "#7D756D",
  },
  list: {
    marginTop: 20,
    display: "grid",
    gap: 10,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    border: "1px solid #DED5CA",
    borderRadius: 15,
    padding: "13px 14px",
    background: "#FFFFFF",
  },
  productInfo: {
    display: "grid",
    gap: 4,
    minWidth: 0,
  },
  productName: {
    color: "#2D2926",
  },
  storeName: {
    color: "#7D756D",
  },
  select: {
    minWidth: 190,
    border: "1px solid #DED5CA",
    borderRadius: 10,
    padding: "10px 12px",
    background: "#FFFDF9",
    color: "#2D2926",
  },
  tip: {
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    background: "#F7F3EC",
    color: "#7D756D",
    fontSize: 13,
  },
};
