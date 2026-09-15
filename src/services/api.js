const API_URL = "http://localhost:3000";

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
    throw new Error(
      data?.error ||
      "Não foi possível conectar ao servidor."
    );
  }

  return data;
}

export { API_URL };