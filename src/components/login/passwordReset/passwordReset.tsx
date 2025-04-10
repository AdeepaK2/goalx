import React, { useState } from 'react'

interface PasswordResetProps {
  onSubmit: (email: string) => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your account email"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none text-[#1e0fbf]"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 text-sm font-medium text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] border-none rounded-md cursor-pointer mb-3 disabled:opacity-70"
        >
          Send OTP
        </button>

        <small>
          <a href="/login" className="text-[#1e0fbf] no-underline">
            Back to Login
          </a>
        </small>
      </form>
    </div>
  )
}

export default PasswordReset