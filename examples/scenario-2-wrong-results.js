// 시나리오 2: 결과는 나오지만 기대와 다른 경우

export const scenario2Examples = {
  description: "검색 결과는 나오지만 예상과 다른 결과가 나오는 경우",
  
  // 문제 상황 1: text vs autocomplete vs phrase 차이
  problem1: {
    name: "text vs autocomplete vs phrase 차이",
    queries: {
      text: {
        $search: {
          index: "productSearch",
          text: {
            query: "갤럭시 프로",
            path: "name"
          }
        }
      },
      autocomplete: {
        $search: {
          index: "productSearch",
          autocomplete: {
            query: "갤럭시",
            path: "name"
          }
        }
      },
      phrase: {
        $search: {
          index: "productSearch",
          phrase: {
            query: "갤럭시 프로",
            path: "name"
          }
        }
      }
    },
    differences: {
      text: "갤럭시와 프로를 각각 검색 (OR 조건)",
      autocomplete: "갤럭시로 시작하는 단어 검색",
      phrase: "갤럭시 프로를 정확한 구문으로 검색"
    },
    solution: {
      step1: "검색 타입에 맞는 Index 설정 확인",
      step2: "사용 목적에 맞는 검색 타입 선택",
      checkQuery: `
        // text: 일반 텍스트 검색 (토큰화됨)
        db.products.aggregate([
          {
            $search: {
              index: "productSearch",
              text: {
                query: "갤럭시 프로",
                path: "name"
              }
            }
          }
        ])
        
        // autocomplete: 자동완성용 (prefix 검색)
        db.products.aggregate([
          {
            $search: {
              index: "productSearch",
              autocomplete: {
                query: "갤럭시",
                path: "name"
              }
            }
          }
        ])
        
        // phrase: 정확한 구문 검색
        db.products.aggregate([
          {
            $search: {
              index: "productSearch",
              phrase: {
                query: "갤럭시 프로",
                path: "name"
              }
            }
          }
        ])
      `
    }
  },

  // 문제 상황 2: Tokenization 이슈 (한글, 영어, 숫자 혼합)
  problem2: {
    name: "한글, 영어, 숫자 혼합 시 토크나이징 문제",
    data: [
      { name: "갤럭시 S24" },
      { name: "아이폰 15 Pro" },
      { name: "맥북 Pro 16인치" }
    ],
    query: {
      $search: {
        index: "productSearch",
        text: {
          query: "S24",
          path: "name"
        }
      }
    },
    issue: "한글과 영어/숫자가 혼합된 경우 토크나이징이 제대로 안 될 수 있음",
    solution: {
      step1: "Analyzer를 lucene.korean 또는 custom analyzer 사용",
      step2: "영어/숫자 처리 방식 확인",
      checkQuery: `
        // standard analyzer 사용 시
        {
          mappings: {
            fields: {
              name: {
                type: "string",
                analyzer: "standard"  // 한글 처리에 부적합
              }
            }
          }
        }
        
        // lucene.korean analyzer 사용 (권장)
        {
          mappings: {
            fields: {
              name: {
                type: "string",
                analyzer: "lucene.korean"  // 한글 최적화
              }
            }
          }
        }
        
        // Custom analyzer (영어/숫자 보존)
        {
          mappings: {
            fields: {
              name: {
                type: "string",
                analyzer: "lucene.korean",
                searchAnalyzer: "lucene.korean"
              }
            }
          }
        }
      `
    }
  },

  // 문제 상황 3: 대소문자 / 공백 / 특수문자 문제
  problem3: {
    name: "대소문자, 공백, 특수문자 처리 문제",
    queries: {
      caseSensitive: {
        $search: {
          index: "productSearch",
          text: {
            query: "Galaxy",  // 대문자
            path: "name"
          }
        }
      },
      whitespace: {
        $search: {
          index: "productSearch",
          text: {
            query: "갤럭시  S24",  // 공백 2개
            path: "name"
          }
        }
      },
      specialChars: {
        $search: {
          index: "productSearch",
          text: {
            query: "갤럭시-S24",  // 하이픈
            path: "name"
          }
        }
      }
    },
    solution: {
      step1: "Analyzer 설정 확인 (대소문자 무시 여부)",
      step2: "정규화 설정 확인",
      step3: "explain으로 scoring 확인",
      checkQuery: `
        // explain으로 분석
        db.products.aggregate([
          {
            $search: {
              index: "productSearch",
              text: {
                query: "갤럭시",
                path: "name"
              }
            }
          },
          {
            $limit: 1
          }
        ]).explain("executionStats")
        
        // score 기준 정렬 테스트
        db.products.aggregate([
          {
            $search: {
              index: "productSearch",
              text: {
                query: "갤럭시",
                path: "name"
              }
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
      `
    }
  },

  // 디버깅 포인트
  debuggingPoints: [
    "Analyzer 변경 전/후 비교 쿼리 실행",
    "explain을 통한 scoring 확인",
    "score 기준 정렬 테스트",
    "다양한 검색 타입(text, autocomplete, phrase) 비교",
    "토크나이징 결과 확인",
    "대소문자/공백/특수문자 처리 방식 확인"
  ]
};




