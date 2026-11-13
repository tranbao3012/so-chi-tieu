export const STORAGE_KEY = 'expense_tracker_v1';

const _now = Date.now();
export const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Ăn uống', color: '#f97316', icon: 'utensils', type: 'essential', updatedAt: _now },
  { id: 'transport', name: 'Di chuyển', color: '#3b82f6', icon: 'car', type: 'essential', updatedAt: _now },
  { id: 'shopping', name: 'Mua sắm', color: '#ec4899', icon: 'shoppingBag', type: 'discretionary', updatedAt: _now },
  { id: 'bills', name: 'Hoá đơn', color: '#ef4444', icon: 'receipt', type: 'essential', updatedAt: _now },
  { id: 'entertainment', name: 'Giải trí', color: '#8b5cf6', icon: 'gamepad', type: 'discretionary', updatedAt: _now },
  { id: 'health', name: 'Sức khoẻ', color: '#10b981', icon: 'heart', type: 'essential', updatedAt: _now },
  { id: 'education', name: 'Giáo dục', color: '#6366f1', icon: 'book', type: 'essential', updatedAt: _now },
  { id: 'other', name: 'Khác', color: '#64748b', icon: 'package', type: 'discretionary', updatedAt: _now }
];

export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Tiền mặt', color: '#6366f1', icon: 'cash' },
  { id: 'card', name: 'Thẻ', color: '#8b5cf6', icon: 'creditCard' },
  { id: 'transfer', name: 'CK', color: '#ec4899', icon: 'transfer' },
  { id: 'wallet', name: 'Ví ĐT', color: '#f59e0b', icon: 'wallet' }
];

export const COLOR_PALETTE = ['#f97316', '#ef4444', '#ec4899', '#a855f7','#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9','#06b6d4', '#14b8a6', '#10b981', '#22c55e','#84cc16', '#eab308', '#f59e0b', '#64748b'];

export const CATEGORY_ICONS = [
  'utensils', 'coffee', 'pizza', 'cake', 'beer',
  'car', 'fuel', 'bus', 'bike', 'plane',
  'shoppingBag', 'shirt', 'gift', 'diamond', 'sparkles',
  'home', 'zap', 'droplet', 'wifi', 'flame',
  'film', 'gamepad', 'music', 'tv', 'headphones',
  'heart', 'pill', 'dumbbell', 'book', 'graduationCap',
  'pencil', 'receipt', 'package', 'tag', 'phone'
];

export const ICONS = {
  pieChart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  barChart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
  trendUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  dollarSign: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  creditCard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  infoCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.8L20 10.6l-5.1 1.8L13 18l-1.9-5.6L6 10.6l5.1-1.8z"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  alertTriangle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
  transfer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  piggyBank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/></svg>',
  utensils: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="22"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
  coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>',
  pizza: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16l20 6-6-20z"/><circle cx="15" cy="11" r="0.6" fill="currentColor"/><circle cx="11" cy="15" r="0.6" fill="currentColor"/><circle cx="16.5" cy="15.5" r="0.6" fill="currentColor"/></svg>',
  cake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><line x1="7" y1="8" x2="7" y2="11"/><line x1="12" y1="8" x2="12" y2="11"/><line x1="17" y1="8" x2="17" y2="11"/></svg>',
  beer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11h1a3 3 0 0 1 0 6h-1"/><path d="M9 12v6"/><path d="M13 12v6"/><path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5s2-.5 3-.5 2 .5 3 .5a2.5 2.5 0 0 1 0 4Z"/><path d="M5 8v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/></svg>',
  car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>',
  fuel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="15" y2="22"/><line x1="4" y1="9" x2="14" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>',
  bus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>',
  bike: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>',
  plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
  shoppingBag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>',
  diamond: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.71 2.7a2.41 2.41 0 0 0-3.41 0z"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
  gamepad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
  headphones: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  pill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="3" height="6" rx="1"/><rect x="19" y="9" width="3" height="6" rx="1"/><rect x="5" y="7" width="3" height="10" rx="1"/><rect x="16" y="7" width="3" height="10" rx="1"/><line x1="8" y1="12" x2="16" y2="12" stroke-width="2.5"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  graduationCap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
  receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="17.5" x2="12" y2="6.5"/></svg>',
  package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
};

export const ic = (n, size = 16) => {
  const svg = ICONS[n] || '';
  if (!svg) return '';
  return svg.replace('<svg ', `<svg width="${size}" height="${size}" style="width:${size}px;height:${size}px;min-width:${size}px;min-height:${size}px;display:inline-block;vertical-align:middle;" `);
};

export function fillIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    if (ICONS[el.dataset.icon] && !el.querySelector('svg')) {
      el.innerHTML = ic(el.dataset.icon, 16);
    }
  });
}

export const PLATFORM = (() => {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'ios';
})();

const HAPTIC_SUPPORT = 'vibrate' in navigator;

export function haptic(pattern) {
  if (!HAPTIC_SUPPORT) return;
  requestAnimationFrame(() => {
    try { navigator.vibrate(pattern); } catch (e) {}
  });
}

