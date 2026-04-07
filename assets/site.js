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

  const discussionForm = document.querySelector("[data-discussion-form]");
  if (discussionForm) {
    const issueBase = discussionForm.getAttribute("data-issue-base") || "";
    const previewTitle = document.querySelector("[data-discussion-preview-title]");
    const previewBody = document.querySelector("[data-discussion-preview-body]");
    const previewLink = document.querySelector("[data-discussion-preview-link]");

    const buildIssue = () => {
      const data = new FormData(discussionForm);
      const topic = String(data.get("topic") || "General winter hiking feedback");
      const experience = String(data.get("experience") || "Not shared");
      const details = String(data.get("details") || "").trim();
      const name = String(data.get("name") || "").trim();
      const title = `Trailhead discussion: ${topic}`;
      const body = [
        "## Visitor check-in",
        `- Topic: ${topic}`,
        `- Experience level: ${experience}`,
        `- Name or handle: ${name || "Not provided"}`,
        "",
        "## My answer",
        details || "I wanted to join the discussion and will add more detail before submitting.",
        "",
        "## Site prompt",
        "What part of winter hiking feels most uncertain right now, and what would make this site more useful?"
      ].join("\n");
      const url = `${issueBase}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

      if (previewTitle) previewTitle.textContent = title;
      if (previewBody) previewBody.textContent = body;
      if (previewLink) previewLink.href = url;

      return url;
    };

    discussionForm.addEventListener("input", buildIssue);
    discussionForm.addEventListener("change", buildIssue);
    discussionForm.addEventListener("submit", function (event) {
      event.preventDefault();
      window.open(buildIssue(), "_blank", "noopener");
    });

    buildIssue();
  }
})();
