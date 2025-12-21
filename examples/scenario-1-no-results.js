// 시나리오 1: 검색 결과가 0건 나오는 경우

export const scenario1Examples = {
  description: "검색 결과가 0건 나오는 경우의 다양한 원인과 해결 방법",
  
  // 문제 상황 1: Index가 없는 경우
  problem1: {
    name: "Index가 없는 경우",
    query: {
      $search: {
        index: "productSearch",
        text: {
          query: "갤럭시",
          path: "name"
        }
      }
    },
    error: "Index 'productSearch' not found",
    solution: {
      step1: "Atlas UI에서 Search Index 확인",
      step2: "Index 이름이 정확한지 확인",
      step3: "Index가 READY 상태인지 확인",
      checkQuery: `
        // Index 목록 확인
        db.products.getSearchIndexes()
      `
    }
  },

  // 문제 상황 2: dynamic: false + 필드 누락
  problem2: {
    name: "dynamic: false 설정 시 필드 누락",
    indexDefinition: {
      name: "productSearch",
      definition: {
        mappings: {
          dynamic: false,
          fields: {
            name: { type: "string" },
            description: { type: "string" }
            // category 필드가 누락됨
          }
        }
      }
    },
    query: {
      $search: {
        index: "productSearch",
        text: {
          query: "스마트폰",
          path: "category"  // Index에 없는 필드 검색
        }
      }
    },
    result: "0건 반환",
    solution: {
      step1: "Index Mapping에서 필드 확인",
      step2: "dynamic: true로 변경하거나 누락된 필드 추가",
      checkQuery: `
        // Index Mapping 확인
        db.products.getSearchIndexes()
        
        // 수정된 Index 정의
        {
          mappings: {
            dynamic: true,  // 또는
            fields: {
              name: { type: "string" },
              description: { type: "string" },
              category: { type: "string" }  // 누락된 필드 추가
            }
          }
        }
      `
    }
  },

  // 문제 상황 3: Analyzer 불일치
  problem3: {
    name: "Analyzer 불일치 (standard vs keyword)",
    indexDefinition: {
      name: "productSearch",
      definition: {
        mappings: {
          fields: {
            name: {
              type: "string",
              analyzer: "keyword"  // keyword analyzer 사용
            }
          }
        }
      }
    },
    query: {
      $search: {
        index: "productSearch",
        text: {
          query: "갤럭시",  // 부분 일치 검색 시도
          path: "name"
        }
      }
    },
    result: "0건 반환 (keyword는 완전 일치만 가능)",
    solution: {
      step1: "Analyzer를 standard 또는 lucene.korean으로 변경",
      step2: "$searchMeta로 매칭 여부 확인",
      checkQuery: `
        // $searchMeta로 확인
        db.products.aggregate([
          {
            $searchMeta: {
              index: "productSearch",
              text: {
                query: "갤럭시",
                path: "name"
              }
            }
          }
        ])
        
        // 수정된 Index (standard analyzer 사용)
        {
          mappings: {
            fields: {
              name: {
                type: "string",
                analyzer: "standard"  // 또는 "lucene.korean"
              }
            }
          }
        }
      `
    }
  },

  // 문제 상황 4: Nested document 구조 미스매치
  problem4: {
    name: "Nested document / array 구조 미스매치",
    data: {
      _id: 1,
      name: "갤럭시 S24",
      specifications: {
        storage: "512GB",
        ram: "12GB"
      }
    },
    indexDefinition: {
      mappings: {
        fields: {
          "specifications.storage": { type: "string" }
        }
      }
    },
    query: {
      $search: {
        index: "productSearch",
        text: {
          query: "512GB",
          path: "specifications.storage"
        }
      }
    },
    result: "구조가 맞지 않으면 0건 반환",
    solution: {
      step1: "실제 데이터 구조 확인",
      step2: "Index Mapping과 데이터 구조 일치 확인",
      checkQuery: `
        // 실제 데이터 구조 확인
        db.products.findOne({ _id: 1 })
        
        // Index Mapping 확인
        db.products.getSearchIndexes()
        
        // 구조가 다르면 Index 재정의 필요
      `
    }
  },

  // 디버깅 체크리스트
  debuggingChecklist: [
    "searchIndexes 확인: db.collection.getSearchIndexes()",
    "Atlas UI → Search Index → Mappings 점검",
    "$searchMeta로 매칭 여부 확인",
    "Index Status가 READY인지 확인",
    "필드 경로가 정확한지 확인",
    "Analyzer 설정 확인",
    "데이터 구조와 Index Mapping 일치 여부 확인"
  ]
};




