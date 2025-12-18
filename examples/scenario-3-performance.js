// 시나리오 3: 성능이 느린 경우

export const scenario3Examples = {
  description: "검색 성능이 느린 경우의 원인과 최적화 방법",
  
  // 문제 상황 1: 검색 대상 필드 과다
  problem1: {
    name: "검색 대상 필드가 너무 많은 경우",
    query: {
      $search: {
        index: "productSearch",
        compound: {
          should: [
            { text: { query: "갤럭시", path: "name" } },
            { text: { query: "갤럭시", path: "description" } },
            { text: { query: "갤럭시", path: "category" } },
            { text: { query: "갤럭시", path: "brand" } },
            { text: { query: "갤럭시", path: "tags" } },
            { text: { query: "갤럭시", path: "specifications.storage" } },
            { text: { query: "갤럭시", path: "specifications.color" } }
          ]
        }
      }
    },
    issue: "너무 많은 필드를 검색하면 성능 저하",
    solution: {
      step1: "필수 필드만 검색하도록 최적화",
      step2: "가중치(boost)를 사용하여 중요 필드 우선",
      optimizedQuery: `
        // 최적화된 쿼리
        {
          $search: {
            index: "productSearch",
            compound: {
              should: [
                { 
                  text: { 
                    query: "갤럭시", 
                    path: "name",
                    score: { boost: { value: 3 } }  // 가중치 부여
                  } 
                },
                { 
                  text: { 
                    query: "갤럭시", 
                    path: "description",
                    score: { boost: { value: 2 } }
                  } 
                },
                { 
                  text: { 
                    query: "갤럭시", 
                    path: "tags",
                    score: { boost: { value: 1.5 } }
                  } 
                }
              ]
            }
          }
        }
      `
    }
  },

  // 문제 상황 2: 불필요한 should / must 조합
  problem2: {
    name: "복잡한 should/must 조합",
    query: {
      $search: {
        index: "productSearch",
        compound: {
          must: [
            {
              compound: {
                should: [
                  { text: { query: "갤럭시", path: "name" } },
                  { text: { query: "아이폰", path: "name" } }
                ]
              }
            },
            {
              compound: {
                should: [
                  { text: { query: "프로", path: "name" } },
                  { text: { query: "울트라", path: "name" } }
                ]
              }
            }
          ],
          should: [
            { text: { query: "스마트폰", path: "category" } }
          ]
        }
      }
    },
    issue: "복잡한 중첩 구조는 성능 저하 유발",
    solution: {
      step1: "쿼리 구조 단순화",
      step2: "필요한 조건만 사용",
      optimizedQuery: `
        // 단순화된 쿼리
        {
          $search: {
            index: "productSearch",
            compound: {
              should: [
                { text: { query: "갤럭시 프로", path: "name" } },
                { text: { query: "아이폰 프로", path: "name" } },
                { text: { query: "갤럭시 울트라", path: "name" } }
              ],
              must: [
                { text: { query: "스마트폰", path: "category" } }
              ]
            }
          }
        }
      `
    }
  },

  // 문제 상황 3: $search 이후 $match, $project 순서 문제
  problem3: {
    name: "파이프라인 순서 최적화",
    slowQuery: {
      pipeline: [
        { $match: { inStock: true } },
        { $project: { name: 1, price: 1 } },
        {
          $search: {
            index: "productSearch",
            text: { query: "갤럭시", path: "name" }
          }
        },
        { $limit: 10 }
      ]
    },
    issue: "$search 전에 $match를 실행하면 전체 컬렉션 스캔",
    solution: {
      step1: "$search를 먼저 실행",
      step2: "그 다음 $match, $project 적용",
      step3: "limit을 조기 적용",
      optimizedQuery: `
        // 최적화된 파이프라인
        [
          {
            $search: {
              index: "productSearch",
              text: { query: "갤럭시", path: "name" }
            }
          },
          { $limit: 50 },  // 조기 limit 적용
          { $match: { inStock: true } },
          { $project: { name: 1, price: 1, score: { $meta: "searchScore" } } },
          { $limit: 10 }
        ]
      `
    }
  },

  // 디버깅 포인트
  debuggingPoints: [
    "$search 단독 실행 시간 측정",
    "전체 파이프라인 실행 시간 비교",
    "limit 조기 적용 여부 확인",
    "Atlas Metrics에서 Search Latency 확인",
    "검색 대상 필드 수 최소화",
    "복잡한 쿼리 구조 단순화",
    "인덱스 크기와 성능 관계 확인"
  ],

  // 성능 측정 쿼리
  performanceTest: `
    // $search 단독 실행 시간 측정
    const start = Date.now();
    db.products.aggregate([
      {
        $search: {
          index: "productSearch",
          text: { query: "갤럭시", path: "name" }
        }
      },
      { $limit: 10 }
    ]).toArray();
    const searchTime = Date.now() - start;
    
    // 전체 파이프라인 실행 시간 측정
    const start2 = Date.now();
    db.products.aggregate([
      {
        $search: {
          index: "productSearch",
          text: { query: "갤럭시", path: "name" }
        }
      },
      { $match: { inStock: true } },
      { $project: { name: 1, price: 1 } },
      { $limit: 10 }
    ]).toArray();
    const totalTime = Date.now() - start2;
    
    console.log("Search only:", searchTime, "ms");
    console.log("Total pipeline:", totalTime, "ms");
  `
};



