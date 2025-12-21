// 한글 위주 샘플 데이터 생성 스크립트

// 대량 샘플 데이터 생성 함수
export function generateLargeSampleData() {
  const categories = ["스마트폰", "노트북", "태블릿", "TV", "이어폰", "가전제품", "스마트워치", "게이밍", "카메라", "오디오"];
  const brands = ["삼성", "애플", "LG", "소니", "샤오미", "화웨이", "레노버", "아수스", "델", "HP"];
  const productNames = [
    "갤럭시", "아이폰", "맥북", "아이패드", "올레드", "비스포크", "에어팟", "버즈", "워치", "탭",
    "프로", "울트라", "플러스", "맥스", "미니", "에어", "프로맥스", "S24", "15", "M3"
  ];
  const descriptions = [
    "최신 기술이 탑재된 프리미엄 제품입니다.",
    "고성능과 우수한 디자인을 갖춘 제품입니다.",
    "일상 생활에 최적화된 스마트 기기입니다.",
    "프로페셔널한 사용자를 위한 고급 제품입니다.",
    "혁신적인 기능과 뛰어난 사용성을 제공합니다.",
    "최고의 품질과 성능을 자랑하는 제품입니다.",
    "현대적인 디자인과 강력한 기능을 갖춘 제품입니다.",
    "사용자 경험을 최우선으로 설계된 제품입니다."
  ];
  const tags = [
    ["프리미엄", "AI", "카메라", "배터리"],
    ["고성능", "디자인", "스타일", "품질"],
    ["스마트", "편리함", "효율", "혁신"],
    ["프로", "전문가", "크리에이터", "개발자"],
    ["무선", "방수", "배터리", "착용감"],
    ["4K", "HDR", "스마트TV", "화질"],
    ["대용량", "에너지효율", "AI", "편의성"]
  ];

  const products = [];
  const articles = [];

  // Products 생성 (100,000건)
  for (let i = 1; i <= 100000; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const namePart1 = productNames[Math.floor(Math.random() * productNames.length)];
    const namePart2 = productNames[Math.floor(Math.random() * productNames.length)];
    const name = `${brand} ${namePart1} ${namePart2} ${i % 100 === 0 ? '프로' : ''} ${i % 50 === 0 ? '울트라' : ''}`.trim();
    
    products.push({
      _id: i,
      name: name,
      description: descriptions[Math.floor(Math.random() * descriptions.length)] + ` ${category} 카테고리의 인기 제품입니다.`,
      category: category,
      brand: brand,
      price: Math.floor(Math.random() * 5000000) + 100000, // 100,000 ~ 5,100,000
      tags: tags[Math.floor(Math.random() * tags.length)],
      specifications: {
        storage: `${Math.floor(Math.random() * 1000) + 128}GB`,
        ram: `${Math.floor(Math.random() * 32) + 4}GB`,
        display: `${Math.floor(Math.random() * 10) + 5}.${Math.floor(Math.random() * 10)}인치`,
        color: ["블랙", "화이트", "실버", "골드", "블루", "레드"][Math.floor(Math.random() * 6)]
      },
      inStock: Math.random() > 0.2, // 80% 재고 있음
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10 // 3.5 ~ 5.0
    });
  }

  // Articles 생성 (30,000건)
  const articleTitles = [
    "MongoDB Atlas Search 완벽 가이드",
    "한글 검색 최적화 전략",
    "Atlas Search 디버깅 실전 가이드",
    "검색 성능 튜닝 방법",
    "인덱스 설계 베스트 프랙티스",
    "실무 검색 쿼리 최적화",
    "대용량 데이터 검색 전략",
    "검색 결과 랭킹 개선",
    "멀티 필드 검색 구현",
    "검색 분석 및 모니터링"
  ];
  const articleCategories = ["데이터베이스", "검색", "디버깅", "최적화", "튜토리얼", "실전", "가이드", "전략"];
  const authors = ["김개발", "이데이터", "박튜닝", "최최적화", "정검색", "강인덱스", "윤성능", "임디버깅"];

  for (let i = 1; i <= 30000; i++) {
    const titleIndex = Math.floor(Math.random() * articleTitles.length);
    const baseTitle = articleTitles[titleIndex];
    const title = i % 10 === 0 ? `${baseTitle} ${Math.floor(i / 1000)}편` : baseTitle;
    
    articles.push({
      _id: i,
      title: title,
      content: `${title}에 대한 상세한 내용입니다. 실무에서 활용할 수 있는 구체적인 예제와 코드를 포함하고 있습니다. ${i}번째 문서로 다양한 시나리오를 다룹니다.`,
      author: authors[Math.floor(Math.random() * authors.length)],
      category: articleCategories[Math.floor(Math.random() * articleCategories.length)],
      tags: ["MongoDB", "Atlas", "Search", "튜토리얼", "최적화", "디버깅"].slice(0, Math.floor(Math.random() * 4) + 2),
      publishedDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      views: Math.floor(Math.random() * 10000) + 100,
      likes: Math.floor(Math.random() * 500) + 10
    });
  }

  return { products, articles };
}

