document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const inputs = document.querySelectorAll("input");
  const togglePassword = document.getElementById("togglePassword");
  const password = document.getElementById("password");
  let isLogin = true;

  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", function () {
      if (this.value === "") {
        this.parentElement.classList.remove("focused");
      }
    });
  });

  togglePassword.addEventListener("click", function () {
    const type =
      password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    this.querySelector("i").classList.toggle("fa-eye");
    this.querySelector("i").classList.toggle("fa-eye-slash");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("Formulário submetido");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (isLogin) {
      loginUser(email, password);
    } else {
      registerUser(email, password);
    }
  });

  function loginUser(email, password) {
    fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "/html/dashboard.html";
        } else {
          alert("Erro no login: " + data.message);
        }
      })
      .catch((error) => console.error("Erro:", error));
  }
});
