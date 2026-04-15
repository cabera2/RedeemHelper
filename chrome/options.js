import { DEFAULT_GAMES_DATA } from './defaultGames.js';
const userLang = chrome.i18n.getUILanguage().split('-')[0];
const defaultGames = DEFAULT_GAMES_DATA[userLang] || DEFAULT_GAMES_DATA['en'];

let currentGames = [];
applyI18n();
// [저장] 데이터를 브라우저에 영구 저장하는 함수
function saveToStorage() {
    chrome.storage.sync.set({ games: currentGames }, () => {
        console.log("자동 저장 완료!");
    });
}
function applyI18n(){
    document.title = chrome.i18n.getMessage("optTitle");
    document.getElementById('header').textContent = chrome.i18n.getMessage("optHeader");
    document.getElementById('nameInput').placeholder = chrome.i18n.getMessage("optGameName");
    document.getElementById('urlInput').placeholder = chrome.i18n.getMessage("optHeader");
    document.getElementById('addBtn').textContent = chrome.i18n.getMessage("optAdd");
    document.getElementById('guide').innerHTML = chrome.i18n.getMessage("optGuide");
    document.getElementById('resetBtn').textContent = chrome.i18n.getMessage("optReset");
}

// [로드] 페이지가 열릴 때 저장된 데이터를 가져오는 로직
chrome.storage.sync.get(["games"], (result) => {
    if (result.games && result.games.length > 0) {
        currentGames = result.games;
    } else {
        currentGames = [...defaultGames]; // 데이터가 없으면 기본값 사용
    }
    renderList();
});

function renderList() {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = "";
    currentGames.forEach((game, index) => {
        const li = document.createElement('li');
        li.className = 'item';

        // enable 속성이 없거나 true이면 체크된 상태로 표시
        const isChecked = game.enable !== false ? 'checked' : '';

        li.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <input type="checkbox" class="enable-check" data-index="${index}" ${isChecked}>
        <div class="item-info">
          <span class="game-name" style="${game.enable === false ? 'color: #ccc;' : ''}">${game.name}</span>
          <span class="game-url">${game.url}</span>
        </div>
      </div>
      <button class="btn-delete" data-index="${index}">${chrome.i18n.getMessage("optDelete")}</button>
    `;
        itemList.appendChild(li);
    });
}

// 체크박스 상태 변경 감지 이벤트 리스너 추가
document.getElementById('itemList').addEventListener('change', (e) => {
    if (e.target.classList.contains('enable-check')) {
        const index = e.target.getAttribute('data-index');
        currentGames[index].enable = e.target.checked; // 체크 여부를 enable 속성에 저장
        renderList(); // 화면 갱신 (비활성화 시 글자색 변경 효과 등 적용)
        saveToStorage(); // 자동 저장
    }
});

// 추가/삭제/초기화 시 saveToStorage() 호출
document.getElementById('addBtn').addEventListener('click', () => {
    const name = document.getElementById('nameInput').value.trim();
    const url = document.getElementById('urlInput').value.trim();
    if (name && url) {
        currentGames.push({ name, url });
        renderList();
        saveToStorage(); // 자동 저장
        document.getElementById('nameInput').value = "";
        document.getElementById('urlInput').value = "";
    }
});

document.getElementById('itemList').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
        const index = e.target.getAttribute('data-index');
        currentGames.splice(index, 1);
        renderList();
        saveToStorage(); // 자동 저장
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    const text = chrome.i18n.getMessage("optResetWarning");
    if (confirm(text)) {
        currentGames = [...defaultGames];
        renderList();
        saveToStorage(); // 자동 저장
    }
});