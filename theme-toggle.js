/* ==========================================================================
   EduTrack Theme Toggle + Active Nav Highlighting
   Theme preference is applied instantly by an inline snippet in <head> (to
   avoid a flash of the wrong theme); this file wires up the toggle button
   and keeps the nav link matching the current page.
   ========================================================================== */
(function () {
    "use strict";
    const THEME_KEY = "eduTrack_theme";

    function applyIcon(theme) {
        const icon = document.querySelector("#etThemeToggle i");
        if (!icon) return;
        icon.className = theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    }

    document.addEventListener("DOMContentLoaded", function () {
        const current = document.documentElement.getAttribute("data-bs-theme") || "light";
        applyIcon(current);

        const toggleBtn = document.getElementById("etThemeToggle");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", function () {
                const now = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
                document.documentElement.setAttribute("data-bs-theme", now);
                localStorage.setItem(THEME_KEY, now);
                applyIcon(now);
            });
        }

        // Highlight the current page in the nav automatically.
        const path = window.location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll(".et-navbar .nav-link").forEach((link) => {
            const href = link.getAttribute("href");
            link.classList.toggle("active", href === path);
        });
    });
})();
