/* ============================================================
   BHARTIYA BOT — Chat Logic & Visual Effects
   ============================================================ */

(function () {
  "use strict";

  // ---- DOM refs ----
  const chatArea       = document.getElementById("chat-area");
  const messageInput   = document.getElementById("message-input");
  const sendBtn        = document.getElementById("send-btn");
  const typingIndicator= document.getElementById("typing-indicator");
  const welcomeCard    = document.getElementById("welcome-card");
  const sampleChips    = document.querySelectorAll(".sample-chip");
  const canvas         = document.getElementById("particles-canvas");
  const ctx            = canvas.getContext("2d");

  // ---- State ----
  let isWaiting = false;

  // ============================================================
  // PARTICLE SYSTEM
  // ============================================================
  const particles = [];
  const PARTICLE_COUNT = 60;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.hue = Math.random() > 0.5 ? 30 : 200; // saffron or blue
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    resizeCanvas();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });

    // Draw subtle connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 153, 51, ${0.03 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animateParticles);
  }

  window.addEventListener("resize", resizeCanvas);
  initParticles();
  animateParticles();

  // ============================================================
  // CHAT LOGIC
  // ============================================================

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatReply(text) {
    // Simple markdown-like formatting
    // Bold: **text** → <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic: *text* → <em>text</em>
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Detect Devanagari blocks and wrap them
    text = text.replace(/([\u0900-\u097F\u0964\u0965।॥]+(?:\s*[\u0900-\u097F\u0964\u0965।॥]+)*)/g,
      '<span class="sanskrit">$1</span>');
    // Line breaks
    text = text.replace(/\n/g, "<br/>");
    return text;
  }

  function addMessage(content, sender) {
    // Hide welcome card on first message
    if (welcomeCard) {
      welcomeCard.style.display = "none";
    }

    const row = document.createElement("div");
    row.className = `message-row ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = `avatar ${sender === "krishna" ? "krishna-avatar" : "user-avatar"}`;
    avatar.textContent = sender === "krishna" ? "🪷" : "🙏";

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    const msgContent = document.createElement("div");
    msgContent.className = "msg-content";
    if (sender === "krishna") {
      msgContent.innerHTML = formatReply(content);
    } else {
      msgContent.textContent = content;
    }

    const time = document.createElement("span");
    time.className = "msg-time";
    time.textContent = getTime();

    bubble.appendChild(msgContent);
    bubble.appendChild(time);
    row.appendChild(avatar);
    row.appendChild(bubble);
    chatArea.appendChild(row);

    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function showTyping() {
    typingIndicator.classList.add("visible");
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function hideTyping() {
    typingIndicator.classList.remove("visible");
  }

  async function sendMessage(text) {
    if (!text.trim() || isWaiting) return;

    isWaiting = true;
    sendBtn.disabled = true;
    messageInput.value = "";
    autoResizeInput();

    // Add user message
    addMessage(text.trim(), "user");

    // Show typing
    showTyping();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() })
      });

      const data = await res.json();
      hideTyping();

      const reply = data.reply || "Parth, my guidance is momentarily clouded. Please try again.";
      addMessage(reply, "krishna");

    } catch (err) {
      hideTyping();
      addMessage("Parth, the divine connection is temporarily interrupted. Please try again in a moment. 🙏", "krishna");
      console.error("Chat Error:", err);
    }

    isWaiting = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  // Send button
  sendBtn.addEventListener("click", () => {
    sendMessage(messageInput.value);
  });

  // Enter key (Shift+Enter for newline)
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(messageInput.value);
    }
  });

  // Auto-resize textarea
  function autoResizeInput() {
    messageInput.style.height = "auto";
    messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + "px";
  }

  messageInput.addEventListener("input", autoResizeInput);

  // Sample question chips
  sampleChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const msg = chip.getAttribute("data-msg");
      if (msg && !isWaiting) {
        sendMessage(msg);
      }
    });
  });

  // Focus input on load
  messageInput.focus();

})();