// game_chat 컬렉션용 다국어 샘플 데이터 생성 함수
export function generateGameChatData() {
  const chineseNames = ["黑王子", "白騎士", "紅法師", "藍戰士", "綠盜賊", "黃祭司", "紫巫師", "銀劍士", "金弓手", "銅盾士"];
  const englishWords = ["hight", "power", "sword", "shield", "magic", "arrow", "spell", "heal", "buff", "debuff"];
  const koreanWords = ["공격", "방어", "마법", "치유", "버프", "디버프", "스킬", "아이템", "퀘스트", "던전"];
  const messages = [
    "게임을 시작합니다",
    "전투가 시작되었습니다",
    "아이템을 획득했습니다",
    "경험치를 얻었습니다",
    "레벨업했습니다",
    "퀘스트를 완료했습니다",
    "던전에 입장했습니다",
    "보스를 처치했습니다",
    "파티에 참가했습니다",
    "채팅을 입력했습니다"
  ];
  const chineseMessages = [
    "開始遊戲",
    "戰鬥開始",
    "獲得物品",
    "獲得經驗",
    "升級了",
    "完成任務",
    "進入地下城",
    "擊敗首領",
    "加入隊伍",
    "輸入聊天"
  ];
  const englishMessages = [
    "Game started",
    "Battle begins",
    "Item acquired",
    "Gained experience",
    "Level up",
    "Quest completed",
    "Entered dungeon",
    "Boss defeated",
    "Joined party",
    "Chat message"
  ];

  const gameChats = [];

  for (let i = 1; i <= 100; i++) {
    const nameType = Math.floor(Math.random() * 3); // 0: 한자+영문, 1: 한자+한글, 2: 영문+한글
    let playerName;
    
    if (nameType === 0) {
      // 한자 + 영문 조합 (예: 黑王子hight)
      const chinese = chineseNames[Math.floor(Math.random() * chineseNames.length)];
      const english = englishWords[Math.floor(Math.random() * englishWords.length)];
      playerName = `${chinese}${english}`;
    } else if (nameType === 1) {
      // 한자 + 한글 조합
      const chinese = chineseNames[Math.floor(Math.random() * chineseNames.length)];
      const korean = koreanWords[Math.floor(Math.random() * koreanWords.length)];
      playerName = `${chinese}${korean}`;
    } else {
      // 영문 + 한글 조합
      const english = englishWords[Math.floor(Math.random() * englishWords.length)];
      const korean = koreanWords[Math.floor(Math.random() * koreanWords.length)];
      playerName = `${english}${korean}`;
    }

    // 메시지 타입 결정
    const messageType = Math.floor(Math.random() * 3);
    let message;
    if (messageType === 0) {
      message = messages[Math.floor(Math.random() * messages.length)];
    } else if (messageType === 1) {
      message = chineseMessages[Math.floor(Math.random() * chineseMessages.length)];
    } else {
      message = englishMessages[Math.floor(Math.random() * englishMessages.length)];
    }

    gameChats.push({
      _id: i,
      playerName: playerName,
      message: message,
      timestamp: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1, 
                         Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)),
      channel: ["일반", "파티", "길드", "전체"][Math.floor(Math.random() * 4)],
      level: Math.floor(Math.random() * 100) + 1,
      server: `서버${Math.floor(Math.random() * 10) + 1}`
    });
  }

  // 특정 테스트 데이터 추가 (다국어 검색 테스트용)
  const testData = [
    {
      _id: 101,
      playerName: "黑王子hight",
      message: "게임을 시작합니다",
      timestamp: new Date(2024, 11, 18, 12, 0),
      channel: "일반",
      level: 50,
      server: "서버1"
    },
    {
      _id: 102,
      playerName: "白王子hight",
      message: "전투가 시작되었습니다",
      timestamp: new Date(2024, 11, 18, 12, 5),
      channel: "파티",
      level: 45,
      server: "서버1"
    },
    {
      _id: 103,
      playerName: "playerhight",
      message: "아이템을 획득했습니다",
      timestamp: new Date(2024, 11, 18, 12, 10),
      channel: "일반",
      level: 30,
      server: "서버2"
    },
    {
      _id: 104,
      playerName: "hightscore",
      message: "경험치를 얻었습니다",
      timestamp: new Date(2024, 11, 18, 12, 15),
      channel: "길드",
      level: 60,
      server: "서버1"
    },
    {
      _id: 105,
      playerName: "hightlevel",
      message: "레벨업했습니다",
      timestamp: new Date(2024, 11, 18, 12, 20),
      channel: "일반",
      level: 75,
      server: "서버3"
    },
    {
      _id: 106,
      playerName: "hightpower",
      message: "퀘스트를 완료했습니다",
      timestamp: new Date(2024, 11, 18, 12, 25),
      channel: "파티",
      level: 55,
      server: "서버2"
    },
    {
      _id: 107,
      playerName: "superhight",
      message: "던전에 입장했습니다",
      timestamp: new Date(2024, 11, 18, 12, 30),
      channel: "일반",
      level: 40,
      server: "서버1"
    },
    {
      _id: 108,
      playerName: "hightmaster",
      message: "보스를 처치했습니다",
      timestamp: new Date(2024, 11, 18, 12, 35),
      channel: "길드",
      level: 80,
      server: "서버2"
    },
    {
      _id: 109,
      playerName: "hi왕자",
      message: "게임을 시작합니다",
      timestamp: new Date(2024, 11, 18, 12, 40),
      channel: "일반",
      level: 50,
      server: "서버1"
    },
    {
      _id: 110,
      playerName: "hi기사",
      message: "전투가 시작되었습니다",
      timestamp: new Date(2024, 11, 18, 12, 45),
      channel: "파티",
      level: 45,
      server: "서버1"
    },
    {
      _id: 111,
      playerName: "hi마법사",
      message: "아이템을 획득했습니다",
      timestamp: new Date(2024, 11, 18, 12, 50),
      channel: "일반",
      level: 30,
      server: "서버2"
    },
    {
      _id: 112,
      playerName: "hi전사",
      message: "경험치를 얻었습니다",
      timestamp: new Date(2024, 11, 18, 12, 55),
      channel: "길드",
      level: 60,
      server: "서버1"
    },
    {
      _id: 113,
      playerName: "hi도적",
      message: "레벨업했습니다",
      timestamp: new Date(2024, 11, 18, 13, 0),
      channel: "일반",
      level: 75,
      server: "서버3"
    },
    {
      _id: 114,
      playerName: "hi사제",
      message: "퀘스트를 완료했습니다",
      timestamp: new Date(2024, 11, 18, 13, 5),
      channel: "파티",
      level: 55,
      server: "서버2"
    },
    {
      _id: 115,
      playerName: "hi검사",
      message: "던전에 입장했습니다",
      timestamp: new Date(2024, 11, 18, 13, 10),
      channel: "일반",
      level: 40,
      server: "서버1"
    },
    {
      _id: 116,
      playerName: "hi궁수",
      message: "보스를 처치했습니다",
      timestamp: new Date(2024, 11, 18, 13, 15),
      channel: "길드",
      level: 80,
      server: "서버2"
    },
    {
      _id: 117,
      playerName: "hi방패사",
      message: "게임을 시작합니다",
      timestamp: new Date(2024, 11, 18, 13, 20),
      channel: "일반",
      level: 50,
      server: "서버1"
    },
    {
      _id: 118,
      playerName: "hi친구",
      message: "전투가 시작되었습니다",
      timestamp: new Date(2024, 11, 18, 13, 25),
      channel: "파티",
      level: 45,
      server: "서버1"
    }
  ];

  gameChats.push(...testData);

  return gameChats;
}

