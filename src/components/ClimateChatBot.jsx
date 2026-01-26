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
                "👋 Hello! I'm ClimatesBot, your virtual CRM assistant. How can I help you today?",
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
                    color: white;
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
        --chat--color-primary: #417dcf;
        --chat--color-primary-shade-50: #1C6CBF;
        --chat--color-primary-shade-100: #1F7ADB;
        --chat--color-secondary: #EAF3FB;
        --chat--color-accent: #1CE299;
        --chat--color-white: #FFFFFF;
        --chat--color-light: #F8FAFC;
        --chat--color-dark: #1E293B;
        --chat--color-muted: #CBD5E1;

        --chat--window--width: 380px;
        --chat--window--height: 520px;
        --chat--window--bottom: 15px;
        --chat--window--right: 1.5rem;
        --chat--window--border-radius: 0.75rem;
        --chat--window--border: 0px solid var(--chat--color-secondary);
        --chat--window--z-index: 9999;
	
        --chat--header--background: linear-gradient(135deg, #14528E, #1C6CBF);
        --chat--header--color: var(--chat--color-white);

        --chat--message--bot--background: var(--chat--color-secondary);
        --chat--message--bot--color: var(--chat--color-dark);
        --chat--message--user--background: color-mix(in oklab, #202e4b 80%, transparent);
        --chat--message--user--color: var(--chat--color-white);
	      --chat--message--padding: 0.7em;

        --chat--input--background: var(--chat--color-white);
        --chat--input--text-color: var(--chat--color-dark);
        --chat--input--border-active: 1px solid var(--chat--color-primary);
        --chat--input--send--button--color: var(--chat--color-primary);
        --chat--input--send--button--color-hover: var(--chat--color-accent);
        --chat--input--font-size: 0.9em;

        --chat--toggle--size: 47px;
        --chat--toggle--background: linear-gradient(
          145deg,
          var(--color-novo-fondo-terciario-variante6),
          var(--color-novo-fondo-terciario-variante3)
        );
        --chat--toggle--hover--background: linear-gradient(
          145deg,
          var(--color-novo-fondo-terciario-variante3),
          var(--color-novo-fondo-terciario-variante4)
        );
        --chat--toggle--active--background: var(--color-novo-fondo-terciario-variante4);
        --chat--toggle--color: #ffffff;
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
        background-image: url("/images/NOVOChat.svg");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
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
