const API_URL = "http://localhost:3000";

const fieldLabels = {
  name: "Nome",
  description: "Descrição",
  price_cents: "Preço",
  store_name: "Loja",
  store_key: "Tipo de loja",
  external_url: "Link do produto",
  image_url: "URL da imagem",
  is_active: "Status",
};

function formatValidationDetails(details) {
  if (!Array.isArray(details) || details.length === 0) {
    return null;
  }

  const messages = details.map((issue) => {
    const field = issue?.path?.[0];
    const label = fieldLabels[field] || field || "Campo";

    if (
      field === "external_url" ||
      field === "image_url"
    ) {
      return `${label}: use um endereço completo começando com http:// ou https://`;
    }

    if (field === "price_cents") {
      return "Preço: informe um valor válido.";
    }

    if (field === "store_name") {
      return "Loja: informe o nome da loja.";
    }

    if (field === "name") {
      return "Nome: informe o nome do produto.";
    }

    return `${label}: ${issue?.message || "valor inválido"}`;
  });

  return messages.join(" • ");
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("shopfeel_token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...options.headers,
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const validationMessage =
      formatValidationDetails(data?.details);

    throw new Error(
      validationMessage ||
      data?.error ||
      "Não foi possível conectar ao servidor."
    );
  }

  return data;
}

export { API_URL };
