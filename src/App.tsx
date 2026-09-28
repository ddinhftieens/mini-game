import React, { useState, useEffect, useRef } from 'react';
import { GameTheme, QuestionItem, RawQuestion } from './types';
import { GAME_THEMES, DEFAULT_TARGET_STEPS } from './utils/constants';
import { fetchQuestionsFromGoogleSheet, processQuestionsByDifficulty, playSound } from './utils/helpers';
import { Header } from './components/Header';
import { QuestionList } from './components/QuestionList';
import { QuestionCard } from './components/QuestionCard';
import { GameStage } from './components/GameStage';
import { StartScreen } from './components/StartScreen';
import { ThemeSelectModal } from './components/ThemeSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { VictoryModal } from './components/VictoryModal';
import { LoadingScreen } from './components/LoadingScreen';
import { AlertTriangle, Settings, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';

export const App: React.FC = () => {
  // Ref lưu timeout tự động chuyển câu — để cancel khi cần (chơi lại, unmount)
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State quản lý Game
  const [currentTheme, setCurrentTheme] = useState<GameTheme>(GAME_THEMES[0]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [sheetUrl, setSheetUrl] = useState<string>(() => localStorage.getItem('mini_game_sheet_url') || '');
  const [targetSteps, setTargetSteps] = useState<number | undefined>(() => {
    const saved = localStorage.getItem('mini_game_target_steps');
    return saved !== null ? (parseInt(saved, 10) || undefined) : DEFAULT_TARGET_STEPS;
  });

  const [rawQuestions, setRawQuestions] = useState<RawQuestion[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State bộ đếm thời gian làm thử thách (giây)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Tải danh sách câu hỏi từ Google Sheet
  const loadData = async (customUrl?: string, customSteps?: number) => {
    setLoading(true);
    setErrorMessage(null);
    setIsTimerRunning(false);
    setElapsedSeconds(0);
    const targetUrl = customUrl !== undefined ? customUrl : sheetUrl;
    const stepsToUse = customSteps !== undefined ? customSteps : targetSteps;

    try {
      const { questions: rawList } = await fetchQuestionsFromGoogleSheet(targetUrl);
      if (!rawList || rawList.length === 0) {
        throw new Error('Không tìm thấy câu hỏi nào trong Google Sheet.');
      }
      setRawQuestions(rawList);
      // Lấy ngẫu nhiên theo số bước và sắp xếp theo độ khó tăng dần
      const processed = processQuestionsByDifficulty(rawList, stepsToUse);
      setQuestions(processed);
      setCurrentIndex(0);
      setScore(0);
      // Bắt đầu đếm giờ sau khi tải dữ liệu thành công
      setElapsedSeconds(0);
      setIsTimerRunning(true);
    } catch (err: any) {
      console.error('Lỗi nạp câu hỏi:', err);
      setErrorMessage(err.message || 'Không thể tải câu hỏi từ Google Sheet.');
      setRawQuestions([]);
      setQuestions([]);
      setIsTimerRunning(false);
    } finally {
      setLoading(false);
    }
  };

  // Handler khi nhấn nút "Bắt đầu chơi" từ màn hình bắt đầu
  const handleStartGame = () => {
    playSound('click');
    setGameStarted(true);
    loadData();
  };

  // Quay lại màn hình bắt đầu
  const handleBackToStart = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    playSound('click');
    setGameStarted(false);
    setIsTimerRunning(false);
    setQuestions([]);
    setErrorMessage(null);
  };

  // Logic chạy bộ đếm thời gian
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Cleanup timeout khi unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Xử lý khi trả lời câu hỏi
  const handleAnswer = (selectedOption: 'A' | 'B' | 'C' | 'D') => {
    if (questions.length === 0) return;

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.answer;

    // Cập nhật trạng thái câu hỏi
    const updated = [...questions];
    updated[currentIndex] = {
      ...currentQ,
      selectedAnswer: selectedOption,
      status: isCorrect ? 'correct' : 'wrong',
    };
    setQuestions(updated);

    if (isCorrect) {
      playSound('correct');
      playSound('jump');

      // Cộng điểm nếu trước đó chưa đúng
      if (currentQ.status !== 'correct') {
        setScore((prev) => prev + 10);
      }

      // Kiểm tra nếu đã hoàn thành tất cả
      const newCorrectCount = updated.filter((q) => q.status === 'correct').length;
      if (newCorrectCount === updated.length) {
        // Dừng đếm giờ khi hoàn thành tất cả thử thách
        setIsTimerRunning(false);
      } else {
        // Tự động chuyển tiếp sang câu hỏi tiếp theo sau 2.5 giây nếu chưa phải câu cuối
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = setTimeout(() => {
          autoAdvanceTimerRef.current = null;
          setCurrentIndex((prev) => {
            if (prev < questions.length - 1) {
              playSound('click');
              return prev + 1;
            }
            return prev;
          });
        }, 2500);
      }
    } else {
      playSound('wrong');
    }
  };

  // Chơi lại từ đầu: Lấy lại ngẫu nhiên danh sách câu hỏi mới và reset bộ đếm giờ
  const handleResetGame = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    playSound('click');
    setElapsedSeconds(0);
    if (rawQuestions.length > 0) {
      const processed = processQuestionsByDifficulty(rawQuestions, targetSteps);
      setQuestions(processed);
      setCurrentIndex(0);
      setScore(0);
      setIsTimerRunning(true);
    } else {
      loadData();
    }
  };

  // Lưu URL Google Sheet & Cấu hình số bước
  const handleSaveSettings = (newUrl: string, newTargetSteps?: number) => {
    setSheetUrl(newUrl);
    localStorage.setItem('mini_game_sheet_url', newUrl);

    setTargetSteps(newTargetSteps);
    if (newTargetSteps !== undefined) {
      localStorage.setItem('mini_game_target_steps', String(newTargetSteps));
    } else {
      localStorage.removeItem('mini_game_target_steps');
    }

    setShowSettingsModal(false);
    if (gameStarted) {
      loadData(newUrl, newTargetSteps);
    }
  };

  const correctCount = questions.filter((q) => q.status === 'correct').length;
  const isWon = questions.length > 0 && correctCount === questions.length;
  const currentQuestion = questions[currentIndex];

  // Nếu chưa bấm bắt đầu -> Hiển thị Màn hình Bắt Đầu (StartScreen)
  if (!gameStarted) {
    return (
      <>
        <StartScreen
          selectedThemeId={currentTheme.id}
          onSelectTheme={(t) => setCurrentTheme(t)}
          onStartGame={handleStartGame}
          onOpenSettings={() => setShowSettingsModal(true)}
          loading={loading}
        />

        {/* Modal Cài đặt Sheet API */}
        {showSettingsModal && (
          <SettingsModal
            currentUrl={sheetUrl}
            currentSteps={targetSteps}
            onSave={handleSaveSettings}
            onClose={() => setShowSettingsModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        currentTheme={currentTheme}
        score={score}
        totalQuestions={questions.length}
        completedCount={correctCount}
        onReset={handleResetGame}
        onChangeTheme={() => setShowThemeModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Main 3-Column Layout */}
      <main className="main-layout">
        {loading ? (
          <LoadingScreen theme={currentTheme} />
        ) : errorMessage ? (
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '36px 28px',
            border: '2px solid #fee2e2',
            boxShadow: '0 12px 36px rgba(239, 68, 68, 0.08)',
            textAlign: 'center',
            maxWidth: '560px',
            margin: 'auto',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: '#fef2f2',
              border: '2px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <AlertTriangle size={34} color="#dc2626" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#991b1b', marginBottom: '8px' }}>
              Chưa tải được câu hỏi từ Google Sheet!
            </h2>
            <p style={{
              fontSize: '0.88rem',
              color: '#64748b',
              marginBottom: '24px',
              lineHeight: 1.6,
              maxWidth: '460px',
            }}>
              Chưa cấu hình đường dẫn Google Apps Script Web App URL hoặc kết nối bị gián đoạn. Vui lòng bấm vào nút <b>"Cấu hình Google Sheet URL"</b> bên dưới để kết nối.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => setShowSettingsModal(true)}
                style={{
                  padding: '11px 22px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                  transition: 'all 0.2s',
                }}
              >
                <Settings size={18} />
                <span>Cấu hình Google Sheet URL</span>
              </button>
              <button
                onClick={() => loadData()}
                style={{
                  padding: '11px 20px',
                  borderRadius: '14px',
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1.5px solid #cbd5e1',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <RefreshCw size={17} />
                <span>Thử lại</span>
              </button>
              <button
                onClick={handleBackToStart}
                style={{
                  padding: '11px 20px',
                  borderRadius: '14px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1.5px solid #cbd5e1',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <ArrowLeft size={17} />
                <span>Màn hình chính</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Cột 1: Danh sách câu hỏi */}
            <section className="layout-col col-question-list">
              <QuestionList
                questions={questions}
                currentIndex={currentIndex}
              />
            </section>

            {/* Cột 2: Câu hỏi, 4 đáp án và Bộ đếm thời gian */}
            <section className="layout-col col-question-card">
              {currentQuestion && (
                <QuestionCard
                  question={currentQuestion}
                  currentIndex={currentIndex}
                  totalQuestions={questions.length}
                  elapsedSeconds={elapsedSeconds}
                  onAnswer={handleAnswer}
                />
              )}
            </section>

            {/* Cột 3: Trò chơi tương tác (Nhảy lá sen / leo tháp / miệng giếng) */}
            <section className="layout-col col-stage">
              <GameStage
                theme={currentTheme}
                totalQuestions={questions.length}
                correctCount={correctCount}
                currentIndex={currentIndex}
                isWon={isWon}
              />
            </section>
          </>
        )}
      </main>

      {/* Modal Chọn chủ đề trong quá trình chơi */}
      {showThemeModal && (
        <ThemeSelectModal
          selectedThemeId={currentTheme.id}
          onSelectTheme={(t) => setCurrentTheme(t)}
          onStartGame={() => {
            playSound('click');
            setShowThemeModal(false);
          }}
        />
      )}

      {/* Modal Cài đặt Sheet API & Cấu hình số bước */}
      {showSettingsModal && (
        <SettingsModal
          currentUrl={sheetUrl}
          currentSteps={targetSteps}
          onSave={handleSaveSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Modal Chúc mừng Về Đích Hoàn Thành Thử Thách */}
      {isWon && (
        <VictoryModal
          theme={currentTheme}
          score={score}
          totalQuestions={questions.length}
          completionTimeSeconds={elapsedSeconds}
          onPlayAgain={handleResetGame}
        />
      )}
    </div>
  );
};

