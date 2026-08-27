import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

function Brand() {
  return (
    <Link href="/" className="brand" aria-label="تمكن — الصفحة الرئيسية">
      <span className="brand-mark"><span>ت</span><i /></span>
      <span>تمكن</span>
    </Link>
  );
}

export function PlatformShell({ children, footer = true }: { children: React.ReactNode; footer?: boolean }) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const isHome = location === "/";

  const navigateTo = (path: string) => {
    setOpen(false);
    setLocation(path);
  };

  const trainingAction = () => {
    setOpen(false);
    if (isAuthenticated) {
      setLocation("/setup");
      return;
    }
    startLogin();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf6] text-[#152d2d]" dir="rtl">
      <header className={`site-header ${isHome ? "site-header-home" : ""}`}>
        <div className="container flex h-[76px] items-center justify-between gap-4">
          <Brand />
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#49615e] lg:flex" aria-label="التنقل الرئيسي">
            <a href="/#كيف-تعمل" className="nav-link">كيف تعمل</a>
            <a href="/#المسارات" className="nav-link">المسارات</a>
            <a href="/#لماذا-تمكن" className="nav-link">لماذا تمكن</a>
            {isAuthenticated && <Link href="/history" className="nav-link">سجلّي</Link>}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            {loading ? <span className="h-9 w-20 animate-pulse rounded-full bg-[#e8eeea]" /> : isAuthenticated ? (
              <>
                <button onClick={() => setLocation("/history")} className="user-pill" type="button">
                  <span className="user-initial">{user?.name?.trim().slice(0, 1) || "م"}</span>
                  <span className="max-w-28 truncate">{user?.name || "حسابي"}</span>
                </button>
                <button onClick={logout} className="icon-action" aria-label="تسجيل الخروج" type="button">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button onClick={() => startLogin()} className="nav-login" type="button">تسجيل الدخول</button>
            )}
            <button onClick={trainingAction} className="button button-primary button-small" type="button">
              ابدأ التدريب <ArrowLeft size={16} />
            </button>
          </div>
          <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dce4df] text-[#24423e] lg:hidden" aria-label="فتح القائمة" type="button">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#163330]/35 backdrop-blur-sm lg:hidden">
            <motion.div initial={{ x: 56, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 56, opacity: 0 }} transition={{ duration: 0.2 }} className="mr-auto h-full w-[min(88vw,380px)] bg-[#fffefa] p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <Brand />
                <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0f4f1]" aria-label="إغلاق القائمة" type="button"><X size={20} /></button>
              </div>
              <nav className="mt-12 grid gap-2 text-base font-bold" aria-label="التنقل على الهاتف">
                <button onClick={() => navigateTo("/")} className="mobile-nav-item" type="button">الرئيسية</button>
                <button onClick={() => { setOpen(false); document.getElementById("كيف-تعمل")?.scrollIntoView({ behavior: "smooth" }); }} className="mobile-nav-item" type="button">كيف تعمل</button>
                <button onClick={() => { setOpen(false); document.getElementById("المسارات")?.scrollIntoView({ behavior: "smooth" }); }} className="mobile-nav-item" type="button">المسارات المهنية</button>
                {isAuthenticated && <button onClick={() => navigateTo("/history")} className="mobile-nav-item" type="button">سجل مقابلاتي</button>}
              </nav>
              <div className="mt-8 grid gap-3 border-t border-[#e2e8e4] pt-6">
                {!isAuthenticated && <button onClick={() => { setOpen(false); startLogin(); }} className="button button-secondary w-full" type="button">تسجيل الدخول</button>}
                <button onClick={trainingAction} className="button button-primary w-full" type="button">ابدأ التدريب الآن <ArrowLeft size={17} /></button>
                {isAuthenticated && <button onClick={logout} className="button button-ghost w-full text-[#9a3f36]" type="button">تسجيل الخروج</button>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}

      {footer && (
        <footer className="border-t border-[#e4e9e5] bg-[#fffefa] py-9">
          <div className="container flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-right">
            <Brand />
            <p className="text-sm text-[#6a7b76]">تدريب عملي للمقابلات الوظيفية بثقة ووضوح.</p>
            <span className="text-xs text-[#84918c]">© {new Date().getFullYear()} تمكن</span>
          </div>
        </footer>
      )}
    </div>
  );
}
