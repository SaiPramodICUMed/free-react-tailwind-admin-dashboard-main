import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function ResetPasswordForm() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const isFormValid =
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    setPasswordMismatch(false);

    // TODO: call API
    alert("Password reset successfully!");
  };

  return (
    <div className="flex flex-col flex-1">
  <div className="w-full max-w-md pt-10 mx-auto"></div>

  <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
    <div
      className="
        bg-white 
        border 
        border-gray-200 
        shadow-sm 
        rounded-xl 
        p-6 
        sm:p-8
      "
    >
      <div className="mb-6 sm:mb-8 text-center">
        <h3 className="mt-3 text-xl font-semibold">
          Change Password
        </h3>

      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* New Password */}
          <div>
            <Label>
              New Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showNewPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <Label>
              Confirm Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
          </div>

          {passwordMismatch && (
            <div className="w-full mt-2">
              <span className="block text-center bg-red-100 text-red-700 font-semibold rounded-lg py-2">
                Passwords do not match
              </span>
            </div>
          )}

          <div>
            <Button
              className={`w-full ${
                isFormValid
                  ? "bg-[#0070C0] hover:bg-[#005A9C]"
                  : "bg-[#0070C0]/70 cursor-not-allowed"
              }`}
              size="sm"
              disabled={!isFormValid}
            >
              Reset Password
            </Button>
          </div>

          <div className="text-center mt-2">
            <Link
              to="/signin"
              className="text-sm text-brand-500 hover:text-brand-600"
            >
              Back to login
            </Link>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>

  );
}
