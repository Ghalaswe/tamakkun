import { AuthRequired, ErrorState, PageLoader } from "@/components/RouteState";
import { PlatformShell } from "@/components/PlatformShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, ChevronLeft, CircleAlert, Lightbulb, MessageSquareText, Send, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";

const categoryLabels = { general: "عام", technical: "تقني", behavioral: "سلوكي" };

export default function Interview() {
  const [, params] = useRoute("/interview/:id");
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const interviewId = Number(params?.id);
  const utils = trpc.useUtils();
  const detailsInput = useMemo(() => ({ interviewId }), [interviewId]);
  const { data, isLoading, error, refetch } = trpc.interview.details.useQuery(detailsInput, { enabled: isAuthenticated && Number.isFinite(interviewId) });
  const [answer, setAnswer] = useState("");
  const [latestFeedback, setLatestFeedback] = useState<{ feedback: string; improvement: string; score: number } | null>(null);
  const answerMutation = trpc.interview.answer.useMutation({
    onSuccess: result => {
      setLatestFeedback(result.assessment);
      setAnswer("");
      utils.interview.details.invalidate({ interviewId });
      if (result.completed) setTimeout(() => setLocation(`/results/${interviewId}`), 850);
    },
  });

  useEffect(() => {
    if (data?.status === "completed") setLocation(`/results/${data.id}`);
  }, [data?.id, data?.status, setLocation]);

  if (authLoading) return <PlatformShell><main className="page-main"><PageLoader /></main></PlatformShell>;
  if (!isAuthenticated) return <PlatformShell><main className="page-main"><AuthRequired title="سجّل دخولك لبدء المقابلة" /></main></PlatformShell>;
  if (isLoading) return <PlatformShell><main className="page-main"><PageLoader label="نجهّز أسئلة المقابلة" /></main></PlatformShell>;
  if (error || !data) return <PlatformShell><main className="page-main"><ErrorState message={error?.message} retry={() => refetch()} /></main></PlatformShell>;
  if (data.status === "completed") {
    return <PlatformShell><main className="page-main"><PageLoader label="ننتقل إلى تقييمك النهائي" /></main></PlatformShell>;
  }

  const current = data.answers.find(item => !item.answer) || data.answers.at(-1);
  if (!current) return <PlatformShell><main className="page-main"><ErrorState message="لا توجد أسئلة متاحة في هذه المقابلة." /></main></PlatformShell>;
  const completed = data.answers.filter(item => item.answer).length;
  const progress = (completed / data.answers.length) * 100;

  return (
    <PlatformShell footer={false}>
      <main className="interview-page"><div className="container max-w-5xl py-7 sm:py-10">
        <div className="flex items-center justify-between gap-4"><button onClick={() => setLocation("/setup")} className="back-button" type="button"><ChevronLeft size={18} /> إنهاء التدريب</button><div className="hidden text-left sm:block"><p className="text-sm font-bold text-[#2f5550]">{data.roleTitle}</p><p className="mt-1 text-xs text-[#71847f]">جلسة تدريبية شخصية</p></div><span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#35645c] shadow-sm">السؤال {current.sequence} من {data.answers.length}</span></div>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#dde9e3]"><div className="h-full rounded-full bg-[#16806f] transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="question-panel"><div className="flex items-center justify-between"><span className="category-pill">{categoryLabels[current.category]}</span><span className="text-sm font-semibold text-[#71847f]">خذ وقتك، لا توجد إجابة مثالية</span></div><div className="mt-8"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e4f4ee] text-[#137767]"><MessageSquareText size={23} /></span><h1 className="mt-5 text-2xl font-extrabold leading-10 text-[#173a35] sm:text-3xl">{current.question}</h1></div><label className="mt-9 block"><span className="field-title">إجابتك</span><textarea value={answer} onChange={event => setAnswer(event.target.value)} className="answer-area mt-3" placeholder="فكّر في موقف حقيقي، ثم اشرح كيف تعاملت معه وما النتيجة..." maxLength={3000} /></label><div className="mt-3 flex items-center justify-between text-xs text-[#778a84]"><span>يفضل ذكر مثال واقعي واضح.</span><span>{answer.length}/٣٠٠٠</span></div>{answerMutation.error && <p className="mt-4 flex items-center gap-2 rounded-xl bg-[#fdf0ed] p-3 text-sm text-[#a94438]"><CircleAlert size={17} />{answerMutation.error.message}</p>}<button disabled={answer.trim().length < 10 || answerMutation.isPending} onClick={() => answerMutation.mutate({ interviewId: data.id, answerId: current.id, answer })} className="button button-primary button-large mt-6 w-full disabled:cursor-not-allowed disabled:opacity-55" type="button">{answerMutation.isPending ? "نراجع إجابتك..." : <>إرسال الإجابة <Send size={18} /></>}</button></section>
          <aside className="space-y-5"><div className="interview-note"><Sparkles size={20} /><h2>تلميح صغير</h2><p>رتب إجابتك حول موقف محدد، ثم وضّح الإجراء الذي اتخذته والنتيجة.</p></div>{latestFeedback && <div className="feedback-toast"><CheckCircle2 size={21} /><div><p className="font-bold">تم حفظ إجابتك</p><p className="mt-2 text-sm leading-6">{latestFeedback.feedback}</p><p className="mt-2 text-sm font-bold text-[#167367]">الدرجة: {latestFeedback.score}/١٠٠</p></div></div>}<div className="rounded-3xl border border-[#e1e9e4] bg-white p-5"><div className="flex items-center gap-2 text-[#31574f]"><Lightbulb size={19} /><h2 className="font-bold">تقدمك</h2></div><p className="mt-4 text-3xl font-extrabold text-[#173a35]">{completed}<span className="mr-1 text-base font-medium text-[#7c8d88]">من {data.answers.length}</span></p><p className="mt-1 text-sm leading-6 text-[#71847f]">إجابات مكتملة حتى الآن.</p></div></aside>
        </div>
      </div></main>
    </PlatformShell>
  );
}