export const hapticTap = () => haptic(PLATFORM === 'android' ? 10 : 6);
export const hapticSuccess = () => haptic([10, 40, 10]);
export const hapticWarning = () => haptic([25, 25, 25]);

export const state = {
  expenses: [],
  categories: [],
  settings: {
    currency: 'đ',
    monthlyBudget: 0,
    monthlyIncome: 0,
    theme: 'dark',
    aiEnabled: true,
    anomalyEnabled: true,
    suggestEnabled: true,
    accountingEnabled: true,
    updatedAt: Date.now()
  }
};

export const formState = {
  editingExpenseId: null,
  formCategory: null,
  formPayment: 'cash',
  editingCategoryId: null,
  editingCatColor: COLOR_PALETTE[0],
  editingCatIcon: 'tag'
};

export const reportState = { month: new Date() };

let _anomalyCache = null;
let _anomalyCacheDirty = true;

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state.expenses = Array.isArray(parsed.expenses) ? parsed.expenses : [];
      state.categories = Array.isArray(parsed.categories) && parsed.categories.length > 0
        ? parsed.categories : JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
      state.settings = Object.assign({}, state.settings, parsed.settings || {});
    } else {
      state.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    }
  } catch (e) {
    state.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
  }
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    _anomalyCacheDirty = true;
  } catch (e) {
    toast('Không lưu được dữ liệu', 'error');
  }
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const dayIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const todayIso = () => dayIso(new Date());
export const getYesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; };
export const getLastMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() - 1, 1); };
export const fmtDate = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };

export const fmtMoney = (n) => Number(n || 0).toLocaleString('vi-VN') + ' ' + state.settings.currency;

