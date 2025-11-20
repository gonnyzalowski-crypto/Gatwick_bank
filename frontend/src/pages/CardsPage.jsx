import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import CardDetailsComponent from '../components/CardDetailsComponent';
import UserDashboardLayout from '../components/layout/UserDashboardLayout';
import { Modal } from '../components/ui/Modal';
import { ActionButton } from '../components/ui/ActionButton';
import { CreditCard, Plus, TrendingUp, TrendingDown, ArrowUpRight, Wallet, DollarSign, Clock, Eye, EyeOff, X } from 'lucide-react';

/**
 * CardsPage - Grid view of all user cards with creation and management options
 * Mobile-first, responsive design with light theme
 * Supports both Debit and Credit cards with distinct workflows
 */
export const CardsPage = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [cardStats, setCardStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [creating, setCreating] = useState(false);
  const [cardType, setCardType] = useState('DEBIT'); // DEBIT or CREDIT
  const [cardTransactions, setCardTransactions] = useState({});
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [selectedCardForReveal, setSelectedCardForReveal] = useState(null);
  const [backupCode, setBackupCode] = useState('');
  const [revealedCardDetails, setRevealedCardDetails] = useState(null);
  const [revealError, setRevealError] = useState('');
  const [revealing, setRevealing] = useState(false);

  // Helper function to format card number
  const formatCardNumber = (encryptedNumber) => {
    try {
      if (!encryptedNumber) return '•••• •••• •••• ••••';
      // Decode base64 card number
      const decoded = atob(encryptedNumber);
      const lastFour = decoded.slice(-4);
      return `5175 •••• •••• ${lastFour}`;
    } catch (error) {
      console.error('Error formatting card number:', error);
      return '•••• •••• •••• ••••';
    }
  };

  // Fetch all cards and stats
  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch combined debit and credit cards
      try {
        const cardsRes = await apiClient.get('/cards/all/combined');
        console.log('Cards response:', cardsRes);
        if (cardsRes.success && cardsRes.cards) {
          setCards(cardsRes.cards);
          
          // Fetch transactions for each card
          const transactionsPromises = cardsRes.cards.map(async (card) => {
            try {
              const txRes = await apiClient.get(`/cards/${card.id}/transactions?limit=3`);
              return { cardId: card.id, transactions: txRes.transactions || [] };
            } catch (err) {
              console.error(`Error fetching transactions for card ${card.id}:`, err);
              return { cardId: card.id, transactions: [] };
            }
          });
          
          const transactionsData = await Promise.all(transactionsPromises);
          const transactionsMap = {};
          transactionsData.forEach(({ cardId, transactions }) => {
            transactionsMap[cardId] = transactions;
          });
          setCardTransactions(transactionsMap);
        } else {
          setCards([]);
        }
      } catch (err) {
        console.error('Error fetching cards:', err);
        setCards([]);
      }

      // Fetch stats (optional)
      try {
        const statsRes = await apiClient.get('/cards/stats/overview');
        if (statsRes.success && statsRes.stats) {
          setCardStats(statsRes.stats);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }

      // Fetch accounts
      try {
        const accountsRes = await apiClient.get('/accounts');
        if (accountsRes.success && accountsRes.accounts) {
          setAccounts(accountsRes.accounts);
          if (accountsRes.accounts.length > 0) {
            setSelectedAccount(accountsRes.accounts[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    } catch (err) {
      console.error('Error in fetchCards:', err);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();

    if (cardType === 'DEBIT' && !selectedAccount) {
      setError('Please select an account for debit card');
      return;
    }

    try {
      setCreating(true);
      
      let response;
      if (cardType === 'DEBIT') {
        response = await apiClient.post('/cards/debit', {
          accountId: selectedAccount,
          cardHolderName: 'GATWICK BANK'
        });
      } else {
        // Credit card application
        response = await apiClient.post('/cards/credit/apply', {
          requestedLimit: 5000,
          cardHolderName: 'GATWICK BANK'
        });
      }

      if (response.success) {
        // Refresh cards list
        await fetchCards();
        setShowCreateModal(false);
        setError(null);
        setCardType('DEBIT');
        setSelectedAccount('');
      } else {
        setError('Failed to create card');
      }
    } catch (err) {
      console.error('Error creating card:', err);
      setError('Unable to create card');
    } finally {
      setCreating(false);
    }
  };

  // Reveal full card details with backup code verification
  const handleRevealCard = (card) => {
    setSelectedCardForReveal(card);
    setShowRevealModal(true);
    setBackupCode('');
    setRevealError('');
    setRevealedCardDetails(null);
  };

  const handleBackupCodeSubmit = async (e) => {
    e.preventDefault();
    setRevealing(true);
    setRevealError('');

    try {
      const response = await apiClient.post(`/cards/debit/${selectedCardForReveal.id}/reveal`, {
        backupCode: backupCode.trim()
      });

      if (response.success) {
        setRevealedCardDetails(response.card);
        setBackupCode('');
      }
    } catch (err) {
      console.error('Error revealing card:', err);
      setRevealError(err.response?.data?.error || 'Invalid backup code or card not found');
    } finally {
      setRevealing(false);
    }
  };

  const closeRevealModal = () => {
    setShowRevealModal(false);
    setSelectedCardForReveal(null);
    setBackupCode('');
    setRevealedCardDetails(null);
    setRevealError('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
           ' • ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (selectedCardId) {
    return (
      <UserDashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Card details</h2>
            <p className="text-sm text-slate-500 mt-1">View limits, status and recent activity for this card.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <CardDetailsComponent
              cardId={selectedCardId}
              onBack={() => {
                setSelectedCardId(null);
                fetchCards();
              }}
            />
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">My cards</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your debit and credit cards.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {cardStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Total cards</p>
              <p className="text-2xl font-semibold text-slate-900">{cardStats.totalCards}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Active</p>
              <p className="text-2xl font-semibold text-emerald-600">{cardStats.activeCards}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Frozen</p>
              <p className="text-2xl font-semibold text-blue-600">{cardStats.frozenCards}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Inactive</p>
              <p className="text-2xl font-semibold text-slate-500">{cardStats.inactiveCards}</p>
            </div>
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white transition-colors"
          >
            + Create new card
          </button>
        </div>

        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setCardType('DEBIT');
            setSelectedAccount('');
          }}
          title="Create New Card"
          size="md"
        >
          <form onSubmit={handleCreateCard} className="space-y-5">
            {/* Card Type Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Card Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCardType('DEBIT')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    cardType === 'DEBIT'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-neutral-900">Debit Card</div>
                    <div className="text-xs text-neutral-500 mt-1">Linked to account</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setCardType('CREDIT')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    cardType === 'CREDIT'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-neutral-900">Credit Card</div>
                    <div className="text-xs text-neutral-500 mt-1">Requires approval</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Account Selection (only for Debit) */}
            {cardType === 'DEBIT' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Select Account *
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900 text-sm"
                  required
                >
                  <option value="">Choose an account...</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - ${account.balance}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-neutral-500 mt-1.5">
                  The debit card will be linked to this account
                </p>
              </div>
            )}

            {/* Credit Card Info */}
            {cardType === 'CREDIT' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900 font-medium mb-1">Credit Card Application</p>
                <p className="text-xs text-amber-700">
                  Your application will be reviewed by our banking team. You'll be notified once approved.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <ActionButton
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setShowCreateModal(false);
                  setCardType('DEBIT');
                  setSelectedAccount('');
                }}
                fullWidth
              >
                Cancel
              </ActionButton>
              <ActionButton
                type="submit"
                variant="primary"
                size="lg"
                loading={creating}
                disabled={cardType === 'DEBIT' && !selectedAccount}
                fullWidth
              >
                {creating ? 'Creating...' : cardType === 'DEBIT' ? 'Create Debit Card' : 'Apply for Credit Card'}
              </ActionButton>
            </div>
          </form>
        </Modal>

        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : cards.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cards.map((card) => {
                const transactions = cardTransactions[card.id] || [];
                const isCredit = card.cardType === 'CREDIT';
                const isPending = isCredit && card.approvalStatus === 'PENDING';
                
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-all"
                  >
                    {/* Card Type Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isCredit 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {isCredit ? 'CREDIT CARD' : 'DEBIT CARD'}
                      </span>
                      {isPending && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          PENDING APPROVAL
                        </span>
                      )}
                    </div>

                    {/* Card Visual */}
                    <div className="flex items-start gap-4 mb-6">
                      <div 
                        className={`relative w-64 h-40 rounded-2xl p-5 flex flex-col justify-between text-white shadow-lg cursor-pointer hover:scale-105 transition-transform ${
                          isPending ? 'opacity-60' : ''
                        }`}
                        style={{
                          background: isCredit 
                            ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                        }}
                        onClick={() => !isPending && setSelectedCardId(card.id)}
                      >
                        {/* Chip */}
                        <div className="w-12 h-10 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-90"></div>
                        
                        {/* Card Number */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <p className="text-lg font-mono tracking-widest">
                              {formatCardNumber(card.cardNumber)}
                            </p>
                            {!isCredit && !isPending && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRevealCard(card);
                                }}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                                title="Reveal full card details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          {/* Card Holder & Expiry */}
                          <div className="flex justify-between items-end text-xs">
                            <div>
                              <p className="text-white/60 mb-1">Card Holder</p>
                              <p className="font-semibold">{card.cardHolderName || 'CARD HOLDER'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/60 mb-1">Expires</p>
                              <p className="font-semibold">{new Date(card.expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mastercard Logo */}
                        <div className="absolute bottom-5 right-5">
                          <div className="flex gap-1">
                            <div className="w-7 h-7 rounded-full bg-red-500 opacity-80"></div>
                            <div className="w-7 h-7 rounded-full bg-orange-400 opacity-80 -ml-3"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Add New Card Button */}
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-32 h-40 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50/50 flex flex-col items-center justify-center gap-2 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                          <Plus className="w-6 h-6 text-neutral-400 group-hover:text-primary-600" />
                        </div>
                        <p className="text-xs font-medium text-neutral-500 group-hover:text-primary-600">Add Card</p>
                      </button>
                    </div>

                    {/* Card Info Section */}
                    {isCredit ? (
                      // Credit Card Info
                      <div className="mb-6 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Credit Limit</p>
                            <p className="text-xl font-bold text-neutral-900">${parseFloat(card.creditLimit || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Available Credit</p>
                            <p className="text-xl font-bold text-emerald-600">${parseFloat(card.availableCredit || 0).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Current Balance</p>
                            <p className="text-lg font-semibold text-neutral-900">${parseFloat(card.currentBalance || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">APR</p>
                            <p className="text-lg font-semibold text-neutral-900">{parseFloat(card.apr || 0).toFixed(2)}%</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Debit Card Info
                      <div className="mb-6">
                        <p className="text-sm text-neutral-500 mb-1">Daily Limit</p>
                        <p className="text-3xl font-bold text-neutral-900">${parseFloat(card.dailyLimit || 0).toFixed(2)}</p>
                        {card.account && (
                          <p className="text-xs text-neutral-500 mt-2">
                            Linked to: {card.account.accountNumber}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Recent Transactions */}
                    {!isPending && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-neutral-900">Recent Transactions</h3>
                          <button 
                            onClick={() => setSelectedCardId(card.id)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            See All →
                          </button>
                        </div>
                        
                        {/* Transaction List */}
                        <div className="space-y-3">
                          {transactions.length > 0 ? (
                            transactions.map((tx) => (
                              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                                <div className={`w-10 h-10 rounded-xl ${
                                  parseFloat(tx.amount) < 0 ? 'bg-red-50' : 'bg-green-50'
                                } flex items-center justify-center flex-shrink-0`}>
                                  <div className={`w-6 h-6 ${
                                    parseFloat(tx.amount) < 0 ? 'bg-red-500' : 'bg-green-500'
                                  } rounded-md flex items-center justify-center text-white text-xs font-bold`}>
                                    {tx.merchantName.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-neutral-900 truncate">{tx.merchantName}</p>
                                  <p className="text-xs text-neutral-500">{formatDate(tx.createdAt)}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-semibold ${
                                    parseFloat(tx.amount) < 0 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {parseFloat(tx.amount) < 0 ? '-' : '+'}${Math.abs(parseFloat(tx.amount)).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-neutral-500 text-sm">
                              No transactions yet
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Card Status Badge */}
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${card.isActive ? 'bg-emerald-500' : 'bg-neutral-400'}`}></span>
                          <span className="text-sm font-medium text-neutral-700">
                            {card.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {card.isFrozen && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              Frozen
                            </span>
                          )}
                        </div>
                        {!isPending && (
                          <button 
                            onClick={() => setSelectedCardId(card.id)}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                          >
                            View Details →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-neutral-100 text-center">
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No cards yet</h3>
              <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                Create your first card to start managing your finances with Gatwick Bank
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create your first card
              </button>
            </div>
          )}
        </div>

        {/* Reveal Card Details Modal */}
        {showRevealModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Reveal Card Details</h3>
                  <p className="text-sm text-slate-500 mt-1">Enter a backup code to view full card details</p>
                </div>
                <button
                  onClick={closeRevealModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {!revealedCardDetails ? (
                  // Backup Code Entry Form
                  <form onSubmit={handleBackupCodeSubmit} className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-800">
                        <strong>Security Notice:</strong> This action will use one of your backup codes. Please have a backup code ready.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Backup Code *
                      </label>
                      <input
                        type="text"
                        value={backupCode}
                        onChange={(e) => setBackupCode(e.target.value)}
                        placeholder="Enter your backup code"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    {revealError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700">{revealError}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={closeRevealModal}
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={revealing || !backupCode.trim()}
                        className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {revealing ? 'Verifying...' : 'Reveal Card'}
                      </button>
                    </div>
                  </form>
                ) : (
                  // Revealed Card Details
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>Success!</strong> Your card details are now visible. Please keep them secure.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Card Number</label>
                        <p className="text-lg font-mono font-bold text-slate-900">{revealedCardDetails.cardNumber}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">CVV</label>
                          <p className="text-lg font-mono font-bold text-slate-900">{revealedCardDetails.cvv}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Expiry</label>
                          <p className="text-lg font-mono font-bold text-slate-900">
                            {new Date(revealedCardDetails.expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Card Holder</label>
                        <p className="text-lg font-bold text-slate-900">{revealedCardDetails.cardHolderName}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Daily Limit</label>
                        <p className="text-lg font-bold text-slate-900">${parseFloat(revealedCardDetails.dailyLimit || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    <button
                      onClick={closeRevealModal}
                      className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};

export default CardsPage;
