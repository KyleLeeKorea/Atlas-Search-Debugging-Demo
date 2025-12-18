// 한글 위주 샘플 데이터 생성 스크립트

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