// game_hanchat 컬렉션용 순수 한글 샘플 데이터 생성 함수
export function generateGameHanChatData() {
  const koreanNames = [
    "검은왕자", "흰기사", "빨간마법사", "파란전사", "초록도적", 
    "노란사제", "보라마법사", "은빛검사", "금빛궁수", "구리방패사",
    "불꽃전사", "얼음마법사", "번개도적", "바람궁수", "대지사제",
    "어둠기사", "빛의성기사", "어둠의마법사", "자연의드루이드", "죽음의기사"
  ];
  const koreanWords = ["공격", "방어", "마법", "치유", "버프", "디버프", "스킬", "아이템", "퀘스트", "던전"];
  const messages = [
    "게임을 시작합니다",
    "전투가 시작되었습니다",
    "아이템을 획득했습니다",
    "경험치를 얻었습니다",
    "레벨업했습니다",
    "퀘스트를 완료했습니다",
    "던전에 입장했습니다",
    "보스를 처치했습니다",
    "파티에 참가했습니다",
    "채팅을 입력했습니다",
    "무기를 강화했습니다",
    "장비를 교체했습니다",
    "스킬을 배웠습니다",
    "포션을 사용했습니다",
    "길드를 가입했습니다"
  ];

  const gameHanChats = [];

  // 순수 한글 플레이어 이름 생성
  for (let i = 1; i <= 100; i++) {
    const namePart1 = koreanNames[Math.floor(Math.random() * koreanNames.length)];
    const namePart2 = koreanWords[Math.floor(Math.random() * koreanWords.length)];
    const playerName = `${namePart1}${namePart2}`;

    const message = messages[Math.floor(Math.random() * messages.length)];

    gameHanChats.push({
      _id: i,
      playerName: playerName,
      message: message,
      timestamp: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1, 
                         Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)),
      channel: ["일반", "파티", "길드", "전체"][Math.floor(Math.random() * 4)],
      level: Math.floor(Math.random() * 100) + 1,
      server: `서버${Math.floor(Math.random() * 10) + 1}`
    });
  }

  // 특정 테스트 데이터 추가 (한글 검색 테스트용)
  const testData = [
    {
      _id: 101,
      playerName: "검은왕자공격",
      message: "게임을 시작합니다",
      timestamp: new Date(2024, 11, 18, 12, 0),
      channel: "일반",
      level: 50,
      server: "서버1"
    },
    {
      _id: 102,
      playerName: "흰기사방어",
      message: "전투가 시작되었습니다",
      timestamp: new Date(2024, 11, 18, 12, 5),
      channel: "파티",
      level: 45,
      server: "서버1"
    },
    {
      _id: 103,
      playerName: "빨간마법사마법",
      message: "아이템을 획득했습니다",
      timestamp: new Date(2024, 11, 18, 12, 10),
      channel: "일반",
      level: 30,
      server: "서버2"
    },
    {
      _id: 104,
      playerName: "王子hi",
      message: "게임을 시작합니다",
      timestamp: new Date(2024, 11, 18, 12, 15),
      channel: "일반",
      level: 50,
      server: "서버1"
    },
    {
      _id: 105,
      playerName: "王子hello",
      message: "전투가 시작되었습니다",
      timestamp: new Date(2024, 11, 18, 12, 20),
      channel: "파티",
      level: 45,
      server: "서버1"
    }
  ];

  gameHanChats.push(...testData);

  return gameHanChats;
}

