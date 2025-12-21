import express from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import { sampleProducts, sampleArticles, generateLargeSampleData, generateGameChatData, generateGameHanChatData } from './data/sample-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 라우트는 정적 파일 서빙보다 먼저 처리

// 연결 테스트 API 엔드포인트
app.post('/api/test-connection', async (req, res) => {
  const { connectionString, dbName } = req.body;

  // 입력 검증
  if (!connectionString || connectionString.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '연결 문자열이 입력되지 않았습니다.'
    });
  }

  if (!dbName || dbName.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '데이터베이스 이름이 입력되지 않았습니다.'
    });
  }

  let client;
  try {
    // MongoDB 클라이언트 생성 및 연결 테스트
    client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    
    await client.connect();
    
    // 데이터베이스 접근 테스트
    const db = client.db(dbName);
    await db.admin().ping();
    
    // 연결 종료
    await client.close();

    res.json({
      success: true,
      message: '연결 테스트 성공'
    });
  } catch (error) {
    // 연결이 열려있으면 닫기
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('연결 종료 중 오류:', closeError);
      }
    }

    let errorMessage = error.message;
    let errorHint = '';

    if (error.message.includes('authentication')) {
      errorHint = '연결 문자열의 사용자 이름과 비밀번호를 확인하세요.';
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      errorHint = '네트워크 연결을 확인하고 IP 주소가 Atlas 화이트리스트에 추가되어 있는지 확인하세요.';
    } else if (error.message.includes('timeout')) {
      errorHint = '연결 시간이 초과되었습니다. 네트워크 연결과 Atlas 클러스터 상태를 확인하세요.';
    } else {
      errorHint = '연결 문자열 형식과 Atlas 클러스터 설정을 확인하세요.';
    }

    res.status(500).json({ 
      success: false, 
      error: errorMessage, 
      hint: errorHint 
    });
  }
});

// 샘플 데이터 로딩 API 엔드포인트
app.post('/api/load-sample-data', async (req, res) => {
  const { connectionString, dbName } = req.body;

  // 입력 검증
  if (!connectionString || connectionString.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '연결 문자열이 입력되지 않았습니다.'
    });
  }

  if (!dbName || dbName.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '데이터베이스 이름이 입력되지 않았습니다.'
    });
  }

  let client;
  try {
    // MongoDB 클라이언트 생성 및 연결
    client = new MongoClient(connectionString);
    await client.connect();

    // 기존 데이터베이스 삭제 (처음부터 다시 생성하기 위해)
    console.log(`기존 데이터베이스 '${dbName}' 삭제 중...`);
    const db = client.db(dbName);
    
    try {
      // 데이터베이스 삭제 (데이터베이스가 없어도 에러가 발생하지 않도록 try-catch 사용)
      await db.dropDatabase();
      console.log(`기존 데이터베이스 '${dbName}' 삭제 완료`);
    } catch (dropError) {
      // 데이터베이스가 없거나 삭제 중 오류가 발생한 경우
      if (dropError.message && dropError.message.includes('not found')) {
        console.log(`기존 데이터베이스 '${dbName}'가 없습니다. 새로 생성합니다.`);
      } else {
        console.log(`데이터베이스 삭제 중 오류 (무시하고 계속 진행): ${dropError.message}`);
      }
    }

    // 시나리오 1, 2용 기존 샘플 데이터 삽입 (products, articles)
    console.log('시나리오 1, 2용 샘플 데이터 삽입 중...');
    const productsResult = await db.collection('products').insertMany(sampleProducts);
    const articlesResult = await db.collection('articles').insertMany(sampleArticles);
    console.log(`시나리오 1, 2용 데이터 삽입 완료 (products: ${productsResult.insertedCount}개, articles: ${articlesResult.insertedCount}개)`);

    // 시나리오 3용 대량 샘플 데이터 생성 및 삽입 (bigProducts, bigArticles)
    console.log('시나리오 3용 대량 샘플 데이터 생성 중... (10만 건 이상)');
    const { products, articles } = generateLargeSampleData();
    console.log(`생성 완료: bigProducts ${products.length}건, bigArticles ${articles.length}건`);
    
    console.log('시나리오 3용 대량 데이터 삽입 중... (배치 처리)');
    
    // 배치 크기 설정 (한 번에 1000건씩 삽입)
    const batchSize = 1000;
    let bigProductsInserted = 0;
    let bigArticlesInserted = 0;
    
    // bigProducts 배치 삽입
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const result = await db.collection('bigProducts').insertMany(batch);
      bigProductsInserted += result.insertedCount;
      if ((i + batchSize) % 10000 === 0 || i + batchSize >= products.length) {
        console.log(`bigProducts 삽입 진행: ${bigProductsInserted}/${products.length}건`);
      }
    }
    
    // bigArticles 배치 삽입
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      const result = await db.collection('bigArticles').insertMany(batch);
      bigArticlesInserted += result.insertedCount;
      if ((i + batchSize) % 5000 === 0 || i + batchSize >= articles.length) {
        console.log(`bigArticles 삽입 진행: ${bigArticlesInserted}/${articles.length}건`);
      }
    }
    
    console.log(`시나리오 3용 데이터 삽입 완료 (bigProducts: ${bigProductsInserted}개, bigArticles: ${bigArticlesInserted}개, 총: ${bigProductsInserted + bigArticlesInserted}개)`);
    
    // 시나리오 4용 game_chat 다국어 샘플 데이터 생성 및 삽입
    console.log('시나리오 4용 game_chat 다국어 샘플 데이터 생성 중...');
    const gameChats = generateGameChatData();
    console.log(`생성 완료: game_chat ${gameChats.length}건`);
    
    const gameChatResult = await db.collection('game_chat').insertMany(gameChats);
    console.log(`game_chat 데이터 삽입 완료: ${gameChatResult.insertedCount}개`);
    
    // 시나리오 4용 game_hanchat 순수 한글 샘플 데이터 생성 및 삽입
    console.log('='.repeat(60));
    console.log('시나리오 4용 game_hanchat 순수 한글 샘플 데이터 생성 중...');
    let gameHanChatResult = { insertedCount: 0 };
    let gameHanChatError = null;
    
    // 함수 존재 여부 확인
    if (typeof generateGameHanChatData !== 'function') {
      const errorMsg = 'generateGameHanChatData 함수를 찾을 수 없습니다.';
      console.error('❌', errorMsg);
      gameHanChatError = new Error(errorMsg);
    } else {
      try {
        console.log('✅ generateGameHanChatData 함수 확인됨');
        console.log('generateGameHanChatData 함수 호출 중...');
        const gameHanChats = generateGameHanChatData();
        console.log(`✅ 생성 완료: game_hanchat ${gameHanChats.length}건`);
        if (gameHanChats.length > 0) {
          console.log(`첫 번째 데이터 샘플:`, JSON.stringify(gameHanChats[0], null, 2));
        }
        
        console.log('game_hanchat 컬렉션에 데이터 삽입 시작...');
        console.log(`삽입할 데이터 개수: ${gameHanChats.length}개`);
        gameHanChatResult = await db.collection('game_hanchat').insertMany(gameHanChats);
        console.log(`✅ game_hanchat 데이터 삽입 완료: ${gameHanChatResult.insertedCount}개`);
        console.log('='.repeat(60));
      } catch (err) {
        gameHanChatError = err;
        console.error('='.repeat(60));
        console.error('❌ game_hanchat 데이터 생성/삽입 중 오류 발생!');
        console.error('❌ 에러 메시지:', err.message);
        console.error('❌ 에러 타입:', err.constructor.name);
        console.error('❌ 에러 스택:', err.stack);
        console.error('='.repeat(60));
        // 에러가 발생해도 다른 데이터는 계속 진행
      }
    }
    
    console.log(`전체 데이터 삽입 완료 (시나리오 1,2: products ${productsResult.insertedCount}개, articles ${articlesResult.insertedCount}개 / 시나리오 3: bigProducts ${bigProductsInserted}개, bigArticles ${bigArticlesInserted}개 / 시나리오 4: game_chat ${gameChatResult.insertedCount}개, game_hanchat ${gameHanChatResult.insertedCount}개)`);

    // 샘플 데이터 조회 (각 컬렉션에서 3개씩) - 연결 종료 전에 수행
    const sampleProductsData = await db.collection('products').find({}).limit(3).toArray();
    const sampleArticlesData = await db.collection('articles').find({}).limit(3).toArray();
    const sampleGameChatData = await db.collection('game_chat').find({}).limit(3).toArray();
    let sampleGameHanChatData = [];
    try {
      sampleGameHanChatData = await db.collection('game_hanchat').find({}).limit(3).toArray();
      console.log(`game_hanchat 샘플 데이터 조회 완료: ${sampleGameHanChatData.length}개`);
    } catch (gameHanChatFindError) {
      console.error('❌ game_hanchat 샘플 데이터 조회 중 오류:', gameHanChatFindError.message);
      console.error('❌ 에러 스택:', gameHanChatFindError.stack);
      // 에러가 발생해도 빈 배열로 처리
      sampleGameHanChatData = [];
    }

    // 연결 종료
    await client.close();

    // 응답 메시지 생성
    let responseMessage = `샘플 데이터 로딩 완료 (시나리오 1,2: products ${productsResult.insertedCount}개, articles ${articlesResult.insertedCount}개 / 시나리오 3: bigProducts ${bigProductsInserted}개, bigArticles ${bigArticlesInserted}개 / 시나리오 4: game_chat ${gameChatResult.insertedCount}개`;
    
    if (gameHanChatResult.insertedCount > 0) {
      responseMessage += `, game_hanchat ${gameHanChatResult.insertedCount}개`;
    } else if (gameHanChatError) {
      responseMessage += `, game_hanchat 생성 실패 (에러: ${gameHanChatError.message})`;
    } else {
      responseMessage += `, game_hanchat ${gameHanChatResult.insertedCount}개`;
    }
    responseMessage += ').';

    const response = {
      success: true,
      message: responseMessage,
      counts: {
        products: productsResult.insertedCount,
        articles: articlesResult.insertedCount,
        bigProducts: bigProductsInserted,
        bigArticles: bigArticlesInserted,
        gameChat: gameChatResult.insertedCount,
        gameHanChat: gameHanChatResult.insertedCount
      },
      sampleData: {
        products: sampleProductsData,
        articles: sampleArticlesData,
        gameChat: sampleGameChatData,
        gameHanChat: sampleGameHanChatData
      }
    };

    if (gameHanChatError) {
      response.warnings = [`game_hanchat 데이터 생성 실패: ${gameHanChatError.message}`];
    }

    res.json(response);
  } catch (error) {
    // 연결이 열려있으면 닫기
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('연결 종료 중 오류:', closeError);
      }
    }

    let errorMessage = error.message;
    let errorHint = '';

    if (error.message.includes('authentication')) {
      errorHint = '연결 문자열의 사용자 이름과 비밀번호를 확인하세요.';
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      errorHint = '네트워크 연결을 확인하고 IP 주소가 Atlas 화이트리스트에 추가되어 있는지 확인하세요.';
    } else if (error.message.includes('Invalid connection string')) {
      errorHint = '연결 문자열 형식이 올바른지 확인하세요.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      hint: errorHint
    });
  }
});

