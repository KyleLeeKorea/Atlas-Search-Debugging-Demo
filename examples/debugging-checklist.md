# Atlas Search 디버깅 체크리스트

## 기본 확인 사항

### 1. Index 존재 여부 확인
```javascript
// Index 목록 확인
db.collection.getSearchIndexes()

// 특정 Index 확인
db.collection.getSearchIndexes().find(idx => idx.name === "indexName")
```

### 2. Index Status 확인
- **BUILDING**: 인덱스 생성/재구성 중 (쿼리 사용 불가)
- **READY**: 사용 가능
- **FAILED**: 실패 (재생성 필요)
- **PENDING**: 대기 중

### 3. Mapping vs 실제 데이터 구조 일치 여부
```javascript
// 실제 데이터 구조 확인
db.collection.findOne()

// Index Mapping 확인
db.collection.getSearchIndexes()[0].latestDefinition.mappings

// 구조 비교
// - 필드 경로가 정확한가?
// - 중첩 구조가 맞는가?
// - 배열 필드 처리가 올바른가?
```

### 4. Analyzer 확인
```javascript
// Index의 Analyzer 설정 확인
db.collection.getSearchIndexes()[0].latestDefinition.mappings.fields

// 주요 Analyzer:
// - standard: 기본 영어 분석기
// - keyword: 완전 일치만
// - lucene.korean: 한글 최적화
// - custom: 사용자 정의
```

### 5. $searchMeta 활용
```javascript
// 검색 매칭 여부 확인 (결과 없이 메타데이터만)
db.collection.aggregate([
  {
    $searchMeta: {
      index: "indexName",
      text: {
        query: "검색어",
        path: "fieldName"
      }
    }
  }
])
```

## 단계적 디버깅 프로세스

### Step 1: 단순 쿼리부터 시작
```javascript
// 가장 단순한 쿼리로 테스트
db.collection.aggregate([
  {
    $search: {
      index: "indexName",
      text: {
        query: "검색어",
        path: "fieldName"
      }
    }
  },
  { $limit: 1 }
])
```

### Step 2: Index 확인
- Index가 존재하는가?
- Index Status가 READY인가?
- Index 이름이 정확한가?

### Step 3: 필드 경로 확인
- 검색하려는 필드가 Index Mapping에 있는가?
- 필드 경로가 정확한가? (대소문자, 점 표기법)

### Step 4: Analyzer 확인
- Analyzer가 검색어 타입에 적합한가?
- 한글 검색 시 lucene.korean 사용 여부

### Step 5: 데이터 확인
- 실제 데이터에 검색어가 존재하는가?
- 데이터 구조가 Index Mapping과 일치하는가?

### Step 6: 쿼리 복잡도 확인
- 쿼리가 너무 복잡한가?
- 불필요한 조건이 있는가?

## 시나리오별 체크리스트

### 검색 결과가 0건인 경우
- [ ] Index가 존재하는가?
- [ ] Index Status가 READY인가?
- [ ] Index 이름이 정확한가?
- [ ] 필드 경로가 정확한가?
- [ ] dynamic: false인데 필드가 누락되었는가?
- [ ] Analyzer가 적합한가? (keyword는 완전 일치만)
- [ ] 데이터 구조와 Index Mapping이 일치하는가?
- [ ] $searchMeta로 매칭 여부 확인

### 결과는 나오지만 기대와 다른 경우
- [ ] 검색 타입이 적합한가? (text vs autocomplete vs phrase)
- [ ] Analyzer 변경 전/후 비교
- [ ] explain으로 scoring 확인
- [ ] score 기준 정렬 테스트
- [ ] 토크나이징 결과 확인

### 성능이 느린 경우
- [ ] 검색 대상 필드 수 확인
- [ ] 쿼리 복잡도 확인
- [ ] $search 이후 $match, $project 순서 확인
- [ ] limit 조기 적용 여부
- [ ] Atlas Metrics에서 Search Latency 확인

### Index 변경 후 결과가 이상한 경우
- [ ] Index Status 확인 (BUILDING / READY)
- [ ] 변경 이력 관리
- [ ] 다중 Index 공존 시 혼동 여부
- [ ] Index 버전 전략 확인

### 운영 환경에서만 발생하는 문제
- [ ] Sample 데이터 추출하여 재현
- [ ] 환경별(dev/prod) 결과 비교
- [ ] 샤딩 환경에서 검색 범위 확인
- [ ] Search Node 리소스 확인
- [ ] 트래픽 패턴 분석

## 유용한 디버깅 쿼리

### Index 정보 확인
```javascript
db.collection.getSearchIndexes()
```

### $searchMeta로 매칭 확인
```javascript
db.collection.aggregate([
  {
    $searchMeta: {
      index: "indexName",
      text: { query: "검색어", path: "fieldName" }
    }
  }
])
```

### explain으로 분석
```javascript
db.collection.aggregate([
  {
    $search: {
      index: "indexName",
      text: { query: "검색어", path: "fieldName" }
    }
  }
]).explain("executionStats")
```

### Score 확인
```javascript
db.collection.aggregate([
  {
    $search: {
      index: "indexName",
      text: { query: "검색어", path: "fieldName" }
    }
  },
  {
    $addFields: {
      score: { $meta: "searchScore" }
    }
  },
  {
    $sort: { score: -1 }
  }
])
```

### 성능 측정
```javascript
const start = Date.now();
db.collection.aggregate([...]).toArray();
const duration = Date.now() - start;
console.log("Duration:", duration, "ms");
```



