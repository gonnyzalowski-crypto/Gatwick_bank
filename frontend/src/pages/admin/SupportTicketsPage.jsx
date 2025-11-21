import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../../lib/apiClient';

export const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketDetails(selectedTicket.id);
    }
  }, [selectedTicket?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter.toUpperCase()}` : '';
      console.log('Fetching admin tickets with filter:', filter);
      const response = await apiClient.get(`/support/admin/tickets${params}`);
      console.log('Admin tickets response:', response);
      if (response.success) {
        setTickets(response.tickets || []);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      console.error('Error response:', error.response);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await apiClient.get(`/support/tickets/${ticketId}`);
      if (response.success) {
        setMessages(response.ticket.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      const response = await apiClient.post(`/support/tickets/${selectedTicket.id}/messages`, {
        message: newMessage
      });

      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        setNewMessage('');
        fetchTickets(); // Refresh ticket list
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await apiClient.patch(`/support/admin/tickets/${ticketId}`, {
        status: newStatus
      });
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: 'bg-blue-500/20 text-blue-400 border-blue-800',
      IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400 border-yellow-800',
      RESOLVED: 'bg-green-500/20 text-green-400 border-green-800',
      CLOSED: 'bg-slate-500/20 text-slate-400 border-slate-800'
    };
    return styles[status] || styles.OPEN;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      LOW: 'bg-slate-500/20 text-slate-400',
      MEDIUM: 'bg-blue-500/20 text-blue-400',
      HIGH: 'bg-orange-500/20 text-orange-400',
      URGENT: 'bg-red-500/20 text-red-400'
    };
    return styles[priority] || styles.MEDIUM;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Tickets List */}
      <div className="w-1/3 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Support Tickets</h2>
          
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {['all', 'open', 'in_progress', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p>No tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700/50 transition ${
                  selectedTicket?.id === ticket.id ? 'bg-slate-700' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-sm">{ticket.subject}</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      {ticket.user.firstName} {ticket.user.lastName}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {ticket.user.accounts[0]?.accountNumber || 'No account'}
                    </p>
                  </div>
                  {ticket._count?.messages > 0 && (
                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                      {ticket._count.messages}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {new Date(ticket.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden flex flex-col">
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedTicket.subject}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Ticket #{selectedTicket.ticketNumber} • {selectedTicket.category}
                  </p>
                  <p className="text-sm text-slate-400">
                    Customer: {selectedTicket.user.firstName} {selectedTicket.user.lastName} ({selectedTicket.user.email})
                  </p>
                  <p className="text-sm text-slate-400">
                    Account: {selectedTicket.user.accounts[0]?.accountNumber || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${
                    msg.senderType === 'ADMIN'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-white'
                  } rounded-lg p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-semibold">
                        {msg.senderType === 'ADMIN' ? 'Support Agent' : `${selectedTicket.user.firstName} ${selectedTicket.user.lastName}`}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageSquare className="w-16 h-16 mb-4" />
            <p className="text-lg">Select a ticket to view conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsPage;
