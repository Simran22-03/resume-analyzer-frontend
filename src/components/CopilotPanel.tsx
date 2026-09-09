"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";

import api from "@/lib/api";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

interface CopilotPanelProps {
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  resumeId: number | string;
}

export default function CopilotPanel({
  isOpen = true,
  onOpen,
  onClose,
  resumeId,
}: CopilotPanelProps) {
  const [open, setOpen] = useState(isOpen);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [sending, setSending] = useState(false);

  /*
   * =========================================================
   * COPILOT WIDTH
   * =========================================================
   *
   * Default width  : 360px
   * Minimum width  : 300px
   * Maximum width  : almost the full browser width
   *
   * The old maximum of 700px has been removed.
   */

  const [panelWidth, setPanelWidth] = useState(360);

  const isResizing = useRef(false);

  /*
   * Keep open state synchronized
   */

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  /*
   * =========================================================
   * LOAD CHAT HISTORY
   * =========================================================
   *
   * History comes from Django backend.
   */

  useEffect(() => {
    if (!resumeId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const loadHistory = async () => {
      try {
        const response = await api.get(
          `/dashboard/resumes/${resumeId}/copilot/history/`
        );

        if (cancelled) {
          return;
        }

        const backendMessages = response.data?.messages;

        if (Array.isArray(backendMessages)) {
          setMessages(backendMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Unable to load Copilot history:",
            error
          );

          setMessages([]);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  /*
   * =========================================================
   * OPEN / CLOSE
   * =========================================================
   */

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleOpen = () => {
    setOpen(true);
    onOpen?.();
  };

  /*
   * =========================================================
   * RESIZE COPILOT
   * =========================================================
   *
   * VS Code-style resizing.
   *
   * Drag LEFT  -> Copilot becomes wider
   * Drag RIGHT -> Copilot becomes smaller
   *
   * Maximum width = browser width - collapsed sidebar width.
   */

  const handleResizeStart = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!open) {
      return;
    }

    event.preventDefault();

    isResizing.current = true;

    const startX = event.clientX;

    const startWidth = panelWidth;

    const handlePointerMove = (
      moveEvent: PointerEvent
    ) => {
      if (!isResizing.current) {
        return;
      }

      /*
       * Since Copilot is fixed to the RIGHT:
       *
       * Move LEFT  -> increase width
       * Move RIGHT -> decrease width
       */

      const newWidth =
        startWidth +
        (startX - moveEvent.clientX);

      /*
       * Minimum width
       */

      const minWidth = 300;

      /*
       * Maximum width.
       *
       * Copilot can now expand to almost the
       * entire browser window.
       */

      const maxWidth =
        Math.max(
          minWidth,
          window.innerWidth - 46
        );

      /*
       * Keep width inside allowed range.
       */

      const clampedWidth =
        Math.min(
          maxWidth,
          Math.max(
            minWidth,
            newWidth
          )
        );

      setPanelWidth(clampedWidth);
    };

    const handlePointerUp = () => {
      isResizing.current = false;

      document.body.style.cursor = "";

      document.body.style.userSelect = "";

      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp
      );
    };

    document.body.style.cursor = "col-resize";

    document.body.style.userSelect = "none";

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp
    );
  };

  /*
   * =========================================================
   * SEND MESSAGE
   * =========================================================
   *
   * Only the current message is sent.
   *
   * Chat history remains controlled by Django.
   */

  const sendMessage = async () => {
    const text = message.trim();

    if (
      !text ||
      sending ||
      !resumeId
    ) {
      return;
    }

    setMessage("");

    setSending(true);

    try {
      const response = await api.post(
        `/dashboard/resumes/${resumeId}/copilot/`,
        {
          message: text,
        }
      );

      const backendMessages =
        response.data?.messages;

      if (Array.isArray(backendMessages)) {
        setMessages(backendMessages);
      }
    } catch (error) {
      console.error(
        "Copilot error:",
        error
      );

      /*
       * Put the message back into
       * the input if backend fails.
       */

      setMessage(text);
    } finally {
      setSending(false);
    }
  };

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <aside
      className={`fixed right-0 top-0 z-[100] h-screen border-l border-[#dfe7f1] bg-white ${
        open
          ? ""
          : "w-[46px]"
      }`}
      style={
        open
          ? {
              width: `${panelWidth}px`,
              maxWidth:
                "calc(100vw - 46px)",
              minWidth: "300px",
            }
          : undefined
      }
    >
      {open ? (
        <div className="relative flex h-full flex-col bg-white">

          {/* =================================================
              RESIZE HANDLE
          ================================================= */}

          <div
            onPointerDown={
              handleResizeStart
            }
            title="Resize Copilot"
            className="absolute left-0 top-0 z-[120] h-full w-2 cursor-col-resize hover:bg-[#d9e6f7]"
          />

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-[#e8edf4] px-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4ff] text-[#2463eb]">
                <Bot size={18} />
              </div>

              <div>

                <h2 className="text-[13px] font-bold text-[#102a56]">
                  Copilot
                </h2>

                <div className="mt-0.5 flex items-center gap-1">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-[8px] text-[#8190a6]">
                    Resume Assistant
                  </span>

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={
                handleClose
              }
              title="Minimize Copilot"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#71829c] hover:bg-[#f3f6fa] hover:text-[#2463eb]"
            >
              <ChevronRight
                size={17}
              />
            </button>

          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="min-h-0 flex-1 overflow-y-auto p-4">

            <div className="space-y-3">

              {messages.length === 0 && (

                <div className="flex items-start gap-2">

                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#2463eb]">
                    <Bot size={13} />
                  </div>

                  <div className="max-w-[82%] break-words rounded-lg bg-[#eef5ff] px-3 py-2.5 text-[10px] leading-relaxed text-[#52647d]">
                    Upload your resume and I'll help you understand your skills, strengths and improvement areas.
                  </div>

                </div>

              )}

              {messages.map(
                (item) => (

                  <div
                    key={item.id}
                    className={`flex ${
                      item.role === "user"
                        ? "justify-end"
                        : "items-start gap-2"
                    }`}
                  >

                    {item.role === "assistant" && (

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#2463eb]">

                        <Bot size={13} />

                      </div>

                    )}

                    <div
                      className={`max-w-[82%] break-words rounded-lg px-3 py-2.5 text-[10px] leading-relaxed whitespace-pre-line ${
                        item.role === "user"
                          ? "bg-[#2463eb] text-white"
                          : "bg-[#eef5ff] text-[#52647d]"
                      }`}
                    >
                      {item.content}
                    </div>

                  </div>

                )
              )}

            </div>

          </div>

          {/* =================================================
              INPUT
          ================================================= */}

          <div className="shrink-0 border-t border-[#e8edf4] bg-white p-3">

            <div className="flex items-center gap-2 rounded-lg border border-[#dfe7f1] bg-white px-3 py-1.5">

              <input
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();

                    sendMessage();
                  }

                }}
                placeholder="Ask anything about your resume..."
                disabled={sending}
                className="min-w-0 flex-1 bg-transparent py-1.5 text-[10px] text-[#102a56] outline-none placeholder:text-[#9aa8ba]"
              />

              <button
                type="button"
                onClick={
                  sendMessage
                }
                title="Send"
                disabled={
                  sending ||
                  !message.trim()
                }
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#2463eb] text-white hover:bg-[#1f57d0] disabled:opacity-60"
              >
                <Send size={12} />
              </button>

            </div>

            <p className="mt-2 text-center text-[8px] text-[#9aa8ba]">
              Your resume data is securely protected.
            </p>

          </div>

        </div>

      ) : (

        <div className="flex h-full w-full flex-col items-center border-l border-[#dfe7f1] bg-white">

          <button
            type="button"
            onClick={
              handleOpen
            }
            title="Open Copilot"
            className="mt-[86px] flex h-8 w-8 items-center justify-center rounded-md bg-[#edf4ff] text-[#2463eb] hover:bg-[#e4efff]"
          >
            <ChevronLeft
              size={16}
            />
          </button>

          <div className="mt-4 flex items-center justify-center">

            <Bot
              size={17}
              className="text-[#2463eb]"
            />

          </div>

        </div>

      )}

    </aside>
  );
}