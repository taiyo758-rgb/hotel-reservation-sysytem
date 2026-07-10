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
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
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
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
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
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
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
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    type: 'executive-suite',
    name: 'グランド・アジュール・フロア プレミアスイート',
    price: 75000,
    capacity: 4,
    size: '95㎡',
    bed: 'キングベッド × 2',
    floor: '19F〜20F（最上階）',
    amenities: ['Wi-Fi', 'エアコン', 'ミニバー', 'バスローブ', 'レインシャワー', 'ジャグジー', 'ラウンジアクセス', 'バトラーサービス', 'セーフティボックス', 'パノラマビュー', 'ネスプレッソ', 'ボーズサウンドシステム'],
    description: '最高級の寛ぎと圧巻のパノラマビュー。最上階で唯一無二の滞在をお約束します。',
    totalRooms: 1,
    available: 1,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }
];

// ----- Application State -----
let currentStep = 1;
const totalSteps = 5;

let booking = {
  checkIn: null,
  checkOut: null,
  nights: 0,
  guests: 2,
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
  bindEvents();
});

function initDateInputs() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

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
  // Search widget button
  document.getElementById('search-rooms-btn').addEventListener('click', searchRooms);
  
  // Back to home
  const backHomeBtn = document.getElementById('back-to-home-btn');
  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', resetBooking);
  }
}

// ----- Alert Helpers -----
function showAlert(id, message) {
  const el = document.getElementById(id);
  if (!el) {
    const container = document.getElementById('alert-container');
    container.textContent = message;
    container.className = 'alert alert-error visible';
    return;
  }
  el.textContent = message;
  el.classList.add('visible');
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (!el) {
    document.getElementById('alert-container').classList.remove('visible');
    return;
  }
  el.classList.remove('visible');
}

function showFormError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('visible');
}

function hideFormError(id) {
  document.getElementById(id).classList.remove('visible');
}

