import React, { useState } from 'react';
import { X, Copy, Check, Save, Settings, FileSpreadsheet, Sparkles, RotateCcw, Footprints } from 'lucide-react';
import { DEFAULT_GOOGLE_SHEET_URL } from '../utils/constants';

interface SettingsModalProps {
  currentUrl: string;
  currentSteps?: number;
  onSave: (url: string, targetSteps?: number) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUrl,
  currentSteps,
  onSave,
  onClose,
}) => {
  const [url, setUrl] = useState(currentUrl);
  const [stepsInput, setStepsInput] = useState<string>(currentSteps ? String(currentSteps) : '');
  const [copied, setCopied] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Mã Google Apps Script chuẩn, hỗ trợ CORS
  const sampleAppsScriptCode = `function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0]; // Lấy sheet đầu tiên
    var data = sheet.getDataRange().getValues();
    
    if (!data || data.length < 2) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0].map(function(h) { return String(h).trim(); });
    var rows = data.slice(1);
    
    var result = rows
      .filter(function(row) { return row[0] !== "" && row[0] !== undefined; }) // Bỏ qua dòng trống
      .map(function(row) {
        var obj = {};
        headers.forEach(function(header, index) {
          obj[header] = row[index];
        });
        return obj;
      });
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(sampleAppsScriptCode);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = sampleAppsScriptCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Không thể copy:', err);
    }
  };

  const handleSave = () => {
    let parsedSteps: number | undefined = undefined;
    if (stepsInput.trim() !== '') {
      const num = parseInt(stepsInput.trim(), 10);
      if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
        setStepError('Số lượng bước phải là một số nguyên dương (> 0).');
        return;
      }
      parsedSteps = num;
    }
    setStepError(null);
    onSave(url, parsedSteps);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '650px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        boxSizing: 'border-box',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <X size={20} color="#475569" />
        </button>

        {/* Header với Icon đẹp mắt */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: '#eff6ff',
            border: '1.5px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Settings size={24} color="#2563eb" />
          </div>
          <div>
            <h2 style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#1e293b',
              margin: 0,
            }}>
              Cấu hình Google Sheet API
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0, marginTop: '2px' }}>
              Kết nối bộ câu hỏi trực tiếp từ bảng tính của thầy cô
            </p>
          </div>
        </div>

        {/* Input Sheet App Script URL */}
        <div style={{
          marginTop: '16px',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 800,
              fontSize: '0.98rem',
              color: '#334155',
              margin: 0,
            }}>
              <FileSpreadsheet size={18} color="#059669" />
              <span>Apps Script Web App URL:</span>
            </label>

            <button
              type="button"
              onClick={() => setUrl(DEFAULT_GOOGLE_SHEET_URL)}
              title="Khôi phục lại đường dẫn Google Sheet mẫu mặc định"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '8px',
                background: '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0284c7';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#e0f2fe';
                e.currentTarget.style.color = '#0284c7';
              }}
            >
              <RotateCcw size={14} />
              <span>Sử dụng URL mặc định</span>
            </button>
          </div>

          <input
            type="text"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
              background: '#ffffff',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>
              Thầy cô có thể dán link riêng hoặc bấm nút <b>"Sử dụng URL mặc định"</b> ở trên.
            </span>
          </div>
        </div>

        {/* Input Cấu hình Số lượng Bước / Step để tới đích */}
        <div style={{
          marginTop: '14px',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 800,
            fontSize: '0.98rem',
            color: '#334155',
            marginBottom: '8px',
          }}>
            <Footprints size={18} color="#2563eb" />
            <span>Số bước để tới đích:</span>
          </label>

          <input
            type="number"
            min="1"
            step="1"
            placeholder="Để trống để lấy toàn bộ câu hỏi trong Sheet (Mặc định)"
            value={stepsInput}
            onChange={(e) => {
              setStepsInput(e.target.value);
              if (stepError) setStepError(null);
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: stepError ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: "'Times New Roman', Times, serif",
              boxSizing: 'border-box',
              background: '#ffffff',
            }}
          />

          {stepError ? (
            <span style={{ fontSize: '0.84rem', color: '#ef4444', marginTop: '6px', display: 'block', fontWeight: 700 }}>
              {stepError}
            </span>
          ) : (
            <span style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '6px', display: 'block', fontWeight: 600 }}>
              Ví dụ: Sheet có 10 câu hỏi, cấu hình <b>5</b> bước sẽ lấy ngẫu nhiên 5 câu hỏi từ bảng tính. Nếu để trống hoặc số bước lớn hơn số câu hỏi trong Sheet thì game sẽ lấy toàn bộ câu hỏi (được xáo trộn ngẫu nhiên).
            </span>
          )}
        </div>

        {/* Hướng dẫn ngắn gọn với nút sao chép mã */}
        <div style={{
          background: '#f0fdf4',
          borderRadius: '16px',
          padding: '16px 18px',
          border: '1.5px solid #bbf7d0',
          marginTop: '14px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#16a34a" />
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#166534', margin: 0 }}>
                Hướng dẫn nhanh 3 bước:
              </h4>
            </div>

            <button
              onClick={handleCopyCode}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                background: copied ? '#10b981' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: copied ? '0 2px 8px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span>Đã sao chép mã!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Sao chép mã Apps Script</span>
                </>
              )}
            </button>
          </div>

          <ol style={{ fontSize: '0.92rem', color: '#15803d', paddingLeft: '22px', lineHeight: '1.65', margin: 0 }}>
            <li>Tạo Google Sheet (hàng 1: <b>Câu hỏi, A, B, C, D, Đáp án, Mức độ khó</b>).</li>
            <li>Vào <b>Tiện ích mở rộng</b> → <b>Apps Script</b>, bấm nút <b>"Sao chép mã Apps Script"</b> ở trên rồi dán vào và lưu lại.</li>
            <li>Bấm <b>Triển khai</b> → <b>Tùy chọn triển khai mới</b> → Chọn <b>Web app</b> (Quyền truy cập: <b>Anyone</b>) → Dán đường link vào ô trên.</li>
          </ol>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              background: '#f1f5f9',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              color: '#475569',
              fontSize: '0.98rem',
            }}
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '12px 28px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.98rem',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Save size={18} />
            <span>Lưu & Tải Lại Dữ Liệu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
