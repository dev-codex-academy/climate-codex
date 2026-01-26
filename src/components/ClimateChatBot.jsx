import { useEffect } from "react";
import { createChat } from "@n8n/chat";
import "@n8n/chat/style.css";

export const ClimateChatBot = () => {
    useEffect(() => {
        createChat({
            webhookUrl:
                "https://flows.codexcrm.click/webhook/00d397a0-8bab-4fdd-884c-dc05bfc68439/chat",
            mode: "window",
            chatInputKey: "chatInput",
            chatSessionKey: "sessionId",
            loadPreviousSession: true,
            showWelcomeScreen: false,
            defaultLanguage: "es",
            initialMessages: [
                "Hello! I'm ClimatesBot, your virtual CRM assistant. How can I help you today?",
            ],
            i18n: {
                es: {
                    title: "ClimatesBot – CRM Assistant",
                    subtitle:
                        "Access information, manage clients, and resolve system questions quickly and easily.",
                    footer: "Codex CRM • Smart Support",
                    getStarted: "New conversation",
                    inputPlaceholder: "Type your question here...",
                },
            },
        });

        if (window.innerWidth <= 768) {
            setTimeout(() => {
                const header = document.querySelector(".chat-header");
                const toggleBtn = document.querySelector(".chat-window-toggle"); // botón flotante

                if (header && toggleBtn && !document.querySelector("#closeChatBtn")) {
                    const btn = document.createElement("button");
                    btn.id = "closeChatBtn";
                    btn.innerHTML = "✕";
                    btn.style.cssText = `
                    background: transparent;
                    border: none;
                    color: var(--primary-foreground);
                    font-size: 1rem;      
                    cursor: pointer;
                    position: absolute;       
                    top: 10px;                
                    right: 10px;              
                    z-index: 1000;           
                    padding: 4px 8px;
                    border-radius: 4px;
                `;

                    // Aseguramos que el header tenga position relativa
                    if (getComputedStyle(header).position === "static") {
                        header.style.position = "relative";
                    }

                    btn.onclick = () => {
                        const chatWindow = document.querySelector(".chat-window");
                        if (chatWindow && chatWindow.style.display !== "none") {
                            toggleBtn.click(); // cierra el chat y sincroniza el toggle
                        }
                    };

                    header.appendChild(btn); // queda flotando en la esquina
                }
            }, 600);
        }





        const style = document.createElement("style");
        style.innerHTML = `
      :root {
        --chat--color-primary: var(--primary);
        --chat--color-secondary: var(--muted);
        --chat--color-accent: var(--accent);
        --chat--color-white: var(--background);
        --chat--color-light: var(--card);
        --chat--color-dark: var(--foreground);
        --chat--color-muted: var(--muted-foreground);

        --chat--window--width: 380px;
        --chat--window--height: 520px;
        --chat--window--bottom: 15px;
        --chat--window--right: 1.5rem;
        --chat--window--border-radius: var(--radius);
        --chat--window--border: 1px solid var(--border);
        --chat--window--z-index: 9999;
	
        --chat--header--background: var(--primary);
        --chat--header--color: var(--primary-foreground);

        --chat--message--bot--background: var(--muted);
        --chat--message--bot--color: var(--foreground);
        --chat--message--user--background: var(--primary);
        --chat--message--user--color: var(--primary-foreground);
	      --chat--message--padding: 0.7em;

        --chat--input--background: var(--card);
        --chat--input--text-color: var(--foreground);
        --chat--input--border-active: 1px solid var(--ring);
        --chat--input--send--button--color: var(--primary);
        --chat--input--send--button--color-hover: var(--accent);
        --chat--input--font-size: 0.9em;

        --chat--toggle--size: 47px;
        --chat--toggle--background: var(--primary);
        --chat--toggle--hover--background: var(--accent);
        --chat--toggle--active--background: var(--primary);
        --chat--toggle--color: var(--primary-foreground);
        --chat--toggle--bottom: 20px;
        --chat--toggle--right: 40px;
        --chat--toggle--border-radius: 50%;
        --chat--toggle--box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }

      .chat-layout .chat-header{
        gap: 0.6em;
      }

      .chat-layout .chat-header h1 {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 1.2em;
        font-weight: 600;
      }

      .chat-layout .chat-header h1::before {
        content: "";
        display: inline-block;
        width: 50px;
        height: 50px;
        background-color: var(--chat--header--color);
        -webkit-mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>');
        mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>');
        -webkit-mask-size: contain;
        mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: center;
        mask-position: center;
        background-image: none;
      }

      .chat-layout .chat-header p{
        font-size: 0.8em;
      }

      .chat-message{
        font-size: 0.9em;
      }

      svg{
        transform: scale(0.8);
      }

      @media (max-width: 768px) {
        :root {
          --chat--window--width: 100%;
          --chat--window--height: 100dvh;
          --chat--window--bottom: 15px;
          --chat--window--right: 1.5rem;
          --chat--window--border-radius: 0;
        }

        .chat-window {
          position: fixed !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          overflow: hidden !important;
        }

        .chat-layout {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
        }

        .chat-messages {
          flex: 1 1 auto !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch;
        }

        .chat-input {
          flex: 0 0 auto !important;
          padding-bottom: env(safe-area-inset-bottom, 16px) !important;
        }

        .chat-window.chat-keyboard-open {
          position: fixed !important;
          inset: 0 !important;
          height: auto !important;
        }
      }
        .chat-input input, .chat-input textarea {
           background-color: var(--input);
           color: var(--foreground);
        }
    `;
        document.head.appendChild(style);

        const applyViewportHeight = () => {
            if (window.innerWidth > 768) return;
            const chatWindow = document.querySelector(".chat-window");
            if (!chatWindow) return;
            const vh =
                (window.visualViewport && window.visualViewport.height) ||
                window.innerHeight;
            chatWindow.style.height = `${vh}px`;
            chatWindow.style.maxHeight = `${vh}px`;
        };


        const onInputFocus = (ev) => {
            const chatWindow = document.querySelector(".chat-window");
            const messages = document.querySelector(".chat-messages");
            const input = ev.target;

            if (chatWindow) chatWindow.classList.add("chat-keyboard-open");
            applyViewportHeight();

            setTimeout(() => {
                messages?.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
                try {
                    input.scrollIntoView({ behavior: "smooth", block: "nearest" });
                } catch { }
            }, 100);
        };

        const onInputBlur = () => {
            const chatWindow = document.querySelector(".chat-window");
            if (chatWindow) {
                chatWindow.classList.remove("chat-keyboard-open");
                setTimeout(applyViewportHeight, 50);
            }
        };

        const setupListeners = () => {
            if (window.innerWidth <= 768) {
                if (window.visualViewport) {
                    window.visualViewport.addEventListener("resize", applyViewportHeight);
                    window.visualViewport.addEventListener("scroll", applyViewportHeight);
                } else {
                    window.addEventListener("resize", applyViewportHeight);
                }
            }

            const observe = new MutationObserver(() => {
                const input = document.querySelector(
                    ".chat-input input, .chat-input textarea, .chat-footer input, .chat-footer textarea"
                );
                if (input && !input._n8n_attached) {
                    input.addEventListener("focus", onInputFocus);
                    input.addEventListener("blur", onInputBlur);
                    input._n8n_attached = true;
                }
            });

            observe.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                applyViewportHeight();
                const input = document.querySelector(
                    ".chat-input input, .chat-input textarea, .chat-footer input, .chat-footer textarea"
                );
                if (input && !input._n8n_attached) {
                    input.addEventListener("focus", onInputFocus);
                    input.addEventListener("blur", onInputBlur);
                    input._n8n_attached = true;
                }
            }, 300);

            return () => {
                if (window.visualViewport) {
                    window.visualViewport.removeEventListener("resize", applyViewportHeight);
                    window.visualViewport.removeEventListener("scroll", applyViewportHeight);
                } else {
                    window.removeEventListener("resize", applyViewportHeight);
                }
                observe.disconnect();
            };
        };

        const cleanup = setupListeners();

        return () => {
            cleanup();
            document.head.removeChild(style);
        };
    }, []);

    return null;
};
