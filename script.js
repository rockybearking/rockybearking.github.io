// ==========================================
// 🌍 1. 세계 시각 및 내비게이션 로직 (기존 유지)
// ==========================================

const cities = [
    { name: 'Seoul', timezone: 'Asia/Seoul', flag: '🇰🇷' },
    { name: 'New York', timezone: 'America/New_York', flag: '🇺🇸' },
    { name: 'Paris', timezone: 'Europe/Paris', flag: '🇫🇷' },
    { name: 'Tokyo', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
    { name: 'London', timezone: 'Europe/London', flag: '🇬🇧' },
    { name: 'Los Angeles', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
    { name: 'Shanghai', timezone: 'Asia/Shanghai', flag: '🇨🇳' }
];

function createClockCard(cityInfo) {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.innerHTML = `
        <div class="clock-header">
            <span class="city-flag">${cityInfo.flag}</span>
            <span class="city-name">${cityInfo.name}</span>
        </div>
        <div class="digital-time" id="time-${cityInfo.name.replace(/\s+/g, '')}">00:00:00</div>
        <div class="ampm-date" id="date-${cityInfo.name.replace(/\s+/g, '')}"></div>
    `;
    return card;
}

function updateClocks() {
    cities.forEach(city => {
        const timeElement = document.getElementById(`time-${city.name.replace(/\s+/g, '')}`);
        const dateElement = document.getElementById(`date-${city.name.replace(/\s+/g, '')}`);
        const now = new Date();
        const optionsTime = { timeZone: city.timezone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const optionsDate = { timeZone: city.timezone, year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
        
        if (timeElement) timeElement.textContent = now.toLocaleTimeString('ko-KR', optionsTime);
        if (dateElement) dateElement.textContent = now.toLocaleDateString('ko-KR', optionsDate);
    });
}

function initWorldClock() {
    const container = document.getElementById('clock-container');
    if (container) {
        cities.forEach(city => container.appendChild(createClockCard(city)));
        updateClocks();
        setInterval(updateClocks, 1000);
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const homeBtn = document.getElementById('home-btn');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = e.target.dataset.section;
            sections.forEach(s => s.classList.remove('active'));
            const targetEl = document.getElementById(`${targetSection}-section`);
            if (targetEl) targetEl.classList.add('active');
            navItems.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            sections.forEach(s => s.classList.remove('active'));
            const homeEl = document.getElementById('home-section');
            if (homeEl) homeEl.classList.add('active');
            navItems.forEach(n => n.classList.remove('active'));
        });
    }
}

// ==========================================
// 🎲 2. 랜덤 돌림판 로직 (심화 기능 추가됨)
// ==========================================
let rouletteItems = [];
let itemIdCounter = 0;
let currentRotation = 0;
let isSpinning = false;      // 현재 돌아가는 중인지 확인
let isDecelerating = false;  // 수동 모드에서 정지 중인지 확인
let spinTimeoutId = null;

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
}

function addRouletteItem() {
    rouletteItems.push({ id: itemIdCounter++, number: 1, count: '', ratio: '', color: getRandomColor(), activeInput: 'none' });
    updateRoulette();
}

function removeRouletteItem(id) {
    rouletteItems = rouletteItems.filter(item => item.id !== id);
    updateRoulette();
}

function handleInput(id, field, value) {
    const item = rouletteItems.find(i => i.id === id);
    if (!item) return;

    if (field === 'number') {
        let val = parseInt(value) || 1;
        if (val < 1) val = 1;
        if (val > 200) val = 200;
        item.number = val;
    } else if (field === 'count') {
        item.count = value === '' ? '' : parseFloat(value);
        if (value !== '') item.activeInput = 'count';
        else if (item.ratio === '') item.activeInput = 'none';
    } else if (field === 'ratio') {
        item.ratio = value === '' ? '' : parseFloat(value);
        if (value !== '') item.activeInput = 'ratio';
        else if (item.count === '') item.activeInput = 'none';
    }
    updateRoulette();
}

function calculateSlices() {
    let totalFixedRatio = 0;
    let totalCount = 0;

    rouletteItems.forEach(item => {
        if (item.activeInput === 'ratio' && item.ratio !== '') totalFixedRatio += parseFloat(item.ratio);
        else if (item.activeInput === 'count' && item.count !== '') totalCount += parseFloat(item.count);
    });

    let remainingRatio = 100 - totalFixedRatio;
    if (remainingRatio < 0) remainingRatio = 0;

    const slices = rouletteItems.map(item => {
        let finalRatio = 0;
        let calculatedRatioStr = item.ratio;

        if (item.activeInput === 'ratio') finalRatio = parseFloat(item.ratio) || 0;
        else if (item.activeInput === 'count') {
            if (totalCount > 0) {
                finalRatio = (parseFloat(item.count) / totalCount) * remainingRatio;
                calculatedRatioStr = finalRatio.toFixed(1);
            }
        } else {
            const emptyItemsCount = rouletteItems.filter(i => i.activeInput === 'none').length;
            if (emptyItemsCount > 0) finalRatio = remainingRatio / emptyItemsCount;
        }
        return { ...item, finalRatio, calculatedRatioStr };
    });

    return slices;
}

function renderInputs(slices) {
    const container = document.getElementById('roulette-inputs');
    if (!container) return;
    container.innerHTML = '';

    slices.forEach(slice => {
        const row = document.createElement('div');
        row.className = 'roulette-item-row';
        
        const numInput = document.createElement('input');
        numInput.type = 'number'; numInput.min = 1; numInput.max = 200; numInput.value = slice.number;
        numInput.onchange = (e) => handleInput(slice.id, 'number', e.target.value);

        const countInput = document.createElement('input');
        countInput.type = 'number'; countInput.placeholder = '개수';
        countInput.value = slice.activeInput === 'count' ? slice.count : '';
        countInput.disabled = slice.activeInput === 'ratio';
        countInput.oninput = (e) => handleInput(slice.id, 'count', e.target.value);

        const ratioInput = document.createElement('input');
        ratioInput.type = 'number'; ratioInput.placeholder = '비율(%)';
        ratioInput.value = slice.activeInput === 'ratio' ? slice.ratio : (slice.activeInput === 'count' ? slice.calculatedRatioStr : '');
        ratioInput.disabled = slice.activeInput === 'count';
        ratioInput.oninput = (e) => handleInput(slice.id, 'ratio', e.target.value);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn'; deleteBtn.innerText = 'X';
        deleteBtn.onclick = () => removeRouletteItem(slice.id);

        row.appendChild(numInput); row.appendChild(countInput); row.appendChild(ratioInput); row.appendChild(deleteBtn);
        container.appendChild(row);
    });
}

function drawCanvas(slices) {
    const canvas = document.getElementById('roulette-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let startAngle = -Math.PI / 2; 

    slices.forEach(slice => {
        const sliceAngle = (slice.finalRatio / 100) * 2 * Math.PI;
        if (sliceAngle <= 0) return;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = slice.color; ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = '#1a1a1a'; ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right'; ctx.fillStyle = '#000'; ctx.font = 'bold 20px "Malgun Gothic"';
        ctx.fillText(slice.number, radius - 30, 8);
        ctx.restore();

        startAngle += sliceAngle;
    });
}

function updateRoulette() {
    const slices = calculateSlices();
    renderInputs(slices);
    drawCanvas(slices);
}

// 회전 중 현재 실제 각도를 계산하는 함수 (수동 정지 시 필요)
function getCurrentRotation(el) {
    const st = window.getComputedStyle(el, null);
    const tr = st.getPropertyValue("-webkit-transform") || st.getPropertyValue("transform") || "FAIL";
    if (tr !== "none" && tr !== "FAIL") {
        const values = tr.split('(')[1].split(')')[0].split(',');
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        let angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        return (angle < 0 ? angle + 360 : angle);
    }
    return 0;
}

// 메인 돌리기 함수
function spinRoulette() {
    if (rouletteItems.length === 0) return;
    
    const canvas = document.getElementById('roulette-canvas');
    const resultDiv = document.getElementById('spin-result');
    const spinBtn = document.getElementById('spin-btn');
    const timeMode = document.querySelector('input[name="spinTime"]:checked').value;

    // 🛑 수동 모드 정지 로직 (빨간 버튼 클릭 시)
    if (isSpinning && timeMode === 'manual' && !isDecelerating) {
        isDecelerating = true;
        spinBtn.disabled = true; // 중복 클릭 방지
        spinBtn.innerText = "멈추는 중...";

        const currAngle = getCurrentRotation(canvas);
        
        // 트랜지션 강제 해제 후 현재 각도로 고정
        canvas.style.transition = 'none';
        canvas.style.transform = `rotate(${currAngle}deg)`;
        void canvas.offsetWidth; // 브라우저 리플로우 강제 (트랜지션 초기화)

        // 부드럽게 감속하면서 멈출 목표 각도 계산 (약 1.5바퀴 더 돌기)
        const stopAngle = currAngle + (360 * 1.5) + Math.floor(Math.random() * 360);
        currentRotation = stopAngle;

        canvas.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.1, 1)';
        canvas.style.transform = `rotate(${currentRotation}deg)`;

        spinTimeoutId = setTimeout(finishSpin, 3000);
        return;
    }

    if (isSpinning) return; // 이미 돌아가고 있으면 무시

    // 🚀 회전 시작
    isSpinning = true;
    isDecelerating = false;
    resultDiv.innerHTML = "돌아가는 중... 🎯";

    if (timeMode === 'manual') {
        // [직접 모드]: 무한 회전 시작, 버튼은 STOP으로 변경
        spinBtn.innerText = "STOP";
        spinBtn.classList.add('stop-mode');
        
        canvas.style.transition = 'transform 9999s linear';
        currentRotation += 3600000; // 엄청난 각도로 끝없이 돌리기
        canvas.style.transform = `rotate(${currentRotation}deg)`;
        resultDiv.innerHTML = "버튼을 <strong>한 번 더 누르면</strong> 멈춥니다! 🎯";

    } else {
        // [자동 모드]: 설정된 시간 동안 회전 후 자동 멈춤
        spinBtn.disabled = true;
        const duration = parseInt(timeMode, 10);
        
        canvas.style.transition = `transform ${duration}s cubic-bezier(0.17, 0.67, 0.1, 1)`;
        const extraSpins = (Math.floor(Math.random() * 5) + 5) * 360;
        currentRotation += extraSpins + Math.floor(Math.random() * 360);
        canvas.style.transform = `rotate(${currentRotation}deg)`;

        spinTimeoutId = setTimeout(finishSpin, duration * 1000);
    }
}

// 회전 종료 및 결과 판별 함수
function finishSpin() {
    isSpinning = false;
    isDecelerating = false;

    const spinBtn = document.getElementById('spin-btn');
    spinBtn.innerText = "돌리기";
    spinBtn.classList.remove('stop-mode');
    spinBtn.disabled = false;

    const resultDiv = document.getElementById('spin-result');
    const slices = calculateSlices();

    const actualDegree = (360 - (currentRotation % 360)) % 360;
    
    let currentAngle = 0;
    let winnerNumber = "?";
    let winnerId = null;
    
    for (let i = 0; i < slices.length; i++) {
        const sliceAngle = (slices[i].finalRatio / 100) * 360;
        if (actualDegree >= currentAngle && actualDegree < currentAngle + sliceAngle) {
            winnerNumber = slices[i].number;
            winnerId = slices[i].id;
            break;
        }
        currentAngle += sliceAngle;
    }

    let finalHtml = `🎉 당첨 결과: <strong>${winnerNumber}</strong> 번! 🎉`;

    // 🗑️ 자동 제외 로직 (체크되어 있을 시)
    const isAutoRemove = document.getElementById('auto-remove').checked;
    if (isAutoRemove && winnerId !== null) {
        finalHtml += `<br><span style="font-size: 1rem; color: #ff4d4d; font-weight: normal;">(1.5초 후 ${winnerNumber}번이 돌림판에서 자동 제외됩니다.)</span>`;
        // 당첨 확인 시간 1.5초 후 스르륵 제거
        setTimeout(() => {
            removeRouletteItem(winnerId);
        }, 1500);
    }

    resultDiv.innerHTML = finalHtml;
}

function initRoulette() {
    const addBtn = document.getElementById('add-roulette-item');
    const spinBtn = document.getElementById('spin-btn');
    
    if(addBtn) addBtn.addEventListener('click', addRouletteItem);
    if(spinBtn) spinBtn.addEventListener('click', spinRoulette);

    for(let i=1; i<=3; i++) {
        rouletteItems.push({ id: itemIdCounter++, number: i, count: '', ratio: '', color: getRandomColor(), activeInput: 'none' });
    }
    updateRoulette();
}

// ==========================================
// 🚀 3. 페이지 최종 초기화
// ==========================================
window.onload = () => {
    initWorldClock(); 
    setupNavigation(); 
    initRoulette(); 
};
