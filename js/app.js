// ========== Hotel Reservation System ==========

// ----- Room Data -----
const roomsData = [
  {
    id: 1,
    type: 'deluxe-single',
    name: 'デラックスシングル',
    price: 15000,
    capacity: 1,
    size: '22㎡',
    bed: 'シングルベッド × 1',
    floor: '3F〜6F',
    amenities: ['Wi-Fi', 'エアコン', 'ミニバー', 'セーフティボックス', '液晶TV'],
    description: '機能的で快適なシングルルーム。ビジネスや一人旅に最適な空間をご提供します。',
    totalRooms: 8,
    available: 8,
    icon: '🏙️',
    gradient: 'linear-gradient(135deg, #2d3561 0%, #1e2243 50%, #0f1632 100%)'
  },
  {
    id: 2,
    type: 'superior-twin',
    name: 'スーペリアツイン',
    price: 22000,
    capacity: 2,
    size: '32㎡',
    bed: 'シングルベッド × 2',
    floor: '5F〜10F',
    amenities: ['Wi-Fi', 'エアコン', 'ミニバー', 'バスローブ', 'セーフティボックス', '液晶TV', 'デスク'],
    description: 'ゆとりのあるツインルーム。ご友人やご家族との快適な滞在をお楽しみください。',
    totalRooms: 6,
    available: 6,
    icon: '🌿',
    gradient: 'linear-gradient(135deg, #1a3a2a 0%, #122b1e 50%, #0a1f14 100%)'
  },
  {
    id: 3,
    type: 'premium-double',
    name: 'プレミアムダブル',
    price: 28000,
    capacity: 2,
    size: '38㎡',
    bed: 'キングベッド × 1',
    floor: '8F〜15F',
    amenities: ['Wi-Fi', 'エアコン', 'ミニバー', 'バスローブ', 'レインシャワー', 'セーフティボックス', '液晶TV', 'Bluetoothスピーカー'],
    description: '上質な空間でお二人の特別なひとときを。高層階からの眺望もお楽しみいただけます。',
    totalRooms: 4,
    available: 4,
    icon: '✨',
    gradient: 'linear-gradient(135deg, #2a1a3a 0%, #1e1230 50%, #130a22 100%)'
  },
  {
    id: 4,
    type: 'royal-suite',
    name: 'ロイヤルスイート',
    price: 50000,
    capacity: 3,
    size: '65㎡',
    bed: 'キングベッド × 1 + ソファベッド',
    floor: '15F〜18F',
    amenities: ['Wi-Fi', 'エアコン', 'ミニバー', 'バスローブ', 'レインシャワー', 'ジャグジー', 'ラウンジアクセス', 'セーフティボックス', 'ネスプレッソ', 'ターンダウンサービス'],
    description: 'リビングスペース付きの贅沢なスイートルーム。特別な日にふさわしい空間です。',
    totalRooms: 2,
    available: 2,
    icon: '👑',
    gradient: 'linear-gradient(135deg, #3a2a1a 0%, #2e1f10 50%, #1f1408 100%)'
  },
  {
    id: 5,
    type: 'executive-suite',
    name: 'エグゼクティブスイート',
    price: 75000,
    capacity: 4,
    size: '95㎡',
    bed: 'キングベッド × 2',
    floor: '19F〜20F（最上階）',
    amenities: ['Wi-Fi', 'エアコン', 'ミニバー', 'バスローブ', 'レインシャワー', 'ジャグジー', 'ラウンジアクセス', 'バトラーサービス', 'セーフティボックス', 'パノラマビュー', 'ネスプレッソ', 'ボーズサウンドシステム'],
    description: '最高級の寛ぎと圧巻のパノラマビュー。最上階で唯一無二の滞在をお約束します。',
    totalRooms: 1,
    available: 1,
    icon: '🌟',
    gradient: 'linear-gradient(135deg, #1a1a3a 0%, #1e0a30 50%, #160822 100%)'
  }
];

// ----- Application State -----
let currentStep = 1;
const totalSteps = 5;

let booking = {
  checkIn: null,
  checkOut: null,
  nights: 0,
  guests: 1,
  selectedRoom: null,
  guestInfo: {
    name: '',
    nameKana: '',
    email: '',
    phone: '',
    specialRequests: ''
  },
  reservationNumber: '',
  totalPrice: 0,
  bookedAt: null
};

