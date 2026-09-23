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

      const [
        productsData,
        customersData,
        moodsData,
      ] = await Promise.all([
        apiRequest("/api/admin/products"),
        apiRequest("/api/admin/customers"),
        apiRequest("/api/mobile/moods"),
      ]);

      setProducts(productsData.products || []);
      setCustomers(customersData.customers || []);
      setMoods(moodsData.moods || []);
    } catch (error) {
      console.error(
        "Erro ao carregar painel:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  const activeProducts = products.filter(
    (product) =>
      Number(product.is_active) === 1
  );

  return (
    <main className="admin-page">

      {/* MENU LATERAL */}

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
            onClick={() =>
              setPage("dashboard")
            }
          >
            Visão geral
          </NavButton>

          <NavButton
            active={page === "products"}
            onClick={() =>
              setPage("products")
            }
          >
            Produtos
          </NavButton>

          <NavButton
            active={page === "users"}
            onClick={() =>
              setPage("users")
            }
          >
            Usuários
          </NavButton>

          <NavButton
            active={page === "moods"}
            onClick={() =>
              setPage("moods")
            }
          >
            Humores
          </NavButton>

          <NavButton
            active={page === "curation"}
            onClick={() =>
              setPage("curation")
            }
          >
            Curadoria
          </NavButton>

        </nav>

        <div className="admin-account">

          <strong>
            {user.email}
          </strong>

          <span>
            JWT · ADMIN
          </span>

          <button onClick={logout}>
            Sair
          </button>

        </div>

      </aside>


      {/* CONTEÚDO */}

      <section className="admin-main">

        {loading ? (
          <p>
            Carregando painel...
          </p>
        ) : (
          <>

            {page === "dashboard" && (
              <Dashboard
                products={products}
                activeProducts={
                  activeProducts
                }
                customers={customers}
                moods={moods}
              />
            )}

            {page === "products" && (
  <ProductsPage
    products={products}
    moods={moods}
    onRefresh={loadData}
  />
)}

            {page === "users" && (
              <UsersPage
                customers={customers}
              />
            )}

            {page === "moods" && (
              <MoodsPage
                moods={moods}
              />
            )}

            {page === "curation" && (
  <CurationPage
    moods={moods}
    products={products}
  />
)}

          </>
        )}

      </section>

    </main>
  );
}


/* ========================================
   BOTÃO DO MENU
======================================== */

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


