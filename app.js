const express = require('express'); // express 모듈로 app 객체 생성
const cookieParser = require('cookie-parser'); // 쿠키를 파싱하기 위한 미들웨어
const morgan = require('morgan'); // HTTP 요청 로깅을 위한 미들웨어
const path = require('path'); // 파일 및 디렉토리 경로를 다루기 위한 path 모듈
const session = require('express-session'); // 세션 관리를 위한 미들웨어
const nunjucks = require('nunjucks'); // 템플릿 엔진: nunjucks
const dotenv = require('dotenv'); // 환경 변수 관리
const passport = require('passport'); // 인증을 위한 미들웨어

// .env 파일에 정의도니 환경 변수를 로드
dotenv.config();
const pageRouter = require('./routes/page'); // 페이지 라우터를 불러오기
const authRouter = require('./routes/auth'); // 인증 관련 라우터 불러오기
const { sequelize } = require('./models'); // './models'에서 sequelize 객체 호출
const passportConfig = require('./passport'); // Passport 설정을 가져오기

// express 애플리케이션 생성
const app = express();
passportConfig(); // Passport 설정 초기화
app.set('port', process.env.PORT || 8001); // 포트 설정을 환경 변수에서 가져오거나 기본값으로 8001 사용
app.set('view engine', 'html'); // 뷰 엔진으로 'html'을 설정
// nunjucks를 설정하여 'views'디렉토리를 템플릿 파일이 위치한 곳으로 지정
nunjucks.configure('views', {
  express: app, // express 애플리케이션 연결
  watch: true, // 템플릿 파일이 변경될 떄 자동으로 다시 로드되도록 설정
});
// 데이터베이스와 동기화 수행
sequelize.sync({ force: false }) // 기존 테이블을 덮어 쓰지 않음.
  .then(() => { // 동기화 성공 -> '데이터베이스 연결 성공' 출력
    console.log('데이터베이스 연결 성공');  
  })
  .catch((err) => { // 동기화 실패 -> 오류 출력
    console.error(err);
  });

app.use(morgan('dev')); // HTTP 요청 로그를 출력하는 미들웨어 추가
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공을 위한 디렉토리 설정
app.use(express.json()); // JSON 형식의 요청 본문을 파싱하기 위한 미들웨어 추가
app.use(express.urlencoded({ extended: false })); // URL 인코딩된 요청 본문을 파싱하기 위한 미들웨어 추ㄱ
app.use(cookieParser(process.env.COOKIE_SECRET)); // 서명된 쿠키를 파싱하기 위한 미들웨어 추가
app.use(session({
  resave: false, // 세션을 항상 다시 저장하지 않도록 설정
  saveUninitialized: false, // 초기화되지 않은 세션을 저장하지 않도록 설정
  secret: process.env.COOKIE_SECRET, // 쿠키 서명을 위한 비밀 키 설정
  cookie: {
    httpOnly: true, // 클라이언트에서 쿠키를 자바스크립트로 접근하지 못하도록 설정
    secure: false, // HTTPS가 아닌 환경에서도 쿠키가 전송되도록 설정
  },
}));

app.use(passport.initialize()); // Passport 초기화 미들웨어 추가
app.use(passport.session()); // Passport 세션 관리 미들웨어 추가

app.use('/', pageRouter); // '/' 경로로 들어오는 요청을 pagRouter로 처리하도록 설정
app.use('/auth', authRouter); // '/auth' 경로로 들어오는 요청을 authRouter로 처리하도록 설정

// 요청한 라우터가 없을 경우 404  에러를 처리하는 미들웨어 추가
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error); // 에러를 다음 미들웨어로 전달
});

// 에러를 처리하는 미들웨어 추가
app.use((err, req, res, next) => {
  res.locals.message = err.message; // 에러 메시지를 로컬 변수에 설정
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 개발환경에서만 에러 스택 노출
  res.status(err.status || 500); // 에러 상태 코드 설정
  res.render('error'); // 'error' 템플릿 렌더링
});

// 설정된 포트에서 서버를 시작하고 대기
app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중')
});