# MongoDB Atlas 데이터베이스 생성기

MongoDB Atlas 연결 문자열과 데이터베이스 이름을 웹 인터페이스를 통해 입력받아 데이터베이스를 생성하는 Node.js 웹 애플리케이션입니다.

## Atlas Search 디버깅 예제

이 프로젝트는 Atlas Search 디버깅을 실습할 수 있는 예제와 한글 위주 샘플 데이터를 포함합니다.

### 주요 기능

- 웹 기반 데이터베이스 생성 도구
- Atlas Search 디버깅 시나리오 예제 (Top 5)
- 한글 위주 샘플 데이터
- 실전 디버깅 체크리스트

## 설치 방법

```bash
npm install
```

## 사용 방법

```bash
npm start
```

서버가 시작되면 웹 브라우저에서 `http://localhost:3000`을 열어주세요.

웹 페이지에서 다음을 입력하세요:

1. **MongoDB Atlas 연결 문자열**: MongoDB Atlas에서 제공하는 연결 문자열
   - 예: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`

2. **데이터베이스 이름**: 생성할 데이터베이스의 이름

## 연결 문자열 형식

MongoDB Atlas 연결 문자열은 일반적으로 다음과 같은 형식입니다:

```
mongodb+srv://<username>:<password>@<cluster-url>/<database>?<options>
```

또는

```
mongodb://<username>:<password>@<cluster-url>:<port>/<database>?<options>
```

## 주의사항

- MongoDB Atlas에서 IP 주소가 화이트리스트에 추가되어 있어야 합니다.
- 사용자 이름과 비밀번호가 올바른지 확인하세요.
- 데이터베이스 이름에 특수 문자를 사용할 때는 주의하세요.

## 기능

- 웹 기반 사용자 인터페이스
- 실시간 오류 처리 및 피드백
- 서버 측 데이터베이스 생성
- 반응형 디자인

## 포트 변경

기본 포트는 3000입니다. 환경 변수로 변경할 수 있습니다:

```bash
PORT=8080 npm start
```

## Atlas Search 디버깅 예제 사용하기

### 1. 샘플 데이터 삽입

```bash
node scripts/insert-sample-data.js <connectionString> <databaseName>
```

예시:
```bash
node scripts/insert-sample-data.js "mongodb+srv://user:pass@cluster.mongodb.net/" "atlas_search_demo"
```

### 2. Search Index 생성

Atlas UI에서 Search Index를 생성하세요:
- Index 이름: `productSearch`
- Collection: `products`
- Mappings: `dynamic: true` 또는 필요한 필드 매핑

### 3. 디버깅 예제 확인

웹 브라우저에서 `http://localhost:3000/examples.html`을 열어 디버깅 예제를 확인하세요.

### 4. 예제 파일 구조

- `data/sample-data.js` - 한글 위주 샘플 데이터
- `examples/scenario-1-no-results.js` - 검색 결과 0건 시나리오
- `examples/scenario-2-wrong-results.js` - 기대와 다른 결과 시나리오
- `examples/scenario-3-performance.js` - 성능 문제 시나리오
- `examples/scenario-4-index-changes.js` - Index 변경 시나리오
- `examples/scenario-5-production-issues.js` - 운영 환경 문제 시나리오
- `examples/debugging-checklist.md` - 디버깅 체크리스트

## 디버깅 시나리오

### 시나리오 1: 검색 결과가 0건 나오는 경우
- Index가 없는 경우
- dynamic: false + 필드 누락
- Analyzer 불일치
- Nested document 구조 미스매치

### 시나리오 2: 결과는 나오지만 기대와 다른 경우
- text vs autocomplete vs phrase 차이
- Tokenization 이슈 (한글, 영어, 숫자 혼합)
- 대소문자 / 공백 / 특수문자 문제

### 시나리오 3: 성능이 느린 경우
- 검색 대상 필드 과다
- 불필요한 should / must 조합
- $search 이후 $match, $project 순서 문제

### 시나리오 4: Index 변경 후 결과가 이상한 경우
- Index rebuild 중 쿼리 실행
- Mapping 변경 후 반영 지연
- 다중 Index 공존 시 혼동

### 시나리오 5: 운영 환경에서만 발생하는 문제
- 데이터 편차 (prod vs dev)
- 샤딩 환경에서의 검색 범위
- 트래픽 증가 시 Search 노드 리소스 한계

