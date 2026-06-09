"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Menu,
  X,
  Bell,
  MessageSquare,
  Calendar,
  BookOpen,
  Calculator,
  Globe,
  Microscope,
  Compass,
  Users,
  AlertTriangle,
  Trash2,
  UserX,
  Shield,
  ChevronRight,
  Plus,
  LogOut,
  Home,
  ArrowLeft,
  Send,
  Tag,
  FileText,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  User,
  Hash,
  Camera,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Hardcoded Admin Accounts
const ADMIN_ACCOUNTS = [
  { id: "unam_admin1", nickname: "운암고 게시판 관리인", password: "unamhs2026!" },
  { id: "unam_admin2", nickname: "운암고 생활 청소부", password: "unamhs2026!" },
  { id: "unam_admin3", nickname: "운암고 1황", password: "unamhs2026!" },
]

// Categories
const CATEGORIES = [
  { id: "free", name: "자유게시판", icon: MessageSquare },
  { id: "notice", name: "학사일정 공지", icon: Calendar },
  { id: "korean", name: "국어", icon: BookOpen },
  { id: "math", name: "수학", icon: Calculator },
  { id: "english", name: "영어", icon: Globe },
  { id: "social", name: "사탐", icon: Users },
  { id: "science", name: "과탐", icon: Microscope },
  { id: "career", name: "진로/상담", icon: Compass },
]

// Interfaces
interface Comment {
  id: number
  author: string
  authorId?: string
  content: string
  date: string
  time: string
}

interface Post {
  id: number
  title: string
  category: string
  author: string
  authorId?: string
  date: string
  time: string
  content: string
  tags: string[]
  hasReports: boolean
  comments: Comment[]
}

interface Report {
  id: number
  type: "post" | "comment"
  targetId: number
  title: string
  reason: string
  reporter: string
  date: string
  status: "pending" | "sanctioned"
}

interface UserProfile {
  id: string
  nickname: string
  isAdmin: boolean
  realName: string
  studentId: string
  email: string
  profileImage?: string
  lastNicknameChange?: string
  status?: "ACTIVE" | "SANCTIONED"
  sanctionUntil?: string
  sanctionReason?: string
}

