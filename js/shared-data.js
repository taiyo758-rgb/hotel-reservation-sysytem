// ========== Shared Hotel Data Layer (localStorage) ==========

const HotelData = (() => {
  const STORAGE_KEYS = {
    RESERVATIONS: 'gah_reservations',
    ROOMS: 'gah_rooms'
  };

  // Room number definitions by room type
  const ROOM_DEFINITIONS = {
    'deluxe-single': {
      name: 'デラックスシングル',
      rooms: ['301', '302', '303', '304', '305', '306', '307', '308'],
      price: 15000
    },
    'superior-twin': {
      name: 'スーペリアツイン',
      rooms: ['501', '502', '503', '504', '505', '506'],
      price: 22000
    },
    'premium-double': {
      name: 'プレミアムダブル',
      rooms: ['801', '802', '803', '804'],
      price: 28000
    },
    'royal-suite': {
      name: 'ロイヤルスイート',
      rooms: ['1501', '1502'],
      price: 50000
    },
    'executive-suite': {
      name: 'エグゼクティブスイート',
      rooms: ['1901'],
      price: 75000
    }
  };

  // ---------- Initialization ----------
  function init() {
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      _initRooms();
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify([]));
    }
  }

  function _initRooms() {
    const rooms = {};
    for (const [type, def] of Object.entries(ROOM_DEFINITIONS)) {
      for (const num of def.rooms) {
        rooms[num] = {
          number: num,
          type: type,
          typeName: def.name,
          status: 'available', // 'available' | 'occupied'
          reservationNumber: null,
          guestName: null,
          checkedInAt: null
        };
      }
    }
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }

  // ---------- Reservations ----------
  function getReservations() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESERVATIONS) || '[]');
  }

  function saveReservation(reservation) {
    const reservations = getReservations();
    reservations.push(reservation);
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }

  function findReservation(reservationNumber) {
    return getReservations().find(r => r.reservationNumber === reservationNumber) || null;
  }

  function updateReservation(reservationNumber, updates) {
    const reservations = getReservations();
    const index = reservations.findIndex(r => r.reservationNumber === reservationNumber);
    if (index !== -1) {
      reservations[index] = { ...reservations[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
      return reservations[index];
    }
    return null;
  }

  // ---------- Rooms ----------
  function getRooms() {
    const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return data ? JSON.parse(data) : {};
  }

  function getRoom(roomNumber) {
    const rooms = getRooms();
    return rooms[roomNumber] || null;
  }

  function findOccupiedRoom(roomNumber) {
    const room = getRoom(roomNumber);
    if (room && room.status === 'occupied') return room;
    return null;
  }

  function getAvailableRoomByType(type) {
    const rooms = getRooms();
    for (const [num, room] of Object.entries(rooms)) {
      if (room.type === type && room.status === 'available') {
        return room;
      }
    }
    return null;
  }

  function checkInRoom(roomNumber, reservationNumber, guestName) {
    const rooms = getRooms();
    if (rooms[roomNumber]) {
      rooms[roomNumber].status = 'occupied';
      rooms[roomNumber].reservationNumber = reservationNumber;
      rooms[roomNumber].guestName = guestName;
      rooms[roomNumber].checkedInAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
      return rooms[roomNumber];
    }
    return null;
  }

  function checkOutRoom(roomNumber) {
    const rooms = getRooms();
    if (rooms[roomNumber] && rooms[roomNumber].status === 'occupied') {
      const snapshot = { ...rooms[roomNumber] };
      rooms[roomNumber].status = 'available';
      rooms[roomNumber].reservationNumber = null;
      rooms[roomNumber].guestName = null;
      rooms[roomNumber].checkedInAt = null;
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
      return snapshot; // return data before clearing
    }
    return null;
  }

  // ---------- Statistics ----------
  function getRoomStats() {
    const rooms = getRooms();
    const all = Object.values(rooms);
    const available = all.filter(r => r.status === 'available').length;
    const occupied = all.filter(r => r.status === 'occupied').length;
    return { total: all.length, available, occupied };
  }

  function getTodayCheckIns() {
    const today = _todayStr();
    return getReservations().filter(r => {
      if (r.status !== 'checked-in' || !r.checkedInAt) return false;
      return r.checkedInAt.slice(0, 10) === today;
    }).length;
  }

  // ---------- Utility ----------
  function _todayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  function formatDateJP(dateInput) {
    const date = (typeof dateInput === 'string') ? new Date(dateInput) : dateInput;
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const day = days[date.getDay()];
    return `${y}年${m}月${d}日（${day}）`;
  }

  function formatDateTimeJP(dateInput) {
    const date = (typeof dateInput === 'string') ? new Date(dateInput) : dateInput;
    const dateStr = formatDateJP(date);
    const h = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${dateStr} ${h}:${mi}`;
  }

  function getRoomDefinitions() {
    return ROOM_DEFINITIONS;
  }

  // ---------- Public API ----------
  return {
    init,
    getReservations,
    saveReservation,
    findReservation,
    updateReservation,
    getRooms,
    getRoom,
    findOccupiedRoom,
    getAvailableRoomByType,
    checkInRoom,
    checkOutRoom,
    getRoomStats,
    getTodayCheckIns,
    getRoomDefinitions,
    formatDateJP,
    formatDateTimeJP,
    ROOM_DEFINITIONS
  };
})();