// game_chat 컬렉션만 로드하는 API 엔드포인트
app.post('/api/load-game-chat-data', async (req, res) => {
  const { connectionString, dbName } = req.body;

  // 입력 검증
  if (!connectionString || connectionString.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '연결 문자열이 입력되지 않았습니다.'
    });
  }

  if (!dbName || dbName.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '데이터베이스 이름이 입력되지 않았습니다.'
    });
  }

  let client;
  try {
    // MongoDB 클라이언트 생성 및 연결
    client = new MongoClient(connectionString);
    await client.connect();

    const db = client.db(dbName);
    
    // game_chat 컬렉션 삭제
    try {
      await db.collection('game_chat').drop();
      console.log('기존 game_chat 컬렉션 삭제 완료');
    } catch (dropError) {
      if (dropError.message && dropError.message.includes('not found')) {
        console.log('기존 game_chat 컬렉션이 없습니다. 새로 생성합니다.');
      } else {
        console.log(`game_chat 컬렉션 삭제 중 오류 (무시하고 계속 진행): ${dropError.message}`);
      }
    }

    // game_hanchat 컬렉션 삭제
    try {
      await db.collection('game_hanchat').drop();
      console.log('기존 game_hanchat 컬렉션 삭제 완료');
    } catch (dropError) {
      if (dropError.message && dropError.message.includes('not found')) {
        console.log('기존 game_hanchat 컬렉션이 없습니다. 새로 생성합니다.');
      } else {
        console.log(`game_hanchat 컬렉션 삭제 중 오류 (무시하고 계속 진행): ${dropError.message}`);
      }
    }

    // game_chat 샘플 데이터 생성 및 삽입
    console.log('game_chat 다국어 샘플 데이터 생성 중...');
    const gameChats = generateGameChatData();
    console.log(`생성 완료: game_chat ${gameChats.length}건`);
    
    const gameChatResult = await db.collection('game_chat').insertMany(gameChats);
    console.log(`game_chat 데이터 삽입 완료: ${gameChatResult.insertedCount}개`);

    // game_hanchat 샘플 데이터 생성 및 삽입
    console.log('='.repeat(60));
    console.log('game_hanchat 순수 한글 샘플 데이터 생성 중...');
    let gameHanChatResult = { insertedCount: 0 };
    let gameHanChatError = null;
    
    // 함수 존재 여부 확인
    if (typeof generateGameHanChatData !== 'function') {
      const errorMsg = 'generateGameHanChatData 함수를 찾을 수 없습니다.';
      console.error('❌', errorMsg);
      gameHanChatError = new Error(errorMsg);
    } else {
      try {
        console.log('✅ generateGameHanChatData 함수 확인됨');
        console.log('generateGameHanChatData 함수 호출 중...');
        const gameHanChats = generateGameHanChatData();
        console.log(`✅ 생성 완료: game_hanchat ${gameHanChats.length}건`);
        if (gameHanChats.length > 0) {
          console.log(`첫 번째 데이터 샘플:`, JSON.stringify(gameHanChats[0], null, 2));
        }
        
        console.log('game_hanchat 컬렉션에 데이터 삽입 시작...');
        console.log(`삽입할 데이터 개수: ${gameHanChats.length}개`);
        gameHanChatResult = await db.collection('game_hanchat').insertMany(gameHanChats);
        console.log(`✅ game_hanchat 데이터 삽입 완료: ${gameHanChatResult.insertedCount}개`);
        console.log('='.repeat(60));
      } catch (err) {
        gameHanChatError = err;
        console.error('='.repeat(60));
        console.error('❌ game_hanchat 데이터 생성/삽입 중 오류 발생!');
        console.error('❌ 에러 메시지:', err.message);
        console.error('❌ 에러 타입:', err.constructor.name);
        console.error('❌ 에러 스택:', err.stack);
        console.error('='.repeat(60));
      }
    }

    // 샘플 데이터 조회 (3개)
    const sampleGameChatData = await db.collection('game_chat').find({}).limit(3).toArray();
    let sampleGameHanChatData = [];
    try {
      sampleGameHanChatData = await db.collection('game_hanchat').find({}).limit(3).toArray();
      console.log(`game_hanchat 샘플 데이터 조회 완료: ${sampleGameHanChatData.length}개`);
    } catch (gameHanChatFindError) {
      console.error('❌ game_hanchat 샘플 데이터 조회 중 오류:', gameHanChatFindError.message);
      sampleGameHanChatData = [];
    }

    // 연결 종료
    await client.close();

    // 응답 메시지 생성
    let responseMessage = `시나리오 4 샘플 데이터 로딩 완료 (game_chat ${gameChatResult.insertedCount}개`;
    
    if (gameHanChatResult.insertedCount > 0) {
      responseMessage += `, game_hanchat ${gameHanChatResult.insertedCount}개`;
    } else if (gameHanChatError) {
      responseMessage += `, game_hanchat 생성 실패 (에러: ${gameHanChatError.message})`;
    } else {
      responseMessage += `, game_hanchat ${gameHanChatResult.insertedCount}개`;
    }
    responseMessage += ').';

    const response = {
      success: true,
      message: responseMessage,
      counts: {
        gameChat: gameChatResult.insertedCount,
        gameHanChat: gameHanChatResult.insertedCount
      },
      sampleData: {
        gameChat: sampleGameChatData,
        gameHanChat: sampleGameHanChatData
      }
    };

    if (gameHanChatError) {
      response.warnings = [`game_hanchat 데이터 생성 실패: ${gameHanChatError.message}`];
    }

    res.json(response);
  } catch (error) {
    // 연결이 열려있으면 닫기
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('연결 종료 중 오류:', closeError);
      }
    }

    let errorMessage = error.message;
    let errorHint = '';

    if (error.message.includes('authentication')) {
      errorHint = '연결 문자열의 사용자 이름과 비밀번호를 확인하세요.';
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      errorHint = '네트워크 연결을 확인하고 IP 주소가 Atlas 화이트리스트에 추가되어 있는지 확인하세요.';
    } else if (error.message.includes('Invalid connection string')) {
      errorHint = '연결 문자열 형식이 올바른지 확인하세요.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      hint: errorHint
    });
  }
});

