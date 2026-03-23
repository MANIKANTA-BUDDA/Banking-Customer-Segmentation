import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type View = "auth" | "forgot-email" | "forgot-reset" | "forgot-success";

interface LoginPageProps {
  onAuth: () => void;
}

export default function LoginPage({ onAuth }: LoginPageProps) {
  const { login, signup, resetPassword, checkEmailExists } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showSuccess, setShowSuccess] = useState(false);
  const [view, setView] = useState<View>("auth");

  // Sign In
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [showSignInPw, setShowSignInPw] = useState(false);

  // Sign Up
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [showSignUpPw, setShowSignUpPw] = useState(false);

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [forgotEmailLoading, setForgotEmailLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    if (!signInEmail.trim()) return setSignInError("Email is required.");
    if (!EMAIL_RE.test(signInEmail.trim()))
      return setSignInError("Enter a valid email address.");
    if (!signInPassword.trim()) return setSignInError("Password is required.");
    setSignInLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(signInEmail, signInPassword);
    setSignInLoading(false);
    if (result.success) onAuth();
    else setSignInError(result.error ?? "Login failed.");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    if (!signUpName.trim()) return setSignUpError("Full name is required.");
    if (!signUpEmail.trim()) return setSignUpError("Email is required.");
    if (!EMAIL_RE.test(signUpEmail.trim()))
      return setSignUpError("Enter a valid email address.");
    if (!signUpPassword.trim()) return setSignUpError("Password is required.");
    if (signUpPassword.length < 6)
      return setSignUpError("Password must be at least 6 characters.");
    setSignUpLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = signup(signUpName, signUpEmail, signUpPassword);
    setSignUpLoading(false);
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab("signin");
        setSignInEmail(signUpEmail);
        setSignUpName("");
        setSignUpEmail("");
        setSignUpPassword("");
      }, 2000);
    } else {
      setSignUpError(result.error ?? "Could not create account.");
    }
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotEmailError("");
    if (!forgotEmail.trim()) return setForgotEmailError("Email is required.");
    if (!EMAIL_RE.test(forgotEmail.trim()))
      return setForgotEmailError("Enter a valid email address.");
    setForgotEmailLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setForgotEmailLoading(false);
    if (!checkEmailExists(forgotEmail)) {
      return setForgotEmailError("No account found with this email.");
    }
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setView("forgot-reset");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    if (!newPassword.trim()) return setResetError("New password is required.");
    if (newPassword.length < 6)
      return setResetError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword)
      return setResetError("Passwords do not match.");
    setResetLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const result = resetPassword(forgotEmail, newPassword);
    setResetLoading(false);
    if (result.success) {
      setView("forgot-success");
      setTimeout(() => {
        setView("auth");
        setActiveTab("signin");
        setSignInEmail(forgotEmail);
        setForgotEmail("");
      }, 2500);
    } else {
      setResetError(result.error ?? "Could not reset password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 mb-4">
            <Database className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
            Banking Customer Segmentation for Targeted Marketing
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8">
          <AnimatePresence mode="wait">
            {/* Success after signup */}
            {showSuccess && view === "auth" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Account Created!
                  </h2>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    Account created successfully.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Redirecting to login...
                  </p>
                </div>
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              </motion.div>
            ) : view === "forgot-email" ? (
              /* Step 1: Enter email */
              <motion.div
                key="forgot-email"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setView("auth");
                    setForgotEmail("");
                    setForgotEmailError("");
                  }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Reset Password
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Enter your registered email address to reset your password.
                </p>
                <form onSubmit={handleForgotEmailSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="forgot-email"
                      className="text-gray-700 dark:text-gray-300 text-sm"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@gmail.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <AnimatePresence>
                    {forgotEmailError && (
                      <motion.p
                        key="fe-err"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-rose-500 text-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-lg px-3 py-2"
                      >
                        {forgotEmailError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <Button
                    type="submit"
                    disabled={forgotEmailLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl"
                  >
                    {forgotEmailLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : view === "forgot-reset" ? (
              /* Step 2: Set new password */
              <motion.div
                key="forgot-reset"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot-email");
                    setResetError("");
                  }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Set New Password
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Choose a new password for{" "}
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {forgotEmail}
                  </span>
                </p>
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-password"
                      className="text-gray-700 dark:text-gray-300 text-sm"
                    >
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="new-password"
                        type={showNewPw ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showNewPw ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-gray-700 dark:text-gray-300 text-sm"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPw ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPw ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {resetError && (
                      <motion.p
                        key="re-err"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-rose-500 text-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-lg px-3 py-2"
                      >
                        {resetError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <Button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : view === "forgot-success" ? (
              /* Success screen */
              <motion.div
                key="forgot-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Password Reset!
                  </h2>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    Your password has been updated successfully.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Redirecting to login...
                  </p>
                </div>
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              </motion.div>
            ) : (
              /* Main auth tabs */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as "signin" | "signup")}
                  className="w-full"
                >
                  <TabsList className="w-full mb-6 bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                    <TabsTrigger
                      value="signin"
                      className="flex-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-500 dark:text-gray-400"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="flex-1 data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-500 dark:text-gray-400"
                    >
                      Create Account
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="signin-email"
                          className="text-gray-700 dark:text-gray-300 text-sm"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@gmail.com"
                            value={signInEmail}
                            onChange={(e) => setSignInEmail(e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="signin-password"
                            className="text-gray-700 dark:text-gray-300 text-sm"
                          >
                            Password
                          </Label>
                          <button
                            type="button"
                            onClick={() => {
                              setForgotEmail(signInEmail);
                              setForgotEmailError("");
                              setView("forgot-email");
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors font-medium"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="signin-password"
                            type={showSignInPw ? "text" : "password"}
                            placeholder="Enter your password"
                            value={signInPassword}
                            onChange={(e) => setSignInPassword(e.target.value)}
                            className="pl-10 pr-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignInPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showSignInPw ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {signInError && (
                          <motion.p
                            key="si-err"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-rose-500 text-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-lg px-3 py-2"
                          >
                            {signInError}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <Button
                        type="submit"
                        disabled={signInLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl"
                      >
                        {signInLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-name"
                          className="text-gray-700 dark:text-gray-300 text-sm"
                        >
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            value={signUpName}
                            onChange={(e) => setSignUpName(e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-email"
                          className="text-gray-700 dark:text-gray-300 text-sm"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@gmail.com"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-password"
                          className="text-gray-700 dark:text-gray-300 text-sm"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="signup-password"
                            type={showSignUpPw ? "text" : "password"}
                            placeholder="Min. 6 characters"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            className="pl-10 pr-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showSignUpPw ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {signUpError && (
                          <motion.p
                            key="su-err"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-rose-500 text-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-lg px-3 py-2"
                          >
                            {signUpError}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <Button
                        type="submit"
                        disabled={signUpLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl"
                      >
                        {signUpLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-6">
          Banking Customer Segmentation for Targeted Marketing
        </p>
      </motion.div>
    </div>
  );
}
