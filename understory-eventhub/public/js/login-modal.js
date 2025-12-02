document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTER
  const loginLink = document.getElementById("login-link");

  const loginModal = document.getElementById("login-modal-overlay");
  const registerModal = document.getElementById("register-modal-overlay");

  const loginCloseBtn = document.getElementById("login-close-btn");
  const registerCloseBtn = document.getElementById("register-close-btn");

  const openRegisterFromLogin = document.getElementById("open-register-from-login");

  if (!loginModal || !registerModal) return;

  function openModal(modal) {
    modal.classList.add("active");   // BRUGER KUN 'active'
  }

  function closeModal(modal) {
    modal.classList.remove("active");
  }

  // ÅBN LOGIN-MODAL FRA NAVBAR
  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(loginModal);
    });
  }

  // LUK LOGIN-MODAL
  if (loginCloseBtn) {
    loginCloseBtn.addEventListener("click", () => closeModal(loginModal));
  }
  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) closeModal(loginModal);
  });

  // ÅBN REGISTER-MODAL FRA LINK UNDER LOGIN
  if (openRegisterFromLogin) {
    openRegisterFromLogin.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal(loginModal);
      openModal(registerModal);
    });
  }

  // LUK REGISTER-MODAL
  if (registerCloseBtn) {
    registerCloseBtn.addEventListener("click", () => closeModal(registerModal));
  }
  registerModal.addEventListener("click", (e) => {
    if (e.target === registerModal) closeModal(registerModal);
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const loginItem = document.getElementById("nav-login-item");
  const logoutItem = document.getElementById("nav-logout-item");
  const dashboardItem = document.getElementById("nav-dashboard-item");

  // Tjek login status
  try {
    // server route er /api/auth-status (med bindestreg)
    const res = await fetch("/api/auth-status");
    const data = await res.json();

    if (data.loggedIn) {
      if (loginItem) loginItem.style.display = "none";
      if (logoutItem) logoutItem.style.display = "block";
      if (dashboardItem) dashboardItem.style.display = "block";
    } else {
      if (loginItem) loginItem.style.display = "block";
      if (logoutItem) logoutItem.style.display = "none";
      if (dashboardItem) dashboardItem.style.display = "none";
    }
  } catch (err) {
    console.error("Auth status fejlede:", err);
  }
});
