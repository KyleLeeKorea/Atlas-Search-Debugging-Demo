// 시나리오 4: Index 변경 후 결과가 이상한 경우

export const scenario4Examples = {
  description: "Index 변경 후 검색 결과가 예상과 다른 경우",
  
  // 문제 상황 1: Index rebuild 중 쿼리 실행
  problem1: {
    name: "Index rebuild 중 쿼리 실행",
    scenario: "Index 정의를 변경한 후 바로 쿼리 실행",
    issue: "Index가 BUILDING 상태일 때는 이전 Index를 사용하거나 오류 발생",
    solution: {
      step1: "Index Status 확인",
      step2: "READY 상태가 될 때까지 대기",
      checkQuery: `
        // Index Status 확인
        db.products.getSearchIndexes()
        
        // Status 값:
        // - BUILDING: 인덱스 생성/재구성 중
        // - READY: 사용 가능
        // - FAILED: 실패
        // - PENDING: 대기 중
        
        // Status 확인 후 쿼리 실행
        const indexes = db.products.getSearchIndexes();
        const searchIndex = indexes.find(idx => idx.name === "productSearch");
        
        if (searchIndex.status === "READY") {
          // 쿼리 실행
          db.products.aggregate([
            {
              $search: {
                index: "productSearch",
                text: { query: "갤럭시", path: "name" }
              }
            }
          ])
        } else {
          console.log("Index is still building. Please wait.");
        }
      `
    }
  },

  // 문제 상황 2: Mapping 변경 후 반영 지연
  problem2: {
    name: "Mapping 변경 후 반영 지연",
    oldIndex: {
      mappings: {
        fields: {
          name: { type: "string", analyzer: "standard" }
        }
      }
    },
    newIndex: {
      mappings: {
        fields: {
          name: { type: "string", analyzer: "lucene.korean" }
        }
      }
    },
    issue: "Index 변경 후에도 이전 결과가 나올 수 있음",
    solution: {
      step1: "Index 재구성 완료 확인",
      step2: "변경 사항이 반영되었는지 테스트 쿼리 실행",
      step3: "캐시 클리어 (필요시)",
      checkQuery: `
        // Index 재구성
        // Atlas UI에서 Index 수정 후
        
        // 1. Status 확인
        db.products.getSearchIndexes()
        
        // 2. 테스트 쿼리로 변경 사항 확인
        db.products.aggregate([
          {
            $search: {
              index: "productSearch",
              text: { query: "갤럭시", path: "name" }
            }
          },
          { $limit: 1 }
        ])
        
        // 3. 결과 비교 (변경 전/후)
        // Analyzer 변경 시 토크나이징 결과가 달라짐
      `
    }
  },

  // 문제 상황 3: 다중 Index 공존 시 혼동
  problem3: {
    name: "다중 Index 공존 시 혼동",
    indexes: [
      { name: "productSearch", status: "READY" },
      { name: "productSearch_v2", status: "READY" },
      { name: "productSearch_old", status: "READY" }
    ],
    issue: "여러 Index가 있을 때 잘못된 Index 사용 가능",
    solution: {
      step1: "사용 중인 Index 이름 확인",
      step2: "불필요한 Index 삭제",
      step3: "Index 버전 관리 전략 수립",
      checkQuery: `
        // 모든 Index 확인
        db.products.getSearchIndexes()
        
        // 특정 Index 삭제
        db.products.dropSearchIndex("productSearch_old")
        
        // Index 이름 명확히 지정
        db.products.aggregate([
          {
            $search: {
              index: "productSearch_v2",  // 명시적으로 지정
              text: { query: "갤럭시", path: "name" }
            }
          }
        ])
      `
    }
  },

  // Index 버전 관리 전략
  versionStrategy: {
    naming: [
      "productSearch_v1",
      "productSearch_v2",
      "productSearch_latest"
    ],
    migration: {
      step1: "새 Index 생성 (v2)",
      step2: "v2가 READY 상태가 될 때까지 대기",
      step3: "애플리케이션에서 v2로 전환",
      step4: "테스트 후 v1 삭제"
    },
    rollback: {
      step1: "문제 발견 시 즉시 v1으로 롤백",
      step2: "v2 문제 분석",
      step3: "수정 후 v3 생성"
    }
  },

  // 디버깅 체크리스트
  debuggingChecklist: [
    "Index Status 확인 (BUILDING / READY / FAILED)",
    "변경 이력 관리 (버전 관리)",
    "Index 버전 전략 수립",
    "다중 Index 공존 시 명확한 이름 사용",
    "Index 변경 후 테스트 쿼리 실행",
    "변경 전/후 결과 비교",
    "불필요한 Index 정리"
  ],

  // Index 변경 모니터링
  monitoring: `
    // Index 상태 모니터링 함수
    function checkIndexStatus(collectionName, indexName) {
      const indexes = db[collectionName].getSearchIndexes();
      const index = indexes.find(idx => idx.name === indexName);
      
      if (!index) {
        return { error: "Index not found" };
      }
      
      return {
        name: index.name,
        status: index.status,
        definition: index.latestDefinition,
        ready: index.status === "READY"
      };
    }
    
    // 사용 예시
    checkIndexStatus("products", "productSearch");
  `
};




