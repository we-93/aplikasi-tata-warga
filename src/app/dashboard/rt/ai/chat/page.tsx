"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, Bot, User, Paperclip, X, RotateCcw } from "lucide-react";
import { chatWithAi } from "@/app/actions/ai";

export default function AiChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: any }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("tw_chat_history");
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Gagal load history chat", e);
      }
    }
  }, []);

  // Save to localStorage when messages change (keep max 20)
  useEffect(() => {
    if (messages.length > 0) {
      const historyToSave = messages.slice(-20);
      localStorage.setItem("tw_chat_history", JSON.stringify(historyToSave));
    } else {
      localStorage.removeItem("tw_chat_history");
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewSession = () => {
    if (confirm("Mulai sesi baru dan hapus percakapan ini?")) {
      setMessages([]);
      localStorage.removeItem("tw_chat_history");
    }
  };

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
        toast.success("Gambar berhasil dilampirkan");
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Format file tidak didukung. Harap pilih gambar.");
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() && !attachedImage) return;

    if (chatInput.length > 500) {
      toast.error("Pesan terlalu panjang (Maks. 500 karakter)");
      return;
    }

    const now = Date.now();
    if (now - lastRequestTime < 3000) {
      toast.error("Mohon tunggu sebentar sebelum mengirim pesan lagi (Anti-Spam)");
      return;
    }
    setLastRequestTime(now);

    let userContent: any = chatInput;
    if (attachedImage) {
      userContent = [
        { type: "text", text: chatInput || "Tolong jelaskan gambar ini" },
        { type: "image_url", image_url: { url: attachedImage } }
      ];
    }

    const newMessage = { role: "user", content: userContent };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setChatInput("");
    setAttachedImage(null);
    setIsChatLoading(true);

    try {
      // Optimasi: Hanya kirim 6 pesan terakhir (3 sesi tanya jawab) agar token tidak bengkak
      const historyToSend = newMessages.slice(-6);
      const res = await chatWithAi(historyToSend);
      if (res.success && res.message) {
        setMessages([...newMessages, res.message as any]);
      } else {
        toast.error(res.error || "Gagal menghubungi AI");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-card border rounded-xl overflow-hidden shadow-sm mt-0 h-full max-h-full relative">
      
      {/* Header Kecil dengan Tombol Sesi Baru */}
      <div className="absolute top-2 right-2 z-10">
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleNewSession} className="bg-white/80 dark:bg-black/50 backdrop-blur-sm text-xs h-8 shadow-sm">
            <RotateCcw className="w-3 h-3 mr-1" />
            Sesi Baru
          </Button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 pt-12">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
            <Bot className="w-16 h-16 mb-4 text-primary" />
            <p>Mulai obrolan dengan AI Assistant.</p>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role !== 'user' && <div className="w-8 h-8 rounded-full bg-card border border-border-card-foreground shrink-0 flex items-center justify-center text-primary"><Bot className="w-4 h-4" /></div>}
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-primary hover:bg-primary/90 text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
              {typeof m.content === 'string' ? (
                <div className="whitespace-pre-wrap">{m.content}</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {m.content.map((c: any, i: number) => {
                    if (c.type === 'text') return <div key={i} className="whitespace-pre-wrap">{c.text}</div>;
                    if (c.type === 'image_url') return <img key={i} src={c.image_url.url} alt="Uploaded" className="max-w-[250px] rounded-lg border border-white/20" />;
                    return null;
                  })}
                </div>
              )}
            </div>

            {m.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 shrink-0"><User className="w-4 h-4" /></div>}
          </div>
        ))}
        {isChatLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-card border border-border-card-foreground shrink-0 flex items-center justify-center text-primary"><Bot className="w-4 h-4" /></div>
            <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              Asisten RT sedang mengetik....
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t bg-muted/30">
        {attachedImage && (
          <div className="mb-3 relative inline-block">
            <img src={attachedImage} alt="Preview" className="h-20 w-auto rounded-md border shadow-sm" />
            <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-foreground rounded-full p-1 shadow hover:bg-red-600">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileAttach} />
          <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => fileInputRef.current?.click()} title="Lampirkan Foto">
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="relative flex-1">
            <Input 
              placeholder="Tanya sesuatu ke AI atau minta rangkum catatan..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter') handleSendChat() }}
              className="w-full bg-white dark:bg-black pr-14 h-12 text-base rounded-xl"
            />
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs ${chatInput.length > 500 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
              {chatInput.length}/500
            </div>
          </div>
          <Button className="h-12 w-12 bg-[#6419c1] hover:bg-[#7735d4] text-white rounded-xl" onClick={handleSendChat} disabled={isChatLoading || chatInput.length > 500 || (!chatInput.trim() && !attachedImage)}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
