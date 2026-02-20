// Highlight active nav link based on current page
(function () {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll("nav a[data-page]");
  links.forEach(a => {
    if (a.getAttribute("data-page") === path) {
      a.setAttribute("aria-current", "page");
    } else {
      a.removeAttribute("aria-current");
    }
  });

  // Update year in footer
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();