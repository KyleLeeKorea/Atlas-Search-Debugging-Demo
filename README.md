# MongoDB Atlas Search 디버깅 데모

MongoDB Atlas Search 디버깅을 실습할 수 있는 웹 기반 데모 애플리케이션입니다. 가장 흔한 검색 문제 상황을 시나리오별로 제공하며, 실시간으로 쿼리를 실행하고 결과를 확인할 수 있습니다.

## 주요 기능

- 🌐 **웹 기반 인터페이스**: 브라우저에서 바로 사용 가능한 직관적인 UI
- 🔍 **5가지 디버깅 시나리오**: 실제 운영 환경에서 자주 발생하는 문제 상황
- 📊 **실시간 쿼리 실행**: Atlas Search 쿼리를 웹에서 바로 실행하고 결과 확인
- ✏️ **쿼리 편집 기능**: 기본 쿼리를 수정하여 다양한 조건으로 테스트
- 📦 **샘플 데이터 자동 생성**: 각 시나리오별 최적화된 샘플 데이터 제공
- 🔧 **Search Index 관리**: Index 목록 조회 및 생성 가이드
- 📝 **디버깅 체크리스트**: 체계적인 문제 해결 가이드

## 설치 및 실행

### 필수 요구사항

- Node.js (v14 이상)
- MongoDB Atlas 계정 및 클러스터

### 설치

```bash
npm install
```

### 실행

```bash
npm start
```

서버가 시작되면 브라우저에서 `http://localhost:3000`을 열어주세요.

기본 포트는 3000입니다. 환경 변수로 변경할 수 있습니다:

```bash
PORT=8080 npm start
```

## 사용 방법

### 1. 연결 정보 입력

웹 페이지 상단의 연결 정보 입력 폼에 다음을 입력하세요:

