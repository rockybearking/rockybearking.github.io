// ==========================================
// 🌍 1. 세계 시각 및 내비게이션 로직 (기존 기능 유지)
// ==========================================

// 도시 및 타임존 정보 정의
const cities = [
    { name: 'Seoul', timezone: 'Asia/Seoul', flag: '🇰🇷' },
    { name: 'New York', timezone: 'America/New_York', flag: '🇺🇸' },
    { name: 'Paris', timezone: 'Europe/Paris', flag: '🇫🇷' },
    { name: 'Tokyo', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
    { name: 'London', timezone: 'Europe/London', flag: '🇬🇧' },
    { name: 'Los Angeles', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
    { name: 'Shanghai', timezone: 'Asia/Shanghai', flag: '🇨🇳' }
];

// 시계 카드 생성 함수
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

// 시간 업데이트 함수
function updateClocks() {
    cities.forEach(city => {
        const timeElement = document.getElementById(`time-${city.name.replace(/\s+/g, '')}`);
        const dateElement = document.getElementById(`date-${city.name.replace(/\s+/g, '')}`);

        const now = new Date();
        const optionsTime = { timeZone: city.timezone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const optionsDate = { timeZone: city.timezone, year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };

        const formattedTime = now.toLocaleTimeString('ko-KR', optionsTime);
        const formattedDate = now.toLocaleDateString('ko-KR', optionsDate);

        if (timeElement) timeElement.textContent = formattedTime;
        if (dateElement) dateElement.textContent = formattedDate;
    });
}

// 초기화: 시계 컨테이너 채우기 및 업데이트 시작
function initWorldClock() {
    const container = document.getElementById('clock-container');
    if (container) {
        cities.forEach(city => {
            container.appendChild(createClockCard(city));
        });
        updateClocks(); // 즉시 업데이트
        setInterval(updateClocks, 1000); // 1초마다 업데이트
    }
}

// 🏠 내비게이션 로직 (섹션 전환)
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const homeBtn = document.getElementById('home-btn');

    // 일반 내비게이션 링크 클릭 시
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = e.target.dataset.section;

            // 모든 섹션 비활성화, 클릭한 섹션만 활성화
            sections.forEach(s => s.classList.remove('active'));
            const targetEl = document.getElementById(`${targetSection}-section`);
            if (targetEl) targetEl.classList.add('active');

            // 내비게이션 바 링크 활성화 표시
            navItems.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // 🏠 홈 버튼 클릭 시
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            sections.forEach(s => s.classList.remove('active'));
            const homeEl = document.getElementById('home-section');
            if (homeEl) homeEl.classList.add('active'); // 홈 섹션 활성화
            navItems.forEach(n => n.classList.remove('active')); // 일반 링크 비활성화
        });
    }
}


// ==========================================
// 🎲 2. 랜덤 돌림판 로직 (새로 추가되는 기능)
// ==========================================
let rouletteItems = [];
let itemIdCounter = 0;
let currentRotation = 0; // 현재 회전 각도 저장 변수

// 임의의 파스텔 톤 색상 생성 함수
function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
}

// 아이템 추가 함수
function addRouletteItem() {
    rouletteItems.push({
        id: itemIdCounter++,
        number: 1,
        count: '',
        ratio: '',
        color: getRandomColor(),
        activeInput: 'none' // 'count' 또는 'ratio' 상태 추적용
    });
    updateRoulette();
}

// 아이템 삭제 함수
function removeRouletteItem(id) {
    rouletteItems = rouletteItems.filter(item => item.id !== id);
    updateRoulette();
}

// 입력값 변경 시 처리 (개수 vs 비율 상호작용 및 1~200 제한 제어)
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
        if (value !== '') {
            item.activeInput = 'count';
        } else if (item.ratio === '') {
            item.activeInput = 'none';
        }
    } else if (field === 'ratio') {
        item.ratio = value === '' ? '' : parseFloat(value);
        if (value !== '') {
            item.activeInput = 'ratio';
        } else if (item.count === '') {
            item.activeInput = 'none';
        }
    }
    updateRoulette();
}

// 비율 및 각도 계산 함수 (자동 변환 핵심 로직)
function calculateSlices() {
    let totalFixedRatio = 0;
    let totalCount = 0;

    // 1단계: 직접 입력된 고정 비율 및 개수 합산
    rouletteItems.forEach(item => {
        if (item.activeInput === 'ratio' && item.ratio !== '') {
            totalFixedRatio += parseFloat(item.ratio);
        } else if (item.activeInput === 'count' && item.count !== '') {
            totalCount += parseFloat(item.count);
        }
    });

    let remainingRatio = 100 - totalFixedRatio;
    if (remainingRatio < 0) remainingRatio = 0;

    // 2단계: 각 아이템별 최종 적용될 비율(%) 계산
    const slices = rouletteItems.map(item => {
        let finalRatio = 0;
        let calculatedRatioStr = item.ratio;

        if (item.activeInput === 'ratio') {
            finalRatio = parseFloat(item.ratio) || 0;
        } else if (item.activeInput === 'count') {
            if (totalCount > 0) {
                finalRatio = (parseFloat(item.count) / totalCount) * remainingRatio;
                calculatedRatioStr = finalRatio.toFixed(1); // 개수 입력 시 자동 비율 계산값 노출
            }
        } else {
            // 아무것도 안 적은 칸은 남은 비율을 균등 배분
            const emptyItemsCount = rouletteItems.filter(i => i.activeInput === 'none').length;
            if (emptyItemsCount > 0) {
                finalRatio = remainingRatio / emptyItemsCount;
            }
        }

        return { ...item, finalRatio, calculatedRatioStr };
    });

    return slices;
}

