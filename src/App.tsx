import React, { useState, useEffect, useRef } from 'react';
import { GameTheme, QuestionItem, RawQuestion } from './types';
import { GAME_THEMES, DEFAULT_TARGET_STEPS } from './utils/constants';
import { fetchQuestionsFromGoogleSheet, processQuestionsByDifficulty, playSound } from './utils/helpers';
import { Header } from './components/Header';
import { QuestionList } from './components/QuestionList';
import { QuestionCard } from './components/QuestionCard';
import { GameStage } from './components/GameStage';
import { ThemeSelectModal } from './components/ThemeSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { VictoryModal } from './components/VictoryModal';
import { AlertTriangle, Settings, RefreshCw, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  // Ref lưu timeout tự động chuyển câu — để cancel khi cần (chơi lại, unmount)
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State quản lý Game
  const [currentTheme, setCurrentTheme] = useState<GameTheme>(GAME_THEMES[0]);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(true);
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
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tải danh sách câu hỏi từ Google Sheet
  const loadData = async (customUrl?: string, customSteps?: number) => {
    setLoading(true);
    setErrorMessage(null);
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
    } catch (err: any) {
      console.error('Lỗi nạp câu hỏi:', err);
      setErrorMessage(err.message || 'Không thể tải câu hỏi từ Google Sheet.');
      setRawQuestions([]);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Cleanup: cancel timeout tự động chuyển câu khi component unmount
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
        // Hoàn thành tất cả - VictoryModal sẽ tự động kích hoạt pháo hoa liên tục và nhạc chiến thắng
      } else {
        // Tự động chuyển tiếp sang câu hỏi tiếp theo sau 2.5 giây nếu chưa phải câu cuối
        // Cancel timeout cũ trước (nếu có) rồi mới tạo timeout mới
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

  // Chơi lại từ đầu: Lấy lại ngẫu nhiên danh sách câu hỏi mới và sắp xếp theo độ khó tăng dần
  const handleResetGame = () => {
    // Cancel timeout tự động chuyển câu đang chờ (nếu có)
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    playSound('click');
    if (rawQuestions.length > 0) {
      const processed = processQuestionsByDifficulty(rawQuestions, targetSteps);
      setQuestions(processed);
      setCurrentIndex(0);
      setScore(0);
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
    loadData(newUrl, newTargetSteps);
  };

  const correctCount = questions.filter((q) => q.status === 'correct').length;
  const isWon = questions.length > 0 && correctCount === questions.length;
  const currentQuestion = questions[currentIndex];

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
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#065f46',
            minHeight: '380px',
            gap: '14px',
          }}>
            <Loader2 size={44} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
            <div>Đang tải câu hỏi từ Google Sheet...</div>
          </div>
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
              Chưa cấu hình đường dẫn Google Apps Script Web App URL. Vui lòng bấm vào nút <b>"Cấu hình Google Sheet URL"</b> bên dưới để kết nối.
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

            {/* Cột 2: Câu hỏi và 4 đáp án */}
            <section className="layout-col col-question-card">
              {currentQuestion && (
                <QuestionCard
                  question={currentQuestion}
                  currentIndex={currentIndex}
                  totalQuestions={questions.length}
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

      {/* Modal Chọn chủ đề trước khi bắt đầu */}
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
          onPlayAgain={handleResetGame}
        />
      )}
    </div>
  );
};