export const fmtMoneyShort = (n) => {
  n = Number(n || 0);
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace('.0', '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return String(n);
};

export const getCategory = (id) => state.categories.find(c => c.id === id) || { id: 'unknown', name: 'Khác', color: '#64748b', icon: 'package', type: 'discretionary' };

const ID_TO_ICON = {
  food: 'utensils',
  transport: 'car',
  shopping: 'shoppingBag',
  bills: 'receipt',
  entertainment: 'gamepad',
  health: 'heart',
  education: 'book',
  other: 'package'
};

export const getCategoryIcon = (cat) => {
  if (!cat) return 'package';
  if (cat.icon && ICONS[cat.icon]) return cat.icon;
  if (cat.id && ID_TO_ICON[cat.id]) return ID_TO_ICON[cat.id];
  return 'tag';
};

export const getPayment = (id) => PAYMENT_METHODS.find(p => p.id === id) || PAYMENT_METHODS[0];

export const monthKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
export const monthLabel = (d) => 'Tháng ' + (d.getMonth() + 1) + '/' + d.getFullYear();
export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

export const escapeHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const getDayExpenses = (d = new Date()) => { const iso = dayIso(d); return state.expenses.filter(e => e.date === iso); };
export const getMonthExpenses = (d = new Date()) => { const key = monthKey(d); return state.expenses.filter(e => e.date && e.date.startsWith(key)); };

export const calcSummary = (exps) => {
  const total = exps.reduce((s, e) => s + Number(e.amount || 0), 0);
  return { total, count: exps.length };
};

export const calcByCategory = (exps) => {
  const map = new Map();
  exps.forEach(e => map.set(e.categoryId, (map.get(e.categoryId) || 0) + Number(e.amount || 0)));
  return Array.from(map.entries()).map(([id, value]) => ({ category: getCategory(id), value })).sort((a, b) => b.value - a.value);
};

export const calcByPayment = (exps) => {
  const map = new Map();
  exps.forEach(e => map.set(e.paymentMethod, (map.get(e.paymentMethod) || 0) + Number(e.amount || 0)));
  return Array.from(map.entries()).map(([id, value]) => ({ payment: getPayment(id), value })).sort((a, b) => b.value - a.value);
};

export const calcWeekly = (exps, y, m) => {
  const total = daysInMonth(y, m);
  const weeks = [];
  let start = 1;
  while (start <= total) {
    const end = Math.min(start + 6, total);
    const weekExps = exps.filter(e => { const d = parseInt(e.date.split('-')[2], 10); return d >= start && d <= end; });
    weeks.push({ label: `Tuần ${weeks.length + 1}`, days: `${start}-${end}`, total: weekExps.reduce((s, e) => s + Number(e.amount || 0), 0), count: weekExps.length });
    start = end + 1;
  }
  return weeks;
};

export const calcTrend = (cur, prev, label) => {
  if (prev === 0 && cur === 0) return { text: 'Chưa có dữ liệu', type: 'neutral', icon: 'minus' };
  if (prev === 0) return { text: 'Mới phát sinh', type: 'up', icon: 'arrowUp' };
  const diff = cur - prev;
  const pct = Math.abs((diff / prev) * 100).toFixed(0);
  if (diff > 0) return { text: `+${pct}% vs ${label}`, type: 'up', icon: 'arrowUp' };
  if (diff < 0) return { text: `-${pct}% vs ${label}`, type: 'down', icon: 'arrowDown' };
  return { text: `Không đổi`, type: 'neutral', icon: 'minus' };
};

export const AI = {
  forecastMonthEnd() {
    const now = new Date();
    const days = daysInMonth(now.getFullYear(), now.getMonth());
    const day = now.getDate();
    const total = getMonthExpenses(now).reduce((s, e) => s + Number(e.amount), 0);
    const avg = day > 0 ? total / day : 0;
    const forecast = avg * days;
    const budget = state.settings.monthlyBudget;
    return {
      forecast, current: total, avgPerDay: avg, daysLeft: days - day,
      willExceed: budget > 0 && forecast > budget,
      exceedAmount: budget > 0 ? Math.max(0, forecast - budget) : 0,
      remaining: budget > 0 ? budget - total : 0
    };
  },
  detectAnomalies() {
    if (!state.settings.anomalyEnabled) return [];
    if (!_anomalyCacheDirty && _anomalyCache) return _anomalyCache;

    const byCat = {};
    state.expenses.forEach(e => {
      if (!byCat[e.categoryId]) byCat[e.categoryId] = [];
      byCat[e.categoryId].push(Number(e.amount));
    });
    const out = [];
    state.expenses.forEach(e => {
      const amounts = byCat[e.categoryId] || [];
      if (amounts.length < 3) return;
      const sorted = [...amounts].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      if (median > 0 && Number(e.amount) > median * 3) out.push({ ...e, median, ratio: Number(e.amount) / median });
    });

    _anomalyCache = out;
    _anomalyCacheDirty = false;
    return out;
  },
  isAnomalous(id) { return this.detectAnomalies().some(a => a.id === id); },
  healthScore() {
    let score = 100;
    const budget = state.settings.monthlyBudget;
    if (budget > 0) {
      const total = getMonthExpenses().reduce((s, e) => s + Number(e.amount), 0);
      const pct = (total / budget) * 100;
      if (pct > 100) score -= Math.min(40, (pct - 100) * 0.4);
      else if (pct > 80) score -= 10;
      else if (pct > 60) score -= 3;
    } else score -= 5;
    score -= Math.min(20, this.detectAnomalies().length * 3);
    const now = new Date();
    const cur = getMonthExpenses(now).reduce((s, e) => s + Number(e.amount), 0);
    const last = getMonthExpenses(getLastMonth()).reduce((s, e) => s + Number(e.amount), 0);
    if (last > 0 && cur > last * 1.3) score -= 15;
    if (last > 0 && cur < last * 0.7) score += 5;
    const uniqueDays = new Set(getMonthExpenses(now).map(e => e.date)).size;
    if (now.getDate() > 0 && (uniqueDays / now.getDate()) * 100 < 30) score -= 5;
    return Math.max(0, Math.min(100, Math.round(score)));
  },
  healthInfo() {
    const s = this.healthScore();
    if (s >= 85) return { label: 'Rất tốt', icon: 'award', desc: 'Tài chính lành mạnh!' };
    if (s >= 70) return { label: 'Tốt', icon: 'check', desc: 'Chi tiêu trong tầm kiểm soát.' };
    if (s >= 50) return { label: 'Trung bình', icon: 'activity', desc: 'Cần chú ý vài điểm.' };
    if (s >= 30) return { label: 'Cần cải thiện', icon: 'alertTriangle', desc: 'Có dấu hiệu vượt mức.' };
    return { label: 'Báo động', icon: 'alertTriangle', desc: 'Cần điều chỉnh ngay.' };
  },
  suggestCategory(note) {
    if (!state.settings.suggestEnabled) return null;
    if (!note || note.length < 2) return null;
    const n = note.toLowerCase();
    const kws = {
      food: ['ăn', 'uống', 'cafe', 'cà phê', 'cơm', 'phở', 'trà sữa', 'sáng', 'trưa', 'tối', 'bánh', 'bún', 'mì', 'cháo', 'nước'],
      transport: ['xe', 'grab', 'taxi', 'xăng', 'bus', 'vé', 'gửi xe', 'rửa xe', 'gojek', 'xe ôm'],
      shopping: ['mua', 'shopee', 'lazada', 'tiki', 'quần', 'áo', 'giày', 'túi', 'mỹ phẩm', 'shop'],
      bills: ['điện', 'nước', 'gas', 'internet', 'wifi', 'điện thoại', 'hoá đơn', 'hóa đơn', 'nhà', 'trọ', 'cước'],
      entertainment: ['phim', 'game', 'nhạc', 'du lịch', 'khách sạn', 'karaoke', 'netflix', 'spotify', 'youtube'],
      health: ['thuốc', 'khám', 'bệnh viện', 'gym', 'yoga', 'sức khoẻ', 'bảo hiểm', 'nha khoa'],
      education: ['sách', 'học', 'khoá học', 'khóa học', 'trường', 'gia sư', 'học phí']
    };
    for (const [id, words] of Object.entries(kws)) {
      for (const w of words) if (n.includes(w)) return { categoryId: id, matched: w };
    }
    return null;
  },
  suggestAmount(categoryId) {
    if (!state.settings.suggestEnabled) return [];
    const amounts = state.expenses.filter(e => e.categoryId === categoryId).map(e => Number(e.amount));
    if (!amounts.length) return [];
    const counts = {};
    amounts.forEach(a => counts[a] = (counts[a] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([a, c]) => ({ amount: Number(a), count: c }));
  },
  checkAnomalyForInput(catId, amount) {
    if (!state.settings.anomalyEnabled || !catId || !amount || amount <= 0) return null;
    const amounts = state.expenses.filter(e => e.categoryId === catId).map(e => Number(e.amount));
    if (amounts.length < 3) return null;
    const sorted = [...amounts].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    if (median > 0 && amount > median * 3) return { median, ratio: amount / median };
    return null;
  },
  sparklineData(days = 7) {
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = dayIso(d);
      out.push({ date: iso, total: state.expenses.filter(e => e.date === iso).reduce((s, e) => s + Number(e.amount), 0) });
    }
    return out;
  },
  getLiveInsights() {
    if (!state.settings.aiEnabled) return [];
    const insights = [];
    const now = new Date();
    const total = getMonthExpenses(now).reduce((s, e) => s + Number(e.amount), 0);
    const forecast = this.forecastMonthEnd();
    if (forecast.willExceed) {
      const perDay = Math.ceil(forecast.exceedAmount / Math.max(1, forecast.daysLeft));
      insights.push({
        type: 'danger', icon: 'alertTriangle',
        text: `Dự báo cuối tháng <strong>${fmtMoney(Math.round(forecast.forecast))}</strong> — vượt ngân sách <strong>${fmtMoney(forecast.exceedAmount)}</strong>. Giảm <strong>${fmtMoney(perDay)}/ngày</strong> trong ${forecast.daysLeft} ngày tới.`
      });
    } else if (state.settings.monthlyBudget > 0 && total > 0) {
      insights.push({
        type: 'success', icon: 'target',
        text: `Dự báo cuối tháng <strong>${fmtMoney(Math.round(forecast.forecast))}</strong> — trong ngân sách.`
      });
    }
    const anomalies = this.detectAnomalies();
    if (anomalies.length > 0) {
      const top = anomalies[0];
      insights.push({
        type: 'warning', icon: 'zap',
        text: `Phát hiện <strong>${anomalies.length} giao dịch bất thường</strong>. Gần nhất: <strong>${fmtMoney(top.amount)}</strong> — gấp <strong>${top.ratio.toFixed(1)}x</strong> mức thường.`
      });
    }
    const byCat = calcByCategory(getMonthExpenses(now));
    if (byCat.length > 0 && total > 0 && (byCat[0].value / total) > 0.5) {
      insights.push({
        type: 'info', icon: 'pieChart',
        text: `Danh mục <strong>"${byCat[0].category.name}"</strong> chiếm <strong>${(byCat[0].value / total * 100).toFixed(0)}%</strong> tổng chi tháng.`
      });
    }
    if (total === 0 && now.getDate() > 3) {
      insights.push({ type: 'info', icon: 'sparkles', text: `Chưa có giao dịch nào trong tháng. Nhấn <strong>nút +</strong> để bắt đầu.` });
    }
    return insights;
  }
};

export const ACCT = {
  getIncome() { return Number(state.settings.monthlyIncome) || Number(state.settings.monthlyBudget) || 0; },
  analyze503020() {
    const income = this.getIncome();
    const exps = getMonthExpenses(new Date());
    let essential = 0, wants = 0;
    exps.forEach(e => {
      const cat = getCategory(e.categoryId);
      const amt = Number(e.amount || 0);
      if (cat.type === 'essential') essential += amt;
      else wants += amt;
    });
    const savings = Math.max(0, income - essential - wants);
    return {
      income, needs: essential, wants, savings,
      needsPct: income > 0 ? (essential / income * 100) : 0,
      wantsPct: income > 0 ? (wants / income * 100) : 0,
      savingsPct: income > 0 ? (savings / income * 100) : 0,
      needsOk: income > 0 && (essential / income * 100) <= 55,
      wantsOk: income > 0 && (wants / income * 100) <= 35,
      savingsOk: income > 0 && (savings / income * 100) >= 15
    };
  },
  burnRate() {
    const now = new Date();
    const day = now.getDate();
    const days = daysInMonth(now.getFullYear(), now.getMonth());
    const budget = Number(state.settings.monthlyBudget);
    if (budget <= 0) return null;
    const spent = getMonthExpenses(now).reduce((s, e) => s + Number(e.amount), 0);
    const expected = (day / days) * budget;
    const burnPct = expected > 0 ? (spent / expected * 100) : 0;
    return { spent, expected, budget, burnPct, status: burnPct > 120 ? 'danger' : burnPct > 100 ? 'warning' : burnPct > 80 ? 'ok' : 'good' };
  },
  savingsRate() {
    const income = this.getIncome();
    if (income <= 0) return null;
    const exps = getMonthExpenses().reduce((s, e) => s + Number(e.amount), 0);
    const savings = income - exps;
    return { income, expenses: exps, savings, rate: (savings / income * 100) };
  },
  categoryConcentration() {
    const exps = getMonthExpenses();
    const total = exps.reduce((s, e) => s + Number(e.amount), 0);
    if (total <= 0) return null;
    const byCat = calcByCategory(exps);
    let hhi = 0;
    byCat.forEach(c => hhi += Math.pow(c.value / total, 2));
    return { top1Pct: byCat.length > 0 ? (byCat[0].value / total * 100) : 0, diversity: (1 - hhi) * 100 };
  },
  riskLevel() {
    const h = AI.healthScore();
    const b = this.burnRate();
    let r = 'low';
    if (h < 40) r = 'high'; else if (h < 60) r = 'medium';
    if (b && b.status === 'danger') r = 'high';
    else if (b && b.status === 'warning' && r !== 'high') r = 'medium';
    return r;
  }
};

export function toast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 220); }, 2500);
}