// 기존 샘플 데이터 (호환성을 위해 유지)
export const sampleProducts = [
  {
    _id: 1,
    name: "삼성 갤럭시 S24 울트라",
    description: "최신 스마트폰으로 AI 기능이 탑재된 프리미엄 모델입니다. 카메라 성능이 뛰어나고 배터리 수명이 길어 일상 사용에 최적화되어 있습니다.",
    category: "스마트폰",
    brand: "삼성",
    price: 1490000,
    tags: ["프리미엄", "AI", "카메라", "배터리"],
    specifications: {
      storage: "512GB",
      ram: "12GB",
      display: "6.8인치",
      color: "티타늄 그레이"
    },
    inStock: true,
    rating: 4.8
  },
  {
    _id: 2,
    name: "아이폰 15 프로 맥스",
    description: "애플의 최신 플래그십 스마트폰입니다. 티타늄 소재로 제작되어 가볍고 내구성이 뛰어납니다. A17 Pro 칩셋으로 최고의 성능을 제공합니다.",
    category: "스마트폰",
    brand: "애플",
    price: 1990000,
    tags: ["프리미엄", "티타늄", "성능", "디자인"],
    specifications: {
      storage: "1TB",
      ram: "8GB",
      display: "6.7인치",
      color: "네추럴 티타늄"
    },
    inStock: true,
    rating: 4.9
  },
  {
    _id: 3,
    name: "LG 올레드 TV 65인치",
    description: "4K 해상도의 올레드 패널을 탑재한 프리미엄 TV입니다. HDR10과 돌비 비전을 지원하여 생생한 화질을 제공합니다. 스마트 TV 기능이 내장되어 있습니다.",
    category: "TV",
    brand: "LG",
    price: 3200000,
    tags: ["올레드", "4K", "HDR", "스마트TV"],
    specifications: {
      size: "65인치",
      resolution: "4K UHD",
      hdr: true,
      smartTV: true
    },
    inStock: true,
    rating: 4.7
  },
  {
    _id: 4,
    name: "삼성 냉장고 비스포크",
    description: "대용량 4도어 냉장고로 식품 보관에 최적화되어 있습니다. 무풍 냉각 기술로 신선도를 유지하며, 인공지능 기능으로 에너지 효율을 높입니다.",
    category: "가전제품",
    brand: "삼성",
    price: 4500000,
    tags: ["대용량", "비스포크", "AI", "에너지효율"],
    specifications: {
      capacity: "870L",
      doors: 4,
      ai: true,
      energyRating: "1등급"
    },
    inStock: false,
    rating: 4.6
  },
  {
    _id: 5,
    name: "맥북 프로 16인치 M3",
    description: "애플의 최신 프로세서 M3를 탑재한 노트북입니다. 크리에이터와 개발자를 위한 고성능 머신으로 비디오 편집과 코딩 작업에 최적화되어 있습니다.",
    category: "노트북",
    brand: "애플",
    price: 3500000,
    tags: ["프로세서", "크리에이터", "고성능", "개발자"],
    specifications: {
      processor: "M3 Pro",
      ram: "18GB",
      storage: "512GB SSD",
      display: "16.2인치"
    },
    inStock: true,
    rating: 4.9
  },
  {
    _id: 6,
    name: "갤럭시 북 프로 360",
    description: "2-in-1 노트북으로 터치스크린과 S펜을 지원합니다. 업무와 창작 활동 모두에 적합한 다목적 기기입니다. 가벼운 무게로 휴대성이 뛰어납니다.",
    category: "노트북",
    brand: "삼성",
    price: 1800000,
    tags: ["2-in-1", "터치스크린", "S펜", "휴대성"],
    specifications: {
      processor: "인텔 코어 i7",
      ram: "16GB",
      storage: "512GB SSD",
      display: "15.6인치"
    },
    inStock: true,
    rating: 4.5
  },
  {
    _id: 7,
    name: "에어팟 프로 2세대",
    description: "노이즈 캔슬링 기능이 강화된 무선 이어폰입니다. 공간 음향과 적응형 EQ로 최적의 음질을 제공합니다. 방수 기능으로 운동 중에도 사용 가능합니다.",
    category: "이어폰",
    brand: "애플",
    price: 359000,
    tags: ["노이즈캔슬링", "무선", "방수", "음질"],
    specifications: {
      noiseCancelling: true,
      battery: "6시간",
      charging: "무선충전",
      waterResistant: "IPX4"
    },
    inStock: true,
    rating: 4.8
  },
  {
    _id: 8,
    name: "갤럭시 버즈2 프로",
    description: "삼성의 프리미엄 무선 이어버드입니다. 액티브 노이즈 캔슬링과 주변 소리 듣기 기능을 제공합니다. 긴 배터리 수명과 편안한 착용감이 특징입니다.",
    category: "이어폰",
    brand: "삼성",
    price: 199000,
    tags: ["ANC", "무선", "배터리", "착용감"],
    specifications: {
      noiseCancelling: true,
      battery: "8시간",
      charging: "무선충전",
      waterResistant: "IPX7"
    },
    inStock: true,
    rating: 4.6
  },
  {
    _id: 9,
    name: "아이패드 프로 12.9인치",
    description: "M2 칩셋을 탑재한 프로급 태블릿입니다. 크리에이터와 전문가를 위한 고성능 기기로 드로잉, 편집, 설계 작업에 최적화되어 있습니다.",
    category: "태블릿",
    brand: "애플",
    price: 1490000,
    tags: ["프로", "M2", "크리에이터", "고성능"],
    specifications: {
      processor: "M2",
      storage: "256GB",
      display: "12.9인치",
      pencil: "애플펜슬 지원"
    },
    inStock: true,
    rating: 4.8
  },
  {
    _id: 10,
    name: "갤럭시 탭 S9 울트라",
    description: "대형 화면의 프리미엄 태블릿입니다. S펜이 포함되어 있으며, 방수 기능으로 다양한 환경에서 사용할 수 있습니다. 멀티태스킹에 최적화되어 있습니다.",
    category: "태블릿",
    brand: "삼성",
    price: 1299000,
    tags: ["대형화면", "S펜", "방수", "멀티태스킹"],
    specifications: {
      processor: "스냅드래곤 8 Gen 2",
      storage: "256GB",
      display: "14.6인치",
      pencil: "S펜 포함"
    },
    inStock: true,
    rating: 4.7
  },
  {
    _id: 11,
    name: "黑王子hight",
    description: "다국어 환경 테스트용 제품입니다. 한자와 영문이 혼합된 제품명으로 검색 기능을 테스트할 수 있습니다.",
    category: "테스트",
    brand: "테스트",
    price: 100000,
    tags: ["테스트", "다국어", "검색"],
    specifications: {
      type: "테스트 제품",
      color: "블랙"
    },
    inStock: true,
    rating: 4.0
  }
];