// ----- Flow Navigation -----
function goToStep(step) {
  // Hide all steps
  document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
  
  // Show target step
  const target = document.getElementById(`step-${step}`);
  if (target) {
    target.classList.add('active');
  }
  
  // Update progress
  document.querySelectorAll('.progress-step').forEach((el, index) => {
    if (index < step - 1) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
  
  window.scrollTo({ top: document.getElementById('booking-flow-container').offsetTop - 80, behavior: 'smooth' });
}

// ----- Step 1: Search Rooms -----
function searchRooms() {
  const checkIn = document.getElementById('check-in-date').value;
  const checkOut = document.getElementById('check-out-date').value;
  const guestsSelect = document.getElementById('guest-count');
  const guests = guestsSelect ? parseInt(guestsSelect.value) : 2;

  // Validate
  if (!checkIn || !checkOut) {
    showAlert('alert-container', 'チェックイン日とチェックアウト日を入力してください。');
    return;
  }

  const ciDate = new Date(checkIn);
  const coDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (ciDate < today) {
    showAlert('alert-container', '過去の日付は選択できません。');
    return;
  }

  if (coDate <= ciDate) {
    showAlert('alert-container', 'チェックアウト日はチェックイン日より後の日付を選択してください。');
    return;
  }

  hideAlert('alert-container');

  // Calculate nights
  const nights = Math.ceil((coDate - ciDate) / (1000 * 60 * 60 * 24));

  // Save booking info
  booking.checkIn = ciDate;
  booking.checkOut = coDate;
  booking.nights = nights;
  booking.guests = guests;
  booking.selectedRoom = null;

  // Sync with HotelData
  const sharedRooms = HotelData.getRooms();
  const roomDefs = HotelData.getRoomDefinitions();
  
  roomsData.forEach(r => {
    let availCount = 0;
    const typeDef = roomDefs[r.type];
    if (typeDef) {
      typeDef.rooms.forEach(roomNum => {
        if (sharedRooms[roomNum] && sharedRooms[roomNum].status === 'available') {
          availCount++;
        }
      });
    }
    r.available = availCount;
  });

  // Switch UI view
  document.getElementById('hero-section').style.display = 'none';
  document.getElementById('home-content-wrapper').style.display = 'none';
  
  const flowContainer = document.getElementById('booking-flow-container');
  flowContainer.classList.add('active');
  
  renderRooms();
  goToStep(2);
}

// ----- Step 2: Render Rooms -----
function renderRooms() {
  const container = document.getElementById('room-list-container');
  container.innerHTML = '';

  const suitableRooms = roomsData.filter(r => r.capacity >= booking.guests);

  if (suitableRooms.length === 0) {
    container.innerHTML = `<div class="alert alert-warning visible">申し訳ありません。ご指定の人数（${booking.guests}名）で宿泊可能な部屋がありません。</div>`;
    return;
  }

  suitableRooms.forEach(room => {
    const isAvailable = room.available > 0;
    const isLowAvail = room.available > 0 && room.available <= 2;
    
    if (!isAvailable) return; // Hide unavailable for now

    const card = document.createElement('div');
    card.className = 'room-list-item';
    if (!isAvailable) card.classList.add('unavailable');

    card.innerHTML = `
      <div class="room-item-img">
        <img src="${room.image}" alt="${room.name}">
      </div>
      <div class="room-item-content">
        <h3 class="room-item-name">${room.name}</h3>
        <p class="room-item-desc">${room.description}</p>
        <div class="room-item-meta">
          <span>広さ: ${room.size}</span>
          <span>ベッド: ${room.bed}</span>
          <span>定員: ${room.capacity}名</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 10px;">
          ${room.amenities.slice(0, 5).join(' / ')}...
        </div>
        <div class="room-item-footer">
          <div style="color: ${isLowAvail ? 'var(--color-error)' : 'var(--color-text-secondary)'}; font-size: 0.85rem;">
            ${isLowAvail ? `残りわずか (${room.available}室)` : `空室あり`}
          </div>
          <div class="room-item-price">
            ¥${room.price.toLocaleString()} <span>/ 泊</span>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.room-list-item').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      booking.selectedRoom = roomsData.find(r => r.id === room.id);
      
      const btn = document.getElementById('select-room-btn');
      btn.style.display = 'inline-flex';
      btn.onclick = () => goToStep(3);
    });
    
    container.appendChild(card);
  });
}

// ----- Step 3: Guest Info -----
function submitGuestInfo() {
  const name = document.getElementById('guest-name').value.trim();
  const nameKana = document.getElementById('guest-name-kana').value.trim();
  const email = document.getElementById('guest-email').value.trim();
  const phone = document.getElementById('guest-phone').value.trim();
  const specialRequests = document.getElementById('guest-special').value.trim();

  let hasError = false;

  if (!name) { showFormError('error-name', 'お名前を入力してください'); hasError = true; } 
  else { hideFormError('error-name'); }

  if (!nameKana) { showFormError('error-name-kana', 'フリガナを入力してください'); hasError = true; } 
  else { hideFormError('error-name-kana'); }

  if (!email || !isValidEmail(email)) { showFormError('error-email', '有効なメールアドレスを入力してください'); hasError = true; } 
  else { hideFormError('error-email'); }

  if (!phone || !isValidPhone(phone)) { showFormError('error-phone', '有効な電話番号を入力してください'); hasError = true; } 
  else { hideFormError('error-phone'); }

  if (hasError) {
    const firstError = document.querySelector('.form-error.visible');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  booking.guestInfo = { name, nameKana, email, phone, specialRequests };
  booking.totalPrice = booking.selectedRoom.price * booking.nights;

  renderConfirmation();
  goToStep(4);
}

// ----- Step 4: Confirmation -----
function renderConfirmation() {
  const container = document.getElementById('confirm-details');
  const room = booking.selectedRoom;

  container.innerHTML = `
    <table class="confirm-table">
      <tbody>
        <tr>
          <th>チェックイン</th>
          <td>${formatDateJP(booking.checkIn)} (15:00〜)</td>
        </tr>
        <tr>
          <th>チェックアウト</th>
          <td>${formatDateJP(booking.checkOut)} (〜11:00)</td>
        </tr>
        <tr>
          <th>宿泊数・人数</th>
          <td>${booking.nights}泊 / 大人${booking.guests}名</td>
        </tr>
        <tr>
          <th>客室タイプ</th>
          <td>${room.name}</td>
        </tr>
        <tr>
          <th>お名前</th>
          <td>${booking.guestInfo.name} 様（${booking.guestInfo.nameKana}）</td>
        </tr>
        <tr>
          <th>ご連絡先</th>
          <td>${booking.guestInfo.email} / ${booking.guestInfo.phone}</td>
        </tr>
        ${booking.guestInfo.specialRequests ? `
        <tr>
          <th>リクエスト</th>
          <td>${booking.guestInfo.specialRequests}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>
    
    <div class="confirm-total-box">
      <span class="confirm-total-label">合計金額（${booking.nights}泊・税サ込）</span>
      <span class="confirm-total-price">¥${booking.totalPrice.toLocaleString()}</span>
    </div>
  `;
}

// ----- Step 5: Confirm & Complete -----
function confirmReservation() {
  showSpinner();

  setTimeout(() => {
    booking.reservationNumber = generateReservationNumber();
    booking.bookedAt = new Date();

    const roomIndex = roomsData.findIndex(r => r.id === booking.selectedRoom.id);
    if (roomIndex !== -1) {
      roomsData[roomIndex].available = Math.max(0, roomsData[roomIndex].available - 1);
    }

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

    renderCompletion();
    hideSpinner();
    goToStep(5);

    setTimeout(launchConfetti, 300);
  }, 2000);
}

function renderCompletion() {
  document.getElementById('result-reservation-number').textContent = booking.reservationNumber;

  const detailsContainer = document.getElementById('completion-details');
  detailsContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span style="color: var(--color-text-secondary);">客室タイプ</span>
      <strong>${booking.selectedRoom.name}</strong>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span style="color: var(--color-text-secondary);">ご宿泊日</span>
      <strong>${formatDateJP(booking.checkIn)} 〜 ${formatDateJP(booking.checkOut)} (${booking.nights}泊)</strong>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span style="color: var(--color-text-secondary);">代表者名</span>
      <strong>${booking.guestInfo.name} 様</strong>
    </div>
  `;
}

// ----- Reset -----
function resetBooking() {
  document.getElementById('hero-section').style.display = 'block';
  document.getElementById('home-content-wrapper').style.display = 'block';
  document.getElementById('booking-flow-container').classList.remove('active');
  
  // Clear forms
  document.getElementById('guest-name').value = '';
  document.getElementById('guest-name-kana').value = '';
  document.getElementById('guest-email').value = '';
  document.getElementById('guest-phone').value = '';
  document.getElementById('guest-special').value = '';
  
  booking.selectedRoom = null;
  document.getElementById('select-room-btn').style.display = 'none';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----- Utils -----
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const p = phone.replace(/[-()\s]/g, '');
  return /^[0-9]{10,11}$/.test(p);
}

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

function generateReservationNumber() {
  const prefix = 'GAH';
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

function showSpinner() {
  document.getElementById('spinner-overlay').classList.add('visible');
}

function hideSpinner() {
  document.getElementById('spinner-overlay').classList.remove('visible');
}

function launchConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#8e7343', '#d4af37', '#ffffff']
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#8e7343', '#d4af37', '#ffffff']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

// ========== Cancellation Flow ==========

let cancelTarget = null; // Holds the reservation being cancelled

// Bind cancel modal events after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Open modal (booking widget link)
  document.getElementById('open-cancel-modal').addEventListener('click', (e) => {
    e.preventDefault();
    openCancelModal();
  });

  // Open modal (nav link)
  const navCancelLink = document.getElementById('nav-cancel-link');
  if (navCancelLink) {
    navCancelLink.addEventListener('click', (e) => {
      e.preventDefault();
      openCancelModal();
    });
  }

  // Open modal (footer link)
  const footerCancelLink = document.getElementById('footer-cancel-link');
  if (footerCancelLink) {
    footerCancelLink.addEventListener('click', (e) => {
      e.preventDefault();
      openCancelModal();
    });
  }

  // Close modal
  document.getElementById('close-cancel-modal').addEventListener('click', closeCancelModal);
  document.getElementById('cancel-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCancelModal();
  });

  // Search
  document.getElementById('cancel-search-btn').addEventListener('click', cancelSearchReservation);

  // Enter key on input
  document.getElementById('cancel-reservation-number').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') cancelSearchReservation();
  });

  // Back button
  document.getElementById('cancel-back-btn').addEventListener('click', () => {
    document.getElementById('cancel-step-2').style.display = 'none';
    document.getElementById('cancel-step-1').style.display = 'block';
    cancelTarget = null;
  });

  // Confirm cancel
  document.getElementById('cancel-confirm-btn').addEventListener('click', executeCancellation);

  // Done button
  document.getElementById('cancel-done-btn').addEventListener('click', closeCancelModal);
});

function openCancelModal() {
  // Reset to step 1
  document.getElementById('cancel-step-1').style.display = 'block';
  document.getElementById('cancel-step-2').style.display = 'none';
  document.getElementById('cancel-step-3').style.display = 'none';
  document.getElementById('cancel-reservation-number').value = '';
  document.getElementById('cancel-alert').classList.remove('visible');
  cancelTarget = null;

  document.getElementById('cancel-modal').classList.add('visible');
}

function closeCancelModal() {
  document.getElementById('cancel-modal').classList.remove('visible');
  cancelTarget = null;
}

function cancelSearchReservation() {
  const input = document.getElementById('cancel-reservation-number').value.trim();
  const alertEl = document.getElementById('cancel-alert');

  if (!input) {
    alertEl.textContent = '予約番号を入力してください。';
    alertEl.className = 'alert alert-error visible';
    return;
  }

  const reservation = HotelData.findReservation(input);

  if (!reservation) {
    alertEl.textContent = '入力された予約番号は見つかりません。予約番号をご確認ください。';
    alertEl.className = 'alert alert-error visible';
    return;
  }

  if (reservation.status === 'cancelled') {
    alertEl.textContent = 'この予約は既にキャンセル済みです。';
    alertEl.className = 'alert alert-warning visible';
    return;
  }

  if (reservation.status === 'checked-in') {
    alertEl.textContent = 'この予約は既にチェックイン済みのため、キャンセルできません。';
    alertEl.className = 'alert alert-warning visible';
    return;
  }

  alertEl.classList.remove('visible');
  cancelTarget = reservation;

  // Render details
  const detailsEl = document.getElementById('cancel-reservation-details');
  const statusLabel = getStatusLabel(reservation.status);

  detailsEl.innerHTML = `
    <div class="cancel-detail-row">
      <span class="cancel-detail-label">予約番号</span>
      <span class="cancel-detail-value">${reservation.reservationNumber}</span>
    </div>
    <div class="cancel-detail-row">
      <span class="cancel-detail-label">ステータス</span>
      <span class="cancel-detail-value"><span class="cancel-status-badge ${reservation.status}">${statusLabel}</span></span>
    </div>
    <div class="cancel-detail-row">
      <span class="cancel-detail-label">お名前</span>
      <span class="cancel-detail-value">${reservation.guestInfo.name} 様</span>
    </div>
    <div class="cancel-detail-row">
      <span class="cancel-detail-label">客室タイプ</span>
      <span class="cancel-detail-value">${reservation.roomTypeName}</span>
    </div>
    <div class="cancel-detail-row">
      <span class="cancel-detail-label">チェックイン</span>
      <span class="cancel-detail-value">${formatDateJP(new Date(reservation.checkIn))}</span>
    </div>
    <div class="cancel-detail-row">
      <span class="cancel-detail-label">チェックアウト</span>
      <span class="cancel-detail-value">${formatDateJP(new Date(reservation.checkOut))}</span>
    </div>
    <div class="cancel-detail-row">
      <span class="cancel-detail-label">合計金額</span>
      <span class="cancel-detail-value" style="font-size: 1.1rem; color: var(--color-gold);">¥${reservation.totalPrice.toLocaleString()}</span>
    </div>
  `;

  // Show step 2
  document.getElementById('cancel-step-1').style.display = 'none';
  document.getElementById('cancel-step-2').style.display = 'block';
}

function executeCancellation() {
  if (!cancelTarget) return;

  // 1. Update reservation status to 'cancelled'
  HotelData.updateReservation(cancelTarget.reservationNumber, {
    status: 'cancelled',
    cancelledAt: new Date().toISOString()
  });

  // 2. Increase room availability (空室を一つ増やす)
  const roomType = cancelTarget.roomType;
  const roomIndex = roomsData.findIndex(r => r.type === roomType);
  if (roomIndex !== -1) {
    roomsData[roomIndex].available = Math.min(
      roomsData[roomIndex].totalRooms,
      roomsData[roomIndex].available + 1
    );
  }

  // 3. Show completion
  document.getElementById('cancel-complete-number').textContent = cancelTarget.reservationNumber;
  document.getElementById('cancel-step-2').style.display = 'none';
  document.getElementById('cancel-step-3').style.display = 'block';

  cancelTarget = null;
}

function getStatusLabel(status) {
  switch (status) {
    case 'reserved': return '予約済み';
    case 'checked-in': return 'チェックイン済み';
    case 'checked-out': return 'チェックアウト済み';
    case 'cancelled': return 'キャンセル済み';
    default: return status;
  }
}
