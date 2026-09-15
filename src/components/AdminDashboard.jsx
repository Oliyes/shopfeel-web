import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import "./AdminDashboard.css";
export default function AdminDashboard({ user, logout }) {
  const [page, setPage] = useState("dashboard");

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [moods, setMoods] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [productsData, customersData, moodsData] =
        await Promise.all([
          apiRequest("/api/admin/products"),
          apiRequest("/api/admin/customers"),
          apiRequest("/api/mobile/moods"),
        ]);

      setProducts(productsData.products || []);
      setCustomers(customersData.customers || []);
      setMoods(moodsData.moods || []);
    } catch (error) {
      console.error("Erro ao carregar painel:", error);
    } finally {
      setLoading(false);
    }
  }

  const activeProducts = products.filter(
    (product) => Number(product.is_active) === 1
  );

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div>
          <span className="admin-brand-kicker">
            SHOPFEEL
          </span>

          <h1 className="admin-brand">
            Shopfeel
          </h1>
        </div>

        <nav className="admin-nav">
          <NavButton
            active={page === "dashboard"}
            onClick={() => setPage("dashboard")}
          >
            Visão geral
          </NavButton>

          <NavButton
            active={page === "products"}
            onClick={() => setPage("products")}
          >
            Produtos
          </NavButton>

          <NavButton
            active={page === "users"}
            onClick={() => setPage("users")}
          >
            Usuários
          </NavButton>

          <NavButton
            active={page === "moods"}
            onClick={() => setPage("moods")}
          >
            Humores
          </NavButton>

          <NavButton
            active={page === "curation"}
            onClick={() => setPage("curation")}
          >
            Curadoria
          </NavButton>
        </nav>

        <div className="admin-account">
          <strong>{user.email}</strong>
          <span>JWT · ADMIN</span>

          <button onClick={logout}>
            Sair
          </button>
        </div>
      </aside>

      <section className="admin-main">
        {loading ? (
          <p>Carregando painel...</p>
        ) : (
          <>
            {page === "dashboard" && (
              <Dashboard
                products={products}
                activeProducts={activeProducts}
                customers={customers}
                moods={moods}
              />
            )}

            {page === "products" && (
              <ProductsPage
                products={products}
              />
            )}

            {page === "users" && (
              <UsersPage
                customers={customers}
              />
            )}

            {page === "moods" && (
              <MoodsPage moods={moods} />
            )}

            {page === "curation" && (
              <EmptyPage
                kicker="RECOMENDAÇÕES"
                title="Curadoria humor → produto"
                text="Aqui vamos relacionar os produtos cadastrados aos humores do ShopFeel."
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}

function NavButton({
  children,
  active,
  onClick,
}) {
  return (
    <button
      className={
        active
          ? "admin-nav-button active"
          : "admin-nav-button"
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Dashboard({
  products,
  activeProducts,
  customers,
  moods,
}) {
  return (
    <>
      <PageHeader
        kicker="PAINEL"
        title="Visão geral"
        description="Acompanhe os principais dados do ShopFeel."
      />

      <div className="admin-metrics">
        <Metric
          label="Usuários"
          value={customers.length}
          note="contas cadastradas"
        />

        <Metric
          label="Produtos ativos"
          value={activeProducts.length}
          note={`de ${products.length} cadastrados`}
        />

        <Metric
          label="Humores"
          value={moods.length}
          note="humores disponíveis"
        />

        <Metric
          label="API"
          value="ONLINE"
          note="backend conectado"
        />
      </div>

      <div className="admin-dashboard-grid">
        <section>
          <span className="admin-section-label">
            Produtos recentes
          </span>

          <ProductsTable
            products={products.slice(0, 5)}
          />
        </section>

        <section>
          <span className="admin-section-label">
            Humores cadastrados
          </span>

          <div className="admin-mood-list">
            {moods.slice(0, 6).map((mood) => (
              <article
                key={mood.id}
                className="admin-mood-item"
              >
                <span>#{mood.id}</span>

                <div>
                  <strong>
                    {mood.mood_name}
                  </strong>

                  <small>
                    {mood.associated_color}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function ProductsPage({ products }) {
  return (
    <>
      <PageHeader
        kicker="CATÁLOGO"
        title="Produtos"
        description="Gerencie os produtos recomendados pelo ShopFeel."
        action="+ Novo produto"
      />

      <ProductsTable products={products} />
    </>
  );
}

function ProductsTable({ products }) {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Loja</th>
            <th>Preço</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <strong className="product-name">
                  {product.name}
                </strong>

                <small className="product-description">
                  {product.description}
                </small>
              </td>

              <td>
                {product.store_name || "—"}
              </td>

              <td>
                {formatPrice(
                  product.price_cents
                )}
              </td>

              <td>
                <span className="admin-tag">
                  {Number(product.is_active) === 1
                    ? "Ativo"
                    : "Inativo"}
                </span>
              </td>

              <td className="table-actions">
                <button>
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && (
        <div className="empty-table">
          Nenhum produto cadastrado.
        </div>
      )}
    </div>
  );
}

function UsersPage({ customers }) {
  return (
    <>
      <PageHeader
        kicker="CONTAS"
        title="Usuários"
        description="Contas cadastradas no ShopFeel."
      />

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Nível</th>
              <th>Verificado</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <strong className="product-name">
                    {customer.name}
                  </strong>
                </td>

                <td>{customer.email}</td>

                <td>
                  <span className="admin-tag">
                    {customer.access_level}
                  </span>
                </td>

                <td>
                  {customer.email_verified
                    ? "Sim"
                    : "Não"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MoodsPage({ moods }) {
  return (
    <>
      <PageHeader
        kicker="TAXONOMIA"
        title="Humores e cores"
        description="Humores usados pelo sistema de recomendação."
      />

      <div className="admin-moods-grid">
        {moods.map((mood) => (
          <article
            className="admin-mood-card"
            key={mood.id}
          >
            <span>
              #{mood.id} ·{" "}
              {mood.associated_color}
            </span>

            <h3>{mood.mood_name}</h3>

            <p>
              {mood.description ||
                "Sem descrição cadastrada."}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}

function EmptyPage({
  kicker,
  title,
  text,
}) {
  return (
    <>
      <PageHeader
        kicker={kicker}
        title={title}
        description={text}
      />

      <div className="admin-empty">
        Essa área será construída na próxima etapa.
      </div>
    </>
  );
}

function PageHeader({
  kicker,
  title,
  description,
  action,
}) {
  return (
    <header className="admin-header">
      <div>
        <span className="eyebrow">
          {kicker}
        </span>

        <h2>{title}</h2>

        <p>{description}</p>
      </div>

      {action && (
        <button className="admin-action-button">
          {action}
        </button>
      )}
    </header>
  );
}

function Metric({
  label,
  value,
  note,
}) {
  return (
    <article className="admin-metric">
      <span>{label}</span>

      <strong>{value}</strong>

      <small>{note}</small>
    </article>
  );
}

function formatPrice(cents) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format((Number(cents) || 0) / 100);
}