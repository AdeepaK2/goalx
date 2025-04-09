import React, { useState } from 'react'

interface PasswordResetOTPProps {
  email: string;
}

const PasswordResetOTP: React.FC<PasswordResetOTPProps> = ({ email }) => {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle OTP submission
    console.log("OTP submitted for email:", email);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="otp"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Enter OTP
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP received to your email"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none text-[#1e0fbf]"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            OTP sent to: {email}
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-2 text-sm font-medium text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] border-none rounded-md cursor-pointer mb-3 disabled:opacity-70"
        >
          Submit OTP
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

export default PasswordResetOTP