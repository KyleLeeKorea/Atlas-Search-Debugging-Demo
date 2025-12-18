import { MongoClient } from 'mongodb';
import readline from 'readline';

// readline 인터페이스 생성
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 사용자 입력을 받는 함수
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createDatabase() {
  try {
    // MongoDB Atlas 연결 문자열 입력 받기
    const connectionString = await question('MongoDB Atlas 연결 문자열을 입력하세요: ');
    
    if (!connectionString || connectionString.trim() === '') {
      console.error('연결 문자열이 입력되지 않았습니다.');
      rl.close();
      return;
    }

    // 데이터베이스 이름 입력 받기
    const dbName = await question('생성할 데이터베이스 이름을 입력하세요: ');
    
    if (!dbName || dbName.trim() === '') {
      console.error('데이터베이스 이름이 입력되지 않았습니다.');
      rl.close();
      return;
    }

    console.log('\nMongoDB에 연결 중...');
    
    // MongoDB 클라이언트 생성 및 연결
    const client = new MongoClient(connectionString);
    
    await client.connect();
    console.log('MongoDB 연결 완료.');

    // 데이터베이스 선택 (존재하지 않으면 자동으로 생성됨)
    const db = client.db(dbName);
    console.log(`데이터베이스 "${dbName}" 선택됨.`);

    // 데이터베이스가 실제로 생성되었는지 확인하기 위해 간단한 컬렉션에 문서 추가
    const collection = db.collection('_init');
    await collection.insertOne({ 
      createdAt: new Date(),
      message: '데이터베이스 초기화 완료'
    });
    console.log('초기화 문서 추가 완료.');

    // 데이터베이스 목록 확인
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    const dbExists = databases.databases.some(db => db.name === dbName);
    
    if (dbExists) {
      console.log(`\n데이터베이스 "${dbName}" 생성 완료.`);
    } else {
      console.log(`\n데이터베이스 "${dbName}"이 목록에 아직 나타나지 않을 수 있습니다. 첫 문서가 추가되면 자동으로 생성됩니다.`);
    }

    // 연결 종료
    await client.close();
    console.log('\nMongoDB 연결 종료.');
    
  } catch (error) {
    console.error('\n오류 발생:');
    console.error(error.message);
    
    if (error.message.includes('authentication')) {
      console.error('\n연결 문자열의 사용자 이름과 비밀번호를 확인하세요.');
    } else if (error.message.includes('network')) {
      console.error('\n네트워크 연결을 확인하고 IP 주소가 Atlas 화이트리스트에 추가되어 있는지 확인하세요.');
    }
  } finally {
    rl.close();
  }
}

// 프로그램 실행
console.log('MongoDB Atlas 데이터베이스 생성기\n');
createDatabase();

