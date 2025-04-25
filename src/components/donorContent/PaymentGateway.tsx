import React, { useState } from 'react';
import { FiCreditCard, FiLock, FiCheckCircle } from 'react-icons/fi';

interface PaymentGatewayProps {
  amount: number;
  currency: string;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ 
  amount, 
  currency, 
  onPaymentComplete, 
  onCancel 
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete();
    }, 2000);
  };
  
  return (
    <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Complete Payment</h2>
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          disabled={isProcessing}
        >
          &times;
        </button>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-md mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Amount to pay:</p>
          <p className="text-xl font-bold text-[#6e11b0]">{currency} {amount.toFixed(2)}</p>
        </div>
        <FiLock className="text-green-600 text-xl" />
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-2 pl-9 border border-gray-300 rounded-md"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
              maxLength={19}
              required
              disabled={isProcessing}
            />
            <FiCreditCard className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => {
                const input = e.target.value.replace(/\D/g, '');
                if (input.length <= 2) {
                  setExpiryDate(input);
                } else {
                  setExpiryDate(`${input.substring(0, 2)}/${input.substring(2, 4)}`);
                }
              }}
              maxLength={5}
              required
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
              maxLength={3}
              required
              disabled={isProcessing}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name on Card
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="John Doe"
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            required
            disabled={isProcessing}
          />
        </div>
        
        <div className="text-center">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#6e11b0] hover:bg-[#5a0e91] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-center text-gray-500">
        <p>This is a simulation. No actual payment will be processed.</p>
        <p className="mt-1">All payment information is secure and encrypted.</p>
      </div>
    </div>
  );
};

export default PaymentGateway;