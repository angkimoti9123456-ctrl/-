"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Hash, AtSign, Shield, ArrowLeft, CheckCircle, AlertCircle, Send, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type FormType = "login" | "signup" | "reset-password"

export function AuthForms() {
  const router = useRouter()
  const [activeForm, setActiveForm] = useState<FormType>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(false)
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  
  // Signup form state
  const [studentId, setStudentId] = useState("")
  const [realName, setRealName] = useState("")
  const [schoolEmail, setSchoolEmail] = useState("")
  const [nickname, setNickname] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Password reset state
  const [resetEmail, setResetEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newConfirmPassword, setNewConfirmPassword] = useState("")
  const [resetStep, setResetStep] = useState<"email" | "password" | "success">("email")
  const [resetError, setResetError] = useState("")

  // Email verification state for signup
  const [verificationCodeSent, setVerificationCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [verificationError, setVerificationError] = useState("")
  const [verificationTimer, setVerificationTimer] = useState(0)
  const [showVerificationToast, setShowVerificationToast] = useState(false)

  // Mock registered emails for verification
  const REGISTERED_EMAILS = [
    "2024001@school.hs.kr",
    "2024002@school.hs.kr",
    "2024003@school.hs.kr",
    "2025001@school.hs.kr",
  ]

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/board")
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmailVerified) return
    router.push("/board")
  }

  // Email validation helper
  const isValidEmailFormat = useCallback((email: string) => {
    return /^[0-9]{7}@school\.hs\.kr$/.test(email)
  }, [])

  // Timer effect for countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (verificationTimer > 0) {
      interval = setInterval(() => {
        setVerificationTimer((prev) => prev - 1)
      }, 1000)
    } else if (verificationTimer === 0 && verificationCodeSent && !isEmailVerified) {
      // Timer expired
      setVerificationError("인증코드가 올바르지 않거나 시간이 만료되었습니다.")
    }
    return () => clearInterval(interval)
  }, [verificationTimer, verificationCodeSent, isEmailVerified])

  // Format timer as MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Send verification code
  const handleSendVerificationCode = () => {
    if (!isValidEmailFormat(schoolEmail)) return
    
    setVerificationCodeSent(true)
    setVerificationTimer(180) // 3 minutes
    setVerificationCode("")
    setVerificationError("")
    setIsEmailVerified(false)
    
    // Show toast
    setShowVerificationToast(true)
    setTimeout(() => setShowVerificationToast(false), 3000)
  }

  // Verify code
  const handleVerifyCode = () => {
    // Mock: accept "123456" or any 6-digit code for demo
    if (verificationCode === "123456") {
      setIsEmailVerified(true)
      setVerificationError("")
      setVerificationTimer(0)
    } else {
      setVerificationError("인증코드가 올바르지 않거나 시간이 만료되었습니다.")
    }
  }

  // Reset verification when email changes
  const handleEmailChange = (email: string) => {
    setSchoolEmail(email)
    if (verificationCodeSent) {
      setVerificationCodeSent(false)
      setVerificationCode("")
      setIsEmailVerified(false)
      setVerificationError("")
      setVerificationTimer(0)
    }
  }

  const handleVerifyResetEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    
    // Check if email matches the school email format and is registered
    const isValidFormat = /^[0-9]{7}@school\.hs\.kr$/.test(resetEmail)
    const isRegistered = REGISTERED_EMAILS.includes(resetEmail)
    
    if (!resetEmail.trim()) {
      setResetError("학교 이메일을 입력해주세요.")
      return
    }
    
    if (!isValidFormat || !isRegistered) {
      setResetError("가입 정보와 일치하는 학교 이메일이 아닙니다.")
      return
    }
    
    setResetStep("password")
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    
    if (newPassword.length < 8) {
      setResetError("비밀번호는 8자 이상이어야 합니다.")
      return
    }
    
    if (newPassword !== newConfirmPassword) {
      setResetError("비밀번호가 일치하지 않습니다.")
      return
    }
    
    setResetStep("success")
  }

  const handleBackToLogin = () => {
    setActiveForm("login")
    setResetStep("email")
    setResetEmail("")
    setNewPassword("")
    setNewConfirmPassword("")
    setResetError("")
  }

  return (
    <>
    {/* Verification Code Sent Toast */}
    {showVerificationToast && (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
        <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <Send className="w-5 h-5" />
          <span className="text-sm font-medium">입력하신 이메일로 인증코드가 발송되었습니다.</span>
        </div>
      </div>
    )}
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="lg:w-1/2 bg-primary relative overflow-hidden flex flex-col justify-center items-center p-8 lg:p-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-foreground" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-primary-foreground/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4 text-balance">
              운암고등학교
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl font-medium">
              자율게시판
            </p>
          </div>
          
          <div className="max-w-sm mx-auto">
            <p className="text-primary-foreground/70 text-sm lg:text-base leading-relaxed">
              학교 친구들과 소통하고, 아이디어를 공유하며, 안전하고 인증된 환경에서 학교 활동 소식을 확인하세요.
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="hidden lg:flex mt-16 gap-4 justify-center">
            <div className="w-3 h-3 rounded-full bg-primary-foreground/30" />
            <div className="w-3 h-3 rounded-full bg-primary-foreground/50" />
            <div className="w-3 h-3 rounded-full bg-primary-foreground/30" />
          </div>
        </div>
      </div>

      {/* Right Panel - Forms */}
      <div className="lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-16 bg-background">
        <div className="w-full max-w-md">
          {/* Password Reset Form */}
          {activeForm === "reset-password" ? (
            <div className="transition-all duration-300">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                로그인으로 돌아가기
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">비밀번호 재설정</h2>
                <p className="text-muted-foreground mt-1">
                  {resetStep === "email" && "등록된 학교 이메일�� 인증해주세요"}
                  {resetStep === "password" && "새로운 비밀번호를 설정해주세요"}
                  {resetStep === "success" && "비밀번호가 변경되었습니다"}
                </p>
              </div>

              {/* Step: Email Verification */}
              {resetStep === "email" && (
                <form onSubmit={handleVerifyResetEmail} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-sm font-medium">
                      학교 이메일
                    </Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="2024000...@school.hs.kr"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value)
                          setResetError("")
                        }}
                        className="pl-10 h-11 bg-card border-input"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      가입 시 등록한 학교 이메일을 입력해주세요
                    </p>
                  </div>

                  {resetError && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                      <p className="text-sm text-destructive">{resetError}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full h-11 text-base font-medium">
                    이메일 확인
                  </Button>
                </form>
              )}

              {/* Step: New Password */}
              {resetStep === "password" && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-sm text-accent-foreground">
                      <span className="font-medium">{resetEmail}</span> 계정의 비밀번호를 재설정합니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium">
                      새 비밀번호
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="8자 이상 입력해주세요"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value)
                          setResetError("")
                        }}
                        className="pl-10 pr-10 h-11 bg-card border-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-confirm-password" className="text-sm font-medium">
                      새 비밀번호 확인
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="new-confirm-password"
                        type={showNewConfirmPassword ? "text" : "password"}
                        placeholder="비밀번호를 다시 입력해주세요"
                        value={newConfirmPassword}
                        onChange={(e) => {
                          setNewConfirmPassword(e.target.value)
                          setResetError("")
                        }}
                        className="pl-10 pr-10 h-11 bg-card border-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewConfirmPassword(!showNewConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {resetError && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                      <p className="text-sm text-destructive">{resetError}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full h-11 text-base font-medium">
                    변경 완료
                  </Button>
                </form>
              )}

              {/* Step: Success */}
              {resetStep === "success" && (
                <div className="space-y-5">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">비밀번호 변경 완료</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      새로운 비밀번호로 로그인해주세요.
                    </p>
                  </div>

                  <Button onClick={handleBackToLogin} className="w-full h-11 text-base font-medium">
                    로그인하러 가기
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Form Toggle */}
              <div className="flex bg-secondary rounded-lg p-1 mb-8">
                <button
                  type="button"
                  onClick={() => setActiveForm("login")}
                  className={cn(
                    "flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200",
                    activeForm === "login"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForm("signup")}
                  className={cn(
                    "flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200",
                    activeForm === "signup"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  회원가입
                </button>
              </div>

              {/* Login Form */}
              <div
                className={cn(
                  "transition-all duration-300",
                  activeForm === "login"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-4 hidden"
                )}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">다시 오신 것을 환영합니다</h2>
                  <p className="text-muted-foreground mt-1">커뮤니티에 로그인하세요</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">
                      이메일 또는 학번
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="text"
                        placeholder="이메일 또는 학번을 입력하세요"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 h-11 bg-card border-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">
                      비밀번호
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 bg-card border-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                        로그인 상태 유지
                      </Label>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setActiveForm("reset-password")}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      비밀번호를 잊으셨나요?
                    </button>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base font-medium">
                    로그인
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  계정이 없으신가요?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveForm("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    회원가입
                  </button>
                </p>
              </div>

              {/* Signup Form */}
              <div
                className={cn(
                  "transition-all duration-300",
                  activeForm === "signup"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4 hidden"
                )}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">계정 만들기</h2>
                  <p className="text-muted-foreground mt-1">운암고등학교 커뮤니티에 가입하세요</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                  {/* School Authentication Identity Section */}
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      학교 인증 정보
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="student-id" className="text-sm font-medium">
                          학번
                        </Label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="student-id"
                            type="text"
                            placeholder="10101"
                            maxLength={5}
                            pattern="[0-9]{5}"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value.replace(/\D/g, "").slice(0, 5))}
                            className="pl-10 h-10 bg-card border-input"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="real-name" className="text-sm font-medium">
                          실명
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="real-name"
                            type="text"
                            placeholder="홍길동"
                            value={realName}
                            onChange={(e) => setRealName(e.target.value)}
                            className="pl-10 h-10 bg-card border-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="school-email" className="text-sm font-medium">
                      학교 이메일
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="school-email"
                          type="email"
                          placeholder="2024000...@school.hs.kr"
                          value={schoolEmail}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          disabled={isEmailVerified}
                          className="pl-10 h-11 bg-card border-input"
                        />
                      </div>
                      <Button
                        type="button"
                        variant={verificationCodeSent && !isEmailVerified ? "outline" : "default"}
                        onClick={handleSendVerificationCode}
                        disabled={!isValidEmailFormat(schoolEmail) || isEmailVerified}
                        className="h-11 px-4 shrink-0"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {verificationCodeSent ? "재전송" : "인증코드 전송"}
                      </Button>
                    </div>
                    
                    {/* Timer display */}
                    {verificationCodeSent && verificationTimer > 0 && !isEmailVerified && (
                      <div className="flex items-center gap-2 text-sm">
                        <Timer className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">
                          남은 시간: {formatTimer(verificationTimer)}
                        </span>
                      </div>
                    )}

                    {/* Verification code input - smoothly revealed */}
                    {verificationCodeSent && !isEmailVerified && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <Label htmlFor="verification-code" className="text-sm font-medium">
                          인증코드 입력 (6자리)
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="verification-code"
                            type="text"
                            placeholder="인증코드 6자리"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => {
                              setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                              setVerificationError("")
                            }}
                            className="h-11 bg-card border-input font-mono tracking-widest text-center"
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={verificationCode.length !== 6 || verificationTimer === 0}
                            className="h-11 px-6"
                          >
                            확인
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Verification success message */}
                    {isEmailVerified && (
                      <div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/30 rounded-lg animate-in fade-in duration-300">
                        <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-sm font-medium text-accent">이메일 인증이 완료되었습니다.</span>
                      </div>
                    )}

                    {/* Verification error message */}
                    {verificationError && !isEmailVerified && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in duration-300">
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                        <span className="text-sm text-destructive">{verificationError}</span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      인증을 위해 공식 학교 이메일을 사용해주세요
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-sm font-medium">
                      닉네임
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="nickname"
                        type="text"
                        placeholder="커뮤니티에서 사용할 닉네임"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="pl-10 h-11 bg-card border-input"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      커뮤니티 활동 시 표시되는 익명 닉네임입니다
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">
                        비밀번호
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="비밀번호"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pl-10 pr-10 h-11 bg-card border-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium">
                        비밀번호 확인
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="확인"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 pr-10 h-11 bg-card border-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium"
                    disabled={!isEmailVerified}
                  >
                    {isEmailVerified ? "회원가입 완료" : "이메일 인증을 완료해주세요"}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  이미 계정이 있으신가요?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveForm("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    로그인
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
