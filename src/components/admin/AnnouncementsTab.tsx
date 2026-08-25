import React, { useState } from 'react';
import { Megaphone, Send, Loader2, Clock, MessageSquare, PenLine, History } from 'lucide-react';
import { toast } from 'react-toastify';
import { profileCard, sectionLabel } from './ProfileParts';

interface Announcement {
  id: string;
  message: string;
  date: Date;
}

export const AnnouncementsTab: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState<Announcement[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    
    // Simulate API call to send notification to all drivers
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        message: message.trim(),
        date: new Date(),
      };
      
      setHistory([newAnnouncement, ...history]);
      toast.success('Announcement sent to all drivers successfully!');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send announcement. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10">
          <Megaphone className="size-6 text-brand-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Broadcast</h2>
          <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
            Send real-time announcements to all drivers.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:gap-6">
        <div className={profileCard}>
          <div className={`flex items-center gap-2 ${sectionLabel}`}>
            <PenLine className="size-4" />
            Compose Message
          </div>
          <form onSubmit={handleSend} className="mt-4 flex flex-col gap-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your announcement here..."
              className="min-h-[160px] w-full resize-y rounded-xl border border-line bg-ink-900/50 p-5 text-[15px] leading-relaxed text-slate-200 outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-brand-500 focus:bg-ink-900 focus:ring-1 focus:ring-brand-500"
              disabled={isSending}
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-8 py-3.5 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500"
              >
                {isSending ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-5" />
                    Send Announcement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className={profileCard}>
          <div className={`flex items-center gap-2 ${sectionLabel}`}>
            <History className="size-4" />
            Announcement History
          </div>
          
          <div className="mt-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line py-16 text-slate-500">
                <MessageSquare className="size-10 opacity-20" />
                <p className="text-sm">No announcements sent yet. Your sent messages will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {history.map((item) => (
                  <div key={item.id} className="group flex flex-col gap-3 rounded-xl border border-white/[0.04] bg-ink-900 p-5 transition-all duration-300 hover:border-brand-500/30 hover:bg-white/[0.02] sm:flex-row sm:items-start sm:gap-6">
                    <div className="flex shrink-0 items-center gap-2 sm:w-48 sm:flex-col sm:items-start sm:gap-1">
                      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-500">
                        <Clock className="size-3.5" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-200">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
