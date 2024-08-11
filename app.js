const express = require('express'); // express 모듈을 불러와서 애플리케이션을 생성
const cookieParser = require('cookie-parser'); // 쿠키를 파싱하기 위한 미들웨어 불러오기
const morgan = require('morgan'); // HTTP 요청 로깅을 위한 미들웨어 불러오기
const path = require('path'); // 파일 및 디렉토리 경로를 다루기 위한 path 모듈 불러오기
const session = require('express-session'); // 세션 관리를 위한 미들웨어 불러오기
const nunjucks = require('nunjucks'); // 템플릿 엔진인 nunjucks 불러오기
const dotenv = require('dotenv'); // 환경 변수 관리를 위한 dotenv 모듈 불러오기
const passport = require('passport'); // 인증을 위한 Passport 모듈 불러오기

// .env 파일에 정의된 환경 변수를 로드하여 process.env에 설정
dotenv.config();
const pageRouter = require('./routes/page'); // 페이지 관련 라우터를 불러오기
const authRouter = require('./routes/auth'); // 인증 관련 라우터를 불러오기
const postRouter = require('./routes/post'); // 포스트 관련 라우터를 불러오기
const userRouter = require('./routes/user'); // 사용자 관련 라우터를 불러오기
const likeRouter = require('./routes/like'); // 좋아용 관련 라우터를 불러오기
const { sequelize } = require('./models'); // Sequelize 인스턴스를 가져오기
const passportConfig = require('./passport'); // Passport 설정을 불러오기

// express 애플리케이션 생성
const app = express();
passportConfig(); // Passport 설정을 초기화

app.set('port', process.env.PORT || 8001); // 포트를 환경 변수에서 가져오거나 기본값으로 8001 사용
app.set('view engine', 'html'); // 뷰 엔진으로 'html'을 설정

// nunjucks를 설정하여 'views' 디렉토리를 템플릿 파일 위치로 지정
nunjucks.configure('views', {
    express: app, // express 애플리케이션과 연결
    watch: true, // 템플릿 파일이 변경될 때 자동으로 다시 로드
});

// 데이터베이스와 동기화 수행
sequelize.sync({ force: false }) // 기존 테이블을 덮어쓰지 않도록 설정
    .then(() => { // 동기화 성공 시
        console.log('데이터베이스 연결 성공'); // 성공 메시지 출력
    })
    .catch((err) => { // 동기화 실패 시
        console.error(err); // 오류 메시지 출력
    });

app.use(morgan('dev')); // HTTP 요청 로그를 출력하는 미들웨어 추가
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공을 위한 디렉토리 설정
app.use('/img', express.static(path.join(__dirname, 'uploads'))); // 이미지 파일을 제공할 경로 설정
app.use(express.json()); // JSON 형식의 요청 본문을 파싱하기 위한 미들웨어 추가
app.use(express.urlencoded({ extended: false })); // URL 인코딩된 요청 본문을 파싱하기 위한 미들웨어 추가
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

// 각 경로에 맞는 라우터 설정
app.use('/', pageRouter); // '/' 경로로 들어오는 요청을 pageRouter로 처리
app.use('/auth', authRouter); // '/auth' 경로로 들어오는 요청을 authRouter로 처리
app.use('/post', postRouter); // '/post' 경로로 들어오는 요청을 postRouter로 처리
app.use('/user', userRouter); // '/user' 경로로 들어오는 요청을 userRouter로 처리
app.use('/like', likeRouter); // '/user' 경로로 들어오는 요청을 userRouter로 처리


// 요청한 라우터가 없을 경우 404 에러를 처리하는 미들웨어 추가
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`); // 에러 메시지 생성
    error.status = 404; // 에러 상태 코드 설정
    next(error); // 에러를 다음 미들웨어로 전달
});

// 에러를 처리하는 미들웨어 추가
app.use((err, req, res, next) => {
    res.locals.message = err.message; // 에러 메시지를 로컬 변수에 설정
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 개발 환경에서만 에러 스택 노출
    res.status(err.status || 500); // 에러 상태 코드 설정
    res.render('error'); // 'error' 템플릿 렌더링
});

// 설정된 포트에서 서버를 시작하고 대기
app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중'); // 서버 대기 중인 포트 출력
});