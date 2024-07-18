// express 모듈을 불러와서 라우터 객체를 생성
const express = require('express');
// 로그인 여부를 확인하는 미들웨어를 불러옴
const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
// 각 페이지를 렌더링하는 컨트롤러 함수들을 불러옴
const { renderProfile, renderJoin, renderMain } = require('../controllers/page');

const router = express.Router(); // express 라우터 객체 생성

// 모든 요청에 대해 공통적으로 수행할 작업을 정의하는 미들웨어 추가
router.use((req, res, next) => {
  res.locals.user = req.user; // 사용자 정보를 로컬 변수에 설정
  res.locals.followerCount = 0; // 팔로워 수 초기화
  res.locals.followingCount = 0; // 팔로잉 수 초기화
  res.locals.followingIdList = []; // 팔로잉 ID 리스트 초기화
  next(); // 다음 미들웨어 또는 라우터로 제어를 전달
});

// '/profile' 경로로 GET 요청이 들어오면 로그인 상태 확인 -> rederProfile 컨트롤러 실행
router.get('/profile', isLoggedIn, renderProfile);
// '/join' 경로로 GET 요청이 들어오면 로그인되지 않은 상태 확인 -> renderJoin 컨트롤러 실행
router.get('/join', isNotLoggedIn, renderJoin);
// 루트 경로('/')로 GET 요청이 들어오면 renderMain 컨트롤러를 실행
router.get('/', renderMain);

module.exports = router; // 라우터 객체를 모듈로 내보냄