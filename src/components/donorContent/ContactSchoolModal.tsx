import React, { useState } from 'react';
import { FiX, FiMail } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';

interface ContactSchoolModalProps {
  schoolName: string;
  schoolEmail: string;
  donationDetails: string;
  schoolImageUrl?: string; // Add optional school image URL
  onClose: () => void;
}

const ContactSchoolModal: React.FC<ContactSchoolModalProps> = ({
  schoolName,
  schoolEmail,
  donationDetails,
  schoolImageUrl,
  onClose
}) => {
  const [subject, setSubject] = useState(`Regarding my donation to ${schoolName}`);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    const mailtoUrl = `mailto:${schoolEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    
    // Open email client
    window.location.href = mailtoUrl;
    
    // Keep the modal open for a moment so the user can see the "sending" state
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto shadow-xl">
      {/* Add school image at top of modal */}
      {schoolImageUrl ? (
        <div className="w-full h-40 bg-gray-200 rounded-md mb-4 overflow-hidden">
          <img 
            src={schoolImageUrl} 
            alt={schoolName} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-300 rounded-md mb-4 flex items-center justify-center">
          <HiOutlineAcademicCap className="h-16 w-16 text-gray-400" />
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FiMail className="mr-2 text-[#6e11b0]" /> Contact {schoolName}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>
      </div>
      
      <div className="bg-purple-50 p-3 rounded-md mb-4">
        <p className="text-sm text-gray-700">
          Your message will be sent regarding: <span className="font-medium">{donationDetails}</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message to the school..."
            required
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={sending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#6e11b0] hover:bg-[#5a0e91] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {sending ? 'Opening Email...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactSchoolModal;