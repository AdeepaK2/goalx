"use client";
import PasswordReset from "@/components/login/passwordReset/passwordReset";
import PasswordResetOTP from "@/components/login/passwordReset/passwordResetOTP";

import React, { useState } from "react";

const PasswordResetPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // email or otp

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep("otp");
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-4 text-[#1e0fbf] text-center">
          Reset Password
        </h1>

        {step === "email" ? (
          <PasswordReset onSubmit={handleEmailSubmit} />
        ) : (
          <PasswordResetOTP email={email} />
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;