// ----- Initialization -----
document.addEventListener('DOMContentLoaded', () => {
  HotelData.init();
  initDateInputs();
  updateProgressBar();
  bindEvents();
});

function initDateInputs() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const checkInInput = document.getElementById('check-in-date');
  const checkOutInput = document.getElementById('check-out-date');

  checkInInput.min = formatDateISO(today);
  checkInInput.value = formatDateISO(today);
  checkOutInput.min = formatDateISO(tomorrow);
  checkOutInput.value = formatDateISO(tomorrow);

  checkInInput.addEventListener('change', () => {
    const ciDate = new Date(checkInInput.value);
    const nextDay = new Date(ciDate);
    nextDay.setDate(nextDay.getDate() + 1);
    checkOutInput.min = formatDateISO(nextDay);
    if (new Date(checkOutInput.value) <= ciDate) {
      checkOutInput.value = formatDateISO(nextDay);
    }
  });
}

function bindEvents() {
  // Step 1: Search rooms
  document.getElementById('search-rooms-btn').addEventListener('click', searchRooms);

  // Step 3: Submit guest info
  document.getElementById('submit-guest-info-btn').addEventListener('click', submitGuestInfo);

  // Step 4: Confirm reservation
  document.getElementById('confirm-reservation-btn').addEventListener('click', confirmReservation);

  // Step 5: New reservation
  document.getElementById('new-reservation-btn').addEventListener('click', resetReservation);

  // Back buttons
  document.querySelectorAll('[data-back-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.dataset.backStep);
      goToStep(step);
    });
  });
}

