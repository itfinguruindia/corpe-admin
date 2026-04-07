"use client";

import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { Link as LinkIcon, Mail, Check } from "lucide-react";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteUserModal({
  isOpen,
  onClose,
}: InviteUserModalProps) {
  const [registerLink, setRegisterLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRegisterLink(`${window.location.origin}/register`);
    }
  }, []);
  
  // add

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(registerLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-message-circle"
        >
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      ),
      url: `https://wa.me/?text=${encodeURIComponent(`Join our platform! Register here: ${registerLink}`)}`,
      color: "bg-green-500 hover:bg-green-600 text-white border-transparent",
    },
    {
      name: "Facebook",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M13.5 22v-8h2.7l.5-3h-3.2V9.1c0-.9.3-1.6 1.7-1.6H17V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.3V11H8v3h2.5v8h3z" />
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(registerLink)}`,
      color: "bg-blue-600 hover:bg-blue-700 text-white border-transparent",
    },
    {
      name: "Twitter",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(registerLink)}&text=${encodeURIComponent("Join our platform!")}`,
      color: "bg-black hover:bg-gray-800 text-white border-transparent",
    },
    {
      name: "LinkedIn",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6.94 8.5a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5ZM5.5 19V10h2.9v9H5.5Zm4.7 0V10h2.8v1.3h.04c.39-.74 1.35-1.52 2.78-1.52 2.97 0 3.52 1.96 3.52 4.52V19h-2.9v-4.15c0-.99-.02-2.26-1.38-2.26-1.38 0-1.6 1.08-1.6 2.19V19h-2.9Z" />
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(registerLink)}`,
      color: "bg-[#0077b5] hover:bg-[#005e93] text-white border-transparent",
    },
    {
      name: "Email",
      icon: <Mail size={24} />,
      url: `mailto:?subject=${encodeURIComponent("Invitation to join")}&body=${encodeURIComponent(`You are invited to join our platform. Register here: ${registerLink}`)}`,
      color: "bg-gray-600 hover:bg-gray-700 text-white border-transparent",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite New User"
      maxWidth="md:max-w-[40vw]"
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-gray-500">
          Share this registration link with the user you want to invite.
        </p>

        <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          <input
            type="text"
            readOnly
            value={registerLink}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 p-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-gray-700 font-medium text-sm border border-gray-300 bg-white shadow-sm"
            title="Copy link"
          >
            {copied ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <LinkIcon size={16} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">
            Share via
          </h4>
          <div className="grid grid-cols-5 gap-3">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all hover:-translate-y-1 shadow-sm hover:shadow-md border ${link.color}`}
                title={`Share on ${link.name}`}
              >
                {link.icon}
                <span className="text-xs font-medium sr-only">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
