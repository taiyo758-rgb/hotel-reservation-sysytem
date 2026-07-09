// ========== Front Desk Management System ==========

let currentTab = 'checkin';
let pendingCheckIn = { reservation: null, room: null };
let pendingCheckOut = { room: null, reservation: null };

// ----- Initialization -----
document.addEventListener('DOMContentLoaded', () => {
  HotelData.init();
  bindEvents();
  updateDashboard();
});

function bindEvents() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Check-in
  document.getElementById('checkin-search-btn').addEventListener('click', searchCheckIn);
  document.getElementById('checkin-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchCheckIn();
  });
  document.getElementById('checkin-confirm-btn').addEventListener('click', confirmCheckIn);
  document.getElementById('checkin-reset-btn').addEventListener('click', resetCheckIn);

  // Check-out
  document.getElementById('checkout-search-btn').addEventListener('click', searchCheckOut);
  document.getElementById('checkout-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchCheckOut();
  });
  document.getElementById('checkout-confirm-btn').addEventListener('click', confirmCheckOut);
  document.getElementById('checkout-reset-btn').addEventListener('click', resetCheckOut);
}

// ----- Tab Switching -----
function switchTab(tab) {
  currentTab = tab;

  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // Slide the tab indicator
  const switcher = document.querySelector('.tab-switcher');
  switcher.classList.toggle('checkout-active', tab === 'checkout');

  // Show/hide panels
  document.querySelectorAll('.fd-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  document.getElementById(`panel-${tab}`).classList.add('active');

  // Clear states when switching
  if (tab === 'checkin') {
    resetCheckIn();
  } else {
    resetCheckOut();
  }
}

// ========== CHECK-IN ==========

function searchCheckIn() {
  const input = document.getElementById('checkin-input');
  const reservationNum = input.value.trim().toUpperCase();

  // Clear previous results
  hideElement('checkin-alert');
  hideElement('checkin-result');
  hideElement('checkin-success');

  if (!reservationNum) {
    showFdAlert('checkin-alert', 'error', '予約番号を入力してください。');
    return;
  }

  // Search reservation
  const reservation = HotelData.findReservation(reservationNum);

  if (!reservation) {
    showFdAlert('checkin-alert', 'error', '予約番号「' + reservationNum + '」は見つかりませんでした。予約番号をご確認ください。');
    return;
  }

  // Check if already checked in
  if (reservation.status === 'checked-in') {
    showFdAlert('checkin-alert', 'warning',
      '既にチェックイン済みです。（部屋番号: ' + reservation.assignedRoom + '）');
    return;
  }

  // Check if already checked out
  if (reservation.status === 'checked-out') {
    showFdAlert('checkin-alert', 'warning', 'この予約は既にチェックアウト済みです。');
    return;
  }

  // Validate check-in date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate = new Date(reservation.checkIn);
  checkInDate.setHours(0, 0, 0, 0);
  const checkOutDate = new Date(reservation.checkOut);
  checkOutDate.setHours(0, 0, 0, 0);

  if (today < checkInDate) {
    showFdAlert('checkin-alert', 'error',
      'チェックイン日は ' + HotelData.formatDateJP(checkInDate) + ' です。本日はチェックインできません。');
    return;
  }

  if (today >= checkOutDate) {
    showFdAlert('checkin-alert', 'error',
      'チェックアウト日（' + HotelData.formatDateJP(checkOutDate) + '）を過ぎています。この予約ではチェックインできません。');
    return;
  }

  // Find available room of the correct type
  const availableRoom = HotelData.getAvailableRoomByType(reservation.roomType);

  if (!availableRoom) {
    showFdAlert('checkin-alert', 'error',
      '申し訳ございません。' + reservation.roomTypeName + 'の空室が現在ございません。');
    return;
  }

  // Store pending data
  pendingCheckIn = { reservation, room: availableRoom };

  // Render check-in result
  renderCheckInResult(reservation, availableRoom);
}

function renderCheckInResult(reservation, room) {
  const container = document.getElementById('checkin-result-content');

  container.innerHTML = `
    <div class="result-header">
      <div class="result-header-icon">👤</div>
      <div class="result-header-text">
        <h3>${reservation.guestInfo.name} 様</h3>
        <p>${reservation.guestInfo.nameKana}</p>
      </div>
    </div>

    <div class="room-key-card">
      <div class="key-card-stars">★ ★ ★ ★ ★</div>
      <div class="key-card-room-number">${room.number}</div>
      <div class="key-card-room-type">${room.typeName}</div>
      <div class="key-card-divider"></div>
      <div class="key-card-hotel">Grand Azure Hotel</div>
    </div>

    <div class="result-details">
      <div class="result-row">
        <span class="result-label">予約番号</span>
        <span class="result-value">${reservation.reservationNumber}</span>
      </div>
      <div class="result-row">
        <span class="result-label">チェックイン</span>
        <span class="result-value">${HotelData.formatDateJP(reservation.checkIn)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">チェックアウト</span>
        <span class="result-value">${HotelData.formatDateJP(reservation.checkOut)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">宿泊数</span>
        <span class="result-value">${reservation.nights}泊</span>
      </div>
      <div class="result-row">
        <span class="result-label">宿泊人数</span>
        <span class="result-value">${reservation.guests}名</span>
      </div>
      <div class="result-row">
        <span class="result-label">部屋番号</span>
        <span class="result-value" style="color: var(--color-gold); font-size: 1.1rem;">${room.number}号室</span>
      </div>
    </div>
  `;

  showElement('checkin-result');
}

function confirmCheckIn() {
  const { reservation, room } = pendingCheckIn;
  if (!reservation || !room) return;

  // Record room as occupied (step 5: 部屋を使用中として記録)
  HotelData.checkInRoom(room.number, reservation.reservationNumber, reservation.guestInfo.name);

  // Update reservation status
  HotelData.updateReservation(reservation.reservationNumber, {
    status: 'checked-in',
    assignedRoom: room.number,
    checkedInAt: new Date().toISOString()
  });

  // Hide result, show success
  hideElement('checkin-result');

  const successContent = document.getElementById('checkin-success-content');
  successContent.innerHTML = `
    <div class="success-summary">
      <div class="success-summary-row">
        <span class="success-summary-label">お客様名</span>
        <span class="success-summary-value">${reservation.guestInfo.name} 様</span>
      </div>
      <div class="success-summary-row">
        <span class="success-summary-label">部屋番号</span>
        <span class="success-summary-value" style="color: var(--color-gold); font-size: 1.1rem;">${room.number}号室</span>
      </div>
      <div class="success-summary-row">
        <span class="success-summary-label">客室タイプ</span>
        <span class="success-summary-value">${room.typeName}</span>
      </div>
      <div class="success-summary-row">
        <span class="success-summary-label">チェックイン日時</span>
        <span class="success-summary-value">${HotelData.formatDateTimeJP(new Date())}</span>
      </div>
      <div class="success-summary-row">
        <span class="success-summary-label">チェックアウト予定</span>
        <span class="success-summary-value">${HotelData.formatDateJP(reservation.checkOut)}</span>
      </div>
    </div>
  `;

  showElement('checkin-success');
  updateDashboard();

  // Clear pending
  pendingCheckIn = { reservation: null, room: null };
}

function resetCheckIn() {
  document.getElementById('checkin-input').value = '';
  hideElement('checkin-alert');
  hideElement('checkin-result');
  hideElement('checkin-success');
  pendingCheckIn = { reservation: null, room: null };
}

// ========== CHECK-OUT ==========

function searchCheckOut() {
  const input = document.getElementById('checkout-input');
  const roomNum = input.value.trim();

  // Clear previous results
  hideElement('checkout-alert');
  hideElement('checkout-result');
  hideElement('checkout-success');

  if (!roomNum) {
    showFdAlert('checkout-alert', 'error', '部屋番号を入力してください。');
    return;
  }

  // Check if room exists
  const room = HotelData.getRoom(roomNum);

  if (!room) {
    showFdAlert('checkout-alert', 'error',
      '部屋番号「' + roomNum + '」は存在しません。部屋番号をご確認ください。');
    return;
  }

  // Check if room is occupied
  if (room.status !== 'occupied') {
    showFdAlert('checkout-alert', 'warning',
      '部屋番号「' + roomNum + '」は現在使用されていません。');
    return;
  }

  // Get associated reservation
  const reservation = HotelData.findReservation(room.reservationNumber);

  if (!reservation) {
    showFdAlert('checkout-alert', 'error', '関連する予約情報が見つかりません。');
    return;
  }

  // Store pending data
  pendingCheckOut = { room, reservation };

  // Render check-out result
  renderCheckOutResult(room, reservation);
}

function renderCheckOutResult(room, reservation) {
  const now = new Date();
  const container = document.getElementById('checkout-result-content');

  container.innerHTML = `
    <div class="result-header">
      <div class="result-header-icon">👤</div>
      <div class="result-header-text">
        <h3>${reservation.guestInfo.name} 様</h3>
        <p>部屋番号: ${room.number}号室（${room.typeName}）</p>
      </div>
    </div>

    <div class="result-details">
      <div class="result-row">
        <span class="result-label">予約番号</span>
        <span class="result-value">${reservation.reservationNumber}</span>
      </div>
      <div class="result-row">
        <span class="result-label">チェックイン日時</span>
        <span class="result-value">${HotelData.formatDateTimeJP(room.checkedInAt)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">チェックアウト日時</span>
        <span class="result-value" style="color: var(--color-gold);">${HotelData.formatDateTimeJP(now)}</span>
      </div>
      <div class="result-row">
        <span class="result-label">宿泊数</span>
        <span class="result-value">${reservation.nights}泊</span>
      </div>
    </div>

    <div class="charge-box">
      <span class="charge-box-label">ご請求金額</span>
      <span class="charge-box-amount">
        ¥${reservation.totalPrice.toLocaleString()}
        <span class="tax-note">税・サービス料込み</span>
      </span>
    </div>
  `;

  showElement('checkout-result');
}

function confirmCheckOut() {
  const { room, reservation } = pendingCheckOut;
  if (!room || !reservation) return;

  const now = new Date();

  // Free up room (step 4: 部屋番号が開いたことを記録)
  HotelData.checkOutRoom(room.number);

  // Update reservation status
  HotelData.updateReservation(reservation.reservationNumber, {
    status: 'checked-out',
    checkedOutAt: now.toISOString()
  });

  // Hide result, show success
  hideElement('checkout-result');

  const successContent = document.getElementById('checkout-success-content');
  successContent.innerHTML = `
    <div class="success-summary">
      <div class="success-summary-row">
        <span class="success-summary-label">お客様名</span>
        <span class="success-summary-value">${reservation.guestInfo.name} 様</span>
      </div>
      <div class="success-summary-row">
        <span class="success-summary-label">部屋番号</span>
        <span class="success-summary-value">${room.number}号室</span>
      </div>
      <div class="success-summary-row">
        <span class="success-summary-label">チェックアウト日時</span>
        <span class="success-summary-value">${HotelData.formatDateTimeJP(now)}</span>
      </div>
    </div>

    <div class="charge-box">
      <span class="charge-box-label">お支払い金額</span>
      <span class="charge-box-amount">
        ¥${reservation.totalPrice.toLocaleString()}
        <span class="tax-note">税・サービス料込み</span>
      </span>
    </div>
  `;

  showElement('checkout-success');
  updateDashboard();

  // Clear pending
  pendingCheckOut = { room: null, reservation: null };
}

function resetCheckOut() {
  document.getElementById('checkout-input').value = '';
  hideElement('checkout-alert');
  hideElement('checkout-result');
  hideElement('checkout-success');
  pendingCheckOut = { room: null, reservation: null };
}

// ========== Dashboard ==========

function updateDashboard() {
  const stats = HotelData.getRoomStats();
  const todayCheckIns = HotelData.getTodayCheckIns();

  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-available').textContent = stats.available;
  document.getElementById('stat-occupied').textContent = stats.occupied;
  document.getElementById('stat-today').textContent = todayCheckIns;

  renderRoomGrid();
}

// ========== Room Status Grid ==========

function toggleRoomPanel() {
  const wrapper = document.getElementById('room-status-wrapper');
  const toggle = document.getElementById('room-status-toggle');
  const isOpen = wrapper.style.display !== 'none';

  if (isOpen) {
    wrapper.style.display = 'none';
    toggle.classList.remove('open');
  } else {
    wrapper.style.display = 'block';
    toggle.classList.add('open');
    renderRoomGrid();
  }
}

function renderRoomGrid() {
  const container = document.getElementById('room-status-grid');
  const rooms = HotelData.getRooms();
  const definitions = HotelData.getRoomDefinitions();

  let html = '';

  for (const [type, def] of Object.entries(definitions)) {
    html += `<div class="room-type-group">`;
    html += `<div class="room-type-title">${def.name}</div>`;
    html += `<div class="room-tiles">`;

    for (const roomNum of def.rooms) {
      const room = rooms[roomNum];
      if (!room) continue;

      const isOccupied = room.status === 'occupied';
      const statusClass = isOccupied ? 'occupied' : 'available';
      const statusText = isOccupied ? '使用中' : '空室';
      const guestAttr = isOccupied && room.guestName ? ` data-guest="${room.guestName} 様"` : '';

      html += `<div class="room-tile ${statusClass}"${guestAttr}>`;
      html += `${roomNum}`;
      html += `<span class="room-tile-status">${statusText}</span>`;
      if (isOccupied && room.guestName) {
        html += `<span class="room-tile-guest">${room.guestName}</span>`;
      }
      html += `</div>`;
    }

    html += `</div></div>`;
  }

  container.innerHTML = html;
}

// ========== UI Helpers ==========

function showFdAlert(id, type, message) {
  const el = document.getElementById(id);
  el.className = 'fd-alert visible ' + type;
  el.querySelector('.alert-text').textContent = message;
}

function showElement(id) {
  document.getElementById(id).classList.add('visible');
}

function hideElement(id) {
  document.getElementById(id).classList.remove('visible');
}