// ----- Step Navigation -----
function goToStep(step) {
  if (step < 1 || step > totalSteps) return;

  // Hide current step
  const currentEl = document.querySelector(`.step-content.active`);
  if (currentEl) {
    currentEl.classList.remove('active');
  }

  currentStep = step;

  // Show new step
  const nextEl = document.getElementById(`step-${step}`);
  if (nextEl) {
    nextEl.classList.remove('active');
    // Force reflow for animation
    void nextEl.offsetWidth;
    nextEl.classList.add('active');
  }

  updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgressBar() {
  const indicators = document.querySelectorAll('.step-indicator');
  const progressLine = document.querySelector('.progress-line');
  const totalWidth = document.querySelector('.progress-bar').offsetWidth - 80; // subtract padding

  indicators.forEach((indicator, index) => {
    const stepNum = index + 1;
    indicator.classList.remove('active', 'completed');

    if (stepNum < currentStep) {
      indicator.classList.add('completed');
      indicator.querySelector('.step-dot').innerHTML = '✓';
    } else if (stepNum === currentStep) {
      indicator.classList.add('active');
      indicator.querySelector('.step-dot').textContent = stepNum;
    } else {
      indicator.querySelector('.step-dot').textContent = stepNum;
    }
  });

  // Update progress line width
  const progress = ((currentStep - 1) / (totalSteps - 1)) * totalWidth;
  progressLine.style.width = `${progress}px`;
}

// ----- Step 1: Search Rooms -----
function searchRooms() {
  const checkIn = document.getElementById('check-in-date').value;
  const checkOut = document.getElementById('check-out-date').value;
  const guests = parseInt(document.getElementById('num-guests').value);

  // Validate
  if (!checkIn || !checkOut) {
    showAlert('date-alert', 'チェックイン日とチェックアウト日を入力してください。');
    return;
  }

  const ciDate = new Date(checkIn);
  const coDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (ciDate < today) {
    showAlert('date-alert', '過去の日付は選択できません。');
    return;
  }

  if (coDate <= ciDate) {
    showAlert('date-alert', 'チェックアウト日はチェックイン日より後の日付を選択してください。');
    return;
  }

  hideAlert('date-alert');

  // Calculate nights
  const nights = Math.ceil((coDate - ciDate) / (1000 * 60 * 60 * 24));

  // Save booking info
  booking.checkIn = ciDate;
  booking.checkOut = coDate;
  booking.nights = nights;
  booking.guests = guests;

  // Show loading
  showSpinner('空室を検索しています...');

  setTimeout(() => {
    hideSpinner();

    // Filter available rooms by capacity and availability
    const availableRooms = roomsData.filter(room => room.available > 0 && room.capacity >= guests);

    if (availableRooms.length === 0) {
      // Show warning and stay on step 1
      showNoRoomsWarning();
    } else {
      // Render rooms and go to step 2
      renderRooms(availableRooms);
      goToStep(2);
    }
  }, 1200);
}

function showNoRoomsWarning() {
  const warningEl = document.getElementById('no-rooms-warning');
  warningEl.classList.add('visible');

  // Auto-hide after some time
  setTimeout(() => {
    warningEl.classList.remove('visible');
  }, 8000);
}

function renderRooms(rooms) {
  const container = document.getElementById('rooms-container');
  container.innerHTML = '';

  // Update step 2 subtitle with date info
  document.getElementById('room-search-info').textContent =
    `${formatDateJP(booking.checkIn)} 〜 ${formatDateJP(booking.checkOut)}（${booking.nights}泊） / ${booking.guests}名様`;

  rooms.forEach(room => {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.dataset.roomId = room.id;

    const isLowAvail = room.available <= 2;

    card.innerHTML = `
      <div class="room-selected-badge">選択中</div>
      <div class="room-card-visual" style="background: ${room.gradient}">
        <span class="room-icon">${room.icon}</span>
      </div>
      <div class="room-card-body">
        <div class="room-card-name">${room.name}</div>
        <div class="room-card-desc">${room.description}</div>
        <div class="room-card-meta">
          <span class="room-meta-item"><span class="meta-icon">📐</span> ${room.size}</span>
          <span class="room-meta-item"><span class="meta-icon">🛏️</span> ${room.bed}</span>
          <span class="room-meta-item"><span class="meta-icon">🏢</span> ${room.floor}</span>
          <span class="room-meta-item"><span class="meta-icon">👤</span> 定員${room.capacity}名</span>
        </div>
        <div class="room-card-amenities">
          ${room.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}
        </div>
        <div class="room-card-footer">
          <div>
            <div class="room-price">¥${room.price.toLocaleString()} <span class="price-unit">/ 泊</span></div>
          </div>
          <div class="room-avail ${isLowAvail ? 'low' : ''}">
            ${isLowAvail ? '⚠ ' : ''}残り${room.available}室
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => selectRoom(room.id, card));
    container.appendChild(card);
  });
}

function selectRoom(roomId, cardEl) {
  // Deselect all
  document.querySelectorAll('.room-card').forEach(c => c.classList.remove('selected'));

  // Select this one
  cardEl.classList.add('selected');
  booking.selectedRoom = roomsData.find(r => r.id === roomId);

  // Enable next button
  document.getElementById('select-room-btn').style.display = 'inline-flex';
  document.getElementById('select-room-btn').onclick = () => goToStep(3);
}

// ----- Step 3: Guest Info -----
function submitGuestInfo() {
  const name = document.getElementById('guest-name').value.trim();
  const nameKana = document.getElementById('guest-name-kana').value.trim();
  const email = document.getElementById('guest-email').value.trim();
  const phone = document.getElementById('guest-phone').value.trim();
  const specialRequests = document.getElementById('guest-special').value.trim();

  // Validate
  let hasError = false;

  if (!name) {
    showFormError('error-name', 'お名前を入力してください');
    hasError = true;
  } else {
    hideFormError('error-name');
  }

  if (!nameKana) {
    showFormError('error-name-kana', 'フリガナを入力してください');
    hasError = true;
  } else {
    hideFormError('error-name-kana');
  }

  if (!email || !isValidEmail(email)) {
    showFormError('error-email', '有効なメールアドレスを入力してください');
    hasError = true;
  } else {
    hideFormError('error-email');
  }

  if (!phone || !isValidPhone(phone)) {
    showFormError('error-phone', '有効な電話番号を入力してください');
    hasError = true;
  } else {
    hideFormError('error-phone');
  }

  if (hasError) return;

  // Save guest info
  booking.guestInfo = { name, nameKana, email, phone, specialRequests };

  // Calculate total
  booking.totalPrice = booking.selectedRoom.price * booking.nights;

  // Render confirmation
  renderConfirmation();
  goToStep(4);
}

// ----- Step 4: Confirmation -----
function renderConfirmation() {
  const container = document.getElementById('confirm-details');
  const room = booking.selectedRoom;

  container.innerHTML = `
    <div class="confirm-section">
      <div class="confirm-section-title">宿泊情報</div>
      <div class="confirm-row">
        <span class="confirm-label">チェックイン</span>
        <span class="confirm-value">${formatDateJP(booking.checkIn)}</span>
      </div>
      <div class="confirm-row">
        <span class="confirm-label">チェックアウト</span>
        <span class="confirm-value">${formatDateJP(booking.checkOut)}</span>
      </div>
      <div class="confirm-row">
        <span class="confirm-label">宿泊数</span>
        <span class="confirm-value">${booking.nights}泊</span>
      </div>
      <div class="confirm-row">
        <span class="confirm-label">宿泊人数</span>
        <span class="confirm-value">${booking.guests}名</span>
      </div>
    </div>
    <div class="confirm-section">
      <div class="confirm-section-title">客室情報</div>
      <div class="confirm-row">
        <span class="confirm-label">客室タイプ</span>
        <span class="confirm-value">${room.name}</span>
      </div>
      <div class="confirm-row">
        <span class="confirm-label">広さ</span>
        <span class="confirm-value">${room.size}</span>
      </div>
      <div class="confirm-row">
        <span class="confirm-label">ベッド</span>
        <span class="confirm-value">${room.bed}</span>
      </div>
      <div class="confirm-row">
        <span class="confirm-label">1泊料金</span>
        <span class="confirm-value">¥${room.price.toLocaleString()}</span>
      </div>
    </div>
    <div class="confirm-section">
      <div class="confirm-section-title">お客様情報</div>
      <div class="confirm-row">
        <span class="confirm-label">お名前</span>
        <span class="confirm-value">${booking.guestInfo.name}（${booking.guestInfo.nameKana}）</span>
      </div>
      <div class="confirm-row">
        <span class="confirm-label">メールアドレス</span>
        <span class="confirm-value">${booking.guestInfo.email}</span>
      </div>
      <div class="confirm-row">
        <span class="confirm-label">電話番号</span>
        <span class="confirm-value">${booking.guestInfo.phone}</span>
      </div>
      ${booking.guestInfo.specialRequests ? `
      <div class="confirm-row">
        <span class="confirm-label">特別リクエスト</span>
        <span class="confirm-value">${booking.guestInfo.specialRequests}</span>
      </div>
      ` : ''}
    </div>
    <div class="confirm-total">
      <span class="confirm-total-label">合計金額（${booking.nights}泊）</span>
      <span class="confirm-total-price">
        ¥${booking.totalPrice.toLocaleString()}
        <span class="tax-note">税・サービス料込み</span>
      </span>
    </div>
  `;
}

// ----- Step 5: Confirm & Complete -----
function confirmReservation() {
  showSpinner('予約を処理しています...');

  setTimeout(() => {
    // Generate reservation number
    booking.reservationNumber = generateReservationNumber();
    booking.bookedAt = new Date();

    // Decrease room availability (step 9: 空室を一つ減らす)
    const roomIndex = roomsData.findIndex(r => r.id === booking.selectedRoom.id);
    if (roomIndex !== -1) {
      roomsData[roomIndex].available = Math.max(0, roomsData[roomIndex].available - 1);
    }

    // Save reservation to localStorage (shared with front desk system)
    HotelData.saveReservation({
      reservationNumber: booking.reservationNumber,
      checkIn: booking.checkIn.toISOString(),
      checkOut: booking.checkOut.toISOString(),
      nights: booking.nights,
      guests: booking.guests,
      roomType: booking.selectedRoom.type,
      roomTypeName: booking.selectedRoom.name,
      roomPrice: booking.selectedRoom.price,
      guestInfo: booking.guestInfo,
      totalPrice: booking.totalPrice,
      bookedAt: booking.bookedAt.toISOString(),
      status: 'reserved',
      assignedRoom: null,
      checkedInAt: null,
      checkedOutAt: null
    });

    // Render completion
    renderCompletion();

    hideSpinner();
    goToStep(5);

    // Trigger confetti
    setTimeout(launchConfetti, 300);
  }, 2000);
}

function renderCompletion() {
  document.getElementById('result-reservation-number').textContent = booking.reservationNumber;

  const detailsContainer = document.getElementById('completion-details');
  detailsContainer.innerHTML = `
    <div class="completion-detail-row">
      <span class="completion-detail-label">客室タイプ</span>
      <span class="completion-detail-value">${booking.selectedRoom.name}</span>
    </div>
    <div class="completion-detail-row">
      <span class="completion-detail-label">チェックイン</span>
      <span class="completion-detail-value">${formatDateJP(booking.checkIn)}</span>
    </div>
    <div class="completion-detail-row">
      <span class="completion-detail-label">チェックアウト</span>
      <span class="completion-detail-value">${formatDateJP(booking.checkOut)}</span>
    </div>
    <div class="completion-detail-row">
      <span class="completion-detail-label">宿泊数</span>
      <span class="completion-detail-value">${booking.nights}泊</span>
    </div>
    <div class="completion-detail-row">
      <span class="completion-detail-label">宿泊人数</span>
      <span class="completion-detail-value">${booking.guests}名</span>
    </div>
    <div class="completion-detail-row">
      <span class="completion-detail-label">お名前</span>
      <span class="completion-detail-value">${booking.guestInfo.name} 様</span>
    </div>
    <div class="completion-detail-row">
      <span class="completion-detail-label">予約日時</span>
      <span class="completion-detail-value">${formatDateTimeJP(booking.bookedAt)}</span>
    </div>
    <div class="completion-total-row">
      <span class="completion-detail-label">お支払い金額</span>
      <span class="completion-detail-value">¥${booking.totalPrice.toLocaleString()}</span>
    </div>
  `;
}

// ----- Reset -----
function resetReservation() {
  booking = {
    checkIn: null,
    checkOut: null,
    nights: 0,
    guests: 1,
    selectedRoom: null,
    guestInfo: {
      name: '',
      nameKana: '',
      email: '',
      phone: '',
      specialRequests: ''
    },
    reservationNumber: '',
    totalPrice: 0,
    bookedAt: null
  };

  // Reset form inputs
  document.getElementById('guest-name').value = '';
  document.getElementById('guest-name-kana').value = '';
  document.getElementById('guest-email').value = '';
  document.getElementById('guest-phone').value = '';
  document.getElementById('guest-special').value = '';
  document.getElementById('num-guests').value = '1';

  // Hide select room button
  document.getElementById('select-room-btn').style.display = 'none';

  // Hide alerts
  hideAlert('date-alert');
  document.getElementById('no-rooms-warning').classList.remove('visible');

  // Reset date inputs
  initDateInputs();

  goToStep(1);
}

// ----- Utility Functions -----
function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateJP(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const day = days[date.getDay()];
  return `${y}年${m}月${d}日（${day}）`;
}

function formatDateTimeJP(date) {
  const dateStr = formatDateJP(date);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${dateStr} ${h}:${m}`;
}

function formatCurrency(amount) {
  return `¥${amount.toLocaleString()}`;
}

function generateReservationNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GAH-${datePart}-${randomPart}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[\d\-\+\(\)\s]{8,15}$/.test(phone);
}

// ----- Alert & Error Helpers -----
function showAlert(id, message) {
  const el = document.getElementById(id);
  el.querySelector('.alert-text').textContent = message;
  el.classList.add('visible');
}

function hideAlert(id) {
  document.getElementById(id).classList.remove('visible');
}

function showFormError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.add('visible');
}

function hideFormError(id) {
  const el = document.getElementById(id);
  el.textContent = '';
  el.classList.remove('visible');
}

// ----- Spinner -----
function showSpinner(text) {
  const spinner = document.getElementById('spinner-overlay');
  spinner.querySelector('.spinner-text').textContent = text || '処理中...';
  spinner.classList.add('visible');
}

function hideSpinner() {
  document.getElementById('spinner-overlay').classList.remove('visible');
}

// ----- Confetti -----
function launchConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const colors = ['#c9a84c', '#e0c87a', '#4caf87', '#f5576c', '#667eea', '#fa709a', '#fee140', '#4facfe'];
  const shapes = ['square', 'circle'];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = Math.random() * 8 + 6;

    piece.style.left = `${Math.random() * 100}%`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size}px`;
    piece.style.background = color;
    piece.style.borderRadius = shape === 'circle' ? '50%' : '2px';
    piece.style.animationDuration = `${Math.random() * 2 + 2}s`;
    piece.style.animationDelay = `${Math.random() * 1}s`;

    container.appendChild(piece);
  }

  setTimeout(() => {
    container.remove();
  }, 5000);
}

// ----- Window Resize Handler for Progress Bar -----
window.addEventListener('resize', () => {
  updateProgressBar();
});
