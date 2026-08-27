import { AuthRequired, ErrorState, PageLoader } from "@/components/RouteState";
import { PlatformShell } from "@/components/PlatformShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, ChevronLeft, Lightbulb, MessageSquareQuote, Sparkles, Target } from "lucide-react";
import { useMemo } from "react";
import { useLocation, useRoute } from "wouter";

const categoryLabels = { general: "سؤال عام", technical: "سؤال تقني", behavioral: "سؤال سلوكي" };

function scoreTone(score: number) {
  if (score >= 80) return "#16806f";
  if (score >= 60) return "#c68c26";
  return "#bd5b4e";
}

function Metric({ label, value }: { label: string; value: number | null }) {
  const score = value || 0;
  return <div className="metric-row"><div className="flex items-center justify-between"><span>{label}</span><strong style={{ color: scoreTone(score) }}>{score}%</strong></div><div className="metric-track"><span style={{ width: `${score}%`, background: scoreTone(score) }} /></div></div>;
}

export default function AnswerDetail() {
  const [, params] = useRoute("/results/:id/answers/:answerId");
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const interviewId = Number(params?.id);
  const answerId = Number(params?.answerId);
  const detailsInput = useMemo(() => ({ interviewId }), [interviewId]);
  const { data, isLoading, error, refetch } = trpc.interview.details.useQuery(detailsInput, { enabled: isAuthenticated && Number.isFinite(interviewId) });
  if (authLoading) return <PlatformShell><main className="page-main"><PageLoader /></main></PlatformShell>;
  if (!isAuthenticated) return <PlatformShell><main className="page-main"><AuthRequired title="سجّل دخولك لمراجعة إجابتك" /></main></PlatformShell>;
  if (isLoading) return <PlatformShell><main className="page-main"><PageLoader label="نسترجع تحليل الإجابة" /></main></PlatformShell>;
  if (error || !data) return <PlatformShell><main className="page-main"><ErrorState message={error?.message} retry={() => refetch()} /></main></PlatformShell>;
  const answer = data.answers.find(item => item.id === answerId);
  if (!answer) return <PlatformShell><main className="page-main"><ErrorState message="لم نعثر على الإجابة المطلوبة ضمن هذه المقابلة." /></main></PlatformShell>;

  return <PlatformShell><main className="answer-detail-page"><div className="container max-w-4xl py-9 sm:py-14"><button onClick={() => setLocation(`/results/${data.id}`)} className="back-button" type="button"><ChevronLeft size={18} /> العودة إلى التقييم</button><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_260px]"><section><div className="answer-detail-heading"><span className="category-pill">{categoryLabels[answer.category]}</span><p>مراجعة إجابة السؤال {answer.sequence}</p><h1>{answer.question}</h1></div><article className="quote-answer mt-5"><MessageSquareQuote size={23} /><div><p className="quote-label">إجابتك</p><p>{answer.answer || "لم يتم حفظ نص لهذه الإجابة."}</p></div></article><div className="mt-5 grid gap-4 sm:grid-cols-2"><article className="detail-note detail-good"><CheckCircle2 size={21} /><div><p className="detail-note-label">ملاحظة المدرب</p><h2>ما ظهر جيدًا</h2><p>{answer.feedback || "لا توجد ملاحظة مسجلة."}</p></div></article><article className="detail-note detail-next"><Lightbulb size={21} /><div><p className="detail-note-label">الخطوة التالية</p><h2>كيف تحسنها</h2><p>{answer.improvement || "أعد التدريب مع أمثلة أكثر تحديدًا."}</p></div></article></div></section><aside><div className="detail-score-card"><span className="detail-score-icon"><Target size={22} /></span><p>تقييم الإجابة</p><strong style={{ color: scoreTone(answer.score || 0) }}>{answer.score ?? "–"}</strong><small>من ١٠٠</small><div className="mt-7 space-y-5"><Metric label="الوضوح" value={answer.clarityScore} /><Metric label="الارتباط" value={answer.relevanceScore} /><Metric label="البنية" value={answer.structureScore} /></div></div><button onClick={() => setLocation(`/results/${data.id}`)} className="button button-secondary mt-4 w-full" type="button">كل الإجابات <ArrowLeft size={16} /></button></aside></div></div></main></PlatformShell>;
}

