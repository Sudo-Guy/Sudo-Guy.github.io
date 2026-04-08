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
    const submitNote = document.querySelector("[data-discussion-submit-note]");

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
      if (submitNote) {
        submitNote.textContent = "GitHub opened in a new tab with your reply prefilled. Submit it there to post publicly.";
      }
    });

    buildIssue();
  }

  const discussionList = document.querySelector("[data-discussion-list]");
  const discussionStatus = document.querySelector("[data-discussion-status]");
  if (discussionList) {
    const repoIssuesUrl = "https://api.github.com/repos/Sudo-Guy/Sudo-Guy.github.io/issues?state=all&per_page=20&sort=created&direction=desc";

    const extractAnswer = function (body) {
      if (!body) return "Opened a new trailhead discussion.";

      const answerMarker = "## My answer";
      const promptMarker = "## Site prompt";
      let text = body;
      const answerIndex = body.indexOf(answerMarker);
      if (answerIndex !== -1) {
        text = body.slice(answerIndex + answerMarker.length).trim();
      }

      const promptIndex = text.indexOf(promptMarker);
      if (promptIndex !== -1) {
        text = text.slice(0, promptIndex).trim();
      }

      text = text.replace(/\r/g, "").trim();
      return text.length > 220 ? `${text.slice(0, 217).trimEnd()}...` : text;
    };

    fetch(repoIssuesUrl, {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (response) {
        if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
        return response.json();
      })
      .then(function (issues) {
        const posts = issues
          .filter(function (issue) {
            return !issue.pull_request && /^Trailhead discussion:/i.test(issue.title);
          })
          .slice(0, 4);

        discussionList.innerHTML = "";
        if (!posts.length) {
          const empty = document.createElement("div");
          empty.className = "discussion-empty";
          empty.textContent = "No public replies yet. Be the first person to add a question.";
          discussionList.appendChild(empty);
          if (discussionStatus) {
            discussionStatus.textContent = "Public replies will appear here after visitors post them.";
          }
          return;
        }

        posts.forEach(function (issue) {
          const item = document.createElement("article");
          item.className = "discussion-item";

          const heading = document.createElement("h4");
          const link = document.createElement("a");
          link.href = issue.html_url;
          link.target = "_blank";
          link.rel = "noreferrer";
          link.textContent = issue.title.replace(/^Trailhead discussion:\s*/i, "");
          heading.appendChild(link);

          const meta = document.createElement("p");
          meta.className = "discussion-meta";
          meta.textContent = `${issue.user.login} posted on ${new Date(issue.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
          })}`;

          const excerpt = document.createElement("p");
          excerpt.className = "discussion-excerpt";
          excerpt.textContent = extractAnswer(issue.body);

          item.appendChild(heading);
          item.appendChild(meta);
          item.appendChild(excerpt);
          discussionList.appendChild(item);
        });

        if (discussionStatus) {
          discussionStatus.textContent = "Recent public replies from GitHub Issues.";
        }
      })
      .catch(function () {
        discussionList.innerHTML = "";
        const fallback = document.createElement("div");
        fallback.className = "discussion-empty";
        fallback.textContent = "Recent replies could not be loaded right now. Use the GitHub link below to view the public discussion.";
        discussionList.appendChild(fallback);
        if (discussionStatus) {
          discussionStatus.textContent = "GitHub replies are temporarily unavailable.";
        }
      });
  }
})();
