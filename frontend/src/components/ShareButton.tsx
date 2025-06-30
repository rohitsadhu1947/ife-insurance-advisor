import React, { useState } from 'react';

interface ShareButtonProps {
  shareText: string;
  shareUrl: string;
  customerName?: string;
  customerEmail?: string;
  buttonLabel?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ shareText, shareUrl, customerName, customerEmail, buttonLabel = 'Share' }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Insurance Advisor',
        text: shareText,
        url: shareUrl,
      });
    } else {
      setShowDropdown((prev) => !prev);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setShowDropdown(false);
    alert('Link copied to clipboard!');
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
  const emailUrl = `mailto:${customerEmail || ''}?subject=Insurance Report&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;

  return (
    <div className="relative inline-block">
      <button
        className="btn-secondary"
        onClick={handleShare}
        type="button"
      >
        {buttonLabel}
      </button>
      {/* Dropdown for fallback if Web Share API is not available */}
      {!navigator.share && showDropdown && (
        <div className="absolute z-10 left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-green-600 hover:bg-green-50 rounded"
          >
            WhatsApp
          </a>
          <a
            href={emailUrl}
            className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            Email
          </a>
          <a
            href={smsUrl}
            className="block px-4 py-2 text-purple-600 hover:bg-purple-50 rounded"
          >
            SMS
          </a>
          <button
            onClick={handleCopy}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareButton; 