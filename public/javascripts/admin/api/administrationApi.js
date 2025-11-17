window.Administration = window.Administration || {};

const API_BASE_URL = "http://localhost:4010";

function getToken() {
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((row) => row.startsWith("token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

window.Administration.apiRequest = async function (url, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/";
      return null;
    }
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
};
