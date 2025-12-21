// 샘플 데이터 삽입 스크립트
// 사용법: node scripts/insert-sample-data.js <connectionString> <databaseName>

import { MongoClient } from 'mongodb';
import { sampleProducts, sampleArticles } from '../data/sample-data.js';

const connectionString = process.argv[2];
const dbName = process.argv[3];

if (!connectionString || !dbName) {
  console.error('사용법: node scripts/insert-sample-data.js <connectionString> <databaseName>');
  process.exit(1);
}

async function insertSampleData() {
  let client;
  
  try {
    console.log('MongoDB에 연결 중...');
    client = new MongoClient(connectionString);
    await client.connect();
    console.log('연결 완료.');

    const db = client.db(dbName);
    
    // 기존 데이터 삭제 (선택사항)
    console.log('\n기존 데이터 삭제 중...');
    await db.collection('products').deleteMany({});
    await db.collection('articles').deleteMany({});
    console.log('기존 데이터 삭제 완료.');

    // 샘플 데이터 삽입
    console.log('\n샘플 데이터 삽입 중...');
    const productsResult = await db.collection('products').insertMany(sampleProducts);
    const articlesResult = await db.collection('articles').insertMany(sampleArticles);
    
    console.log(`\n삽입 완료:`);
    console.log(`- products: ${productsResult.insertedCount}개`);
    console.log(`- articles: ${articlesResult.insertedCount}개`);

    // 데이터 확인
    const productCount = await db.collection('products').countDocuments();
    const articleCount = await db.collection('articles').countDocuments();
    
    console.log(`\n현재 데이터:`);
    console.log(`- products: ${productCount}개`);
    console.log(`- articles: ${articleCount}개`);

    console.log('\n다음 단계:');
    console.log('1. Atlas UI에서 Search Index 생성');
    console.log('2. examples/ 디렉토리의 예제 파일 참고');
    console.log('3. 디버깅 체크리스트 확인: examples/debugging-checklist.md');

  } catch (error) {
    console.error('\n오류 발생:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n연결 종료.');
    }
  }
}

insertSampleData();




