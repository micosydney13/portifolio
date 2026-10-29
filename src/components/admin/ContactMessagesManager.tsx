import React, { useState } from 'react';
import { Mail, MailOpen, Trash2, Archive, Reply, Calendar, User, Search, X } from 'lucide-react';
import { ContactMessage } from '../../types';
import { markMessageRead, archiveMessage, deleteMessage } from '../../lib/storage';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface ContactMessagesManagerProps {
  messages: ContactMessage[];
  onSaved: (msg: string) => void;
}

export const ContactMessagesManager: React.FC<ContactMessagesManagerProps> = ({ messages, onSaved }) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null);

  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread' && (m.read || m.archived)) return false;
    if (filter === 'archived' && !m.archived) return false;
    if (filter === 'all' && m.archived) return false;

    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      await markMessageRead(msg.id, true);
      onSaved('Message marked as read.');
    }
  };

  const handleToggleRead = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    await markMessageRead(msg.id, !msg.read);
    onSaved(`Message marked as ${!msg.read ? 'read' : 'unread'}.`);
  };

  const handleToggleArchive = async (msg: ContactMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await archiveMessage(msg.id, !msg.archived);
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage({ ...selectedMessage, archived: !msg.archived });
    }
    onSaved(`Message ${!msg.archived ? 'archived' : 'restored'}.`);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    await deleteMessage(toDelete.id);
    if (selectedMessage?.id === toDelete.id) {
      setSelectedMessage(null);
    }
    setToDelete(null);
    onSaved('Message permanently removed from database.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-950">
            Contact Messages & Client Inquiries
          </h2>
          <p className="text-xs font-mono-code text-neutral-500 mt-1">
            Real inquiries submitted through the public website. Secured by administrator Row-Level Security.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-code px-3 py-1 bg-black text-white">
            {messages.filter((m) => !m.read && !m.archived).length} Unread
          </span>
          <span className="text-xs font-mono-code px-3 py-1 bg-neutral-100 text-neutral-700">
            {messages.length} Total
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200 p-3">
        <div className="flex border border-neutral-200 p-0.5 bg-neutral-50 text-xs font-mono-code">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 uppercase ${filter === 'all' ? 'bg-black text-white font-semibold' : 'text-neutral-600 hover:text-black'}`}
          >
            Inbox ({messages.filter((m) => !m.archived).length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 uppercase ${filter === 'unread' ? 'bg-black text-white font-semibold' : 'text-neutral-600 hover:text-black'}`}
          >
            Unread ({messages.filter((m) => !m.read && !m.archived).length})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-3 py-1 uppercase ${filter === 'archived' ? 'bg-black text-white font-semibold' : 'text-neutral-600 hover:text-black'}`}
          >
            Archived ({messages.filter((m) => m.archived).length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono-code border border-neutral-200 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Messages List / Grid */}
      {filteredMessages.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-neutral-300 bg-white">
          <p className="text-xs font-mono-code text-neutral-500">
            No messages found in this view.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 divide-y divide-neutral-100">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleOpenMessage(msg)}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                !msg.read ? 'bg-neutral-50/80 hover:bg-neutral-100/60 font-medium' : 'bg-white hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 truncate">
                <div className="pt-0.5 sm:pt-0">
                  {!msg.read ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-black block" title="Unread" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full border border-neutral-300 block" title="Read" />
                  )}
                </div>

                <div className="truncate space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900 truncate">
                      {msg.name}
                    </span>
                    <span className="text-[11px] font-mono-code text-neutral-400 truncate">
                      &lt;{msg.email}&gt;
                    </span>
                  </div>
                  <div className="text-xs text-neutral-800 truncate">
                    {msg.subject}
                  </div>
                  <p className="text-xs text-neutral-500 truncate max-w-xl font-normal">
                    {msg.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs font-mono-code text-neutral-400">
                <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleToggleRead(msg, e)}
                    className="p-1.5 hover:text-black"
                    title={msg.read ? 'Mark unread' : 'Mark read'}
                  >
                    {msg.read ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5 text-black" />}
                  </button>
                  <button
                    onClick={(e) => handleToggleArchive(msg, e)}
                    className="p-1.5 hover:text-black"
                    title={msg.archived ? 'Unarchive' : 'Archive'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setToDelete(msg);
                    }}
                    className="p-1.5 hover:text-black"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Reader Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-neutral-300 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 bg-neutral-100 text-neutral-700">
                  Inquiry Details
                </span>
                <h3 className="font-display font-bold text-lg text-neutral-950 mt-1">
                  {selectedMessage.subject}
                </h3>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-neutral-400 hover:text-black p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono-code border-b border-neutral-100 pb-4 text-neutral-600">
              <div>
                <span className="text-neutral-400 uppercase block text-[10px]">Sender Name:</span>
                <span className="font-semibold text-neutral-900">{selectedMessage.name}</span>
              </div>
              <div>
                <span className="text-neutral-400 uppercase block text-[10px]">Email Address:</span>
                <a href={`mailto:${selectedMessage.email}`} className="font-semibold text-neutral-900 underline">
                  {selectedMessage.email}
                </a>
              </div>
              <div>
                <span className="text-neutral-400 uppercase block text-[10px]">Received At:</span>
                <span>{new Date(selectedMessage.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-neutral-400 uppercase block text-[10px]">Message Status:</span>
                <span className="capitalize">{selectedMessage.archived ? 'Archived' : 'Active Inbox'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono-code uppercase text-neutral-400 tracking-wider">
                Message Body:
              </span>
              <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs sm:text-sm text-neutral-900 font-normal leading-relaxed whitespace-pre-line">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleArchive(selectedMessage)}
                  className="px-3 py-1.5 border border-neutral-300 text-xs font-mono-code hover:bg-neutral-50 flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{selectedMessage.archived ? 'Move to Inbox' : 'Archive'}</span>
                </button>
                <button
                  onClick={() => setToDelete(selectedMessage)}
                  className="px-3 py-1.5 border border-neutral-300 text-xs font-mono-code hover:border-black text-neutral-700 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="px-5 py-2 bg-black text-white text-xs uppercase font-mono-code font-semibold flex items-center gap-2 hover:bg-neutral-800"
              >
                <Reply className="w-3.5 h-3.5" />
                <span>Compose Reply</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(toDelete)}
        title="Delete Ingestion Record"
        message={`Permanently remove enquiry from ${toDelete?.name}? This record will be deleted from the database.`}
        confirmLabel="Permanently Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />

    </div>
  );
};
