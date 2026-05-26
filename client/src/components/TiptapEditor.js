import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

// ─── Toolbar Button ──────────────────────────────────────────────────────────
const ToolbarBtn = ({ onClick, active, title, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`
      relative flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold
      transition-all duration-150 select-none flex-shrink-0
      ${active
        ? "bg-x-blue text-white shadow-lg shadow-x-blue/30"
        : "text-x-gray hover:text-x-white hover:bg-white/8"
      }
      ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
    `}
    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
  >
    {children}
  </button>
);

// ─── Divider ─────────────────────────────────────────────────────────────────
const Divider = () => (
  <div className="w-px h-5 bg-white/10 mx-1 flex-shrink-0" />
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TiptapEditor = ({
  value,
  onChange,
  placeholder = "Share your thoughts, ideas, or questions with the DevMate community...",
  maxLength = 2000,
  onFocus,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable the built-in codeBlock so we don't double up
        codeBlock: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "tiptap-placeholder",
      }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If the only content is an empty paragraph, treat as empty
      const isEmpty = editor.isEmpty;
      onChange(isEmpty ? "" : html);
    },
    onFocus: () => onFocus && onFocus(),
    editorProps: {
      attributes: {
        class: "tiptap-editor-area",
        spellcheck: "true",
      },
    },
  });

  // Sync external value reset (e.g., after post submit)
  useEffect(() => {
    if (!editor) return;
    if (value === "" && !editor.isEmpty) {
      editor.commands.clearContent(true);
    }
  }, [value, editor]);

  if (!editor) return null;


  return (
    <div className="tiptap-wrapper">
      {/* ── Toolbar ── */}
      <div className="tiptap-toolbar">
        <div className={`tiptap-toolbar-buttons ${isExpanded ? "tiptap-toolbar-buttons-expanded" : "tiptap-toolbar-buttons-collapsed"}`}>
          {/* Text style */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold (Ctrl+B)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic (Ctrl+I)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline (Ctrl+U)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>
            </svg>
          </ToolbarBtn>

          <Divider />

          {/* Headings */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            H1
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            H2
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            H3
          </ToolbarBtn>

          <Divider />

          {/* Lists */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-8v2h14V3H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
            </svg>
          </ToolbarBtn>

          <Divider />

          {/* Block quote & inline code */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Inline Code"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
            </svg>
          </ToolbarBtn>

          <Divider />

          {/* Undo / Redo */}
          <ToolbarBtn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
            </svg>
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
            </svg>
          </ToolbarBtn>
        </div>

        {/* Right-aligned actions (toggle button) */}
        <div className="tiptap-toolbar-right">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse formatting tools" : "Expand formatting tools"}
            className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/30 hover:border-white/60 text-x-gray hover:text-x-white hover:bg-white/8 transition-all duration-150 cursor-pointer flex-shrink-0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isExpanded ? "rotate(45deg)" : "rotate(0deg)",
                transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Editor Area ── */}
      <EditorContent editor={editor} />

      {/* Tiptap styles injected inline */}
      <style>{`
        .tiptap-wrapper {
          background: transparent;
          border: none;
          border-radius: 0;
          overflow: hidden;
          transition: none;
        }
        .tiptap-wrapper:focus-within {
          border-color: transparent;
          box-shadow: none;
        }

        .tiptap-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0px;
          background: transparent;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          gap: 12px;
          overflow: hidden;
        }

        .tiptap-toolbar-buttons {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          gap: 2px;
          flex-grow: 1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .tiptap-toolbar-buttons-collapsed {
          opacity: 0;
          max-width: 0;
          transform: translateX(-10px);
          pointer-events: none;
          padding: 0;
          margin: 0;
          gap: 0;
        }

        .tiptap-toolbar-buttons-expanded {
          opacity: 1;
          max-width: 500px;
          transform: translateX(0);
          pointer-events: auto;
        }

        .tiptap-toolbar-right {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .tiptap-toolbar-counter {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .tiptap-toolbar-counter.has-border {
          padding-left: 8px;
          border-left: 1px solid rgba(255,255,255,0.08);
        }

        @media (max-width: 640px) {
          .tiptap-toolbar-buttons {
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;  /* Firefox */
            -ms-overflow-style: none;  /* IE and Edge */
            padding-bottom: 2px;
          }
          .tiptap-toolbar-buttons-expanded::-webkit-scrollbar {
            display: none; /* Hide scrollbars for Chrome/Safari */
          }
        }

        .tiptap-editor-area {
          min-height: 320px;
          max-height: 600px;
          overflow-y: auto;
          padding: 16px 0px;
          outline: none;
          color: #f1f5f9;
          font-size: 24px;
          line-height: 1.5;
          font-family: 'Inter', 'Space Grotesk', sans-serif;
          caret-color: #1d9bf0;
        }

        /* Placeholder */
        .tiptap-editor-area p.is-editor-empty:first-child::before,
        .tiptap-placeholder:first-child::before {
          content: attr(data-placeholder);
          color: rgba(156,163,175,0.6);
          pointer-events: none;
          position: absolute;
          font-family: 'Inter', sans-serif;
          font-size: 24px;
        }

        /* Prose styles inside editor */
        .tiptap-editor-area h1 { font-size: 1.6em; font-weight: 800; margin: 0.6em 0 0.3em; color: #fff; letter-spacing: -0.02em; font-family: 'Space Grotesk', sans-serif; }
        .tiptap-editor-area h2 { font-size: 1.35em; font-weight: 700; margin: 0.5em 0 0.25em; color: #fff; font-family: 'Space Grotesk', sans-serif; }
        .tiptap-editor-area h3 { font-size: 1.15em; font-weight: 700; margin: 0.4em 0 0.2em; color: #e2e8f0; font-family: 'Space Grotesk', sans-serif; }

        .tiptap-editor-area p { margin: 0.35em 0; }
        .tiptap-editor-area strong { color: #fff; font-weight: 700; }
        .tiptap-editor-area em { color: #cbd5e1; font-style: italic; }
        .tiptap-editor-area u { text-decoration-color: #1d9bf0; }
        .tiptap-editor-area s { color: #6b7280; }

        .tiptap-editor-area ul,
        .tiptap-editor-area ol { padding-left: 1.5em; margin: 0.4em 0; }
        .tiptap-editor-area li { margin: 0.15em 0; }
        .tiptap-editor-area ul li { list-style-type: disc; }
        .tiptap-editor-area ol li { list-style-type: decimal; }

        .tiptap-editor-area blockquote {
          border-left: 3px solid #1d9bf0;
          padding-left: 14px;
          margin: 0.6em 0;
          color: #94a3b8;
          font-style: italic;
        }

        .tiptap-editor-area code {
          background: rgba(29,155,240,0.12);
          border: 1px solid rgba(29,155,240,0.25);
          border-radius: 4px;
          padding: 1px 6px;
          font-family: 'Fira Code', 'Monaco', monospace;
          font-size: 0.88em;
          color: #60a5fa;
        }

        /* Scrollbar */
        .tiptap-editor-area::-webkit-scrollbar { width: 4px; }
        .tiptap-editor-area::-webkit-scrollbar-track { background: transparent; }
        .tiptap-editor-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        /* Feed rendering — rich content */
        .rich-content h1 { font-size: 1.5em; font-weight: 800; margin: 0.5em 0 0.2em; color: #fff; font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }
        .rich-content h2 { font-size: 1.25em; font-weight: 700; margin: 0.4em 0 0.2em; color: #fff; font-family: 'Space Grotesk', sans-serif; }
        .rich-content h3 { font-size: 1.1em; font-weight: 700; margin: 0.3em 0 0.15em; color: #e2e8f0; font-family: 'Space Grotesk', sans-serif; }
        .rich-content p { margin: 0.3em 0; line-height: 1.65; color: #e2e8f0; }
        .rich-content strong { color: #fff; font-weight: 700; }
        .rich-content em { font-style: italic; color: #cbd5e1; }
        .rich-content u { text-decoration-color: #1d9bf0; }
        .rich-content s { color: #6b7280; }
        .rich-content ul, .rich-content ol { padding-left: 1.4em; margin: 0.3em 0; }
        .rich-content li { margin: 0.1em 0; color: #e2e8f0; }
        .rich-content ul li { list-style-type: disc; }
        .rich-content ol li { list-style-type: decimal; }
        .rich-content blockquote {
          border-left: 3px solid #1d9bf0;
          padding-left: 12px;
          margin: 0.5em 0;
          color: #94a3b8;
          font-style: italic;
        }
        .rich-content code {
          background: rgba(29,155,240,0.1);
          border: 1px solid rgba(29,155,240,0.2);
          border-radius: 4px;
          padding: 1px 5px;
          font-family: 'Fira Code', monospace;
          font-size: 0.87em;
          color: #60a5fa;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;