// 설정 인풋 UI 렌더링 함수
function renderInputs(slices) {
    const container = document.getElementById('roulette-inputs');
    if (!container) return;
    container.innerHTML = '';

    slices.forEach(slice => {
        const row = document.createElement('div');
        row.className = 'roulette-item-row';
        
        // 숫자 입력 칸 (1~200)
        const numInput = document.createElement('input');
        numInput.type = 'number';
        numInput.min = 1;
        numInput.max = 200;
        numInput.value = slice.number;
        numInput.onchange = (e) => handleInput(slice.id, 'number', e.target.value);

        // 개수 입력 칸
        const countInput = document.createElement('input');
        countInput.type = 'number';
        countInput.placeholder = '개수';
        countInput.value = slice.activeInput === 'count' ? slice.count : '';
        countInput.disabled = slice.activeInput === 'ratio'; // 비율 입력시 비활성화(회색)
        countInput.oninput = (e) => handleInput(slice.id, 'count', e.target.value);

        // 비율 입력 칸
        const ratioInput = document.createElement('input');
        ratioInput.type = 'number';
        ratioInput.placeholder = '비율(%)';
        ratioInput.value = slice.activeInput === 'ratio' ? slice.ratio : (slice.activeInput === 'count' ? slice.calculatedRatioStr : '');
        ratioInput.disabled = slice.activeInput === 'count'; // 개수 입력시 비활성화(회색)
        ratioInput.oninput = (e) => handleInput(slice.id, 'ratio', e.target.value);

        // 삭제 버튼
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerText = 'X';
        deleteBtn.onclick = () => removeRouletteItem(slice.id);

        row.appendChild(numInput);
        row.appendChild(countInput);
        row.appendChild(ratioInput);
        row.appendChild(deleteBtn);
        container.appendChild(row);
    });
}

// HTML5 Canvas로 실시간 돌림판 시각화 그리기
function drawCanvas(slices) {
    const canvas = document.getElementById('roulette-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startAngle = -Math.PI / 2; // 12시 정각 방향 기점

    slices.forEach(slice => {
        const sliceAngle = (slice.finalRatio / 100) * 2 * Math.PI;
        if (sliceAngle <= 0) return;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();

        ctx.fillStyle = slice.color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#1a1a1a';
        ctx.stroke();

        // 부채꼴 내부에 숫자 텍스트 배치
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px "Malgun Gothic"';
        ctx.fillText(slice.number, radius - 30, 8);
        ctx.restore();

        startAngle += sliceAngle;
    });
}

// 데이터 변화에 따른 통합 화면 갱신
function updateRoulette() {
    const slices = calculateSlices();
    renderInputs(slices);
    drawCanvas(slices);
}

// 돌리기 구동 (회전 누적 계산)
function spinRoulette() {
    if (rouletteItems.length === 0) return;
    
    const canvas = document.getElementById('roulette-canvas');
    const resultDiv = document.getElementById('spin-result');
    const slices = calculateSlices();
    
    // 무제한 회전을 위해 회전수 무작위 누적 가산 (최소 5~10바퀴 + 알파 각도)
    const extraSpins = (Math.floor(Math.random() * 5) + 5) * 360;
    const randomDegree = Math.floor(Math.random() * 360);
    currentRotation += extraSpins + randomDegree;

    canvas.style.transform = `rotate(${currentRotation}deg)`;
    resultDiv.innerText = "돌아가는 중... 🎯";

    // CSS transition 속도(3초)에 맞춰 결과 판정 실행
    setTimeout(() => {
        // 회전 후 12시 바늘 방향(정상단)이 가리키는 실제 상대 각도 환산
        const actualDegree = (360 - (currentRotation % 360)) % 360;
        
        let currentAngle = 0;
        let winnerNumber = "?";
        
        for (let i = 0; i < slices.length; i++) {
            const sliceAngle = (slices[i].finalRatio / 100) * 360;
            if (actualDegree >= currentAngle && actualDegree < currentAngle + sliceAngle) {
                winnerNumber = slices[i].number;
                break;
            }
            currentAngle += sliceAngle;
        }

        resultDiv.innerHTML = `🎉 결과: <strong>${winnerNumber}</strong> 번! 🎉`;
    }, 3000);
}

// 돌림판 버튼 초기 이벤트 셋업
function initRoulette() {
    const addBtn = document.getElementById('add-roulette-item');
    const spinBtn = document.getElementById('spin-btn');
    
    if(addBtn) addBtn.addEventListener('click', addRouletteItem);
    if(spinBtn) spinBtn.addEventListener('click', spinRoulette);

    // 최초 로드시 보여줄 기본 샘플 항목 생성
    for(let i=1; i<=3; i++) {
        rouletteItems.push({
            id: itemIdCounter++, number: i, count: '', ratio: '', color: getRandomColor(), activeInput: 'none'
        });
    }
    updateRoulette();
}


// ==========================================
// 🚀 3. 페이지 최종 초기화 실행 영역
// ==========================================
window.onload = () => {
    initWorldClock(); // 기존 세계 시각 초기화 실행
    setupNavigation(); // 기존 상단 메뉴 네비게이션 작동 실행
    initRoulette(); // 새로운 랜덤 돌림판 시스템 구동 시작
};