/* ========================================
   DASHBOARD
======================================== */

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

            {moods
              .slice(0, 6)
              .map((mood) => (

                <article
                  key={mood.id}
                  className="admin-mood-item"
                >

                  <span>
                    #{mood.id}
                  </span>

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


/* ========================================
   PRODUTOS
======================================== */

function ProductsPage({
  products,
  moods,
  onRefresh,
}) {
  const [showForm, setShowForm] =
    useState(false);
const [recommendations, setRecommendations] =
  useState([]);

useEffect(() => {
  loadRecommendations();
}, []);

async function loadRecommendations() {
  try {
    const data = await apiRequest(
      "/api/admin/recommendations"
    );

    setRecommendations(
      data.recommendations || []
    );
  } catch (error) {
    console.error(
      "Erro ao carregar recomendações:",
      error
    );
  }
}
  const [
    editingProduct,
    setEditingProduct,
  ] = useState(null);

  const [saving, setSaving] =
    useState(false);

  const [
    formMessage,
    setFormMessage,
  ] = useState("");


  const stores = [
    {
      key: "mercado_livre",
      name: "Mercado Livre",
      logo: "/stores/mercado-livre.png",
    },

    {
      key: "amazon",
      name: "Amazon",
      logo: "/stores/amazon.png",
    },

    {
      key: "shopee",
      name: "Shopee",
      logo: "/stores/shopee.png",
    },

    {
      key: "magalu",
      name: "Magazine Luiza",
      logo: "/stores/magalu.png",
    },

    {
      key: "outro",
      name: "Outra loja",
      logo: null,
    },
  ];


  const emptyForm = {
    name: "",
    description: "",
    price: "",

    store_key: "mercado_livre",
    store_name: "Mercado Livre",

    custom_store_name: "",

    external_url: "",
    image_url: "",

    is_active: 1,
  };


  const [form, setForm] =
    useState(emptyForm);


  function changeField(
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }


  function handleStoreChange(value) {
    const selectedStore =
      stores.find(
        (store) =>
          store.key === value
      );

    setForm((current) => ({
      ...current,

      store_key: value,

      store_name:
        value === "outro"
          ? ""
          : selectedStore?.name || "",

      custom_store_name:
        value === "outro"
          ? current.custom_store_name
          : "",
    }));
  }


  function resetForm() {
    setForm({
      ...emptyForm,
    });

    setFormMessage("");
  }


  function openNewProduct() {
    setEditingProduct(null);

    resetForm();

    setShowForm(true);
  }


  function closeForm() {
    setShowForm(false);

    setEditingProduct(null);

    resetForm();
  }


  function openEditProduct(product) {
    setEditingProduct(product);

    const storeExists =
      stores.some(
        (store) =>
          store.key ===
          product.store_key
      );

    const selectedStoreKey =
      storeExists
        ? product.store_key
        : "outro";


    setForm({
      name:
        product.name || "",

      description:
        product.description || "",

      price:
        (
          (Number(
            product.price_cents
          ) || 0) / 100
        )
          .toFixed(2)
          .replace(".", ","),

      store_key:
        selectedStoreKey,

      store_name:
        selectedStoreKey === "outro"
          ? ""
          : product.store_name || "",

      custom_store_name:
        selectedStoreKey === "outro"
          ? product.store_name || ""
          : "",

      external_url:
        product.external_url || "",

      image_url:
        product.image_url || "",

      is_active:
        Number(
          product.is_active
        ),
    });

    setFormMessage("");

    setShowForm(true);
  }


  async function handleSaveProduct(
    event
  ) {
    event.preventDefault();

    setFormMessage("");


    const storeName =
      form.store_key === "outro"
        ? form.custom_store_name.trim()
        : form.store_name;


    if (!form.name.trim()) {
      setFormMessage(
        "Digite o nome do produto."
      );

      return;
    }


    if (!form.price) {
      setFormMessage(
        "Digite o preço do produto."
      );

      return;
    }


    if (!storeName) {
      setFormMessage(
        "Informe o nome da loja."
      );

      return;
    }


    if (
      !form.external_url.trim()
    ) {
      setFormMessage(
        "Informe o link do produto."
      );

      return;
    }


    const priceNumber = Number(
      String(form.price)
        .replace(/\./g, "")
        .replace(",", ".")
    );


    if (
      Number.isNaN(priceNumber) ||
      priceNumber < 0
    ) {
      setFormMessage(
        "Digite um preço válido."
      );

      return;
    }


    const priceCents =
      Math.round(
        priceNumber * 100
      );


    const productData = {
      name:
        form.name.trim(),

      description:
        form.description.trim() ||
        null,

      price_cents:
        priceCents,

      store_name:
        storeName,

      store_key:
        form.store_key,

      external_url:
        form.external_url.trim(),

      image_url:
        form.image_url.trim() ||
        null,

      is_active:
        Number(
          form.is_active
        ),
    };


    try {
      setSaving(true);


      if (editingProduct) {

        await apiRequest(
          `/api/admin/products/${editingProduct.id}`,
          {
            method: "PATCH",

            body: JSON.stringify(
              productData
            ),
          }
        );

      } else {

        await apiRequest(
          "/api/admin/products",
          {
            method: "POST",

            body: JSON.stringify(
              productData
            ),
          }
        );

      }


      await onRefresh();

      closeForm();

    } catch (error) {

      setFormMessage(
        error.message ||
          "Não foi possível salvar o produto."
      );

    } finally {

      setSaving(false);

    }
  }


  return (
    <>

      <PageHeader
        kicker="CATÁLOGO"
        title="Produtos"
        description="Gerencie os produtos recomendados pelo ShopFeel."
      />


      <div className="products-toolbar">

        <div>

          <span>
            {products.length}
          </span>

          <small>
            produtos cadastrados
          </small>

        </div>


        <button
          className="admin-action-button"
          onClick={openNewProduct}
        >
          + Novo produto
        </button>

      </div>


      <ProductsTable
        products={products}
        moods={moods}
        recommendations={recommendations}
        onEdit={openEditProduct}
        onRefresh={onRefresh}
      />


      {showForm && (

        <div className="product-modal-overlay">

          <div className="product-modal">


            <div className="product-modal-header">

              <div>

                <span className="eyebrow">
                  CATÁLOGO
                </span>


                <h2>

                  {editingProduct
                    ? "Editar produto"
                    : "Novo produto"}

                </h2>


                <p>

                  {editingProduct
                    ? "Altere as informações do produto selecionado."
                    : "Cadastre um produto de uma loja externa no ShopFeel."}

                </p>

              </div>


              <button
                className="modal-close"
                onClick={closeForm}
                type="button"
              >
                ×
              </button>

            </div>


            <form
              className="product-form"
              onSubmit={
                handleSaveProduct
              }
            >


              <div className="product-form-grid">

                <label className="product-field">

                  <span>
                    Nome do produto
                  </span>

                  <input
                    type="text"

                    placeholder="Ex: Fone Bluetooth JBL"

                    value={form.name}

                    onChange={(event) =>
                      changeField(
                        "name",
                        event.target.value
                      )
                    }
                  />

                </label>


                <label className="product-field">

                  <span>
                    Preço
                  </span>

                  <div className="price-input">

                    <strong>
                      R$
                    </strong>

                    <input
                      type="text"

                      placeholder="299,90"

                      value={form.price}

                      onChange={(event) =>
                        changeField(
                          "price",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </label>

              </div>


              <label className="product-field">

                <span>
                  Descrição
                </span>

                <textarea
                  placeholder="Descrição curta do produto..."

                  value={
                    form.description
                  }

                  onChange={(event) =>
                    changeField(
                      "description",
                      event.target.value
                    )
                  }
                />

              </label>


              <div className="product-form-grid">

                <label className="product-field">

                  <span>
                    Loja
                  </span>

                  <select
                    value={
                      form.store_key
                    }

                    onChange={(event) =>
                      handleStoreChange(
                        event.target.value
                      )
                    }
                  >

                    {stores.map(
                      (store) => (

                        <option
                          key={store.key}
                          value={store.key}
                        >
                          {store.name}
                        </option>

                      )
                    )}

                  </select>

                </label>


                <div className="selected-store">

                  <span>
                    Loja selecionada
                  </span>

                  <div>

                    {form.store_key !==
                    "outro" ? (

                      <img
                        src={
                          getStoreLogo(
                            form.store_key
                          )
                        }

                        alt={
                          form.store_name
                        }

                        className="selected-store-logo"
                      />

                    ) : (

                      <span className="selected-store-fallback">
                        🏪
                      </span>

                    )}


                    <p>

                      {form.store_key ===
                      "outro"
                        ? form.custom_store_name ||
                          "Outra loja"
                        : form.store_name}

                    </p>

                  </div>

                </div>

              </div>


              {form.store_key ===
                "outro" && (

                <label className="product-field">

                  <span>
                    Digite o nome da loja
                  </span>

                  <input
                    type="text"

                    placeholder="Ex: KaBuM!, Renner, Nike..."

                    value={
                      form.custom_store_name
                    }

                    onChange={(event) =>
                      changeField(
                        "custom_store_name",
                        event.target.value
                      )
                    }
                  />

                  <small>
                    Informe o nome do site
                    ou loja onde esse produto
                    está disponível.
                  </small>

                </label>

              )}


              <label className="product-field">

                <span>
                  Link do produto
                </span>

                <input
                  type="url"

                  placeholder="https://www.loja.com/produto..."

                  value={
                    form.external_url
                  }

                  onChange={(event) =>
                    changeField(
                      "external_url",
                      event.target.value
                    )
                  }
                />

                <small>
                  O usuário será direcionado
                  para esse endereço ao tocar
                  em "Ver produto".
                </small>

              </label>


              <label className="product-field">

                <span>
                  URL da imagem
                </span>

                <input
                  type="url"

                  placeholder="https://.../imagem.jpg"

                  value={
                    form.image_url
                  }

                  onChange={(event) =>
                    changeField(
                      "image_url",
                      event.target.value
                    )
                  }
                />

                <small>
                  Você pode copiar o endereço
                  da imagem do produto.
                </small>

              </label>


              {form.image_url && (

                <div className="product-image-preview">

                  <span>
                    Prévia da imagem
                  </span>

                  <div>

                    <img
                      src={
                        form.image_url
                      }

                      alt="Prévia do produto"

                      onLoad={(event) => {
                        event.currentTarget.style.display =
                          "block";
                      }}

                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>

                </div>

              )}


              <label className="product-field">

                <span>
                  Status
                </span>

                <select
                  value={
                    form.is_active
                  }

                  onChange={(event) =>
                    changeField(
                      "is_active",
                      Number(
                        event.target.value
                      )
                    )
                  }
                >

                  <option value={1}>
                    Ativo
                  </option>

                  <option value={0}>
                    Inativo
                  </option>

                </select>

              </label>


              {formMessage && (

                <div className="product-form-message">
                  {formMessage}
                </div>

              )}


              <div className="product-form-actions">

                <button
                  type="button"
                  className="secondary-admin-button"
                  onClick={closeForm}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="save-product-button"
                  disabled={saving}
                >

                  {saving
                    ? "Salvando..."
                    : editingProduct
                    ? "Salvar alterações"
                    : "Salvar produto"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}


/* ========================================
   TABELA DE PRODUTOS
======================================== */

function ProductsTable({
  products,
  moods,
  recommendations,
  onEdit,
  onRefresh,
}) {
  const canEdit =
    typeof onEdit === "function";

  const canChangeStatus =
    typeof onRefresh === "function";

  const [
    changingStatusId,
    setChangingStatusId,
  ] = useState(null);


  async function toggleProductStatus(
    product
  ) {
    try {
      setChangingStatusId(
        product.id
      );

      const newStatus =
        Number(
          product.is_active
        ) === 1
          ? 0
          : 1;


      await apiRequest(
        `/api/admin/products/${product.id}`,
        {
          method: "PATCH",

          body: JSON.stringify({
            is_active:
              newStatus,
          }),
        }
      );


      if (onRefresh) {
        await onRefresh();
      }

    } catch (error) {

      alert(
        error.message ||
          "Não foi possível alterar o status do produto."
      );

    } finally {

      setChangingStatusId(
        null
      );

    }
  }


  const hasActions =
    canEdit ||
    canChangeStatus;

  const showMoods =
    Array.isArray(moods) &&
    Array.isArray(recommendations);


  return (
    <div className="admin-table-wrapper">

      <table className="admin-table">

        <thead>

          <tr>

            <th>
              Produto
            </th>

            <th>
              Loja
            </th>

            <th>
              Preço
            </th>

            {showMoods && (
              <th>
                Humores
              </th>
            )}

            <th>
              Status
            </th>

            {hasActions && (
              <th>
                Ações
              </th>
            )}

          </tr>

        </thead>


        <tbody>

          {products.map(
            (product) => {
              const productMoods = showMoods
                ? moods.filter(
                    (mood) =>
                      recommendations.some(
                        (recommendation) =>
                          Number(
                            recommendation.product_id
                          ) === Number(product.id) &&
                          Number(
                            recommendation.mood_id
                          ) === Number(mood.id)
                      )
                  )
                : [];

              return (
              <tr
                key={
                  product.id
                }
              >

                <td>

                  <strong className="product-name">
                    {product.name}
                  </strong>

                  <small className="product-description">
                    {product.description}
                  </small>

                </td>


                <td>

                  <div className="store-table-cell">

                    {getStoreLogo(
                      product.store_key
                    ) ? (

                      <img
                        className="store-logo"

                        src={
                          getStoreLogo(
                            product.store_key
                          )
                        }

                        alt={
                          product.store_name
                        }
                      />

                    ) : (

                      <span className="store-fallback">
                        🏪
                      </span>

                    )}


                    <span>
                      {product.store_name ||
                        "—"}
                    </span>

                  </div>

                </td>


                <td>

                  {formatPrice(
                    product.price_cents
                  )}

                </td>


                {showMoods && (
                  <td>
                    <div className="product-moods">

                      {productMoods.length > 0 ? (

                        productMoods.map(
                          (mood) => (

                            <span
                              key={mood.id}
                              className="product-mood-tag"
                            >
                              <span>
                                {getMoodEmoji(
                                  mood.mood_name
                                )}
                              </span>

                              {mood.mood_name}
                            </span>

                          )
                        )

                      ) : (

                        <span className="product-no-mood">
                          Sem indicação
                        </span>

                      )}

                    </div>
                  </td>
                )}


                <td>

                  <span
                    className={
                      Number(
                        product.is_active
                      ) === 1
                        ? "admin-tag active-tag"
                        : "admin-tag inactive-tag"
                    }
                  >

                    {Number(
                      product.is_active
                    ) === 1
                      ? "Ativo"
                      : "Inativo"}

                  </span>

                </td>


                {hasActions && (

                  <td className="table-actions">

                    {canEdit && (

                      <button
                        type="button"

                        onClick={() =>
                          onEdit(product)
                        }
                      >
                        Editar
                      </button>

                    )}


                    {canChangeStatus && (

                      <button
                        type="button"

                        disabled={
                          changingStatusId ===
                          product.id
                        }

                        onClick={() =>
                          toggleProductStatus(
                            product
                          )
                        }
                      >

                        {changingStatusId ===
                        product.id
                          ? "Alterando..."
                          : Number(
                              product.is_active
                            ) === 1
                          ? "Desativar"
                          : "Ativar"}

                      </button>

                    )}

                  </td>

                )}

              </tr>
              );
            }
          )}

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


/* ========================================
   USUÁRIOS
======================================== */
function CurationPage({
  moods,
  products,
}) {
  const [selectedMoodId, setSelectedMoodId] =
    useState(moods[0]?.id || null);

  const [selectedProducts, setSelectedProducts] =
    useState([]);

  const [savedProducts, setSavedProducts] =
    useState([]);

  const [loadingCuration, setLoadingCuration] =
    useState(false);

  const [savingCuration, setSavingCuration] =
    useState(false);

  const [curationMessage, setCurationMessage] =
    useState("");


  const activeProducts = products.filter(
    (product) =>
      Number(product.is_active) === 1
  );


  const selectedMood = moods.find(
    (mood) =>
      Number(mood.id) ===
      Number(selectedMoodId)
  );


  useEffect(() => {
    if (!selectedMoodId) {
      return;
    }

    loadRecommendations(
      selectedMoodId
    );
  }, [selectedMoodId]);


  async function loadRecommendations(
    moodId
  ) {
    try {
      setLoadingCuration(true);
      setCurationMessage("");

      const data =
        await apiRequest(
          `/api/admin/recommendations?mood_id=${moodId}`
        );


      const ids =
        (
          data.recommendations ||
          []
        ).map(
          (recommendation) =>
            Number(
              recommendation.product_id
            )
        );


      setSelectedProducts(ids);
      setSavedProducts(ids);

    } catch (error) {

      setCurationMessage(
        error.message ||
          "Não foi possível carregar a curadoria."
      );

    } finally {

      setLoadingCuration(false);

    }
  }


  function selectMood(moodId) {
    setSelectedMoodId(
      Number(moodId)
    );

    setCurationMessage("");
  }


  function toggleProduct(productId) {
    const id =
      Number(productId);

    const alreadySelected =
      selectedProducts.includes(id);


    if (alreadySelected) {

      setSelectedProducts(
        selectedProducts.filter(
          (currentId) =>
            currentId !== id
        )
      );

      setCurationMessage("");

      return;
    }


    if (
      selectedProducts.length >= 4
    ) {

      setCurationMessage(
        "Você pode selecionar no máximo 4 produtos para cada humor."
      );

      return;
    }


    setSelectedProducts([
      ...selectedProducts,
      id,
    ]);

    setCurationMessage("");
  }


  async function saveCuration() {
    if (!selectedMoodId) {
      setCurationMessage(
        "Selecione um humor."
      );

      return;
    }


    if (
      selectedProducts.length === 0
    ) {
      setCurationMessage(
        "Selecione pelo menos um produto."
      );

      return;
    }


    try {
      setSavingCuration(true);
      setCurationMessage("");


      const currentSet =
        new Set(
          selectedProducts
        );

      const savedSet =
        new Set(
          savedProducts
        );


      const productsToAdd =
        selectedProducts.filter(
          (productId) =>
            !savedSet.has(
              productId
            )
        );


      const productsToRemove =
        savedProducts.filter(
          (productId) =>
            !currentSet.has(
              productId
            )
        );


      const addRequests =
        productsToAdd.map(
          (productId) =>
            apiRequest(
              "/api/admin/recommendations",
              {
                method: "POST",

                body: JSON.stringify({
                  product_id:
                    Number(
                      productId
                    ),

                  mood_id:
                    Number(
                      selectedMoodId
                    ),
                }),
              }
            )
        );


      const removeRequests =
        productsToRemove.map(
          (productId) =>
            apiRequest(
              `/api/admin/recommendations/${selectedMoodId}/${productId}`,
              {
                method:
                  "DELETE",
              }
            )
        );


      await Promise.all([
        ...addRequests,
        ...removeRequests,
      ]);


      setSavedProducts([
        ...selectedProducts,
      ]);


      setCurationMessage(
        "Curadoria salva com sucesso."
      );

    } catch (error) {

      setCurationMessage(
        error.message ||
          "Não foi possível salvar a curadoria."
      );

    } finally {

      setSavingCuration(false);

    }
  }


  return (
    <>

      <PageHeader
        kicker="RECOMENDAÇÕES"
        title="Curadoria"
        description="Escolha um humor e relacione até 4 produtos que combinam com ele."
      />


      <div className="curation-layout">


        {/* HUMORES */}

        <section className="curation-moods">

          <span className="admin-section-label">
            1. Escolha o humor
          </span>


          <div className="curation-mood-grid">

            {moods.map(
              (mood) => (

                <button
                  type="button"

                  key={
                    mood.id
                  }

                  className={
                    Number(
                      selectedMoodId
                    ) ===
                    Number(
                      mood.id
                    )
                      ? "curation-mood-button selected"
                      : "curation-mood-button"
                  }

                  onClick={() =>
                    selectMood(
                      mood.id
                    )
                  }
                >

                  <span className="curation-emoji">
                    {getMoodEmoji(
                      mood.mood_name
                    )}
                  </span>

                  <strong>
                    {
                      mood.mood_name
                    }
                  </strong>

                </button>

              )
            )}

          </div>

        </section>


        {/* PRODUTOS */}

        <section className="curation-products">

          <div className="curation-products-header">

            <div>

              <span className="admin-section-label">
                2. Escolha os produtos
              </span>

              <h3>
                {selectedMood
                  ? `${getMoodEmoji(
                      selectedMood.mood_name
                    )} ${selectedMood.mood_name}`
                  : "Selecione um humor"}
              </h3>

            </div>


            <div className="curation-counter">

              <strong>
                {
                  selectedProducts.length
                }
              </strong>

              <span>
                / 4 produtos
              </span>

            </div>

          </div>


          {loadingCuration ? (

            <div className="curation-empty">
              Carregando produtos...
            </div>

          ) : activeProducts.length === 0 ? (

            <div className="curation-empty">
              Nenhum produto ativo cadastrado.
            </div>

          ) : (

            <div className="curation-product-grid">

              {activeProducts.map(
                (product) => {

                  const selected =
                    selectedProducts.includes(
                      Number(
                        product.id
                      )
                    );


                  return (
                    <button
                      type="button"

                      key={
                        product.id
                      }

                      className={
                        selected
                          ? "curation-product-card selected"
                          : "curation-product-card"
                      }

                      onClick={() =>
                        toggleProduct(
                          product.id
                        )
                      }
                    >

                      <div className="curation-product-image">

                        {product.image_url ? (

                          <img
                            src={
                              product.image_url
                            }

                            alt={
                              product.name
                            }
                          />

                        ) : getStoreLogo(
                            product.store_key
                          ) ? (

                          <img
                            src={
                              getStoreLogo(
                                product.store_key
                              )
                            }

                            alt={
                              product.store_name
                            }

                            className="curation-store-image"
                          />

                        ) : (

                          <span>
                            🛍️
                          </span>

                        )}

                      </div>


                      <div className="curation-product-info">

                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <span>
                          {
                            product.store_name
                          }
                        </span>

                        <small>
                          {formatPrice(
                            product.price_cents
                          )}
                        </small>

                      </div>


                      <span
                        className={
                          selected
                            ? "curation-check selected"
                            : "curation-check"
                        }
                      >

                        {selected
                          ? "✓"
                          : ""}

                      </span>

                    </button>
                  );
                }
              )}

            </div>

          )}


          {curationMessage && (

            <div
              className={
                curationMessage.includes(
                  "sucesso"
                )
                  ? "curation-message success"
                  : "curation-message"
              }
            >
              {curationMessage}
            </div>

          )}


          <div className="curation-footer">

            <div>

              <span>
                {
                  selectedProducts.length
                } produto(s) selecionado(s)
              </span>

              <small>
                Esses produtos aparecerão
                no mobile quando o usuário
                escolher esse humor.
              </small>

            </div>


            <button
              type="button"

              className="save-product-button"

              disabled={
                savingCuration ||
                selectedProducts.length ===
                  0
              }

              onClick={
                saveCuration
              }
            >

              {savingCuration
                ? "Salvando..."
                : "Salvar curadoria"}

            </button>

          </div>

        </section>

      </div>

    </>
  );
}
function UsersPage({
  customers,
}) {
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

              <th>
                Nome
              </th>

              <th>
                E-mail
              </th>

              <th>
                Nível
              </th>

              <th>
                Verificado
              </th>

            </tr>

          </thead>


          <tbody>

            {customers.map(
              (customer) => (

                <tr
                  key={
                    customer.id
                  }
                >

                  <td>

                    <strong className="product-name">
                      {customer.name}
                    </strong>

                  </td>


                  <td>
                    {customer.email}
                  </td>


                  <td>

                    <span className="admin-tag">
                      {
                        customer.access_level
                      }
                    </span>

                  </td>


                  <td>

                    {customer.email_verified
                      ? "Sim"
                      : "Não"}

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </>
  );
}


/* ========================================
   HUMORES
======================================== */

function MoodsPage({
  moods,
}) {
  return (
    <>

      <PageHeader
        kicker="TAXONOMIA"
        title="Humores e cores"
        description="Humores usados pelo sistema de recomendação."
      />


      <div className="admin-moods-grid">

        {moods.map(
          (mood) => (

            <article
              className="admin-mood-card"

              key={
                mood.id
              }
            >

              <span>

                #{mood.id}
                {" · "}
                {
                  mood.associated_color
                }

              </span>


              <h3>
                {
                  mood.mood_name
                }
              </h3>


              <p>

                {mood.description ||
                  "Sem descrição cadastrada."}

              </p>

            </article>

          )
        )}

      </div>

    </>
  );
}


/* ========================================
   PÁGINA VAZIA
======================================== */

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

        Essa área será construída
        na próxima etapa.

      </div>

    </>
  );
}


/* ========================================
   CABEÇALHO
======================================== */

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

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

      </div>


      {action && (

        <button className="admin-action-button">
          {action}
        </button>

      )}

    </header>
  );
}


/* ========================================
   MÉTRICA
======================================== */

function Metric({
  label,
  value,
  note,
}) {
  return (
    <article className="admin-metric">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {note}
      </small>

    </article>
  );
}


/* ========================================
   FORMATAR PREÇO
======================================== */

function formatPrice(cents) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(
    (Number(cents) || 0) / 100
  );
}


/* ========================================
   LOGOS DAS LOJAS
======================================== */

function getStoreLogo(storeKey) {
  const logos = {
    mercado_livre:
      "/stores/mercado-livre.png",

    amazon:
      "/stores/amazon.png",

    shopee:
      "/stores/shopee.png",

    magalu:
      "/stores/magalu.png",
  };

  return (
    logos[storeKey] || null
  );
}
function getMoodEmoji(moodName) {
  const name =
    String(
      moodName || ""
    ).toLowerCase();


  if (
    name.includes("alegr") ||
    name.includes("feliz")
  ) {
    return "😊";
  }


  if (
    name.includes("calma") ||
    name.includes("tranquil")
  ) {
    return "😌";
  }


  if (
    name.includes("raiva") ||
    name.includes("irrit")
  ) {
    return "😠";
  }


  if (
    name.includes("triste")
  ) {
    return "😢";
  }


  if (
    name.includes("criativ")
  ) {
    return "🤩";
  }


  if (
    name.includes("esperan")
  ) {
    return "🌱";
  }


  if (
    name.includes("vital") ||
    name.includes("energia")
  ) {
    return "⚡";
  }


  if (
    name.includes("amor") ||
    name.includes("rom")
  ) {
    return "🥰";
  }


  if (
    name.includes("ansied") ||
    name.includes("ansios")
  ) {
    return "😰";
  }


  if (
    name.includes("surpres")
  ) {
    return "😮";
  }


  return "🙂";
}