// Initial Posts Data
const INITIAL_POSTS: Post[] = [
  { 
    id: 1, 
    title: "내일 체육대회 준비물 뭐예요?", 
    category: "free", 
    author: "익명의 학생1", 
    date: "2026-05-28",
    time: "14:32",
    content: `안녕하세요! 내일 체육대회인데 준비물이 뭔지 정확히 모르겠어서요.

선생님께서 말씀하신 것 같은데 제가 놓쳤나봐요 ㅠㅠ

혹시 아시는 분 계시면 알려주세요!

- 운동화는 필수인가요?
- 반티 입어야 하나요?
- 물이나 간식 가져가도 되나요?`,
    tags: ["체육대회", "준비물", "질문"],
    hasReports: false,
    comments: [
      { id: 1, author: "체육부장", content: "운동화 필수고요, 반티 꼭 입고 오세요! 물은 가져오시면 됩니다.", date: "2026-05-28", time: "14:45" },
      { id: 2, author: "같은반친구", content: "간식도 가져와도 된대요~ 도시락도 싸오라고 하셨어요!", date: "2026-05-28", time: "15:02" },
    ]
  },
  { 
    id: 2, 
    title: "중간고사 범위 정리해봤습니다", 
    category: "korean", 
    author: "공부벌레", 
    date: "2026-05-27",
    time: "20:15",
    content: `국어 중간고사 범위 정리해봤습니다!

## 문학 파트
- 현대시: 윤동주 '서시', 김소월 '진달래꽃'
- 고전시: 정철 '관동별곡'
- 현대소설: 김유정 '동백꽃'

## 문법 파트
- 음운의 변동
- 단어의 형성
- 문장 성분

## 비문학
- 논증 방식
- 글의 구조 파악

도움이 되셨으면 좋겠습니다! 화이팅!`,
    tags: ["국어", "중간고사", "범위정리"],
    hasReports: true,
    comments: [
      { id: 1, author: "열공중", content: "와 감사합니다!! 정리 진짜 잘하셨네요", date: "2026-05-27", time: "21:30" },
    ]
  },
  { 
    id: 3, 
    title: "수학 문제 질문드립니다", 
    category: "math", 
    author: "수포자탈출", 
    date: "2026-05-27",
    time: "18:20",
    content: `수학 23번 문제 어떻게 푸는지 모르겠어요 ㅠㅠ

이차함수 문제인데 최댓값 구하는 거요.

f(x) = -x² + 4x + 5 에서 최댓값을 구하라는 문제인데...

완전제곱식으로 바꾸는 건 알겠는데 그 다음이 헷갈려요.

도움 주시면 감사하겠습니다!`,
    tags: ["수학", "이차함수", "질문"],
    hasReports: false,
    comments: [
      { id: 1, author: "수학천재", content: "f(x) = -(x-2)² + 9 로 바꾸면 x=2일 때 최댓값 9입니다!", date: "2026-05-27", time: "19:00" },
      { id: 2, author: "수포자탈출", content: "아!! 이해됐어요 감사합니다!!!", date: "2026-05-27", time: "19:15" },
    ]
  },
  { 
    id: 4, 
    title: "영어 에세이 첨삭 부탁드려요", 
    category: "english", 
    author: "영어마스터", 
    date: "2026-05-26",
    time: "16:40",
    content: `영어 수행평가로 에세이를 써야 하는데 첨삭 부탁드려도 될까요?

주제: The importance of environmental protection

Environmental protection is very important in our lives. We need to protect the environment for our future.

First, we should reduce plastic use. Plastic is harmful to animals and nature.

Second, we can plant more trees. Trees give us clean air.

In conclusion, we must protect our environment together.

---

너무 짧은 것 같은데 어떻게 더 늘릴 수 있을까요?`,
    tags: ["영어", "에세이", "첨삭"],
    hasReports: false,
    comments: []
  },
  { 
    id: 5, 
    title: "진로상담 신청 방법 알려주세요", 
    category: "career", 
    author: "고민이많아", 
    date: "2026-05-26",
    time: "10:30",
    content: `진로 상담 받고 싶은데 어떻게 신청하는지 모르겠어요.

선생님한테 직접 가서 말씀드려야 하나요?
아니면 온라인으로 신청하는 방법이 있나요?

요즘 진로 때문에 고민이 많아서 상담 한번 받아보고 싶습니다.

아시는 분 계시면 알려주세요!`,
    tags: ["진로", "상담", "신청방법"],
    hasReports: true,
    comments: [
      { id: 1, author: "3학년선배", content: "진로상담실 앞에 신청서 있어요! 작성해서 제출하시면 됩니다", date: "2026-05-26", time: "11:00" },
    ]
  },
  { 
    id: 6, 
    title: "과학 실험 보고서 양식 공유", 
    category: "science", 
    author: "과학덕후", 
    date: "2026-05-25",
    time: "22:10",
    content: `과학 실험 보고서 양식 공유합니다!

## 보고서 구성

1. **실험 제목**
2. **실험 목적**
3. **실험 준비물**
4. **실험 방법** (순서대로 작성)
5. **실험 결과** (표, 그래프 포함)
6. **결론 및 고찰**
7. **참고 문헌**

선생님께서 강조하신 부분:
- 결과는 객관적으로 작성
- 고찰에서 오차 원인 분석 필수
- 참고 문헌 형식 지켜서 작성

도움이 되셨으면 좋겠습니다!`,
    tags: ["과학", "실험보고서", "양식"],
    hasReports: false,
    comments: [
      { id: 1, author: "과학초보", content: "딱 필요했던 건데 감사합니다!", date: "2026-05-26", time: "08:30" },
    ]
  },
  { 
    id: 7, 
    title: "학사일정 변경 안내", 
    category: "notice", 
    author: "운암고 게시판 관리인", 
    date: "2026-05-25",
    time: "09:00",
    content: `## 학사일정 변경 안내

안녕하세요, 운암고등학교입니다.

아래와 같이 학사일정이 변경되었음을 안내드립니다.

### 변경 사항

| 기존 일정 | 변경 일정 | 내용 |
|----------|----------|------|
| 5/30(금) | 5/31(토) | 체육대회 |
| 6/5(목) | 6/7(토) | 학부모 상담 주간 시작 |

### 사유
- 체육대회: 우천 예보로 인한 연기
- 학부모 상담: 학교 행사 일정 조율

문의사항은 교무실로 연락 바랍니다.`,
    tags: ["공지", "학사일정", "변경"],
    hasReports: false,
    comments: []
  },
  { 
    id: 8, 
    title: "동아리 모집 공고", 
    category: "free", 
    author: "동아리장", 
    date: "2026-05-24",
    time: "13:25",
    content: `## 코딩 동아리 'CodeX' 신입 부원 모집!

안녕하세요! 코딩 동아리 CodeX입니다.

### 모집 대상
- 프로그래밍에 관심 있는 1, 2학년
- 경험 무관 (초보자 환영!)

### 활동 내용
- 주 1회 정기 모임 (수요일 방과후)
- 웹 개발, 앱 개발 프로젝트
- 각종 코딩 대회 참가
- 선배 멘토링

### 지원 방법
- 구글폼 링크로 지원서 제출
- 마감: 5/30(금)

많은 관심 부탁드립니다!`,
    tags: ["동아리", "모집", "코딩"],
    hasReports: false,
    comments: [
      { id: 1, author: "코딩꿈나무", content: "초보자도 정말 괜찮나요?? 관심있어요!", date: "2026-05-24", time: "15:00" },
      { id: 2, author: "동아리장", content: "네! 완전 초보자분들도 기초부터 알려드려요~ 편하게 지원하세요!", date: "2026-05-24", time: "15:30" },
    ]
  },
]

// Initial Reports Data
const INITIAL_REPORTS: Report[] = [
  { id: 1, type: "post", targetId: 2, title: "중간고사 범위 정리해봤습니다", reason: "불법 광고 (도박/마약 등)", reporter: "익명", date: "2026-05-27", status: "pending" },
  { id: 2, type: "comment", targetId: 5, title: "진로상담 신청 방법 알려주세요", reason: "욕설/비방", reporter: "익명", date: "2026-05-26", status: "pending" },
  { id: 3, type: "post", targetId: 8, title: "동아리 모집 공고", reason: "기타", reporter: "익명", date: "2026-05-24", status: "pending" },
]