export const sampleArticles = [
  {
    _id: 1,
    title: "MongoDB Atlas Search 완벽 가이드",
    content: "Atlas Search를 활용한 전문 검색 기능 구현 방법을 상세히 설명합니다. 인덱스 설정부터 쿼리 최적화까지 실무 예제를 포함합니다.",
    author: "김개발",
    category: "데이터베이스",
    tags: ["MongoDB", "Atlas", "Search", "튜토리얼"],
    publishedDate: new Date("2024-01-15"),
    views: 1250,
    likes: 45
  },
  {
    _id: 2,
    title: "한글 검색 최적화 전략",
    content: "한글 텍스트 검색 시 발생하는 문제점과 해결 방법을 다룹니다. Analyzer 설정과 토크나이징 전략을 중심으로 설명합니다.",
    author: "이데이터",
    category: "검색",
    tags: ["한글", "검색", "최적화", "Analyzer"],
    publishedDate: new Date("2024-02-20"),
    views: 890,
    likes: 32
  },
  {
    _id: 3,
    title: "Atlas Search 디버깅 실전 가이드",
    content: "검색 결과가 예상과 다를 때 문제를 진단하고 해결하는 방법을 단계별로 설명합니다. 실제 사례를 통한 디버깅 프로세스를 공유합니다.",
    author: "박튜닝",
    category: "디버깅",
    tags: ["디버깅", "문제해결", "실전", "가이드"],
    publishedDate: new Date("2024-03-10"),
    views: 2100,
    likes: 78
  }
];