// 쿼리 실행 API 엔드포인트
app.post('/api/execute-query', async (req, res) => {
  // 요청 본문을 파일로 저장하여 확인
  const fs = await import('fs');
  const requestLog = {
    timestamp: new Date().toISOString(),
    body: req.body,
    connectionString: req.body.connectionString,
    connectionStringLength: req.body.connectionString ? req.body.connectionString.length : 0,
    connectionStringType: typeof req.body.connectionString,
    hasLocalhost: req.body.connectionString ? (req.body.connectionString.includes('localhost') || req.body.connectionString.includes('127.0.0.1') || req.body.connectionString.includes(':28000')) : false
  };
  fs.writeFileSync('/tmp/mongodb-request.log', JSON.stringify(requestLog, null, 2));
  
  console.log('='.repeat(80));
  console.log('📥 서버: 쿼리 실행 API 요청 수신');
  console.log('='.repeat(80));
  console.log('Request body keys:', Object.keys(req.body));
  console.log('📥 받은 연결 문자열 전체:', req.body.connectionString || 'undefined');
  console.log('📥 받은 연결 문자열 전체 길이:', req.body.connectionString ? req.body.connectionString.length : 0);
  console.log('📥 받은 연결 문자열 타입:', typeof req.body.connectionString);
  console.log('📥 받은 연결 문자열 시작:', req.body.connectionString ? req.body.connectionString.substring(0, 50) : 'N/A');
  console.log('📥 받은 연결 문자열 끝:', req.body.connectionString ? req.body.connectionString.substring(Math.max(0, req.body.connectionString.length - 50)) : 'N/A');
  console.log('📥 localhost 포함 여부:', req.body.connectionString ? (req.body.connectionString.includes('localhost') || req.body.connectionString.includes('127.0.0.1') || req.body.connectionString.includes(':28000')) : 'N/A');
  console.log('📥 데이터베이스 이름:', req.body.dbName);
  console.log('📥 컬렉션:', req.body.collection);
  console.log('📥 쿼리 타입:', req.body.queryType);
  console.log('📥 받은 요청 본문 전체 (JSON):', JSON.stringify(req.body));
  console.log('='.repeat(80));

  const { connectionString, dbName, collection, query, queryType } = req.body;

  // 즉시 연결 문자열 검증 - 가장 먼저 확인
  if (!connectionString) {
    console.error('❌ 연결 문자열이 전달되지 않았습니다. req.body:', JSON.stringify(req.body));
    return res.status(400).json({
      success: false,
      error: '연결 문자열이 전달되지 않았습니다.',
      hint: '클라이언트에서 연결 문자열이 전송되지 않았습니다. 브라우저 콘솔을 확인하세요.',
      debug: {
        requestBodyKeys: Object.keys(req.body),
        connectionStringExists: false
      }
    });
  }

  if (typeof connectionString !== 'string') {
    console.error('❌ 연결 문자열이 문자열 타입이 아닙니다:', typeof connectionString, connectionString);
    return res.status(400).json({
      success: false,
      error: '연결 문자열 형식이 올바르지 않습니다.',
      hint: `연결 문자열은 문자열이어야 합니다. 현재 타입: ${typeof connectionString}`,
      debug: {
        connectionStringType: typeof connectionString,
        connectionStringValue: String(connectionString).substring(0, 50)
      }
    });
  }

  // 연결 문자열 정리 - 제어 문자 및 localhost 관련 문자열 완전 제거
  let cleanedConnectionString = connectionString
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // 제어 문자 제거
    .replace(/\s+/g, '') // 모든 공백 제거
    .replace(/localhost/gi, '') // localhost 완전 제거 (대소문자 무시)
    .replace(/127\.0\.0\.1/g, '') // 127.0.0.1 완전 제거
    .replace(/:28000/g, '') // :28000 완전 제거
    .trim();

  if (cleanedConnectionString === '') {
    console.error('❌ 연결 문자열이 비어있습니다. 원본:', connectionString);
    return res.status(400).json({
      success: false,
      error: '연결 문자열이 비어있습니다.',
      hint: '상단의 연결 정보 입력 폼에 MongoDB Atlas 연결 문자열을 입력하세요.',
      debug: {
        originalLength: connectionString.length,
        cleanedLength: cleanedConnectionString.length
      }
    });
  }

  // localhost 관련 문자열이 원본에 포함되어 있었는지 확인
  const hadLocalhost = connectionString.toLowerCase().includes('localhost') || 
                        connectionString.includes('127.0.0.1') || 
                        connectionString.includes(':28000');
  
  if (hadLocalhost) {
    console.error('❌ 연결 문자열에 localhost 관련 문자열이 포함되어 있었습니다!');
    console.error('원본 연결 문자열:', connectionString);
    console.error('정리된 연결 문자열:', cleanedConnectionString);
    return res.status(400).json({
      success: false,
      error: '연결 문자열에 localhost, 127.0.0.1, 또는 :28000이 포함되어 있습니다.',
      hint: 'MongoDB Atlas 연결 문자열을 사용해야 합니다. localhost, 127.0.0.1, 또는 :28000이 포함된 연결 문자열은 사용할 수 없습니다.'
    });
  }

  const trimmedConnectionString = cleanedConnectionString;

  // 연결 문자열 검증 로그
  console.log('✅ 연결 문자열 검증 통과:', {
    length: trimmedConnectionString.length,
    prefix: trimmedConnectionString.substring(0, 30),
    startsWithMongo: trimmedConnectionString.startsWith('mongodb://') || trimmedConnectionString.startsWith('mongodb+srv://')
  });

  // 연결 문자열 형식 검증
  if (!trimmedConnectionString.startsWith('mongodb://') && !trimmedConnectionString.startsWith('mongodb+srv://')) {
    console.error('연결 문자열 형식 오류:', {
      prefix: trimmedConnectionString.substring(0, 20),
      fullLength: trimmedConnectionString.length,
      firstChars: trimmedConnectionString.substring(0, 50)
    });
    return res.status(400).json({
      success: false,
      error: '올바른 MongoDB 연결 문자열 형식이 아닙니다.',
      hint: `연결 문자열은 mongodb:// 또는 mongodb+srv://로 시작해야 합니다. 현재 값의 시작 부분: "${trimmedConnectionString.substring(0, 50)}"`
    });
  }

  // localhost 포함 여부 최종 확인 (이미 위에서 제거했으므로 이 부분은 이중 확인)
  const hasLocalhost = trimmedConnectionString.toLowerCase().includes('localhost') || 
                       trimmedConnectionString.includes('127.0.0.1') || 
                       trimmedConnectionString.includes(':28000');
  
  if (hasLocalhost) {
    console.error('❌ 연결 문자열에 localhost 관련 문자열이 여전히 포함되어 있습니다!');
    console.error('연결 문자열:', trimmedConnectionString);
    console.error('localhost 포함:', trimmedConnectionString.toLowerCase().includes('localhost'));
    console.error('127.0.0.1 포함:', trimmedConnectionString.includes('127.0.0.1'));
    console.error(':28000 포함:', trimmedConnectionString.includes(':28000'));
    return res.status(400).json({
      success: false,
      error: '연결 문자열에 localhost, 127.0.0.1, 또는 :28000이 포함되어 있습니다.',
      hint: 'MongoDB Atlas 연결 문자열을 사용해야 합니다. localhost, 127.0.0.1, 또는 :28000이 포함된 연결 문자열은 사용할 수 없습니다.'
    });
  }

  if (!dbName || typeof dbName !== 'string' || dbName.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '데이터베이스 이름이 입력되지 않았습니다.'
    });
  }

  if (!collection || typeof collection !== 'string' || collection.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '컬렉션 이름이 입력되지 않았습니다.'
    });
  }

  // getSearchIndexes는 query가 필요 없음
  if (queryType !== 'getSearchIndexes' && !query) {
    return res.status(400).json({
      success: false,
      error: '쿼리가 입력되지 않았습니다.'
    });
  }

  let client;
  let finalConnectionString = trimmedConnectionString; // catch 블록에서 사용하기 위해 외부에 선언
  try {
    // 연결 문자열 최종 검증
    if (trimmedConnectionString.includes('localhost') || trimmedConnectionString.includes('127.0.0.1') || trimmedConnectionString.includes(':28000')) {
      const errorMsg = '연결 문자열에 localhost, 127.0.0.1, 또는 :28000이 포함되어 있습니다. MongoDB Atlas 연결 문자열을 사용해야 합니다.';
      console.error('❌', errorMsg, { connectionString: trimmedConnectionString.substring(0, 100) });
      return res.status(400).json({
        success: false,
        error: errorMsg,
        hint: 'MongoDB Atlas 연결 문자열을 사용하세요. localhost나 127.0.0.1이 포함된 연결 문자열은 사용할 수 없습니다.'
      });
    }

    if (!trimmedConnectionString.startsWith('mongodb://') && !trimmedConnectionString.startsWith('mongodb+srv://')) {
      const errorMsg = `연결 문자열이 mongodb:// 또는 mongodb+srv://로 시작하지 않습니다. 현재 시작 부분: "${trimmedConnectionString.substring(0, 30)}"`;
      console.error('❌', errorMsg);
      return res.status(400).json({
        success: false,
        error: errorMsg,
        hint: '연결 문자열은 mongodb:// 또는 mongodb+srv://로 시작해야 합니다.'
      });
    }

    if (trimmedConnectionString.length < 20) {
      const errorMsg = `연결 문자열이 너무 짧습니다 (${trimmedConnectionString.length}자). 올바른 MongoDB Atlas 연결 문자열인지 확인하세요.`;
      console.error('❌', errorMsg);
      return res.status(400).json({
        success: false,
        error: errorMsg,
        hint: '연결 문자열이 너무 짧습니다. MongoDB Atlas에서 제공하는 전체 연결 문자열을 입력하세요.'
      });
    }

    // 연결 문자열 최종 확인 - 전체 출력 및 상세 검증
    console.log('='.repeat(80));
    console.log('🔍 MongoDB 연결 시도 - 연결 문자열 최종 확인');
    console.log('='.repeat(80));
    console.log('📥 받은 연결 문자열 전체:', trimmedConnectionString);
    console.log('📥 연결 문자열 길이:', trimmedConnectionString.length);
    console.log('📥 연결 문자열 시작:', trimmedConnectionString.substring(0, 50));
    console.log('📥 연결 문자열 끝:', trimmedConnectionString.substring(Math.max(0, trimmedConnectionString.length - 50)));
    
    // 각 문자 확인 (특수문자, 줄바꿈 등)
    const hasNewline = trimmedConnectionString.includes('\n') || trimmedConnectionString.includes('\r');
    const hasTab = trimmedConnectionString.includes('\t');
    const hasControlChars = /[\x00-\x1F\x7F]/.test(trimmedConnectionString);
    console.log('📥 줄바꿈 포함:', hasNewline);
    console.log('📥 탭 포함:', hasTab);
    console.log('📥 제어 문자 포함:', hasControlChars);
    
    // 연결 문자열을 문자 배열로 변환하여 확인
    const suspiciousChars = [];
    for (let i = 0; i < trimmedConnectionString.length; i++) {
      const char = trimmedConnectionString[i];
      const code = char.charCodeAt(0);
      if (code < 32 || code === 127) {
        suspiciousChars.push({ index: i, char: char, code: code });
      }
    }
    if (suspiciousChars.length > 0) {
      console.log('⚠️ 의심스러운 문자 발견:', suspiciousChars);
    }
    
    // URL 파싱 시도
    try {
      const url = new URL(trimmedConnectionString);
      console.log('📥 URL 파싱 성공:');
      console.log('  - 프로토콜:', url.protocol);
      console.log('  - 호스트:', url.hostname);
      console.log('  - 포트:', url.port || '(기본값)');
      console.log('  - 경로:', url.pathname);
      console.log('  - 검색 파라미터:', url.search);
    } catch (urlError) {
      console.log('⚠️ URL 파싱 실패:', urlError.message);
    }
    
    console.log('📥 localhost 포함 여부:', trimmedConnectionString.includes('localhost') || trimmedConnectionString.includes('127.0.0.1') || trimmedConnectionString.includes(':28000'));
    console.log('📥 데이터베이스:', dbName);
    console.log('📥 컬렉션:', collection);
    console.log('📥 쿼리 타입:', queryType);
    console.log('='.repeat(80));
    
    // 연결 문자열 최종 검증 (이미 위에서 검증했지만 다시 한 번 확인)
    const hasLocalhostInTrimmed = trimmedConnectionString.toLowerCase().includes('localhost') || 
                                    trimmedConnectionString.includes('127.0.0.1') || 
                                    trimmedConnectionString.includes(':28000');
    
    if (hasLocalhostInTrimmed) {
      const errorMsg = '❌ 연결 문자열에 localhost 관련 문자열이 포함되어 있습니다!';
      console.error(errorMsg);
      console.error('전체 연결 문자열:', trimmedConnectionString);
      console.error('localhost 포함:', trimmedConnectionString.toLowerCase().includes('localhost'));
      console.error('127.0.0.1 포함:', trimmedConnectionString.includes('127.0.0.1'));
      console.error(':28000 포함:', trimmedConnectionString.includes(':28000'));
      return res.status(400).json({
        success: false,
        error: errorMsg,
        hint: `연결 문자열에 localhost, 127.0.0.1, 또는 :28000이 포함되어 있습니다.\n\n받은 연결 문자열: ${trimmedConnectionString.substring(0, 100)}...`
      });
    }
    
    // 정리된 연결 문자열 사용
    finalConnectionString = trimmedConnectionString;
    
    // MongoClient 생성 전 최종 확인
    if (!finalConnectionString.startsWith('mongodb://') && !finalConnectionString.startsWith('mongodb+srv://')) {
      const errorMsg = '❌ 연결 문자열 형식이 올바르지 않습니다!';
      console.error(errorMsg);
      console.error('전체 연결 문자열:', finalConnectionString);
      return res.status(400).json({
        success: false,
        error: errorMsg,
        hint: `연결 문자열이 mongodb:// 또는 mongodb+srv://로 시작하지 않습니다.\n\n받은 연결 문자열: ${finalConnectionString.substring(0, 100)}...`
      });
    }
    
    // MongoClient 생성 전 최종 최종 확인
    console.log('='.repeat(80));
    console.log('🔌 MongoClient 생성 직전 최종 확인');
    console.log('='.repeat(80));
    console.log('🔌 사용할 연결 문자열 전체:', finalConnectionString);
    console.log('🔌 연결 문자열 길이:', finalConnectionString.length);
    console.log('🔌 연결 문자열 시작:', finalConnectionString.substring(0, 50));
    console.log('🔌 연결 문자열 끝:', finalConnectionString.substring(Math.max(0, finalConnectionString.length - 50)));
    console.log('🔌 localhost 포함 여부:', finalConnectionString.includes('localhost') || finalConnectionString.includes('127.0.0.1') || finalConnectionString.includes(':28000'));
    console.log('🔌 mongodb+srv:// 시작 여부:', finalConnectionString.startsWith('mongodb+srv://'));
    console.log('🔌 mongodb:// 시작 여부:', finalConnectionString.startsWith('mongodb://'));
    
    // 연결 문자열을 JSON으로 직렬화하여 확인 (특수문자 확인)
    console.log('🔌 JSON 직렬화:', JSON.stringify(finalConnectionString));
    console.log('='.repeat(80));
    
    // 절대 localhost가 포함되어 있으면 안 됨 - 최종 검증 (대소문자 무시)
    const hasLocalhostFinal = finalConnectionString.toLowerCase().includes('localhost') || 
                              finalConnectionString.includes('127.0.0.1') || 
                              finalConnectionString.includes(':28000');
    
    if (hasLocalhostFinal) {
      const errorMsg = '❌ 최종 검증 실패: 연결 문자열에 localhost 관련 문자열이 포함되어 있습니다!';
      console.error(errorMsg);
      console.error('전체 연결 문자열:', finalConnectionString);
      console.error('localhost 포함:', finalConnectionString.toLowerCase().includes('localhost'));
      console.error('127.0.0.1 포함:', finalConnectionString.includes('127.0.0.1'));
      console.error(':28000 포함:', finalConnectionString.includes(':28000'));
      console.error('연결 문자열을 문자 단위로 출력:');
      for (let i = 0; i < Math.min(finalConnectionString.length, 300); i++) {
        const char = finalConnectionString[i];
        const code = char.charCodeAt(0);
        const lowerChar = char.toLowerCase();
        if (code < 32 || code === 127 || 
            lowerChar === 'l' || lowerChar === 'o' || lowerChar === 'c' || lowerChar === 'a' || 
            lowerChar === 'h' || lowerChar === 's' || lowerChar === 't' || 
            char === '1' || char === '2' || char === '7' || char === '0' || char === '8' || char === ':' || char === '.') {
          console.error(`  [${i}]: '${char}' (코드: ${code}, 16진수: 0x${code.toString(16)})`);
        }
      }
      return res.status(400).json({
        success: false,
        error: errorMsg,
        hint: `연결 문자열에 localhost, 127.0.0.1, 또는 :28000이 포함되어 있습니다.\n\n받은 연결 문자열: ${finalConnectionString}`
      });
    }
    
    // 연결 문자열 바이트 단위 검증
    console.log('🔌 연결 문자열 바이트 확인:');
    const connectionStringBytes = Buffer.from(finalConnectionString, 'utf8');
    console.log('🔌 바이트 길이:', connectionStringBytes.length);
    console.log('🔌 바이트 배열 (처음 100바이트):', Array.from(connectionStringBytes.slice(0, 100)).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '));
    
    // 연결 문자열을 다시 문자열로 변환하여 확인
    const reconstructed = connectionStringBytes.toString('utf8');
    if (reconstructed !== finalConnectionString) {
      console.error('⚠️ 연결 문자열 재구성 시 차이 발견!');
      console.error('  원본:', finalConnectionString);
      console.error('  재구성:', reconstructed);
    }
    
    // MongoClient 생성
    console.log('🔌 MongoClient 생성 중...');
    const mongoClientOptions = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    };
    console.log('🔌 MongoClient 옵션:', JSON.stringify(mongoClientOptions));
    console.log('🔌 MongoClient에 전달할 연결 문자열 전체:', finalConnectionString);
    console.log('🔌 MongoClient에 전달할 연결 문자열 길이:', finalConnectionString.length);
    
    // 연결 문자열을 직접 복사하여 사용 (참조 문제 방지)
    const connectionStringForMongo = String(finalConnectionString);
    console.log('🔌 복사된 연결 문자열:', connectionStringForMongo);
    console.log('🔌 복사된 연결 문자열 === 원본:', connectionStringForMongo === finalConnectionString);
    console.log('🔌 복사된 연결 문자열에 localhost 포함 여부:', connectionStringForMongo.includes('localhost') || connectionStringForMongo.includes('127.0.0.1') || connectionStringForMongo.includes(':28000'));
    
    // MongoClient 생성 전 최종 최종 최종 확인
    console.log('='.repeat(80));
    console.log('🚨 MongoClient 생성 직전 - 절대 최종 확인');
    console.log('='.repeat(80));
    console.log('🚨 연결 문자열 전체 (문자 단위):');
    for (let i = 0; i < Math.min(connectionStringForMongo.length, 200); i++) {
      const char = connectionStringForMongo[i];
      const code = char.charCodeAt(0);
      if (i < 100 || code < 32 || code === 127 || char === 'l' || char === 'o' || char === 'c' || char === 'a' || char === 'h' || char === 's' || char === 't' || char === '1' || char === '2' || char === '7' || char === '0' || char === '8' || char === ':') {
        console.log(`  [${i}]: '${char}' (코드: ${code}, 16진수: 0x${code.toString(16)})`);
      }
    }
    console.log('🚨 연결 문자열 전체:', connectionStringForMongo);
    console.log('🚨 연결 문자열 길이:', connectionStringForMongo.length);
    console.log('🚨 localhost 검색 결과:', connectionStringForMongo.indexOf('localhost'));
    console.log('🚨 127.0.0.1 검색 결과:', connectionStringForMongo.indexOf('127.0.0.1'));
    console.log('🚨 :28000 검색 결과:', connectionStringForMongo.indexOf(':28000'));
    console.log('='.repeat(80));
    
    // 연결 문자열을 직접 하드코딩하여 테스트 (임시)
    // 실제 연결 문자열이 올바른지 확인하기 위해
    console.log('🚨 최종 확인: MongoClient에 전달할 연결 문자열');
    console.log('🚨 연결 문자열 전체:', connectionStringForMongo);
    console.log('🚨 연결 문자열 길이:', connectionStringForMongo.length);
    console.log('🚨 연결 문자열이 mongodb+srv://로 시작하는가?', connectionStringForMongo.startsWith('mongodb+srv://'));
    console.log('🚨 연결 문자열에 localhost가 있는가?', connectionStringForMongo.includes('localhost'));
    console.log('🚨 연결 문자열에 127.0.0.1이 있는가?', connectionStringForMongo.includes('127.0.0.1'));
    console.log('🚨 연결 문자열에 :28000이 있는가?', connectionStringForMongo.includes(':28000'));
    
    // 연결 문자열을 새 변수에 복사하여 확인
    const finalConnStr = String(connectionStringForMongo);
    console.log('🚨 최종 연결 문자열 변수:', finalConnStr);
    console.log('🚨 최종 연결 문자열 === 원본?', finalConnStr === connectionStringForMongo);
    
    client = new MongoClient(finalConnStr, mongoClientOptions);
    
    console.log('✅ MongoClient 생성 완료, 연결 시도...');
    
    await client.connect();
    console.log('✅ MongoDB 연결 성공');
    const db = client.db(dbName);
    const coll = db.collection(collection);

    let result;
    let executionTime = Date.now();
    let indexInfo = null; // Before 쿼리 인덱스 정보 (모든 쿼리 타입에서 접근 가능)

    if (queryType === 'aggregate') {
      // aggregation pipeline 실행
      console.log('🔍 Aggregation 쿼리 실행 중...');
      console.log('🔍 쿼리:', JSON.stringify(query, null, 2));
      
      // Before 쿼리인 경우 인덱스 확인 및 정보 수집 (scenario4-1-before, scenario4-2-before)
      const searchStage = query && query.length > 0 ? query.find(stage => stage.$search) : null;
      if (searchStage && searchStage.$search && (searchStage.$search.index === 'gameHanChatSearchKorean' || searchStage.$search.index === 'gameChatSearchKorean')) {
        const indexNameToFind = searchStage.$search.index;
        console.log(`🔍 Before 쿼리 감지: ${indexNameToFind} 인덱스 확인 중...`);
        try {
          // 인덱스 목록 확인
          let indexes = [];
          if (typeof coll.getSearchIndexes === 'function') {
            indexes = await coll.getSearchIndexes().toArray();
          } else {
            const indexResult = await db.command({ listSearchIndexes: collection });
            indexes = indexResult.cursor?.firstBatch || [];
          }
          
          // 인덱스 이름에 따라 적절한 인덱스 찾기
          const koreanIndex = indexes.find(idx => idx.name === indexNameToFind);
          const multilingualIndex = collection === 'game_chat' 
            ? indexes.find(idx => idx.name === 'gameChatSearchMultilingual')
            : indexes.find(idx => idx.name === 'gameHanChatSearchMultilingual');
          
          // 인덱스 정보 수집
          indexInfo = {
            exists: !!koreanIndex,
            allIndexes: indexes.map(idx => ({ name: idx.name, status: idx.status || 'unknown' })),
            koreanIndex: koreanIndex ? {
              name: koreanIndex.name,
              status: koreanIndex.status || 'unknown',
              analyzer: null
            } : null,
            multilingualIndex: multilingualIndex ? {
              name: multilingualIndex.name,
              status: multilingualIndex.status || 'unknown'
            } : null
          };
          
          if (koreanIndex) {
            // 인덱스의 analyzer 확인
            const indexDefinition = koreanIndex.latestDefinition || koreanIndex.definition;
            const playerNameField = indexDefinition?.mappings?.fields?.playerName;
            const analyzer = playerNameField?.analyzer;
            indexInfo.koreanIndex.analyzer = analyzer || 'unknown';
            
            if (analyzer !== 'lucene.korean') {
              console.warn(`⚠️ ${indexNameToFind} 인덱스의 analyzer가 'lucene.korean'이 아닙니다: ${analyzer}`);
            }
          }
          
          if (!koreanIndex) {
            console.error(`❌ ${indexNameToFind} 인덱스가 없습니다.`);
            console.error(`현재 존재하는 인덱스: ${indexes.map(idx => idx.name).join(', ')}`);
            await client.close();
            return res.status(400).json({
              success: false,
              error: `${indexNameToFind} 인덱스가 존재하지 않습니다.`,
              hint: `Before 쿼리를 실행하려면 '${indexNameToFind}' 인덱스를 먼저 생성해야 합니다.\n\n` +
                    `현재 존재하는 인덱스: ${indexes.length > 0 ? indexes.map(idx => idx.name).join(', ') : '없음'}\n\n` +
                    `해결 방법:\n` +
                    `1. Atlas UI → Search → Create Search Index\n` +
                    `2. Index 이름: ${indexNameToFind}\n` +
                    `3. Collection: ${collection}\n` +
                    `4. JSON Editor 선택 후 아래 JSON 사용:\n` +
                    `   {\n` +
                    `     "mappings": {\n` +
                    `       "dynamic": false,\n` +
                    `       "fields": {\n` +
                    `         "playerName": {\n` +
                    `           "type": "string",\n` +
                    `           "analyzer": "lucene.korean"\n` +
                    `         }\n` +
                    `       }\n` +
                    `     }\n` +
                    `   }\n` +
                    `5. Index가 READY 상태가 되면 다시 쿼리를 실행하세요.\n\n` +
                    `⚠️ 참고: Before 쿼리는 '${collection}' 컬렉션에서 'lucene.korean' analyzer를 사용합니다.`,
              indexInfo: indexInfo
            });
          }
        } catch (indexCheckError) {
          console.error('❌ 인덱스 확인 중 오류:', indexCheckError.message);
          // 인덱스 확인 실패해도 쿼리는 계속 진행
        }
      }
      
      try {
        result = await coll.aggregate(query).toArray();
        
        // Before 쿼리이고 결과가 나온 경우 경고 정보 추가
        if (searchStage && searchStage.$search && (searchStage.$search.index === 'gameHanChatSearchKorean' || searchStage.$search.index === 'gameChatSearchKorean') && result.length > 0) {
          console.log(`✅ Before 쿼리에서 ${result.length}개 결과가 반환되었습니다.`);
        }
      } catch (aggError) {
        console.error('❌ Aggregation 쿼리 실행 중 오류:', aggError.message);
        console.error('❌ Aggregation 오류 스택:', aggError.stack);
        await client.close();
        
        // localhost 관련 에러인 경우 - Search Index 문제로 판단
        if (aggError.message && (aggError.message.includes('localhost') || aggError.message.includes('127.0.0.1') || aggError.message.includes(':28000'))) {
          const searchIndexName = query && query.length > 0 && query[0].$search ? query[0].$search.index : '알 수 없음';
          return res.status(400).json({
            success: false,
            error: `Search Index '${searchIndexName}'가 존재하지 않거나 올바르게 설정되지 않았습니다.`,
            hint: `에러: ${aggError.message}\n\n이 에러는 Search Index가 없거나 잘못 설정된 경우 발생합니다.\n\n해결 방법:\n1. Atlas UI → Search → Indexes에서 '${searchIndexName}' Index가 존재하는지 확인하세요.\n2. Index가 BUILDING 상태가 아닌 READY 상태인지 확인하세요.\n3. Index 이름이 쿼리에서 사용한 이름과 정확히 일치하는지 확인하세요.\n4. Index Mapping이 올바르게 설정되어 있는지 확인하세요.`
          });
        }
        
        // Index 관련 에러인 경우
        if (aggError.message && (aggError.message.includes('index') || aggError.message.includes('Index'))) {
          let errorHint = 'Search Index가 올바르게 설정되어 있는지 확인하세요.';
          
          // autocomplete 관련 에러인 경우
          if (aggError.message.includes('autocomplete') && aggError.message.includes('definition not present')) {
            errorHint = 'autocomplete 검색을 사용하려면 <strong>별도의 Search Index</strong>를 생성해야 합니다.\n\n' +
              '현재 Index는 string 타입으로 정의되어 있어 autocomplete 검색이 불가능합니다.\n\n' +
              '해결 방법:\n' +
              '1. Atlas UI → Search → Create Search Index\n' +
              '2. <strong>Index 이름:</strong> productSearchAutocomplete (다른 이름 사용 가능)\n' +
              '3. JSON Editor 선택 후 아래 JSON 사용:\n' +
              '   {\n' +
              '     "mappings": {\n' +
              '       "dynamic": false,\n' +
              '       "fields": {\n' +
              '         "name": {\n' +
              '           "type": "autocomplete",\n' +
              '           "analyzer": "lucene.korean"\n' +
              '         }\n' +
              '       }\n' +
              '     }\n' +
              '   }\n' +
              '4. Index가 READY 상태가 되면 쿼리에서 index 이름을 "productSearchAutocomplete"로 변경하여 실행하세요.\n' +
              '5. 또는 text 검색을 사용하세요 (현재 productSearch Index와 호환됨).';
          }
          
          return res.status(400).json({
            success: false,
            error: aggError.message,
            hint: errorHint
          });
        }
        
        throw aggError; // 다른 에러는 그대로 전달
      }
    } else if (queryType === 'getSearchIndexes') {
      // Search Index 목록 조회
      console.log('🔍 Search Index 목록 조회 중...');
      console.log('🔍 데이터베이스:', dbName);
      console.log('🔍 컬렉션:', collection);
      try {
        // MongoDB 드라이버 버전에 따라 다른 방법 시도
        if (typeof coll.getSearchIndexes === 'function') {
          console.log('🔍 getSearchIndexes 메서드 사용');
          result = await coll.getSearchIndexes().toArray();
          console.log('✅ Search Index 목록 조회 성공:', result.length, '개');
        } else {
          // 대체 방법: db.command를 사용하여 현재 데이터베이스 컨텍스트에서 실행
          console.log('🔍 listSearchIndexes 명령어 사용 (db.command)');
          const indexes = await db.command({
            listSearchIndexes: collection
          });
          result = indexes.cursor?.firstBatch || indexes.cursor?.firstBatch || [];
          console.log('✅ Search Index 목록 조회 성공 (명령어):', result.length, '개');
        }
        
        // 결과가 배열이 아닌 경우 처리
        if (!Array.isArray(result)) {
          console.warn('⚠️ Search Index 결과가 배열이 아닙니다:', typeof result);
          result = [];
        }
        
        // 각 인덱스의 상태 정보 확인
        if (result.length > 0) {
          console.log('🔍 인덱스 목록:');
          result.forEach((idx, i) => {
            console.log(`  [${i}] 이름: ${idx.name}, 상태: ${idx.status || '알 수 없음'}, queryable: ${idx.queryable}`);
          });
        }
      } catch (indexError) {
        console.error('❌ Search Index 목록 조회 중 오류:', indexError.message);
        console.error('❌ 에러 스택:', indexError.stack);
        // 에러 정보를 포함하여 반환
        throw new Error(`Search Index 목록 조회 실패: ${indexError.message}`);
      }
    } else if (queryType === 'find') {
      // find 쿼리 실행
      result = await coll.find(query).toArray();
    } else if (queryType === 'count') {
      // count 쿼리 실행
      result = await coll.countDocuments(query);
    } else {
      throw new Error('지원하지 않는 쿼리 타입입니다.');
    }

    executionTime = Date.now() - executionTime;

    await client.close();

    // Before 쿼리인 경우 인덱스 정보도 함께 반환
    const response = {
      success: true,
      result: result,
      executionTime: executionTime,
      resultCount: Array.isArray(result) ? result.length : result
    };
    
    if (indexInfo) {
      response.indexInfo = indexInfo;
    }

    res.json(response);

  } catch (error) {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('연결 종료 중 오류:', closeError);
      }
    }

    // 에러 발생 시 연결 문자열 전체 출력
    console.error('='.repeat(80));
    console.error('❌ MongoDB 연결 오류 발생');
    console.error('='.repeat(80));
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    console.error('원본 연결 문자열:', trimmedConnectionString);
    console.error('정리된 연결 문자열:', finalConnectionString || trimmedConnectionString);
    console.error('연결 문자열 길이:', (finalConnectionString || trimmedConnectionString).length);
    console.error('연결 문자열 시작:', (finalConnectionString || trimmedConnectionString).substring(0, 50));
    console.error('연결 문자열 끝:', (finalConnectionString || trimmedConnectionString).substring(Math.max(0, (finalConnectionString || trimmedConnectionString).length - 50)));
    console.error('localhost 포함 여부:', (finalConnectionString || trimmedConnectionString).includes('localhost') || (finalConnectionString || trimmedConnectionString).includes('127.0.0.1') || (finalConnectionString || trimmedConnectionString).includes(':28000'));
    
    // 에러 메시지에서 실제 연결 시도한 호스트 확인
    const errorMsg = error.message || '';
    const localhostMatch = errorMsg.match(/localhost[:\d]*|127\.0\.0\.1[:\d]*|:\d{4,5}/);
    if (localhostMatch) {
      console.error('⚠️ 에러 메시지에서 localhost 관련 문자열 발견:', localhostMatch[0]);
      console.error('⚠️ 이것은 연결 문자열에 localhost가 포함되어 있거나, MongoDB 드라이버가 연결 문자열을 잘못 파싱했을 가능성이 있습니다.');
    }
    
    // 연결 문자열을 다시 한 번 문자 단위로 확인
    const connStrToCheck = finalConnectionString || trimmedConnectionString;
    console.error('연결 문자열 문자 단위 확인 (처음 200자):');
    for (let i = 0; i < Math.min(connStrToCheck.length, 200); i++) {
      const char = connStrToCheck[i];
      const code = char.charCodeAt(0);
      if (code < 32 || code === 127 || char === 'l' || char === 'o' || char === 'c' || char === 'a' || char === 'h' || char === 's' || char === 't' || char === '1' || char === '2' || char === '7' || char === '0' || char === '8' || char === ':') {
        console.error(`  [${i}]: '${char}' (코드: ${code}, 16진수: 0x${code.toString(16)})`);
      }
    }
    
    console.error('='.repeat(80));

    let errorMessage = error.message;
    let errorHint = '';

    if (error.message.includes('index') || error.message.includes('Index')) {
      errorHint = 'Index가 존재하는지 확인하세요.';
    } else if (error.message.includes('Connection refused') || error.message.includes('localhost') || error.message.includes('127.0.0.1') || error.message.includes(':28000')) {
      errorHint = `연결 문자열이 올바른지 확인하세요. Atlas 연결 문자열을 사용해야 합니다.\n\n사용된 연결 문자열: ${trimmedConnectionString.substring(0, 100)}...\n\nlocalhost, 127.0.0.1, 또는 :28000이 포함되어 있으면 안 됩니다.`;
    } else if (error.message.includes('authentication')) {
      errorHint = '연결 문자열의 사용자 이름과 비밀번호를 확인하세요.';
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      errorHint = '네트워크 연결을 확인하고 IP 주소가 Atlas 화이트리스트에 추가되어 있는지 확인하세요.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      hint: errorHint
    });
  }
});

