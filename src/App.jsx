import { useState } from "react";
import "./App.css";

import { apiRequest } from "./services/api";

function App() {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(null);

  async function handleLogin(event) {
    event.preventDefault();

    setMessage("");

    if (!email || !password) {
      setMessage("Preencha o e-mail e a senha.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/api/auth/login", {
        method: "POST",

        body: JSON.stringify({
          email,
          password,
        }),
      });

      localStorage.setItem(
        "shopfeel_token",
        data.token
      );

      localStorage.setItem(
        "shopfeel_user",
        JSON.stringify(data.customer)
      );

      setUser(data.customer);

    } catch (error) {
      setMessage(error.message);

    } finally {
      setLoading(false);
    }
  }


  async function handleRegister(event) {
    event.preventDefault();

    setMessage("");

    if (!name || !email || !password) {
      setMessage("Preencha todos os campos.");
      return;
    }

    if (password.length < 8) {
      setMessage(
        "A senha precisa ter pelo menos 8 caracteres."
      );

      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest(
        "/api/auth/register",
        {
          method: "POST",

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      localStorage.setItem(
        "shopfeel_token",
        data.token
      );

      localStorage.setItem(
        "shopfeel_user",
        JSON.stringify(data.customer)
      );

      setUser(data.customer);

    } catch (error) {
      setMessage(error.message);

    } finally {
      setLoading(false);
    }
  }


  function logout() {
    localStorage.removeItem("shopfeel_token");
    localStorage.removeItem("shopfeel_user");

    setUser(null);
    setPassword("");
  }


  if (user) {
    return (
      <main className="logged-page">

        <section className="logged-card">

          <span className="eyebrow">
            CONEXÃO REALIZADA
          </span>

          <h1>
            Olá, {user.name}
          </h1>

          <p>
            Seu login está conectado ao backend
            do ShopFeel.
          </p>

          <div className="user-data">
            <div>
              <span>E-mail</span>
              <strong>{user.email}</strong>
            </div>

            <div>
              <span>Tipo de conta</span>
              <strong>
                {user.access_level}
              </strong>
            </div>
          </div>

          <button
            className="primary-button"
            onClick={logout}
          >
            Sair
          </button>

        </section>

      </main>
    );
  }


  return (
    <main className="auth-page">

      <section className="auth-container">

        <div className="auth-left">

          <span className="eyebrow">
            SHOPFEEL
          </span>

          <h1>
            O que você sente
            <br />
            também pode inspirar
            <br />
            suas escolhas.
          </h1>

          <p>
            Descubra produtos selecionados
            de acordo com seu humor.
          </p>

          <div className="moods">
            <span className="mood yellow"></span>
            <span className="mood blue"></span>
            <span className="mood purple"></span>
            <span className="mood green"></span>
            <span className="mood red"></span>
          </div>

        </div>


        <div className="auth-right">

          <div className="logo">
            Shopfeel
          </div>

          <div className="form-container">

            <span className="eyebrow">
              {mode === "login"
                ? "ACESSO"
                : "NOVA CONTA"}
            </span>

            <h2>
              {mode === "login"
                ? "Bem-vindo de volta"
                : "Criar conta"}
            </h2>

            <p className="description">
              {mode === "login"
                ? "Entre para continuar no ShopFeel."
                : "Crie sua conta para começar a descobrir produtos."}
            </p>


            <form
              onSubmit={
                mode === "login"
                  ? handleLogin
                  : handleRegister
              }
            >

              {mode === "register" && (
                <label className="field">
                  <span>Nome</span>

                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                  />
                </label>
              )}


              <label className="field">
                <span>E-mail</span>

                <input
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                />
              </label>


              <label className="field">
                <span>Senha</span>

                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />
              </label>


              {message && (
                <div className="message">
                  {message}
                </div>
              )}


              <button
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Aguarde..."
                  : mode === "login"
                  ? "Entrar"
                  : "Criar minha conta"}
              </button>

            </form>


            <div className="change-mode">

              <span>
                {mode === "login"
                  ? "Ainda não possui uma conta?"
                  : "Já possui uma conta?"}
              </span>

              <button
                type="button"
                onClick={() => {
                  setMessage("");

                  setMode(
                    mode === "login"
                      ? "register"
                      : "login"
                  );
                }}
              >
                {mode === "login"
                  ? "Criar conta"
                  : "Entrar"}
              </button>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default App;