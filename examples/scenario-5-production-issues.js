// 시나리오 5: 운영 환경에서만 발생하는 문제

export const scenario5Examples = {
  description: "운영 환경에서만 발생하는 문제와 해결 방법",
  
  // 문제 상황 1: 데이터 편차 (prod vs dev)
  problem1: {
    name: "데이터 편차로 인한 문제",
    dev: {
      dataCount: 100,
      sampleData: "간단한 테스트 데이터",
      structure: "단순한 구조"
    },
    prod: {
      dataCount: 1000000,
      sampleData: "복잡한 실제 데이터",
      structure: "다양한 구조, null 값, 중첩 문서"
    },
    issue: "개발 환경에서는 정상 작동하지만 운영 환경에서 문제 발생",
    solution: {
      step1: "운영 데이터 샘플 추출",
      step2: "로컬에서 재현",
      step3: "동일 쿼리로 환경별 결과 비교",
      checkQuery: `
        // 운영 데이터 샘플 추출
        db.products.aggregate([
          { $sample: { size: 1000 } },
          { $out: "products_sample" }
        ])
        
        // 샘플 데이터로 테스트
        db.products_sample.aggregate([
          {
            $search: {
              index: "productSearch",
              text: { query: "갤럭시", path: "name" }
            }
          }
        ])
        
        // 환경별 결과 비교
        // 개발: db_dev.products.aggregate([...])
        // 운영: db_prod.products.aggregate([...])
      `
    }
  },

  // 문제 상황 2: 샤딩 환경에서의 검색 범위
  problem2: {
    name: "샤딩 환경에서의 검색 범위 문제",
    issue: "샤딩된 컬렉션에서 검색 시 일부 샤드만 검색하거나 결과가 누락될 수 있음",
    solution: {
      step1: "샤드 키와 검색 필드 관계 확인",
      step2: "전체 샤드에서 검색되는지 확인",
      step3: "필요시 샤드 키 전략 재검토",
      checkQuery: `
        // 샤드 정보 확인
        db.products.getShardDistribution()
        
        // 샤드 키 확인
        sh.status()
        
        // 검색 쿼리 (자동으로 모든 샤드 검색)
        db.products.aggregate([
          {
            $search: {
              index: "productSearch",
              text: { query: "갤럭시", path: "name" }
            }
          }
        ])
        
        // 주의: 샤드 키로 필터링하면 특정 샤드만 검색됨
        db.products.aggregate([
          { $match: { shardKey: "value" } },  // 샤드 키 필터
          {
            $search: {
              index: "productSearch",
              text: { query: "갤럭시", path: "name" }
            }
          }
        ])
      `
    }
  },

  // 문제 상황 3: 트래픽 증가 시 Search 노드 리소스 한계
  problem3: {
    name: "트래픽 증가 시 Search 노드 리소스 한계",
    symptoms: [
      "검색 응답 시간 증가",
      "타임아웃 발생",
      "Search 노드 CPU/메모리 사용률 증가"
    ],
    solution: {
      step1: "Atlas Metrics에서 Search Latency 확인",
      step2: "쿼리 최적화",
      step3: "Search Node Scaling 고려",
      checkQuery: `
        // 현재 쿼리 성능 확인
        db.products.aggregate([
          {
            $search: {
              index: "productSearch",
              text: { query: "갤럭시", path: "name" }
            }
          }
        ]).explain("executionStats")
        
        // 최적화: limit 조기 적용
        db.products.aggregate([
          {
            $search: {
              index: "productSearch",
              text: { query: "갤럭시", path: "name" }
            }
          },
          { $limit: 20 }  // 조기 limit 적용
        ])
        
        // 최적화: 불필요한 필드 제거
        db.products.aggregate([
          {
            $search: {
              index: "productSearch",
              text: { query: "갤럭시", path: "name" }
            }
          },
          { $limit: 20 },
          { $project: { name: 1, price: 1 } }  // 필요한 필드만
        ])
      `
    }
  },

  // 디버깅 포인트
  debuggingPoints: [
    "Sample 데이터 추출 방법",
    "동일 쿼리의 환경별 결과 비교",
    "Search Node Scaling 전략",
    "샤딩 환경에서의 검색 범위 확인",
    "트래픽 패턴 분석",
    "리소스 사용률 모니터링"
  ],

  // 운영 환경 디버깅 체크리스트
  productionChecklist: [
    "운영 데이터 샘플로 로컬 재현",
    "환경별(dev/staging/prod) 쿼리 결과 비교",
    "샤드 분산 상태 확인",
    "Search 노드 리소스 모니터링",
    "트래픽 패턴 분석",
    "쿼리 최적화 적용",
    "필요시 Search Node 스케일링"
  ],

  // 모니터링 쿼리
  monitoring: `
    // 검색 성능 모니터링
    function monitorSearchPerformance(collectionName, indexName, query) {
      const start = Date.now();
      const result = db[collectionName].aggregate([
        {
          $search: {
            index: indexName,
            text: query
          }
        },
        { $limit: 10 }
      ]).toArray();
      const duration = Date.now() - start;
      
      return {
        duration: duration,
        resultCount: result.length,
        timestamp: new Date()
      };
    }
    
    // 사용 예시
    monitorSearchPerformance("products", "productSearch", {
      query: "갤럭시",
      path: "name"
    });
  `
};