// Search Index 생성 API 엔드포인트
app.post('/api/create-search-index', async (req, res) => {
  console.log('='.repeat(80));
  console.log('📥 Search Index 생성 API 요청 수신');
  console.log('='.repeat(80));
  
  const { connectionString, dbName, collection, indexName, indexDefinition } = req.body;
  
  console.log('📥 받은 연결 문자열:', connectionString ? connectionString.substring(0, 50) + '...' : 'undefined');
  console.log('📥 데이터베이스:', dbName);
  console.log('📥 컬렉션:', collection);
  console.log('📥 Index 이름:', indexName);
  console.log('📥 Index 정의:', JSON.stringify(indexDefinition, null, 2));
  console.log('='.repeat(80));

  if (!connectionString || typeof connectionString !== 'string' || connectionString.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '연결 문자열이 전달되지 않았습니다.'
    });
  }

  if (!dbName || typeof dbName !== 'string' || dbName.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '데이터베이스 이름이 입력되지 않았습니다.'
    });
  }

  if (!collection || typeof collection !== 'string' || collection.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '컬렉션 이름이 입력되지 않았습니다.'
    });
  }

  if (!indexName || typeof indexName !== 'string' || indexName.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Index 이름이 입력되지 않았습니다.'
    });
  }

  if (!indexDefinition || typeof indexDefinition !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Index 정의가 올바르지 않습니다.'
    });
  }

  const trimmedConnectionString = connectionString.trim();

  // localhost 체크
  if (trimmedConnectionString.includes('localhost') || trimmedConnectionString.includes('127.0.0.1') || trimmedConnectionString.includes(':28000')) {
    return res.status(400).json({
      success: false,
      error: '연결 문자열에 localhost가 포함되어 있습니다.',
      hint: 'MongoDB Atlas 연결 문자열을 사용해야 합니다.'
    });
  }

  let client;
  try {
    client = new MongoClient(trimmedConnectionString, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    await client.connect();
    console.log('✅ MongoDB 연결 성공');
    const db = client.db(dbName);
    const coll = db.collection(collection);

    // Search Index 생성
    console.log('🔍 Search Index 생성 중...');
    console.log('🔍 Index 이름:', indexName);
    console.log('🔍 Index 정의:', JSON.stringify(indexDefinition, null, 2));

    // MongoDB 드라이버의 createSearchIndex 메서드 사용
    let result;
    
    // 방법 1: createSearchIndex 메서드 사용 (드라이버 6.0+)
    if (typeof coll.createSearchIndex === 'function') {
      console.log('🔍 createSearchIndex 메서드 사용');
      try {
        // MongoDB 드라이버 6.3.0의 createSearchIndex 메서드
        // 첫 번째 인자: definition 객체 (mappings 포함)
        // 두 번째 인자: options 객체 (name 포함)
        console.log('🔍 createSearchIndex 호출:', {
          definitionType: typeof indexDefinition,
          hasMappings: !!indexDefinition.mappings,
          name: indexName
        });
        
        result = await coll.createSearchIndex(indexDefinition, { name: indexName });
        console.log('✅ createSearchIndex 메서드로 생성 성공:', result);
      } catch (methodError) {
        console.error('❌ createSearchIndex 메서드 실패:', methodError.message);
        console.error('❌ 에러 코드:', methodError.code);
        console.error('❌ 에러 코드명:', methodError.codeName);
        console.error('❌ 에러 스택:', methodError.stack);
        
        // MongoDB Atlas Search Index는 Atlas UI에서만 생성 가능할 수 있습니다
        // 또는 API 형식이 다를 수 있으므로 사용자에게 안내
        throw new Error(`Search Index 생성에 실패했습니다. MongoDB Atlas UI에서 직접 생성하거나, Atlas Admin API를 사용하세요. 원인: ${methodError.message}`);
      }
    } else {
      // 방법 2: admin command 사용
      console.log('🔍 admin command 사용 (createSearchIndex 메서드 없음)');
      try {
        const adminDb = db.admin();
        result = await adminDb.command({
          createSearchIndexes: collection,
          indexes: [{
            name: indexName,
            definition: indexDefinition
          }]
        });
        console.log('✅ admin command로 생성 성공:', result);
      } catch (commandError) {
        console.error('❌ admin command 실패:', commandError.message);
        console.error('❌ 에러 상세:', commandError);
        throw commandError;
      }
    }

    console.log('✅ Search Index 생성 완료:', result);

    await client.close();

    res.json({
      success: true,
      message: `Search Index '${indexName}' 생성이 시작되었습니다.`,
      result: result,
      hint: 'Index가 BUILDING 상태에서 READY 상태로 변경되는데 몇 분이 걸릴 수 있습니다. Index 목록을 확인하여 상태를 확인하세요.'
    });

  } catch (error) {
    console.error('❌ Search Index 생성 중 오류:', error);
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('연결 종료 중 오류:', closeError);
      }
    }

    let errorMessage = error.message;
    let errorHint = '';

    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      errorHint = '이미 같은 이름의 Index가 존재합니다. 다른 이름을 사용하거나 기존 Index를 삭제하세요.';
    } else if (error.message.includes('BSON field') || error.message.includes('unknown field') || error.message.includes('IDLUnknownField') || error.code === 40415) {
      errorHint = 'MongoDB 드라이버를 통한 Search Index 생성이 현재 버전에서 지원되지 않을 수 있습니다.\n\n해결 방법:\n1. MongoDB Atlas UI에서 직접 생성하세요:\n   - Atlas 콘솔 → Search → Create Search Index\n   - JSON Editor 선택\n   - 아래 Index 정의 JSON을 복사하여 붙여넣기\n\n2. Index 정의 JSON:\n' + JSON.stringify(indexDefinition, null, 2) + '\n\n3. Index 이름: ' + indexName + '\n4. Database: ' + dbName + '\n5. Collection: ' + collection;
    } else if (error.message.includes('authentication')) {
      errorHint = '연결 문자열의 사용자 이름과 비밀번호를 확인하세요.';
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      errorHint = '네트워크 연결을 확인하고 IP 주소가 Atlas 화이트리스트에 추가되어 있는지 확인하세요.';
    } else {
      errorHint = 'Index 생성 중 오류가 발생했습니다.\n\nMongoDB Atlas Search Index는 Atlas UI에서 직접 생성하는 것이 가장 안정적입니다.\n\nAtlas UI에서 생성하는 방법:\n1. Atlas 콘솔 → Search → Create Search Index\n2. JSON Editor 선택\n3. Index 정의 JSON을 붙여넣기';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      hint: errorHint
    });
  }
});

// 정적 파일 서빙 (API 라우트 이후)
app.use(express.static('public'));

// 404 핸들러
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      error: 'API 엔드포인트를 찾을 수 없습니다.'
    });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  if (req.path.startsWith('/api/')) {
    res.status(500).json({
      success: false,
      error: err.message || '서버 오류가 발생했습니다.',
      hint: '서버 로그를 확인하세요.'
    });
  } else {
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`MongoDB Atlas 디버깅 데모`);
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