export function openSheet(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

export function closeSheet(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

let _confirmCallback = null;

export function showConfirm(title, message, onOk) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  _confirmCallback = onOk;
  openSheet('confirmModal');
}

export function bindConfirmOK() {
  const btn = document.getElementById('confirmOkBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    hapticTap();
    if (typeof _confirmCallback === 'function') _confirmCallback();
    _confirmCallback = null;
    closeSheet('confirmModal');
  });
}

export function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.settings.theme || 'light');
  const icon = document.getElementById('themeIcon');
  if (icon) {
    if (state.settings.theme === 'dark') {
      icon.innerHTML = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
    } else {
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', state.settings.theme === 'dark' ? '#0b1020' : '#f8fafc');
}

export function toggleTheme() {
  hapticTap();
  state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
  state.settings.updatedAt = Date.now();
  saveState();
  applyTheme();
}

export function renderSparkline(container, data, color = 'var(--primary)') {
  if (!container) return;
  if (!data || data.length === 0) { container.innerHTML = ''; return; }
  const max = Math.max(...data.map(d => d.total), 1);
  const w = 80, h = 32;
  const stepX = data.length > 1 ? w / (data.length - 1) : 0;
  const pts = data.map((d, i) => `${i * stepX},${h - (d.total / max) * (h - 4) - 2}`).join(' ');
  const area = `M0,${h} L${pts.split(' ').join(' L')} L${w},${h} Z`;
  container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none"><path d="${area}" fill="${color}" opacity="0.15"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function renderDonut(container, segments, total) {
  if (!container) return;
  const size = 160, cx = 80, cy = 80, r = 58;
  const circ = 2 * Math.PI * r;

  container.style.width = size + 'px';
  container.style.height = size + 'px';
  container.style.margin = '0 auto';
  container.style.position = 'relative';

  if (!total) {
    container.innerHTML = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="16"/></svg><div class="donut-center" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div class="donut-center-label" style="font-size:9.5px;color:var(--text-soft);font-weight:700;">Tổng</div><div class="donut-center-value" style="font-size:17px;font-weight:800;color:var(--text);">0</div></div>`;
    return;
  }

  let offset = 0;
  let svg = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="16"/>`;
  segments.forEach(s => {
    const dash = (s.value / total) * circ;
    if (dash < 0.5) return;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="16" stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += dash;
  });
  svg += '</svg>';
  svg += `<div class="donut-center" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;"><div class="donut-center-label" style="font-size:9.5px;color:var(--text-soft);font-weight:700;">Tổng</div><div class="donut-center-value" style="font-size:17px;font-weight:800;color:var(--text);">${fmtMoneyShort(total)}</div></div>`;
  container.innerHTML = svg;
}

export function generateInsights(monthExp, total, prevTotal, days) {
  if (monthExp.length === 0) return [];
  const ins = [];
  const byCat = calcByCategory(monthExp);
  if (byCat.length > 0) {
    const top = byCat[0];
    ins.push({ icon: 'pieChart', html: `Danh mục <strong>${escapeHtml(top.category.name)}</strong> chiếm <strong>${(top.value / total * 100).toFixed(0)}%</strong> tổng chi.` });
  }
  if (prevTotal > 0) {
    const diff = total - prevTotal;
    const pct = Math.abs((diff / prevTotal) * 100).toFixed(0);
    if (diff > 0) ins.push({ icon: 'arrowUp', html: `Chi tiêu <strong>tăng ${pct}%</strong> vs tháng trước.` });
    else if (diff < 0) ins.push({ icon: 'arrowDown', html: `Chi tiêu <strong>giảm ${pct}%</strong> vs tháng trước.` });
  }
  const uniqueDays = new Set(monthExp.map(e => e.date)).size;
  ins.push({ icon: 'calendar', html: `<strong>${uniqueDays}/${days} ngày</strong> có chi tiêu.` });
  if (state.settings.monthlyBudget > 0) {
    const pct = (total / state.settings.monthlyBudget * 100).toFixed(0);
    if (total > state.settings.monthlyBudget) ins.push({ icon: 'target', html: `Vượt ngân sách <strong>${fmtMoney(total - state.settings.monthlyBudget)}</strong>.` });
    else ins.push({ icon: 'target', html: `Đã dùng <strong>${pct}%</strong> ngân sách.` });
  }
  return ins;
}

export function exportPDF() {
  const html = buildPdfReport();
  document.getElementById('pdfReport').innerHTML = html;
  setTimeout(() => {
    window.print();
    setTimeout(() => { document.getElementById('pdfReport').innerHTML = ''; }, 500);
  }, 200);
}

function buildPdfChartSVG(dailyMap, days, maxDay) {
  const W = 480, H = 140, P = { t: 10, r: 10, b: 24, l: 32 };
  const cw = W - P.l - P.r, ch = H - P.t - P.b;
  const bw = Math.max(4, Math.min(14, cw / days - 2));
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;"><defs><linearGradient id="pdfBarGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4f46e5"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>`;
  for (let i = 0; i <= 4; i++) {
    const y = P.t + (ch / 4) * i;
    s += `<line x1="${P.l}" y1="${y}" x2="${W - P.r}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`;
    s += `<text x="${P.l - 6}" y="${y + 3}" text-anchor="end" font-size="7" fill="#94a3b8" font-weight="600">${fmtMoneyShort(Math.round(maxDay * (1 - i / 4)))}</text>`;
  }
  for (let d = 1; d <= days; d++) {
    const val = dailyMap.get(d) || 0;
    if (val === 0) continue;
    const barH = (val / maxDay) * ch;
    const x = P.l + ((d - 1) / days) * cw + (cw / days - bw) / 2;
    const y = P.t + ch - barH;
    s += `<rect x="${x}" y="${y}" width="${bw}" height="${barH}" fill="url(#pdfBarGrad)" rx="1"/>`;
    s += `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="6.5" fill="#94a3b8" font-weight="600">${d}</text>`;
  }
  return s + '</svg>';
}

function buildPdfReport() {
  const reportMonth = reportState.month;
  const monthExp = getMonthExpenses(reportMonth);
  const prevExp = getMonthExpenses(new Date(reportMonth.getFullYear(), reportMonth.getMonth() - 1, 1));
  const { total, count } = calcSummary(monthExp);
  const prevTotal = calcSummary(prevExp).total;
  const days = daysInMonth(reportMonth.getFullYear(), reportMonth.getMonth());
  const avg = total / days;
  const largest = monthExp.reduce((m, e) => Math.max(m, Number(e.amount || 0)), 0);
  const diffPct = prevTotal > 0 ? ((total - prevTotal) / prevTotal * 100) : 0;
  const byCat = calcByCategory(monthExp);
  const byPay = calcByPayment(monthExp);
  const weekly = calcWeekly(monthExp, reportMonth.getFullYear(), reportMonth.getMonth());
  const top = [...monthExp].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 10);
  const budget = state.settings.monthlyBudget || 0;
  const budgetPct = budget > 0 ? (total / budget * 100) : 0;
  const health = AI.healthScore();
  const healthInfo = AI.healthInfo();
  const rule = ACCT.analyze503020();
  const insights = generateInsights(monthExp, total, prevTotal, days);
  const dateStr = new Date().toLocaleString('vi-VN');
  const dailyMap = new Map();
  monthExp.forEach(e => { const d = parseInt(e.date.split('-')[2], 10); dailyMap.set(d, (dailyMap.get(d) || 0) + Number(e.amount)); });
  const maxDay = Math.max(...Array.from(dailyMap.values()), 1);

  let h = `<div class="pdf-page"><div class="pdf-cover"><div class="pdf-cover-top"><div class="pdf-cover-brand"><div class="pdf-cover-logo">$</div><div><div class="pdf-cover-brand-name">Quản Lý Chi Tiêu</div><div class="pdf-cover-brand-sub">AI Tài chính · Kế toán</div></div></div><div class="pdf-cover-title">BÁO CÁO<br>CHI TIÊU CÁ NHÂN</div><div class="pdf-cover-subtitle">Phân tích tài chính chuyên sâu</div><div class="pdf-cover-period">${monthLabel(reportMonth)}</div></div><div><div class="pdf-cover-meta"><div class="pdf-cover-meta-item"><div class="pdf-cover-meta-label">Ngày tạo</div><div class="pdf-cover-meta-value">${dateStr}</div></div><div class="pdf-cover-meta-item"><div class="pdf-cover-meta-label">Kỳ báo cáo</div><div class="pdf-cover-meta-value">${monthLabel(reportMonth)}</div></div><div class="pdf-cover-meta-item"><div class="pdf-cover-meta-label">Số giao dịch</div><div class="pdf-cover-meta-value">${count}</div></div><div class="pdf-cover-meta-item"><div class="pdf-cover-meta-label">Tổng chi</div><div class="pdf-cover-meta-value">${fmtMoney(total)}</div></div></div><div class="pdf-cover-footer">Được tạo tự động bởi Quản Lý Chi Tiêu v6.0 · ${dateStr}</div></div></div></div>`;

  h += `<div class="pdf-page"><div class="pdf-page-header"><div class="pdf-page-header-title">Tóm tắt tổng quan</div><div class="pdf-page-header-section">${monthLabel(reportMonth)}</div></div><div class="pdf-health-banner"><div class="pdf-health-score-big">${health}<span>/100</span></div><div style="flex:1;"><div class="pdf-health-label">Sức khoẻ tài chính</div><div class="pdf-health-status">${healthInfo.label}</div><div class="pdf-health-desc">${healthInfo.desc}</div></div></div><div class="pdf-kpi-grid"><div class="pdf-kpi"><div class="pdf-kpi-label">Tổng chi tiêu</div><div class="pdf-kpi-value">${fmtMoneyShort(total)}</div><div class="pdf-kpi-sub">${count} giao dịch</div></div><div class="pdf-kpi"><div class="pdf-kpi-label">TB/ngày</div><div class="pdf-kpi-value">${fmtMoneyShort(Math.round(avg))}</div><div class="pdf-kpi-sub">Trên ${days} ngày</div></div><div class="pdf-kpi"><div class="pdf-kpi-label">Chi lớn nhất</div><div class="pdf-kpi-value">${fmtMoneyShort(largest)}</div><div class="pdf-kpi-sub">Giao dịch đắt nhất</div></div><div class="pdf-kpi"><div class="pdf-kpi-label">So tháng trước</div><div class="pdf-kpi-value">${prevTotal > 0 ? (diffPct >= 0 ? '+' : '') + diffPct.toFixed(0) + '%' : '—'}</div><div class="pdf-kpi-sub">${prevTotal > 0 ? fmtMoneyShort(prevTotal) : 'Chưa có'}</div></div></div>`;

  if (budget > 0) h += `<div class="pdf-section"><div class="pdf-section-title">Ngân sách</div><div class="pdf-kpi-grid" style="grid-template-columns:repeat(3,1fr)"><div class="pdf-kpi"><div class="pdf-kpi-label">Ngân sách</div><div class="pdf-kpi-value">${fmtMoneyShort(budget)}</div></div><div class="pdf-kpi"><div class="pdf-kpi-label">Đã dùng</div><div class="pdf-kpi-value">${budgetPct.toFixed(0)}%</div><div class="pdf-kpi-sub">${fmtMoney(total)}</div></div><div class="pdf-kpi"><div class="pdf-kpi-label">${budgetPct > 100 ? 'Vượt' : 'Còn'}</div><div class="pdf-kpi-value">${fmtMoneyShort(Math.abs(budget - total))}</div></div></div></div>`;

  if (rule.income > 0) h += `<div class="pdf-section"><div class="pdf-section-title">Phân tích 50/30/20</div><table class="pdf-table"><thead><tr><th>Loại</th><th class="right">Số tiền</th><th class="right">% Thu nhập</th><th class="right">Mục tiêu</th><th class="right">ĐG</th></tr></thead><tbody><tr><td><strong>Thiết yếu</strong></td><td class="num">${fmtMoney(rule.needs)}</td><td class="num">${rule.needsPct.toFixed(1)}%</td><td class="num">≤50%</td><td class="num" style="color:${rule.needsOk ? '#10b981' : '#ef4444'};font-weight:800;">${rule.needsOk ? 'Đạt' : 'Vượt'}</td></tr><tr><td><strong>Mong muốn</strong></td><td class="num">${fmtMoney(rule.wants)}</td><td class="num">${rule.wantsPct.toFixed(1)}%</td><td class="num">≤30%</td><td class="num" style="color:${rule.wantsOk ? '#10b981' : '#ef4444'};font-weight:800;">${rule.wantsOk ? 'Đạt' : 'Vượt'}</td></tr><tr><td><strong>Tiết kiệm</strong></td><td class="num">${fmtMoney(rule.savings)}</td><td class="num">${rule.savingsPct.toFixed(1)}%</td><td class="num">≥20%</td><td class="num" style="color:${rule.savingsOk ? '#10b981' : '#ef4444'};font-weight:800;">${rule.savingsOk ? 'Đạt' : 'Chưa'}</td></tr></tbody></table></div>`;

  h += `<div class="pdf-page-footer"><span>Quản Lý Chi Tiêu v6.0</span><span>Trang 2</span></div></div>`;

  h += `<div class="pdf-page"><div class="pdf-page-header"><div class="pdf-page-header-title">Phân tích chi tiết</div><div class="pdf-page-header-section">${monthLabel(reportMonth)}</div></div><div class="pdf-section"><div class="pdf-section-title">Chi tiêu theo danh mục</div>${byCat.length === 0 ? '<div style="padding:20px;text-align:center;color:#94a3b8;">Chưa có dữ liệu</div>' : `<table class="pdf-table"><thead><tr><th>#</th><th>Danh mục</th><th class="right">Số tiền</th><th class="right">Tỷ trọng</th></tr></thead><tbody>${byCat.map((b, i) => `<tr><td>${i + 1}</td><td><span class="dot" style="background:${b.category.color};"></span>${escapeHtml(b.category.name)}</td><td class="num">${fmtMoney(b.value)}</td><td class="num">${total > 0 ? (b.value / total * 100).toFixed(1) : 0}%</td></tr>`).join('')}</tbody></table>`}</div><div class="pdf-section"><div class="pdf-section-title">Chi tiêu theo ngày</div>${buildPdfChartSVG(dailyMap, days, maxDay)}</div><div class="pdf-2col"><div class="pdf-section"><div class="pdf-section-title">Phương thức</div>${byPay.length === 0 ? '' : `<table class="pdf-table"><thead><tr><th>Loại</th><th class="right">Số tiền</th><th class="right">%</th></tr></thead><tbody>${byPay.map(p => `<tr><td><span class="dot" style="background:${p.payment.color};"></span>${escapeHtml(p.payment.name)}</td><td class="num">${fmtMoney(p.value)}</td><td class="num">${total > 0 ? (p.value / total * 100).toFixed(1) : 0}%</td></tr>`).join('')}</tbody></table>`}</div><div class="pdf-section"><div class="pdf-section-title">Theo tuần</div><table class="pdf-table"><thead><tr><th>Tuần</th><th class="right">Số tiền</th><th class="right">GD</th></tr></thead><tbody>${weekly.map(w => `<tr><td>${w.label} <span style="color:#94a3b8;font-size:8pt;">(${w.days})</span></td><td class="num">${fmtMoney(w.total)}</td><td class="num">${w.count}</td></tr>`).join('')}</tbody></table></div></div><div class="pdf-page-footer"><span>Quản Lý Chi Tiêu v6.0</span><span>Trang 3</span></div></div>`;

  h += `<div class="pdf-page"><div class="pdf-page-header"><div class="pdf-page-header-title">Nhận xét & Khuyến nghị</div><div class="pdf-page-header-section">${monthLabel(reportMonth)}</div></div>${insights.length > 0 ? `<div class="pdf-section"><div class="pdf-section-title">Phân tích thông minh</div><div class="pdf-insight-list">${insights.map(i => `<div class="pdf-insight">${i.html}</div>`).join('')}</div></div>` : ''}<div class="pdf-section"><div class="pdf-section-title">Top 10 chi tiêu</div>${top.length === 0 ? '' : `<table class="pdf-table"><thead><tr><th>#</th><th>Danh mục</th><th>Ghi chú</th><th class="right">Số tiền</th><th class="right">Ngày</th></tr></thead><tbody>${top.map((e, i) => { const c = getCategory(e.categoryId); return `<tr><td>${i + 1}</td><td><span class="dot" style="background:${c.color};"></span>${escapeHtml(c.name)}</td><td>${escapeHtml(e.note || '—')}</td><td class="num">${fmtMoney(e.amount)}</td><td class="num">${fmtDate(e.date)}</td></tr>`; }).join('')}</tbody></table>`}</div><div class="pdf-section"><div class="pdf-section-title">Khuyến nghị</div><div class="pdf-insight-list">${budget > 0 && budgetPct > 100 ? `<div class="pdf-insight danger"><strong>Cảnh báo:</strong> Vượt NS ${fmtMoney(total - budget)}. Cần cắt giảm chi tiêu.</div>` : budget > 0 && budgetPct > 80 ? `<div class="pdf-insight warning">Đã dùng ${budgetPct.toFixed(0)}% ngân sách. Chú ý chi tiêu.</div>` : budget > 0 ? `<div class="pdf-insight success">Chi tiêu trong tầm kiểm soát. Duy trì thói quen tốt.</div>` : `<div class="pdf-insight"><strong>Gợi ý:</strong> Đặt ngân sách để AI phân tích chính xác hơn.</div>`}${rule.income > 0 && !rule.savingsOk ? `<div class="pdf-insight warning">Tỷ lệ tiết kiệm (${rule.savingsPct.toFixed(1)}%) thấp hơn mục tiêu 20%.</div>` : rule.income > 0 ? `<div class="pdf-insight success">Tỷ lệ tiết kiệm đạt mục tiêu!</div>` : ''}</div></div><div class="pdf-sign"><div class="pdf-sign-block"><div class="pdf-sign-label">Người lập</div><div class="pdf-sign-line">${dateStr}</div></div><div class="pdf-sign-block"><div class="pdf-sign-label">Kiểm tra</div><div class="pdf-sign-line">${dateStr}</div></div><div class="pdf-sign-block"><div class="pdf-sign-label">Phê duyệt</div><div class="pdf-sign-line">${dateStr}</div></div></div><div class="pdf-page-footer"><span>Quản Lý Chi Tiêu v6.0 · Báo cáo tự động</span><span>Trang 4</span></div></div>`;

  return h;
}