- **MongoDB Atlas 연결 문자열**: MongoDB Atlas에서 제공하는 연결 문자열
  - 예: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`
- **데이터베이스 이름**: 사용할 데이터베이스 이름

### 2. 샘플 데이터 로드

각 시나리오 탭에서 해당 시나리오에 필요한 샘플 데이터를 로드할 수 있습니다:

- **시나리오 1, 2**: `products`, `articles` 컬렉션
- **시나리오 3**: `bigProducts`, `bigArticles` 컬렉션 (10만 건 이상)
- **시나리오 4**: `game_chat`, `game_hanchat` 컬렉션

### 3. Search Index 생성

각 시나리오의 가이드를 따라 MongoDB Atlas UI에서 Search Index를 생성하세요. Index 생성 가이드가 각 시나리오에 포함되어 있습니다.

### 4. 쿼리 실행 및 테스트

- 기본 쿼리 실행 버튼으로 예제 쿼리를 실행할 수 있습니다
- "수정된 쿼리 실행" 기능으로 쿼리를 편집하여 다양한 조건으로 테스트할 수 있습니다

## 디버깅 시나리오

### 시나리오 1: 검색 결과가 0건 나오는 경우

**주요 문제 상황:**
- Index가 없는 경우
- `dynamic: false` 설정에서 필드 매핑 누락
- Analyzer 불일치
- Nested document 구조 미스매치

**컬렉션:**
- `products`: 상품 데이터
- `articles`: 게시글 데이터

**주요 기능:**
- Index 목록 확인
- Index 생성 가이드
- `$searchMeta`로 매칭 확인
- 쿼리 편집 및 실행

### 시나리오 2: 결과는 나오지만 기대와 다른 경우

**주요 문제 상황:**
- `text` vs `autocomplete` vs `phrase` 검색 타입 차이
- Tokenization 이슈 (한글, 영어, 숫자 혼합)
- 대소문자 / 공백 / 특수문자 처리 문제
- 점수(Score) 기준 정렬 및 가중치 설정

**컬렉션:**
- `products`: 상품 데이터

**주요 기능:**
- Field Boost를 활용한 검색 결과 순위 조정
- Compound 쿼리와 Should 절 활용
- autocomplete 검색 구현
- phrase 검색 활용
- Score 확인 및 분석

### 시나리오 3: 성능이 느린 경우

**주요 문제 상황:**
- 검색 대상 필드 과다
- 불필요한 `should` / `must` 조합
- `$search` 이후 `$match`, `$project` 순서 문제
- Index 크기 증가

**컬렉션:**
- `bigProducts`: 대량 상품 데이터 (10만 건 이상)
- `bigArticles`: 대량 게시글 데이터 (3만 건 이상)

**주요 기능:**
- `$limit` 조기 적용으로 성능 개선
- Projection 최소화
- `filter` vs `must` 차이 이해
- `$searchMeta`로 성능 문제 원인 분리
- autocomplete 성능 최적화

### 시나리오 4: 다국어 환경에서의 검색

**주요 문제 상황:**
- 한자, 영문, 한글이 혼합된 다국어 데이터 검색
- Analyzer 선택에 따른 검색 결과 차이
- `lucene.korean` vs `lucene.standard` analyzer 비교

**컬렉션:**
- `game_chat`: 다국어 데이터 (한자+영문+한글 혼합)
- `game_hanchat`: 순수 한글 데이터

**주요 기능:**
- Case 1: `lucene.korean` analyzer 사용 (game_chat)
- Case 2: `lucene.standard` analyzer 사용 (game_chat)
- game_hanchat에서 analyzer별 비교
- 다국어 검색 최적화 가이드

**특징:**
- `game_chat`: 다국어 플레이어 이름 (예: "黑王子hight", "黑王子가hight커")
- `game_hanchat`: 순수 한글 플레이어 이름 (예: "검은왕자공격", "흰기사방어")
- 각 시나리오에서 Case 1과 Case 2를 비교하여 analyzer 차이 확인

### 시나리오 5: 운영 환경에서만 발생하는 문제

**주요 문제 상황:**
- 데이터 편차 (프로덕션 vs 개발 환경)
- 샤딩 환경에서의 검색 범위
- 트래픽 증가 시 Search 노드 리소스 한계

**주요 기능:**
- 운영 환경 모니터링 가이드
- 데이터 검증 방법

## 샘플 데이터

### 시나리오 1, 2용 데이터

- **products**: 11건의 상품 데이터 (한글 제품명, 설명, 카테고리 등)
- **articles**: 3건의 게시글 데이터

### 시나리오 3용 데이터

- **bigProducts**: 100,000건의 대량 상품 데이터
- **bigArticles**: 30,000건의 대량 게시글 데이터

### 시나리오 4용 데이터

- **game_chat**: 119건의 다국어 게임 채팅 데이터
  - 플레이어 이름: 한자+영문, 한자+한글, 영문+한글 조합
  - 예: "黑王子hight", "黑王子가hight커", "hi왕자" 등
- **game_hanchat**: 105건의 순수 한글 게임 채팅 데이터
  - 플레이어 이름: 순수 한글 조합만 사용
  - 예: "검은왕자공격", "흰기사방어", "파란전사치유" 등

## API 엔드포인트

### POST `/api/test-connection`
연결 문자열과 데이터베이스 연결 테스트

### POST `/api/load-sample-data`
전체 샘플 데이터 로드 (시나리오 1, 2, 3, 4 모든 데이터)

### POST `/api/load-game-chat-data`
시나리오 4용 데이터만 로드 (game_chat, game_hanchat)

### POST `/api/execute-query`
Atlas Search 쿼리 실행

**요청 본문:**
```json
{
  "connectionString": "mongodb+srv://...",
  "dbName": "database_name",
  "collection": "collection_name",
  "query": [...],
  "queryType": "aggregate"
}
```

### POST `/api/get-search-indexes`
Search Index 목록 조회

### POST `/api/create-search-index`
Search Index 생성 (Atlas UI 사용 권장)

### POST `/api/execute-find`
일반 find 쿼리 실행 (데이터 확인용)

## 파일 구조

```
Atlas-Search-Debugging-Demo/
├── data/
│   └── sample-data.js           # 샘플 데이터 생성 함수
├── examples/
│   ├── debugging-checklist.md   # 디버깅 체크리스트
│   ├── scenario-1-no-results.js # 시나리오 1 예제
│   ├── scenario-2-wrong-results.js # 시나리오 2 예제
│   ├── scenario-3-performance.js # 시나리오 3 예제
│   ├── scenario-4-index-changes.js # 시나리오 4 예제
│   └── scenario-5-production-issues.js # 시나리오 5 예제
├── public/
│   ├── index.html               # 메인 페이지 (데이터 로드)
│   └── examples.html            # 디버깅 예제 페이지
├── scripts/
│   └── insert-sample-data.js    # 샘플 데이터 삽입 스크립트
├── server.js                    # Express 서버
└── package.json
```

## 주요 기능 상세

### 웹 인터페이스

- **연결 정보 입력**: MongoDB Atlas 연결 문자열과 데이터베이스 이름 입력
- **연결 정보 저장**: localStorage에 연결 정보 자동 저장
- **탭 기반 네비게이션**: 시나리오별로 구분된 탭 인터페이스
- **쿼리 실행**: 버튼 클릭으로 쿼리 실행 및 결과 표시
- **쿼리 편집**: textarea에서 쿼리를 편집하여 수정된 쿼리 실행
- **결과 표시**: 실행 시간, 결과 개수, 상세 데이터 표시
- **에러 처리**: 친절한 에러 메시지와 해결 방법 안내

### 샘플 데이터 생성

- **자동 생성**: 함수 호출로 대량 데이터 자동 생성
- **배치 처리**: 대량 데이터는 배치 단위로 삽입하여 성능 최적화
- **다양한 데이터 타입**: 한글, 영문, 한자, 숫자 등 다양한 데이터 타입 포함

## 주의사항

- MongoDB Atlas에서 IP 주소가 화이트리스트에 추가되어 있어야 합니다
- 사용자 이름과 비밀번호가 올바른지 확인하세요
- Search Index 생성은 MongoDB Atlas UI에서 수행하는 것을 권장합니다
- 대량 데이터 로드는 시간이 걸릴 수 있습니다 (시나리오 3: 약 수 분 소요)
- Index가 BUILDING 상태일 때는 쿼리 실행이 제한될 수 있습니다

## 연결 문자열 형식

MongoDB Atlas 연결 문자열은 일반적으로 다음과 같은 형식입니다:

```
mongodb+srv://<username>:<password>@<cluster-url>/<database>?<options>
```

또는

```
mongodb://<username>:<password>@<cluster-url>:<port>/<database>?<options>
```

**중요:** localhost, 127.0.0.1, 또는 :28000이 포함된 연결 문자열은 사용할 수 없습니다. MongoDB Atlas 연결 문자열을 사용해야 합니다.

## 디버깅 체크리스트

웹 인터페이스의 "체크리스트" 탭에서 다음 항목들을 확인할 수 있습니다:

- Index 존재 여부 확인
- Index Status 확인 (BUILDING / READY / FAILED)
- Mapping vs 실제 데이터 구조 일치 여부
- Analyzer 확인
- `$searchMeta` 활용
- 단순 쿼리부터 단계적 확장
- Score 기준 정렬로 관련도 확인
- Index 버전 관리 전략

## 라이선스

ISC

## 기여

이슈나 개선 제안은 GitHub Issues를 통해 제출해주세요.
