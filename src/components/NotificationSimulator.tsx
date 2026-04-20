import { useState, FormEvent } from 'react';
import { Send, Plus, AppWindow } from 'lucide-react';

interface Props {
  onSimulate: (sender: string, content: string, app: string) => void;
}

export default function NotificationSimulator({ onSimulate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [sender, setSender] = useState('');
  const [content, setContent] = useState('');
  const [app, setApp] = useState('WhatsApp');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sender || !content) return;
    onSimulate(sender, content, app);
    setSender('');
    setContent('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 bg-[var(--accent)] text-white rounded-full shadow-lg shadow-[var(--accent)]/20 hover:scale-110 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      ) : (
        <div className="vault-glass p-6 rounded-2xl w-80 shadow-2xl border-[var(--surface-border)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#71717A]">Mock Signal</h3>
            <button onClick={() => setIsOpen(false)} className="text-[#71717A] hover:text-white">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-[#71717A] uppercase block mb-1.5 ml-1">Source App</label>
              <select 
                value={app}
                onChange={(e) => setApp(e.target.value)}
                className="w-full bg-white/5 border border-[var(--surface-border)] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telegram">Telegram</option>
                <option value="Instagram">Instagram</option>
                <option value="Messenger">Messenger</option>
                <option value="Discord">Discord</option>
                <option value="Slack">Slack</option>
                <option value="SMS">SMS Message</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Email">Work Email</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#71717A] uppercase block mb-1.5 ml-1">Sender</label>
              <input 
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Manager / Mom / J. Doe"
                className="w-full bg-white/5 border border-[var(--surface-border)] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#71717A] uppercase block mb-1.5 ml-1">Payload Content</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="The project deadline has shifted..."
                rows={3}
                className="w-full bg-white/5 border border-[var(--surface-border)] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 resize-none transition-colors"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[var(--accent)] hover:opacity-90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Send className="w-4 h-4" />
              INJECT TO VAULT
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
