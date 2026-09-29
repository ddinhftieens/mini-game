import { GameTheme } from '../types';

/**
 * CẤU HÌNH GOOGLE APPS SCRIPT / SHEET API MẶC ĐỊNH
 */
export const DEFAULT_GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzMVJhX3QrMcP0O3TW9VTPbBTlUBFyQaPLUYIPuIG6acBP5xACFGruUkZJ-hhqbJ5Yzlg/exec';
export const GOOGLE_SHEET_APPS_SCRIPT_URL = '';
export const DEFAULT_TARGET_STEPS = 5;

/**
 * CÁC CHỦ ĐỀ GAME
 */
const baseUrl = import.meta.env.BASE_URL || '/';
const formatPath = (path: string) => `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export const GAME_THEMES: GameTheme[] = [
  {
    id: 'frog',
    title: 'Giải cứu Ếch Xanh',
    subtitle: 'Nhảy qua các lá sen để lên bờ an toàn',
    characterName: 'Chú Ếch Con',
    characterImage: formatPath('giaicuuechxanh/character_images.png'),
    destinationName: 'Bờ Ao Xanh Mát',
    destinationImage: formatPath('giaicuuechxanh/destination_images.png'),
    stepName: 'Lá sen',
    stepImage: formatPath('giaicuuechxanh/step_images.png'),
    description: 'Cùng Ếch trả lời đúng các câu hỏi để nhảy qua từng chiếc lá sen và về đích an toàn nhé!',
    descriptionAudio: formatPath('giaicuuechxanh/description.mp3'),
    backgroundTheme: 'from-emerald-400 to-teal-700',
    primaryColor: '#10b981',
    victoryTitle: 'Chúc mừng con đã về đích!',
    victoryMessage: 'Chú Ếch Con đã an toàn lên bờ nhờ sự thông minh và chính xác của con!',
  },
  {
    id: 'snail',
    title: 'Giải cứu Ốc Sên',
    subtitle: 'Từng bước vươn tới ánh mặt trời',
    characterName: 'Chú Ốc Sên',
    characterImage: formatPath('giaicuuocsen/character_images.png'),
    destinationName: 'Khu Vườn Hoa Nắng',
    destinationImage: formatPath('giaicuuocsen/destination_images.png'),
    stepName: 'Bậc đá',
    stepImage: formatPath('giaicuuocsen/step_images.png'),
    description: 'Cùng Ốc Sên kiên trì leo từng bậc đá lên khỏi miệng giếng đón ánh nắng rực rỡ nhé!',
    descriptionAudio: formatPath('giaicuuocsen/description.mp3'),
    backgroundTheme: 'from-amber-400 to-orange-700',
    primaryColor: '#f59e0b',
    victoryTitle: 'Chúc mừng con đã về đích!',
    victoryMessage: 'Chú Ốc Sên đã kiên trì vượt qua từng bậc đá vươn tới khu vườn hoa nắng rực rỡ nhờ sự trợ giúp của con!',
  },
  {
    id: 'astronaut',
    title: 'Giải cứu Phi Hành Gia',
    subtitle: 'Vượt qua các thiên thạch để trở về phi thuyền',
    characterName: 'Phi Hành Gia Nhí',
    characterImage: formatPath('giaicuuphihanhgia/character_images.png'),
    destinationName: 'Phi Thuyền Không Gian',
    destinationImage: formatPath('giaicuuphihanhgia/destination_images.png'),
    stepName: 'Thiên thạch',
    stepImage: formatPath('giaicuuphihanhgia/step_images.png'),
    description: 'Cùng Phi Hành Gia vượt qua các thiên thạch bay lơ lửng để về trạm không gian an toàn nhé!',
    descriptionAudio: formatPath('giaicuuphihanhgia/description.mp3'),
    backgroundTheme: 'from-sky-400 via-sky-600 to-slate-900',
    primaryColor: '#0284c7',
    victoryTitle: 'Chúc mừng con đã về đích!',
    victoryMessage: 'Phi Hành Gia Nhí đã cập bến trạm vũ trụ thành công nhờ vào trí thông minh tuyệt vời của con!',
  },
  {
    id: 'bee',
    title: 'Ong Vàng Tìm Mật',
    subtitle: 'Bay qua các bông hoa để về tổ mật ngọt',
    characterName: 'Chú Ong Chăm Chỉ',
    characterImage: formatPath('giaicuuongvang/character_images.png'),
    destinationName: 'Tổ Mật Khổng Lồ',
    destinationImage: formatPath('giaicuuongvang/destination_images.png'),
    stepName: 'Bông hoa',
    stepImage: formatPath('giaicuuongvang/step_images.png'),
    description: 'Cùng Ong Vàng trả lời đúng câu hỏi để bay qua từng bông hoa thơm và thu hoạch tổ mật ngọt nhé!',
    descriptionAudio: formatPath('giaicuuongvang/description.mp3'),
    backgroundTheme: 'from-amber-400 to-yellow-600',
    primaryColor: '#eab308',
    victoryTitle: 'Thu hoạch mật thành công!',
    victoryMessage: 'Chú Ong Vàng đã mang đầy ắp mật ngọt về tổ nhờ sự trợ giúp thông thái của con!',
  },
  {
    id: 'penguin',
    title: 'Giải cứu Chim Cánh Cụt',
    subtitle: 'Lướt qua các tảng băng trôi về ngôi nhà ấm áp',
    characterName: 'Chú Cánh Cụt Nhí',
    characterImage: formatPath('giaicuucanhcut/character_images.png'),
    destinationName: 'Nhà Băng Igloo Ấm Áp',
    destinationImage: formatPath('giaicuucanhcut/destination_images.png'),
    stepName: 'Tảng băng',
    stepImage: formatPath('giaicuucanhcut/step_images.png'),
    description: 'Cùng Chim Cánh Cụt con nhảy qua các tảng băng trôi dạt để về đến ngôi nhà tuyết ấm áp nhé!',
    descriptionAudio: formatPath('giaicuucanhcut/description.mp3'),
    backgroundTheme: 'from-cyan-400 to-blue-700',
    primaryColor: '#06b6d4',
    victoryTitle: 'Chúc mừng con đã về đích!',
    victoryMessage: 'Chú Chim Cánh Cụt đã an toàn về nhà ăn bữa tối ấm áp nhờ sự thông minh của con!',
  },
  {
    id: 'rabbit',
    title: 'Thỏ Con Tìm Cà Rốt',
    subtitle: 'Vượt qua nấm thần kỳ để tìm kho báu cà rốt',
    characterName: 'Chú Thỏ Con',
    characterImage: formatPath('giaicuuthocon/character_images.png'),
    destinationName: 'Cà Rốt Khổng Lồ',
    destinationImage: formatPath('giaicuuthocon/destination_images.png'),
    stepName: 'Nấm thần',
    stepImage: formatPath('giaicuuthocon/step_images.png'),
    description: 'Cùng Thỏ Con vượt qua các cây nấm phát sáng trong khu rừng kỳ diệu để tìm được củ cà rốt khổng lồ nhé!',
    descriptionAudio: formatPath('giaicuuthocon/description.mp3'),
    backgroundTheme: 'from-rose-400 to-orange-500',
    primaryColor: '#f43f5e',
    victoryTitle: 'Tìm được kho báu cà rốt!',
    victoryMessage: 'Chú Thỏ Con đã tìm được củ cà rốt ngon lành nhất khu rừng nhờ sự giúp đỡ của con!',
  },
];

