document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("login-link");
  const overlay = document.getElementById("login-modal-overlay");
  const closeBtn = document.getElementById("login-close-btn");

  if (!loginLink || !overlay || !closeBtn) return;

  // Åbn modal når man klikker på "Login" i menuen
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    overlay.classList.add("active");
  });

  // Luk modal når man klikker på krydset
  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
  });

  // Luk modal når man klikker udenfor boksen
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
    }
  });
});
