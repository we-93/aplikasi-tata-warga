"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";

// Load Jodit dynamically to prevent SSR issues
const JoditEditor = dynamic(() => import("jodit-react"), { 
  ssr: false,
  loading: () => <div className="h-[400px] flex items-center justify-center bg-muted/20 border rounded-md">Memuat Editor...</div>
});

export function QuillEditor({ value, onChange }: { value: string; onChange: (content: string) => void }) {
  const editor = useRef(null);
  
  const config = useMemo(() => ({
    readonly: false,
    placeholder: "Ketik isi surat Anda di sini...",
    minHeight: 400,
    buttons: [
      'source', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'table', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'fullsize'
    ],
    uploader: {
      insertImageAsBase64URI: true
    },
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false
  }), []);

  return (
    <div className="bg-white rounded-md border text-base shadow-sm">
      <style>{`
        .jodit-workplace {
          background-color: #f5f5f5 !important;
          padding: 32px 16px !important;
        }
        .jodit-wysiwyg {
          width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 auto !important;
          background-color: white !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
          padding: 2.54cm !important;
          border: 1px solid #e5e7eb !important;
          font-family: 'Times New Roman', Times, serif !important;
          font-size: 12pt !important;
          line-height: 1.5 !important;
        }
        .jodit-wysiwyg table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        .jodit-wysiwyg td, .jodit-wysiwyg th {
          vertical-align: top !important;
          padding: 2px 4px !important;
        }
        .jodit-wysiwyg hr {
          border: none !important;
          border-top: 3px solid black !important;
          border-bottom: 1px solid black !important;
          height: 2px !important;
          margin: 15px 0 !important;
        }
      `}</style>
      <JoditEditor
        ref={editor}
        value={value}
        config={config}
        onBlur={newContent => onChange(newContent)}
        onChange={() => {}} // We handle it in onBlur to prevent lag
      />
    </div>
  );
}
