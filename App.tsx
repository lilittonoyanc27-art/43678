import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  QUESTIONS,
  QuestionItem,
  checkAnswer,
} from "./questions";
import {
  playCorrectSound,
  playWrongSound,
  playPassSound,
  playVictorySound,
  speakText,
} from "./sound";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Languages,
  Eye,
  EyeOff,
  Trophy,
  ChevronRight,
  ListOrdered,
  Sparkles,
  Info,
  Footprints,
} from "lucide-react";

type QuestionStatus = "pending" | "correct" | "wrong" | "passed";

const TOTAL_TIME_SECONDS = 30 * 60; // 30 minutes = 1800s

export default function App() {
  // Game states
  const [statuses, setStatuses] = useState<Record<number, QuestionStatus>>(() => {
    const initial: Record<number, QuestionStatus> = {};
    QUESTIONS.forEach((q) => {
      initial[q.id] = "pending";
    });
    return initial;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME_SECONDS);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Armenian translation reveal state
  const [revealedTranslations, setRevealedTranslations] = useState<Record<number, boolean>>({});
  const [alwaysShowArmenian, setAlwaysShowArmenian] = useState<boolean>(false);
  const [showPeekAnswer, setShowPeekAnswer] = useState<boolean>(false);

  // Display mode for the Rosco nodes: 'letter' or 'number'
  const [roscoDisplayMode, setRoscoDisplayMode] = useState<"letter" | "number">("letter");

  // Feedback banner after submission
  const [lastFeedback, setLastFeedback] = useState<{
    type: "correct" | "wrong" | "pass" | null;
    message: string;
    subMessage?: string;
  }>({ type: null, message: "" });

  // History / review modal toggle
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "wrong" | "passed">("all");

  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = QUESTIONS[currentIndex];

  // Counters
  const aciertos = useMemo(
    () => Object.values(statuses).filter((s) => s === "correct").length,
    [statuses]
  );
  const fallos = useMemo(
    () => Object.values(statuses).filter((s) => s === "wrong").length,
    [statuses]
  );
  const passedCount = useMemo(
    () => Object.values(statuses).filter((s) => s === "passed").length,
    [statuses]
  );
  const remainingCount = useMemo(
    () => Object.values(statuses).filter((s) => s === "pending" || s === "passed").length,
    [statuses]
  );

  // Check if round is complete
  const checkCompletion = useCallback((updatedStatuses: Record<number, QuestionStatus>) => {
    const hasUnresolved = QUESTIONS.some(
      (q) => updatedStatuses[q.id] === "pending" || updatedStatuses[q.id] === "passed"
    );
    if (!hasUnresolved) {
      setIsPlaying(false);
      setIsGameOver(true);
      playVictorySound(isMuted);
    }
  }, [isMuted]);

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          setIsGameOver(true);
          playVictorySound(isMuted);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, isMuted]);

  // Focus input and reset peek answer when index changes or playing
  useEffect(() => {
    setShowPeekAnswer(false);
    if (isPlaying && !isGameOver) {
      inputRef.current?.focus();
    }
  }, [currentIndex, isPlaying, isGameOver]);

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Find next unanswered question
  const getNextAvailableIndex = useCallback(
    (fromIndex: number, currentStatuses: Record<number, QuestionStatus>): number => {
      const len = QUESTIONS.length;
      for (let i = 1; i <= len; i++) {
        const nextIdx = (fromIndex + i) % len;
        const qId = QUESTIONS[nextIdx].id;
        if (currentStatuses[qId] === "pending" || currentStatuses[qId] === "passed") {
          return nextIdx;
        }
      }
      return fromIndex;
    },
    []
  );

  // Start / Resume game
  const handleStartResume = () => {
    setIsPlaying(true);
    inputRef.current?.focus();
  };

  // Pause game
  const handlePause = () => {
    setIsPlaying(false);
  };

  // Restart game
  const handleRestart = () => {
    const initial: Record<number, QuestionStatus> = {};
    QUESTIONS.forEach((q) => {
      initial[q.id] = "pending";
    });
    setStatuses(initial);
    setCurrentIndex(0);
    setUserInput("");
    setTimeLeft(TOTAL_TIME_SECONDS);
    setIsGameOver(false);
    setIsPlaying(true);
    setRevealedTranslations({});
    setShowPeekAnswer(false);
    setLastFeedback({ type: null, message: "" });
    inputRef.current?.focus();
  };

  // Quick accent insertion
  const insertChar = (char: string) => {
    setUserInput((prev) => prev + char);
    inputRef.current?.focus();
  };

  // Toggle Armenian translation reveal
  const toggleArmenianReveal = (questionId: number) => {
    setRevealedTranslations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Submit Answer
  const handleAnswerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isPlaying || isGameOver) {
      setIsPlaying(true);
    }

    const trimmedInput = userInput.trim();
    if (!trimmedInput) return;

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    const isCorrect = checkAnswer(trimmedInput, currentQuestion);

    if (isCorrect) {
      playCorrectSound(isMuted);
      const nextStatuses = { ...statuses, [currentQuestion.id]: "correct" as QuestionStatus };
      setStatuses(nextStatuses);

      setLastFeedback({
        type: "correct",
        message: `¡Correcto! ✅ ${currentQuestion.answerEs}`,
        subMessage: `${currentQuestion.answerArm}`,
      });

      setUserInput("");
      const nextIdx = getNextAvailableIndex(currentIndex, nextStatuses);
      setCurrentIndex(nextIdx);
      checkCompletion(nextStatuses);
    } else {
      // User requested: "если ответ неверный всё равно продолжить играть"
      // Mark as wrong, play error sound, show feedback and answer, and CONTINUE PLAYING!
      playWrongSound(isMuted);
      const nextStatuses = { ...statuses, [currentQuestion.id]: "wrong" as QuestionStatus };
      setStatuses(nextStatuses);

      setLastFeedback({
        type: "wrong",
        message: `❌ Неверно: "${trimmedInput}". Правильный ответ: ${currentQuestion.answerEs}`,
        subMessage: `Թարգմանություն՝ ${currentQuestion.answerArm}`,
      });

      setUserInput("");
      const nextIdx = getNextAvailableIndex(currentIndex, nextStatuses);
      setCurrentIndex(nextIdx);
      checkCompletion(nextStatuses);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setLastFeedback({ type: null, message: "" });
    }, 4500);
  };

  // Pasapalabra action
  const handlePasapalabra = () => {
    if (!isPlaying) setIsPlaying(true);
    playPassSound(isMuted);

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    const nextStatuses = {
      ...statuses,
      [currentQuestion.id]: statuses[currentQuestion.id] === "pending" ? "passed" : statuses[currentQuestion.id],
    };
    setStatuses(nextStatuses);

    setLastFeedback({
      type: "pass",
      message: `¡Pasapalabra! ⏩ Вопрос #${currentQuestion.id} пропущен`,
      subMessage: "Вы вернетесь к нему в следующем круге",
    });

    setUserInput("");
    const nextIdx = getNextAvailableIndex(currentIndex, nextStatuses);
    setCurrentIndex(nextIdx);

    feedbackTimeoutRef.current = setTimeout(() => {
      setLastFeedback({ type: null, message: "" });
    }, 2000);
  };

  // Jump to specific question
  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    if (!isPlaying && !isGameOver) {
      setIsPlaying(true);
    }
    inputRef.current?.focus();
  };

  // Filtered list for review modal
  const filteredQuestions = useMemo(() => {
    if (reviewFilter === "all") return QUESTIONS;
    return QUESTIONS.filter((q) => statuses[q.id] === reviewFilter);
  }, [reviewFilter, statuses]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Bar Header */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-black text-white shadow-lg shadow-sky-500/20">
            ⚽
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Pasapalabra Fútbol</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">
                ARM ⇄ ESP
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              27 հարց ֆուտբոլի մասին․ պատասխանները՝ մեկ բառով
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setAlwaysShowArmenian(!alwaysShowArmenian)}
            title="Տեսնել հայերենը միշտ / Скрыть или показать армянский перевод"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              alwaysShowArmenian
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">
              {alwaysShowArmenian ? "Հայերենը բաց է" : "Թարգմանություն ըստ սեղմման"}
            </span>
            <span className="md:hidden">ՀԱՅ</span>
          </button>

          <button
            onClick={() => setRoscoDisplayMode(roscoDisplayMode === "letter" ? "number" : "letter")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Переключить вид: буквы / номера"
          >
            <ListOrdered className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">
              {roscoDisplayMode === "letter" ? "Տառեր (P, E...)" : "Համարներ (1-27)"}
            </span>
          </button>

          <button
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Посмотреть все 27 вопросов"
          >
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">27 Հարցեր</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={isMuted ? "Включить звук" : "Выключить звук"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Scoreboard and Timer Strip */}
        <div className="w-full max-w-4xl grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {/* Aciertos (Green) */}
          <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-2.5 sm:p-4 flex items-center justify-between shadow-lg shadow-emerald-950/20">
            <div>
              <p className="text-[11px] sm:text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                Aciertos · Ճիշտ
              </p>
              <p className="text-2xl sm:text-4xl font-extrabold text-emerald-300 font-mono tabular-nums">
                {aciertos}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Timer (Center orange circle / TV timer) */}
          <div className="bg-gradient-to-b from-amber-950/50 to-slate-900 border border-amber-500/40 rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-center shadow-lg shadow-amber-950/30 relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-amber-400 mb-0.5 sm:mb-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                30 րոպե / 30 min
              </span>
            </div>
            <div className="text-2xl sm:text-4xl font-black text-amber-300 font-mono tabular-nums tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {!isPlaying && !isGameOver && (
                <button
                  onClick={handleStartResume}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30"
                >
                  <Play className="w-3 h-3 fill-current" /> Սկսել
                </button>
              )}
              {isPlaying && !isGameOver && (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30"
                >
                  <Pause className="w-3 h-3 fill-current" /> Դադար
                </button>
              )}
              <button
                onClick={handleRestart}
                title="Restart"
                className="text-[11px] text-slate-400 hover:text-white p-1 rounded"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Fallos (Red) */}
          <div className="bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-500/30 rounded-2xl p-2.5 sm:p-4 flex items-center justify-between shadow-lg shadow-rose-950/20">
            <div>
              <p className="text-[11px] sm:text-xs text-rose-400 font-semibold uppercase tracking-wider">
                Fallos · Սխալ
              </p>
              <p className="text-2xl sm:text-4xl font-extrabold text-rose-300 font-mono tabular-nums">
                {fallos}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Central Arena: El Rosco + Question Board */}
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 my-auto px-2">
          {/* EL ROSCO (Interactive Circle with 27 items) */}
          <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[390px] md:h-[390px] shrink-0 flex items-center justify-center p-3 select-none">
            {/* Outer boundary frame ring - ensures complete visual containment */}
            <div className="absolute inset-0 rounded-full border border-sky-500/25 bg-gradient-to-b from-sky-950/40 via-slate-900/50 to-slate-950/90 shadow-[0_0_35px_rgba(2,132,199,0.18)] pointer-events-none" />
            
            {/* Inner stadium decorative ring */}
            <div className="absolute inset-7 sm:inset-9 rounded-full border border-sky-500/20 bg-sky-950/20 backdrop-blur-sm pointer-events-none" />
            <div className="absolute inset-14 sm:inset-18 rounded-full border border-dashed border-sky-400/20 pointer-events-none" />

            {/* Rosco Center Information Hub */}
            <div className="absolute z-10 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-2xl sm:text-3xl font-black text-white/90 tracking-wider font-mono leading-none">
                {currentIndex + 1}
                <span className="text-xs text-sky-400 font-normal ml-0.5">/27</span>
              </span>
              <span className="text-[11px] sm:text-xs text-sky-300 font-semibold uppercase tracking-wider mt-1 leading-tight">
                {currentQuestion.prefix}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                {remainingCount} մնացած
              </span>
            </div>

            {/* 27 Nodes placed strictly inside circular frame */}
            {QUESTIONS.map((q, idx) => {
              // 27 questions: angle step = 360 / 27 = 13.3333 deg
              // Start at top: -90 deg
              const angleDeg = -90 + (idx * 360) / 27;
              const angleRad = (angleDeg * Math.PI) / 180;
              // Radius percentage: 34% gives ample clearance so no node ever crosses the frame
              const radiusPercent = 34;
              const leftPercent = 50 + radiusPercent * Math.cos(angleRad);
              const topPercent = 50 + radiusPercent * Math.sin(angleRad);

              const status = statuses[q.id];
              const isCurrent = idx === currentIndex;

              // Color styles based on Pasapalabra TV standards
              let bgClass = "bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-blue-500/30";
              let borderClass = "border-sky-300/60";
              let animationClass = "";

              if (status === "correct") {
                bgClass = "bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-emerald-500/40";
                borderClass = "border-emerald-200";
              } else if (status === "wrong") {
                bgClass = "bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-500/40";
                borderClass = "border-rose-200";
              } else if (status === "passed") {
                bgClass = "bg-gradient-to-tr from-amber-600 to-yellow-500 text-white shadow-amber-500/40";
                borderClass = "border-amber-200";
              }

              if (isCurrent) {
                animationClass = "animate-rosco-current z-20 ring-2 sm:ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105";
              }

              const label = roscoDisplayMode === "letter" ? q.letter : q.id.toString();

              return (
                <button
                  key={q.id}
                  onClick={() => handleJumpToQuestion(idx)}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center p-0 m-0 border shadow-md transition-all duration-150 cursor-pointer hover:scale-110 hover:z-30 leading-none overflow-hidden ${bgClass} ${borderClass} ${animationClass}`}
                  title={`#${q.id} (${q.letter}): ${q.answerEs} — ${q.answerArm}`}
                >
                  <span className="font-extrabold text-[11px] sm:text-xs leading-none flex items-center justify-center text-center select-none block max-w-full truncate">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Question & Interaction Box */}
          <div className="w-full flex-1 flex flex-col gap-3 sm:gap-4 max-w-lg">
            {/* Feedback alert (if any) */}
            {lastFeedback.type && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm animate-pop-in ${
                  lastFeedback.type === "correct"
                    ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
                    : lastFeedback.type === "wrong"
                    ? "bg-rose-950/80 border-rose-500/50 text-rose-200"
                    : "bg-amber-950/80 border-amber-500/50 text-amber-200"
                }`}
              >
                <div className="mt-0.5">
                  {lastFeedback.type === "correct" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {lastFeedback.type === "wrong" && <XCircle className="w-4 h-4 text-rose-400" />}
                  {lastFeedback.type === "pass" && <ChevronRight className="w-4 h-4 text-amber-400" />}
                </div>
                <div>
                  <p className="font-bold">{lastFeedback.message}</p>
                  {lastFeedback.subMessage && (
                    <p className="opacity-90 font-medium text-xs mt-0.5">{lastFeedback.subMessage}</p>
                  )}
                </div>
              </div>
            )}

            {/* The Active Question Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-sm">
              {/* Question Header info */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 font-extrabold text-sm flex items-center justify-center border border-sky-500/40 font-mono">
                    {currentQuestion.letter}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-sky-400 uppercase tracking-wide">
                    {currentQuestion.prefix}
                  </span>
                  <span className="text-xs text-slate-500">· #{currentQuestion.id}</span>
                </div>

                {/* Pronunciation & hint */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => speakText(currentQuestion.questionEs, "es-ES")}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Լսել իսպաներեն արտասանությունը / Escuchar pronunciación"
                  >
                    <Volume2 className="w-4 h-4 text-sky-400" />
                  </button>
                  <button
                    onClick={() => toggleArmenianReveal(currentQuestion.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                    title="Սեղմեք հայերեն թարգմանության համար"
                  >
                    {alwaysShowArmenian || revealedTranslations[currentQuestion.id] ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px]">Թաքցնել</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px]">Հայերեն</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Spanish Question Area - CLICKABLE AS REQUESTED! */}
              {/* "и пусть при кликкке на исп откроется перевод на арм" */}
              <div
                onClick={() => toggleArmenianReveal(currentQuestion.id)}
                className="group cursor-pointer rounded-xl p-3 sm:p-4 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 hover:border-sky-500/50 transition-all duration-200"
                title="Սեղմեք իսպաներեն տեքստի վրա՝ հայերեն թարգմանությունը բացելու համար"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    Pregunta en Español 🇪🇸
                  </span>
                  <span className="text-[10px] text-amber-400/90 group-hover:text-amber-300 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Սեղմեք թարգմանության համար</span>
                  </span>
                </div>
                <p className="text-base sm:text-xl font-bold text-white group-hover:text-sky-200 transition-colors leading-relaxed">
                  {currentQuestion.questionEs}
                </p>
              </div>

              {/* Armenian Translation Section (Revealed on click or if alwaysShowArmenian) */}
              {(alwaysShowArmenian || revealedTranslations[currentQuestion.id]) && (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-sm sm:text-base animate-pop-in">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-1">
                    <span>Հարցը հայերենով 🇦🇲:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(currentQuestion.questionArm, "hy-AM");
                      }}
                      className="p-1 hover:text-white"
                      title="Լսել հայերեն"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-semibold text-amber-100">
                    {currentQuestion.questionArm}
                  </p>
                  <p className="text-xs text-amber-300/80 mt-1">
                    Պատասխանը մեկ բառով՝ <strong>{currentQuestion.letter}</strong> տառով (Օր. իսպաներենով)
                  </p>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleAnswerSubmit} className="mt-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={`Escribe la respuesta (${currentQuestion.letter}...)...`}
                    className="w-full bg-slate-950 border-2 border-sky-500/40 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20 text-white rounded-xl px-4 py-3 sm:py-3.5 text-base sm:text-lg font-medium outline-none transition-all placeholder:text-slate-600"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  {userInput && (
                    <button
                      type="button"
                      onClick={() => setUserInput("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Quick Spanish Accents Bar for Non-Spanish Keyboards */}
                <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] text-slate-400 shrink-0 mr-1">Իսպաներեն տառեր:</span>
                  {["á", "é", "í", "ó", "ú", "ñ"].map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => insertChar(char)}
                      className="w-7 h-7 sm:w-8 sm:h-8 p-0 m-0 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-transform active:scale-95 leading-none shrink-0"
                    >
                      <span className="leading-none">{char}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => insertChar("Á")}
                    className="w-7 h-7 sm:w-8 sm:h-8 p-0 m-0 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-transform active:scale-95 leading-none shrink-0"
                  >
                    <span className="leading-none">Á</span>
                  </button>
                </div>

                {/* Primary Action Buttons: Enviar & Pasapalabra */}
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <button
                    type="submit"
                    className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>ENVIAR · Ուղարկել</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePasapalabra}
                    className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 shrink-0" />
                    <span>PASAPALABRA · Բաց թողնել</span>
                  </button>
                </div>

                {/* Dedicated Separate "Ответ / Պատասխան" Button - Pure peek, NOT counted as error! */}
                {/* User request: "пусть отдельно будет кнопка ответ но при клике на ответ пусть не считается неверным ответ а просто посмотреть" */}
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPeekAnswer(!showPeekAnswer)}
                    className="w-full py-2.5 px-3 rounded-xl bg-sky-950/40 hover:bg-sky-900/40 border border-sky-500/30 hover:border-sky-400/50 text-sky-300 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    title="Посмотреть правильный ответ без штрафа и без ошибки"
                  >
                    <Eye className="w-4 h-4 text-sky-400" />
                    <span>
                      {showPeekAnswer
                        ? "Скрыть ответ · Թաքցնել պատասխանը"
                        : "Посмотреть ответ · Տեսնել պատասխանը (առանց սխալի)"}
                    </span>
                  </button>
                </div>

                {/* Peek Answer Display Area */}
                {showPeekAnswer && (
                  <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-sky-950/70 to-slate-900/90 border border-sky-500/40 animate-pop-in flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-300 flex items-center gap-1.5 uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span>Պատասխան · Ответ на вопрос #{currentQuestion.id}</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Не считается ошибкой
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 bg-slate-950/80 p-2.5 rounded-lg border border-sky-500/20">
                      <div>
                        <p className="text-base sm:text-lg font-black text-emerald-400 tracking-wide leading-tight">
                          {currentQuestion.answerEs}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                          🇦🇲 {currentQuestion.answerArm}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => speakText(currentQuestion.answerEs, "es-ES")}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white transition-colors"
                          title="Прослушать произношение"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUserInput(currentQuestion.answerEs);
                            inputRef.current?.focus();
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors cursor-pointer"
                          title="Вставить слово в поле ввода"
                        >
                          Вставить
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Quick Question Navigator strip at bottom */}
        <div className="w-full max-w-5xl mt-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 mb-2.5 px-1 gap-2">
            <span className="font-semibold text-slate-300">Հարցերի ընտրություն (1 - 27) / Selección de preguntas</span>
            <div className="flex items-center gap-3 text-[11px] flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Ճիշտ
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Սխալ
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Բաց թողնված
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Սպասում է
              </span>
            </div>
          </div>
          <div className="grid grid-cols-9 sm:grid-cols-[repeat(27,minmax(0,1fr))] gap-1 sm:gap-1.5">
            {QUESTIONS.map((q, idx) => {
              const status = statuses[q.id];
              const isCurrent = idx === currentIndex;
              let dotClass = "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700";
              if (status === "correct") dotClass = "bg-emerald-600 text-white border-emerald-400";
              else if (status === "wrong") dotClass = "bg-rose-600 text-white border-rose-400";
              else if (status === "passed") dotClass = "bg-amber-600 text-white border-amber-400";

              return (
                <button
                  key={q.id}
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`h-7 sm:h-8 rounded-md flex flex-col items-center justify-center text-center border font-bold transition-all overflow-hidden ${dotClass} ${
                    isCurrent ? "ring-2 ring-amber-400 scale-105 z-10 font-black" : "opacity-90 hover:opacity-100"
                  }`}
                  title={`#${q.id} (${q.letter}): ${q.answerEs} — ${q.answerArm}`}
                >
                  <span className="text-[11px] sm:text-xs leading-none">
                    {roscoDisplayMode === "letter" ? q.letter : q.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Game Over / Victory Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl relative animate-pop-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mx-auto flex items-center justify-center mb-4">
              <Trophy className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {aciertos >= 20 ? "¡Excelente! 🏆 Հիանալի խաղ!" : "¡Juego Terminado! ⚽ Խաղն ավարտվեց"}
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              Դուք անցաք ֆուտբոլային 27 հարցերը
            </p>

            <div className="grid grid-cols-3 gap-3 my-6">
              <div className="bg-emerald-950/50 border border-emerald-500/40 p-3 rounded-xl">
                <p className="text-xs text-emerald-400 font-bold uppercase">Ճիշտ</p>
                <p className="text-3xl font-extrabold text-emerald-300 font-mono mt-1">{aciertos}</p>
              </div>
              <div className="bg-rose-950/50 border border-rose-500/40 p-3 rounded-xl">
                <p className="text-xs text-rose-400 font-bold uppercase">Սխալ</p>
                <p className="text-3xl font-extrabold text-rose-300 font-mono mt-1">{fallos}</p>
              </div>
              <div className="bg-amber-950/50 border border-amber-500/40 p-3 rounded-xl">
                <p className="text-xs text-amber-400 font-bold uppercase">Ժամանակ</p>
                <p className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono mt-2">
                  {formatTime(TOTAL_TIME_SECONDS - timeLeft)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm sm:text-base shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Խաղալ նորից · Jugar de nuevo
              </button>
              <button
                onClick={() => {
                  setIsGameOver(false);
                  setShowReviewModal(true);
                }}
                className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm sm:text-base transition-colors"
              >
                Դիտել բոլոր 27 պատասխանները
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review All 27 Questions Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-pop-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>27 Ֆուտբոլային հարցեր և պատասխաններ</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    27 preguntas
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Սեղմեք ցանկացած հարցի վրա՝ այն անմիջապես խաղալու համար
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-400 text-xs mr-1">Ֆիլտր:</span>
              <button
                onClick={() => setReviewFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  reviewFilter === "all" ? "bg-white text-slate-950 font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Բոլորը (27)
              </button>
              <button
                onClick={() => setReviewFilter("correct")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  reviewFilter === "correct" ? "bg-emerald-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Ճիշտ ({aciertos})
              </button>
              <button
                onClick={() => setReviewFilter("wrong")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  reviewFilter === "wrong" ? "bg-rose-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Սխալ ({fallos})
              </button>
              <button
                onClick={() => setReviewFilter("passed")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  reviewFilter === "passed" ? "bg-amber-600 text-white font-bold" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Բաց թողնված ({passedCount})
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {filteredQuestions.map((q) => {
                const status = statuses[q.id];
                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(q.id - 1);
                      setShowReviewModal(false);
                      if (!isPlaying) setIsPlaying(true);
                    }}
                    className="p-3.5 sm:p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center justify-center font-extrabold text-sm shrink-0 font-mono mt-0.5 sm:mt-0">
                        {q.letter}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-sky-400 font-bold">#{q.id}</span>
                          <span className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                            {q.questionEs}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1">
                          🇦🇲 {q.questionArm}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-700/50 pt-2 sm:pt-0">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-emerald-400">
                          {q.answerEs}
                        </p>
                        <p className="text-xs text-emerald-200/80">
                          {q.answerArm}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {status === "correct" && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Ճիշտ
                          </span>
                        )}
                        {status === "wrong" && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Սխալ
                          </span>
                        )}
                        {status === "passed" && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Բաց
                          </span>
                        )}
                        {status === "pending" && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-700 text-slate-300">
                            Սպասում է
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Ընդհանուր՝ 27 ֆուտբոլային տերմիններ
              </span>
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors"
              >
                Շարունակել խաղը
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Instructions / Credits */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/90 py-3 px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
        <span>⚽ Pasapalabra: 27 preguntas sobre fútbol con respuestas de una palabra</span>
        <span className="hidden sm:inline">·</span>
        <span className="text-slate-400">
          💡 Սեղմեք իսպաներեն հարցի վրա՝ հայերեն թարգմանությունը տեսնելու համար
        </span>
      </footer>
    </div>
  );
}
