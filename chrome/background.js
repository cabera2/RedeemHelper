/**
 * 1. 메뉴 갱신 함수
 * 저장소에서 게임 리스트를 읽어와 우클릭 메뉴를 동적으로 생성합니다.
 */
function updateMenus() {
    chrome.contextMenus.removeAll(() => {
        chrome.storage.sync.get(["games"], (result) => {
            const games = result.games || [];
            games.forEach((game, index) => {
                // enable이 명시적으로 false인 경우 메뉴 생성을 건너뜀
                if (game.enable === false) return;

                const labelText = chrome.i18n.getMessage("transferPage").replace("{n}", game.name);
                chrome.contextMenus.create({
                    id: `redeem-${index}`, // 원본 배열 인덱스를 유지하여 클릭 리스너와의 정렬 유지
                    title: `${labelText}`,
                    contexts: ["selection"]
                });
            });
        });
    });
}

// 초기화 및 리스너 등록 부분
chrome.runtime.onInstalled.addListener(updateMenus);
chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.games) updateMenus();
});

/**
 * 5. 메뉴 클릭 이벤트 리스너
 * 클릭한 메뉴의 인덱스에 맞는 URL을 찾아 새 탭을 엽니다.
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const selectionText = (info.selectionText || "").trim();

    chrome.storage.sync.get(["games"], (result) => {
        const games = result.games || [];
        const menuId = info.menuItemId; // 'redeem-0', 'redeem-1' 등의 ID

        // ID에서 인덱스 숫자만 추출
        const index = parseInt(menuId.replace("redeem-", ""));

        if (!isNaN(index) && games[index]) {
            // {n}을 선택한 텍스트로 치환하고 인코딩 처리
            const finalUrl = games[index].url.replace("{n}", encodeURIComponent(selectionText));

            // 새 탭 열기
            chrome.tabs.create({ url: finalUrl });
        }
    });
});