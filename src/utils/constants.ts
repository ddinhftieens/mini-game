import { GameTheme } from '../types';

/**
 * CẤU HÌNH GOOGLE APPS SCRIPT / SHEET API MẶC ĐỊNH
 */
export const DEFAULT_GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzMVJhX3QrMcP0O3TW9VTPbBTlUBFyQaPLUYIPuIG6acBP5xACFGruUkZJ-hhqbJ5Yzlg/exec';
export const GOOGLE_SHEET_APPS_SCRIPT_URL = DEFAULT_GOOGLE_SHEET_URL;

/**
 * CÁC CHỦ ĐỀ GAME
 */
const baseUrl = import.meta.env.BASE_URL || '/';
const formatPath = (path: string) => `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export const GAME_THEMES: GameTheme[] = [
  {
    id: 'frog',
    title: 'Giải cứu Chú Ếch Xanh',
    subtitle: 'Nhảy qua các lá sen để lên bờ an toàn',
    characterName: 'Chú Ếch Con',
    characterImage: formatPath('giaicuuechsanh/character_images.png'),
    destinationName: 'Bờ Ao Xanh Mát',
    destinationImage: formatPath('giaicuuechsanh/destination_images.png'),
    stepName: 'Lá sen',
    stepImage: formatPath('giaicuuechsanh/step_images.png'),
    description: 'Bé hãy cùng bạn Ếch trả lời đúng các câu hỏi để nhảy qua từng chiếc lá sen và về đích an toàn nhé!',
    backgroundTheme: 'from-emerald-400 to-teal-700',
    primaryColor: '#10b981',
  },
  {
    id: 'princess',
    title: 'Giải cứu Công Chúa',
    subtitle: 'Vượt qua các tầng tháp lâu đài',
    characterName: 'Hiệp Sĩ Nhí',
    destinationName: 'Lâu Đài Hoàng Gia',
    stepName: 'Tầng tháp',
    description: 'Vượt qua các chướng ngại vật kiến thức để mở khóa các tầng lâu đài và giải cứu công chúa nào!',
    backgroundTheme: 'from-pink-400 to-purple-700',
    primaryColor: '#ec4899',
  },
  {
    id: 'snail',
    title: 'Ốc Sên Leo Miệng Giếng',
    subtitle: 'Từng bước vươn tới ánh mặt trời',
    characterName: 'Chú Ốc Sên',
    characterImage: formatPath('giaicuuocsen/character_images.png'),
    destinationName: 'Khu Vườn Hoa Nắng',
    destinationImage: formatPath('giaicuuocsen/destination_images.png'),
    stepName: 'Bậc đá',
    stepImage: formatPath('giaicuuocsen/step_images.png'),
    description: 'Cùng chú ốc sên kiên trì leo từng bậc đá lên khỏi miệng giếng đón ánh nắng rực rỡ nhé!',
    backgroundTheme: 'from-amber-400 to-orange-700',
    primaryColor: '#f59e0b',
  },
];