// Report Reasons
const REPORT_REASONS = [
  { id: "abuse", label: "욕설/비방" },
  { id: "illegal", label: "불법 광고 (도박/마약 등)" },
  { id: "harassment", label: "성희롱" },
  { id: "other", label: "기타" },
]

type ViewMode = "list" | "detail" | "write"
type ApiPost = {
  post_id: string
  type: string
  author_id: string
  author_nickname?: string
  title: string
  content: string
  view_count: number
  due_date: string
  created_at: string
}

type ApiComment = {
  comment_id: string
  post_id: string
  author_id: string
  author_nickname?: string
  content: string
  created_at: string
}

type ApiReport = {
  report_id: string
  type: "post" | "comment" | string
  target_id: string
  title: string
  reason: string
  reporter: string
  date: string
  status: "pending" | "sanctioned" | string
}

const mapApiCommentToComment = (comment: ApiComment): Comment => {
  const createdAt = comment.created_at || ""

  return {
    id: Number(comment.comment_id.match(/\d+/)?.[0] ?? Date.now()),
    author: comment.author_nickname || comment.author_id,
    authorId: comment.author_id,
    content: comment.content,
    date: createdAt.slice(0, 10),
    time: createdAt.slice(11, 16),
  }
}

const mapApiPostToPost = (post: ApiPost): Post => {
  const numericId = Number(post.post_id.match(/\d+/)?.[0] ?? Date.now())
  const createdDate = post.created_at || ""

  return {
    id: numericId,
    title: post.title,
    category: post.type.toLowerCase(),
    author: post.author_nickname || post.author_id,
    authorId: post.author_id,
    date: createdDate.slice(0, 10),
    time: createdDate.slice(11, 16),
    content: post.content,
    tags: [],
    hasReports: false,
    comments: [],
  }
}

const mapApiReportToReport = (report: ApiReport): Report => ({
  id: Number(report.report_id.match(/\d+/)?.[0] ?? Date.now()),
  type: report.type === "comment" ? "comment" : "post",
  targetId: Number(report.target_id.match(/\d+/)?.[0] ?? 0),
  title: report.title,
  reason: report.reason,
  reporter: report.reporter,
  date: report.date,
  status: report.status === "sanctioned" ? "sanctioned" : "pending",
})

