# MongoDB Atlas 데이터베이스 생성기

MongoDB Atlas 연결 문자열과 데이터베이스 이름을 웹 인터페이스를 통해 입력받아 데이터베이스를 생성하는 Node.js 웹 애플리케이션입니다.

## 설치 방법

```bash
npm install
```

## 사용 방법

```bash
npm start
```

서버가 시작되면 웹 브라우저에서 `http://localhost:3000`을 열어주세요.

웹 페이지에서 다음을 입력하세요:

1. **MongoDB Atlas 연결 문자열**: MongoDB Atlas에서 제공하는 연결 문자열
   - 예: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`

2. **데이터베이스 이름**: 생성할 데이터베이스의 이름

## 연결 문자열 형식

MongoDB Atlas 연결 문자열은 일반적으로 다음과 같은 형식입니다:

```
mongodb+srv://<username>:<password>@<cluster-url>/<database>?<options>
```

또는

```
mongodb://<username>:<password>@<cluster-url>:<port>/<database>?<options>
```

## 주의사항

- MongoDB Atlas에서 IP 주소가 화이트리스트에 추가되어 있어야 합니다.
- 사용자 이름과 비밀번호가 올바른지 확인하세요.
- 데이터베이스 이름에 특수 문자를 사용할 때는 주의하세요.

## 기능

- 🌐 웹 기반 사용자 인터페이스
- ✅ 실시간 오류 처리 및 피드백
- 🔒 안전한 서버 측 데이터베이스 생성
- 📱 반응형 디자인

## 포트 변경

기본 포트는 3000입니다. 환경 변수로 변경할 수 있습니다:

```bash
PORT=8080 npm start
```

