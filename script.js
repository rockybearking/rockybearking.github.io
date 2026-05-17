// 도시 및 타임존 정보 정의 (새로운 시계 카드를 만들기 위해)
const cities = [
    { name: 'Seoul', timezone: 'Asia/Seoul', flag: '🇰🇷' },
    { name: 'New York', timezone: 'America/New_York', flag: '🇺🇸' },
    { name: 'Paris', timezone: 'Europe/Paris', flag: '🇫🇷' },
    { name: 'Tokyo', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
    { name: 'London', timezone: 'Europe/London', flag: '🇬🇧' },
    { name: 'Los Angeles', timezone: 'America/Los_Angeles', flag: '🇺🇸' }
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

        timeElement.textContent = formattedTime;
        dateElement.textContent = formattedDate;
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
            document.getElementById(`${targetSection}-section`).classList.add('active');

            // 내비게이션 바 링크 활성화 표시
            navItems.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // 🏠 홈 버튼 클릭 시 (이미지의 화살표 로직)
    homeBtn.addEventListener('click', () => {
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById('home-section').classList.add('active'); // 홈 섹션 활성화
        navItems.forEach(n => n.classList.remove('active')); // 일반 링크 비활성화
    });
}

// 페이지 로드 시 실행
window.onload = () => {
    initWorldClock();
    setupNavigation();
};