export function CommunityBoard() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Core state
  const [commentsLoading, setCommentsLoading] = useState(false)

  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState("")
  const [reports, setReports] = useState<Report[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportsError, setReportsError] = useState("")
  const [deletingReportId, setDeletingReportId] = useState<number | null>(null)
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("free")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ id: number; title: string; type: "post" | "comment" } | null>(null)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  
  // Write post state
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostCategory, setNewPostCategory] = useState("free")
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostTags, setNewPostTags] = useState("")
  
  // Comment state
  const [newComment, setNewComment] = useState("")
  
  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [newNickname, setNewNickname] = useState("")
  const [nicknameError, setNicknameError] = useState("")
  const [nicknameSuccess, setNicknameSuccess] = useState("")
  
  // Logout alert state
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  
  // Sanction modal state
  const [sanctionModalOpen, setSanctionModalOpen] = useState(false)
  const [sanctionTargetReport, setSanctionTargetReport] = useState<Report | null>(null)
  
  // Mock logged in user
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: "",
    nickname: "",
    isAdmin: false,
    realName: "",
    studentId: "",
    email: "",
    status: "ACTIVE",
  })

  const [userLoaded, setUserLoaded] = useState(false)

  // Toast helper
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }
  
  useEffect(() => {
    const raw = sessionStorage.getItem("currentUser")

    if (!raw) {
      router.push("/")
      return
    }

    try {
      const parsed = JSON.parse(raw)
      setCurrentUser(parsed)
      setUserLoaded(true)
    } catch {
      sessionStorage.removeItem("currentUser")
      router.push("/")
    }
  }, [router])

  //서버에서 게시글 불러오는 함수 추가
  const loadPosts = async () => {
    try {
      setPostsLoading(true)
      setPostsError("")
  
      const res = await fetch("/api/posts")
      const data = await res.json()
  
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "게시글을 불러오지 못했습니다.")
      }

      const mappedPosts = (data.posts as ApiPost[]).map(mapApiPostToPost)

      // 최신 글이 위로 오게 정렬
      mappedPosts.sort((a, b) => b.id - a.id)

      setPosts(mappedPosts)
    } catch (error) {
      setPostsError(error instanceof Error ? error.message : "게시글 불러오기 실패")
    } finally {
      setPostsLoading(false)
    }
  }

  useEffect(() => {
    void loadPosts()
  }, [])

  // 댓글 불러오는 함수 추가
  const loadCommentsForPost = async (postId: number) => {
    const apiPostId = `p_${String(postId).padStart(3, "0")}`

    try {
      setCommentsLoading(true)

      const res = await fetch(`/api/comments?post_id=${encodeURIComponent(apiPostId)}`)
      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "댓글을 불러오지 못했습니다.")
      }

      const mappedComments = (data.comments as ApiComment[]).map(mapApiCommentToComment)

      setSelectedPost((prev) =>
        prev && prev.id === postId
          ? { ...prev, comments: mappedComments }
          : prev
      )
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "댓글 불러오기 실패",
        "error"
      )
    } finally {
      setCommentsLoading(false)
    }
  }

  //신고 불러오는 함수 추가
  const loadReports = async () => {
    try {
      setReportsLoading(true)
      setReportsError("")

      const res = await fetch("/api/reports", { cache: "no-store" })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "신고를 불러오지 못했습니다.")
      }

      const mappedReports = (data.reports as ApiReport[]).map(mapApiReportToReport)
      setReports(mappedReports)
    } catch (error) {
      setReportsError(error instanceof Error ? error.message : "신고 불러오기 실패")
    } finally {
      setReportsLoading(false)
    }
  }

  // Markdown parser for rendering bold and italic text
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
      // Check for bold (**text**)
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
      // Check for italic (*text*)
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/)

      if (boldMatch && (!italicMatch || boldMatch.index! <= italicMatch.index!)) {
        // Add text before bold
        if (boldMatch.index! > 0) {
          parts.push(<span key={key++}>{remaining.substring(0, boldMatch.index)}</span>)
        }
        // Add bold text
        parts.push(<strong key={key++} className="font-bold">{boldMatch[1]}</strong>)
        remaining = remaining.substring(boldMatch.index! + boldMatch[0].length)
      } else if (italicMatch) {
        // Add text before italic
        if (italicMatch.index! > 0) {
          parts.push(<span key={key++}>{remaining.substring(0, italicMatch.index)}</span>)
        }
        // Add italic text
        parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>)
        remaining = remaining.substring(italicMatch.index! + italicMatch[0].length)
      } else {
        // No more matches, add remaining text
        parts.push(<span key={key++}>{remaining}</span>)
        break
      }
    }

    return parts
  }

  // Parse content with line breaks and markdown
  const renderContent = (content: string): React.ReactNode => {
    return content.split('\n').map((line, lineIndex) => (
      <span key={lineIndex}>
        {parseMarkdown(line)}
        {lineIndex < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  const getCategoryName = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId)?.name || categoryId
  }

  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      free: "bg-blue-100 text-blue-700",
      notice: "bg-red-100 text-red-700",
      korean: "bg-emerald-100 text-emerald-700",
      math: "bg-purple-100 text-purple-700",
      english: "bg-amber-100 text-amber-700",
      social: "bg-pink-100 text-pink-700",
      science: "bg-cyan-100 text-cyan-700",
      career: "bg-orange-100 text-orange-700",
    }
    return colors[categoryId] || "bg-gray-100 text-gray-700"
  }

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleReport = (id: number, title: string, type: "post" | "comment" = "post") => {
    setReportTarget({ id, title, type })
    setSelectedReasons([])
    setReportModalOpen(true)
  }

  const handleSubmitReport = async () => {
    if (selectedReasons.length === 0 || !reportTarget) return

    try {
      const reason = selectedReasons
        .map((r) => REPORT_REASONS.find((reason) => reason.id === r)?.label)
        .filter(Boolean)
        .join(", ")

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: reportTarget.type,
          target_id: reportTarget.id,
          title: reportTarget.title,
          reason,
          reporter: "익명",
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "신고 등록 실패")
      }

      setReportModalOpen(false)
      setReportTarget(null)
      setSelectedReasons([])

      showToast("신고가 접수되었습니다. 관리자가 검토 후 조치합니다.")
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "신고 중 오류가 발생했습니다.",
        "error"
      )
    }
  }

  const toggleReason = (reasonId: string) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId)
        ? prev.filter(r => r !== reasonId)
        : [...prev, reasonId]
    )
  }
  
  const handlePostClick = async (post: Post) => {
    setSelectedPost({ ...post, comments: [] })
    setViewMode("detail")
    await loadCommentsForPost(post.id)
  }
  
  const handleBackToList = () => {
    setSelectedPost(null)
    setViewMode("list")
    setNewComment("")
  }

  const isSanctioned = () => currentUser.status === "SANCTIONED"
  
  const handleOpenWriteMode = () => {
    if (isSanctioned()) {
      showToast("이용이 제한된 계정입니다.", "error")
      return
    }

    setNewPostTitle("")
    setNewPostCategory(selectedCategory === "all" ? "free" : selectedCategory)
    setNewPostContent("")
    setNewPostTags("")
    setViewMode("write")
  }
  
  const handleCancelWrite = () => {
    setViewMode("list")
  }
  
  // Submit new post - adds to state
  const handleSubmitPost = async () => {
    if (isSanctioned()) {
      showToast("이용이 제한된 계정입니다.", "error")
      return
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) return

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          type: newPostCategory.toUpperCase(),
          author_id: currentUser.studentId === "ADMIN" ? currentUser.id : currentUser.studentId,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "게시글 등록 실패")
      }

      await loadPosts()
      setViewMode("list")
      showToast("게시글이 성공적으로 등록되었습니다.")
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "게시글 등록 중 오류가 발생했습니다.",
        "error"
      )
    }
  }
  
  // Submit comment - adds to post
  const handleSubmitComment = async () => {
    if (isSanctioned()) {
      showToast("이용이 제한된 계정입니다.", "error")
      return
    }

    if (!newComment.trim() || !selectedPost) return

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: `p_${String(selectedPost.id).padStart(3, "0")}`,
          author_id: currentUser.studentId === "ADMIN" ? currentUser.id : currentUser.studentId,
          content: newComment.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "댓글 등록 실패")
      }

      setNewComment("")
      await loadCommentsForPost(selectedPost.id)
      showToast("댓글이 등록되었습니다.")
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "댓글 등록 중 오류가 발생했습니다.",
        "error"
      )
    }
  }
  
  // Editor toolbar functions
  const insertMarkdown = (syntax: string, wrap: boolean = true) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = newPostContent.substring(start, end)
    
    let newText: string
    if (wrap && selectedText) {
      newText = newPostContent.substring(0, start) + syntax + selectedText + syntax + newPostContent.substring(end)
    } else {
      newText = newPostContent.substring(0, start) + syntax + newPostContent.substring(end)
    }
    
    setNewPostContent(newText)
    
    // Restore focus
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = wrap && selectedText ? end + syntax.length * 2 : start + syntax.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }
  
  const handleBold = () => insertMarkdown("**")
  const handleItalic = () => insertMarkdown("*")
  const handleBulletList = () => insertMarkdown("\n- ", false)
  const handleNumberedList = () => insertMarkdown("\n1. ", false)
  const handleLink = () => insertMarkdown("[링크텍스트](URL)", false)
  const handleQuote = () => insertMarkdown("\n> ", false)
  const handleCode = () => insertMarkdown("`")
  
  // Admin actions - delete content from both dashboard and board
  const handleDeleteContent = async (report: Report) => {
    setDeletingReportId(report.id)

    try {
      if (report.type === "post") {
        const postId = `p_${String(report.targetId).padStart(3, "0")}`

        const res = await fetch("/api/posts", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ post_id: postId }),
        })

        const text = await res.text()
        const data = text ? JSON.parse(text) : null

        if (!res.ok || !data?.ok) {
          throw new Error(data?.message || "게시글 삭제 실패")
        }

        await loadPosts()
      }

      setReports((prev) => prev.filter((r) => r.id !== report.id))

      if (selectedPost?.id === report.targetId) {
        setSelectedPost(null)
        setViewMode("list")
      }

      showToast("해당 컨텐츠가 성공적으로 삭제되었습니다.")
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.",
        "error"
      )
    } finally {
      setDeletingReportId(null)
    }
  }
  
  const handleOpenSanctionModal = (report: Report) => {
    setSanctionTargetReport(report)
    setSanctionModalOpen(true)
  }
  
  const handleConfirmSanction = async () => {
    if (!sanctionTargetReport) return

    try {
      const reportId = `r_${String(sanctionTargetReport.id).padStart(3, "0")}`

      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report_id: reportId,
          status: "sanctioned",
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "제재 처리 실패")
      }

      setReports((prev) =>
        prev.map((r) =>
          r.id === sanctionTargetReport.id ? { ...r, status: "sanctioned" } : r
        )
      )

      await loadReports()
      setSanctionModalOpen(false)
      setSanctionTargetReport(null)
      
      showToast("사용자 제재가 완료되었습니다.")
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "제재 처리 중 오류가 발생했습니다.",
        "error"
      )
    }
  }
  
  // Nickname change logic
  const canChangeNickname = () => {
    if (!currentUser.lastNicknameChange) return true
    const lastChange = new Date(currentUser.lastNicknameChange)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 7
  }
  
  const getDaysUntilNicknameChange = () => {
    if (!currentUser.lastNicknameChange) return 0
    const lastChange = new Date(currentUser.lastNicknameChange)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 7 - diffDays)
  }
  
  const handleOpenProfile = () => {
    setNewNickname(currentUser.nickname)
    setNicknameError("")
    setNicknameSuccess("")
    setProfileModalOpen(true)
  }
  
  const handleSaveNickname = async () => {
    setNicknameError("")
    setNicknameSuccess("")

    if (!newNickname.trim()) {
      setNicknameError("닉네임을 입력해주세요.")
      return
    }

    if (newNickname.length < 2 || newNickname.length > 20) {
      setNicknameError("닉네임은 2자 이상 20자 이하로 입력해주세요.")
      return
    }

    if (!canChangeNickname()) {
      const daysLeft = getDaysUntilNicknameChange()
      setNicknameError(`닉네임 변경은 ${daysLeft}일 후에 가능합니다.`)
      return
    }

    try {
      const res = await fetch("/api/user/nickname", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          nickname: newNickname.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "닉네임 변경 실패")
      }

      const updatedUser = {
        ...currentUser,
        nickname: newNickname.trim(),
        lastNicknameChange: new Date().toISOString().split("T")[0],
      }

      setCurrentUser(updatedUser)
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setNicknameSuccess("닉네임이 성공적으로 변경되었습니다. (다음 변경 가능일: 7일 후)")
    } catch (error) {
      setNicknameError(
        error instanceof Error ? error.message : "닉네임 변경 중 오류가 발생했습니다."
      )
    }
  }
  
  const handleLogout = () => {
    setShowLogoutAlert(true)
    setTimeout(() => {
      router.push("/")
    }, 1500)
  }

  if (!userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        불러오는 중...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {currentUser.status === "SANCTIONED" && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-sm text-red-700">
          현재 계정은 제재 상태입니다. 글쓰기와 댓글 작성이 제한됩니다.
          {currentUser.sanctionReason ? ` (사유: ${currentUser.sanctionReason})` : ""}
          {currentUser.sanctionUntil ? ` / 해제 예정일: ${currentUser.sanctionUntil}` : ""}
        </div>
      )}
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={cn(
            "px-4 py-3 rounded-lg shadow-lg flex items-center gap-3",
            toast.type === "success" 
              ? "bg-primary text-primary-foreground" 
              : "bg-destructive text-destructive-foreground"
          )}>
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left - Logo & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-foreground">운암고 자율게시판</h1>
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="검색어를 입력하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-secondary border-0"
              />
            </div>
          </div>

          {/* Right - User Profile & Admin Toggle */}
          <div className="flex items-center gap-2">
            {currentUser.isAdmin && (
              <Button
                variant={isAdminMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsAdminMode(!isAdminMode)
                  if (!isAdminMode) setShowAdminDashboard(false)
                }}
                className="hidden sm:flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden lg:inline">관리자 모드</span>
              </Button>
            )}
            
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 hover:bg-secondary rounded-lg transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {currentUser.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium text-foreground max-w-[120px] truncate">
                    {currentUser.nickname}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2" onClick={handleOpenProfile}>
                  <User className="w-4 h-4" />
                  내 프로필
                </DropdownMenuItem>
                {currentUser.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2"
                      onClick={() => setIsAdminMode(!isAdminMode)}
                    >
                      <Shield className="w-4 h-4" />
                      {isAdminMode ? "일반 모드로 전환" : "관리자 모드"}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="검색어를 입력하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-secondary border-0"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-0 w-64 h-full lg:h-[calc(100vh-4rem)] bg-card border-r border-border transition-transform duration-300 overflow-y-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="p-4">
            {/* Mobile Close Button */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <span className="font-semibold text-foreground">카테고리</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Dashboard Button */}
            {isAdminMode && currentUser.isAdmin && (
              <Button
                variant={showAdminDashboard ? "default" : "outline"}
                className="w-full mb-4 justify-start gap-2"
                onClick={() => {
                  setShowAdminDashboard(!showAdminDashboard)
                  setViewMode("list")
                  setSelectedPost(null)
                  if (!showAdminDashboard) void loadReports()
                }}
              >
                <Shield className="w-4 h-4" />
                관리자 대시보드
              </Button>
            )}
            

            {/* Categories */}
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory("all")
                  setShowAdminDashboard(false)
                  setSidebarOpen(false)
                  setViewMode("list")
                  setSelectedPost(null)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  selectedCategory === "all" && !showAdminDashboard
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Home className="w-4 h-4" />
                전체 게시판
              </button>

              {CATEGORIES.map((category) => {
                const Icon = category.icon
                const isNotice = category.id === "notice"
                return (
                  <div key={category.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(category.id)
                        setShowAdminDashboard(false)
                        setSidebarOpen(false)
                        setViewMode("list")
                        setSelectedPost(null)
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        selectedCategory === category.id && !showAdminDashboard
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        {category.name}
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                    
                    {/* Admin Notice Button */}
                    {isNotice && isAdminMode && currentUser.isAdmin && selectedCategory === "notice" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 ml-7 justify-start gap-2 text-xs border-dashed"
                        onClick={() => {
                          setNewPostCategory("notice")
                          handleOpenWriteMode()
                        }}
                      >
                        <Plus className="w-3 h-3" />
                        학사공지 작성
                      </Button>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {showAdminDashboard && isAdminMode ? (
            /* Admin Dashboard */
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">관리자 대시보드</h2>
                <p className="text-muted-foreground mt-1">신고된 게시글 및 댓글을 관리합니다</p>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {reportsLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    신고 목록을 불러오는 중...
                  </div>
                ) : reportsError ? (
                  <div className="text-center py-12 text-destructive space-y-3">
                    <p>{reportsError}</p>
                    <Button variant="outline" onClick={loadReports}>
                      다시 시도
                    </Button>
                  </div>
                ) : null}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">유형</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">제목</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">신고 사유</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">상태</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">신고일</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reports.map((report) => (
                        <tr 
                          key={report.id} 
                          className={cn(
                            "transition-all duration-300",
                            deletingReportId === report.id 
                              ? "opacity-0 translate-x-4" 
                              : "hover:bg-secondary/30"
                          )}
                        >
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs">
                              {report.type === "post" ? "게시글" : "댓글"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-foreground font-medium line-clamp-1">
                              {report.title}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              {report.reason}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge 
                              className={cn(
                                "text-xs",
                                report.status === "sanctioned" 
                                  ? "bg-orange-100 text-orange-700" 
                                  : "bg-blue-100 text-blue-700"
                              )}
                            >
                              {report.status === "sanctioned" ? "제재 완료" : "처리 대기"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">{report.date}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-1 text-xs"
                                onClick={() => handleDeleteContent(report)}
                              >
                                <Trash2 className="w-3 h-3" />
                                {report.type === "post" ? "게시글 삭제" : "댓글 삭제"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn(
                                  "h-8 gap-1 text-xs",
                                  report.status === "sanctioned" 
                                    ? "text-muted-foreground" 
                                    : "text-destructive hover:text-destructive"
                                )}
                                onClick={() => handleOpenSanctionModal(report)}
                                disabled={report.status === "sanctioned"}
                              >
                                <UserX className="w-3 h-3" />
                                {report.status === "sanctioned" ? "제재됨" : "사용자 제재"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {reports.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    신고된 내용이 없습니다
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === "write" ? (
            /* Write Post View */
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelWrite}
                  className="gap-2 text-muted-foreground hover:text-foreground mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  취소
                </Button>
                <h2 className="text-2xl font-bold text-foreground">새 글 쓰기</h2>
                <p className="text-muted-foreground mt-1">게시글을 작성해주세요</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">제목</label>
                  <Input
                    placeholder="제목을 입력하세요"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                {/* Category Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">카테고리</label>
                  <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c.id !== "notice" || (isAdminMode && currentUser.isAdmin)).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4" />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rich Text Editor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">내용</label>
                  <div className="border border-border rounded-lg overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 p-2 border-b border-border bg-secondary/30 flex-wrap">
                      <button 
                        type="button"
                        onClick={handleBold}
                        className="p-2 hover:bg-secondary rounded transition-colors" 
                        title="굵게 (**텍스트**)"
                      >
                        <Bold className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        type="button"
                        onClick={handleItalic}
                        className="p-2 hover:bg-secondary rounded transition-colors" 
                        title="기울임 (*텍스트*)"
                      >
                        <Italic className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <div className="w-px h-6 bg-border mx-1" />
                      <button 
                        type="button"
                        onClick={handleBulletList}
                        className="p-2 hover:bg-secondary rounded transition-colors" 
                        title="글머리 기호"
                      >
                        <List className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        type="button"
                        onClick={handleNumberedList}
                        className="p-2 hover:bg-secondary rounded transition-colors" 
                        title="번호 매기기"
                      >
                        <ListOrdered className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <div className="w-px h-6 bg-border mx-1" />
                      <button 
                        type="button"
                        onClick={handleLink}
                        className="p-2 hover:bg-secondary rounded transition-colors" 
                        title="링크 삽입"
                      >
                        <Link className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <div className="w-px h-6 bg-border mx-1" />
                      <button 
                        type="button"
                        onClick={handleQuote}
                        className="p-2 hover:bg-secondary rounded transition-colors" 
                        title="인용"
                      >
                        <Quote className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        type="button"
                        onClick={handleCode}
                        className="p-2 hover:bg-secondary rounded transition-colors" 
                        title="코드"
                      >
                        <Code className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    {/* Text Area */}
                    <Textarea
                      ref={textareaRef}
                      placeholder={`내용을 입력하세요...\n\n마크다운 문법을 지원합니다.\n- **굵게** 또는 *기울임*\n- ## 제목\n- 목록 항목`}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="min-h-[300px] border-0 rounded-none resize-none focus-visible:ring-0 text-base leading-relaxed"
                    />
                  </div>
                </div>

                {/* Tags Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    태그
                  </label>
                  <Input
                    placeholder="태그를 쉼표(,)로 구분하여 입력하세요 (예: 질문, 수학, 시험)"
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">태그는 게시글 검색에 도움이 됩니다</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={handleCancelWrite} className="px-6">
                    취소
                  </Button>
                  <Button 
                    onClick={handleSubmitPost}
                    disabled={!newPostTitle.trim() || !newPostContent.trim()}
                    className="px-6 gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    등록
                  </Button>
                </div>
              </div>
            </div>
          ) : viewMode === "detail" && selectedPost ? (
            /* Post Detail View */
            <div className="max-w-3xl mx-auto">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="gap-2 text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                목록으로 돌아가기
              </Button>

              {/* Post Content */}
              <article className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Post Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={cn("text-xs font-medium", getCategoryColor(selectedPost.category))}>
                      {getCategoryName(selectedPost.category)}
                    </Badge>
                    {selectedPost.hasReports && isAdminMode && (
                      <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                        신고됨
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-4 text-balance">
                    {selectedPost.title}
                  </h1>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-secondary text-foreground">
                          {selectedPost.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{selectedPost.author}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedPost.date} {selectedPost.time}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-red-600 hover:bg-red-50 gap-1.5"
                      onClick={() => handleReport(selectedPost.id, selectedPost.title)}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs">신고</span>
                    </Button>
                  </div>
                </div>

                {/* Post Body */}
                <div className="p-6">
                  <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                    {renderContent(selectedPost.content)}
                  </div>
                  
                  {/* Tags */}
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-6 pt-6 border-t border-border flex-wrap">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      {selectedPost.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </article>

              {/* Comments Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  댓글 {selectedPost.comments.length}개
                </h3>
                {commentsLoading ? (
                  <div className="text-center py-8 text-muted-foreground bg-card rounded-xl border border-border">
                    댓글을 불러오는 중...
                  </div>
                ) : null}

                {/* Comment Input */}
                <div className="bg-card rounded-xl border border-border p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {currentUser.nickname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="댓글을 작성하세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && newComment.trim()) {
                            e.preventDefault()
                            handleSubmitComment()
                          }
                        }}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex justify-end mt-3">
                          <Button
                            size="sm"
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim() || isSanctioned()}
                            className="gap-2"
                          >
                            <Send className="w-4 h-4" />
                            댓글 등록
                          </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {selectedPost.comments.map((comment) => (
                    <div key={comment.id} className="bg-card rounded-xl border border-border p-4 animate-in fade-in duration-300">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarFallback className="bg-secondary text-foreground text-xs">
                              {comment.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {comment.date} {comment.time}
                              </span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">
                              {renderContent(comment.content)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 gap-1 h-8 px-2"
                          onClick={() => handleReport(comment.id, comment.content, "comment")}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="text-xs">신고</span>
                        </Button>
                      </div>
                    </div>
                  ))}

                  {selectedPost.comments.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                      아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Posts List */
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedCategory === "all" ? "전체 게시판" : getCategoryName(selectedCategory)}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {filteredPosts.length}개의 게시글
                  </p>
                </div>
                  <Button className="gap-2" onClick={handleOpenWriteMode} disabled={isSanctioned()}>
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">새 글 쓰기</span>
                  </Button>
              </div>

              <div className="space-y-3">
                {postsLoading ? (
                  <div className="text-center py-16 text-muted-foreground">
                    게시글을 불러오는 중...
                  </div>
                ) : postsError ? (
                  <div className="text-center py-16 text-destructive space-y-3">
                    <p>{postsError}</p>
                    <Button variant="outline" onClick={loadPosts}>
                      다시 시도
                    </Button>
                  </div>
                ) : null}
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={cn("text-xs font-medium", getCategoryColor(post.category))}>
                            {getCategoryName(post.category)}
                          </Badge>
                          {post.hasReports && isAdminMode && (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                              신고됨
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{post.author}</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                          <span>{post.date}</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {post.comments.length}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReport(post.id, post.title)
                        }}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs">신고</span>
                      </Button>
                    </div>
                  </article>
                ))}

                {filteredPosts.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    게시글이 없습니다
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {reportTarget?.type === "comment" ? "댓글 신고" : "게시글 신고"}
            </DialogTitle>
            <DialogDescription className="text-left">
              {reportTarget && (
                <span className="block mt-2 p-3 bg-secondary rounded-lg text-sm text-foreground line-clamp-2">
                  {`"${reportTarget.title}"`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm font-medium text-foreground mb-3">신고 사유를 선택해주세요</p>
            <div className="space-y-3">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedReasons.includes(reason.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary/50"
                  )}
                >
                  <Checkbox
                    checked={selectedReasons.includes(reason.id)}
                    onCheckedChange={() => toggleReason(reason.id)}
                  />
                  <span className="text-sm text-foreground">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={selectedReasons.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              신고하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              내 프로필
            </DialogTitle>
            <DialogDescription>
              프로필 정보를 확인하고 닉네임을 변경할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  {currentUser.profileImage ? (
                    <img 
                      src={currentUser.profileImage} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      {currentUser.nickname.charAt(0)}
                    </span>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-md hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">실명</Label>
                  <div className="flex items-center gap-2 p-2.5 bg-secondary rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{currentUser.realName}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">학번 / ID</Label>
                  <div className="flex items-center gap-2 p-2.5 bg-secondary rounded-lg">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{currentUser.studentId}</span>
                  </div>
                </div>
              </div>

              {/* Nickname Input */}
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-sm font-medium">
                  닉네임 (커뮤니티 표시명)
                </Label>
                <Input
                  id="nickname"
                  value={newNickname}
                  onChange={(e) => {
                    setNewNickname(e.target.value)
                    setNicknameError("")
                    setNicknameSuccess("")
                  }}
                  placeholder="닉네임을 입력하세요"
                  className="h-11"
                />
                <p className="text-xs text-amber-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  닉네임은 변경 후 7일 동안 다시 바꿀 수 없습니다.
                </p>
                
                {!canChangeNickname() && (
                  <p className="text-xs text-muted-foreground">
                    다음 변경 가능일: {getDaysUntilNicknameChange()}일 후
                  </p>
                )}
              </div>

              {/* Error/Success Messages */}
              {nicknameError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{nicknameError}</p>
                </div>
              )}
              
              {nicknameSuccess && (
                <div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-sm text-accent">{nicknameSuccess}</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setProfileModalOpen(false)}>
              닫기
            </Button>
            <Button 
              onClick={handleSaveNickname}
              disabled={newNickname === currentUser.nickname || !newNickname.trim()}
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sanction Confirmation Modal */}
      <Dialog open={sanctionModalOpen} onOpenChange={setSanctionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-destructive" />
              사용자 제재 확인
            </DialogTitle>
            <DialogDescription>
              해당 사용자를 제재하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-4 bg-secondary rounded-lg space-y-2">
              <p className="text-sm text-foreground">
                <span className="font-medium">신고 대상:</span> {sanctionTargetReport?.title}
              </p>
              <p className="text-sm text-foreground">
                <span className="font-medium">신고 사유:</span> {sanctionTargetReport?.reason}
              </p>
            </div>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                해당 사용자를 7일간 정지하시겠습니까?
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSanctionModalOpen(false)}>
              취소
            </Button>
            <Button
              onClick={handleConfirmSanction}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              제재 확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Alert */}
      {showLogoutAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl border border-border p-6 shadow-xl animate-in fade-in zoom-in duration-200 max-w-sm mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">로그아웃 되었습니다</h3>
              <p className="text-sm text-muted-foreground">로그인 페이지로 이동합니다...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
