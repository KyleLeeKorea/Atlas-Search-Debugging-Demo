import express from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 데이터베이스 생성 API 엔드포인트
app.post('/api/create-database', async (req, res) => {
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

    // 데이터베이스 선택 (존재하지 않으면 자동으로 생성됨)
    const db = client.db(dbName);

    // 데이터베이스가 실제로 생성되었는지 확인하기 위해 간단한 컬렉션에 문서 추가
    const collection = db.collection('_init');
    await collection.insertOne({ 
      createdAt: new Date(),
      message: '데이터베이스 초기화 완료'
    });

    // 데이터베이스 목록 확인
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    const dbExists = databases.databases.some(db => db.name === dbName);

    // 연결 종료
    await client.close();

    res.json({
      success: true,
      message: `데이터베이스 "${dbName}"이(가) 성공적으로 생성되었습니다!`,
      dbExists: dbExists
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

// 서버 시작
app.listen(PORT, () => {
  console.log(`=== MongoDB Atlas 데이터베이스 생성기 ===`);
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`웹 브라우저에서 위 주소를 열어주세요.\n`);
});

