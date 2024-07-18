// express 모듈을 불러와서 라우터 객체를 생성
const express = require('express');
// 로그인 여부를 확인하는 미들웨어를 불러옴
const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
// 각 페이지를 렌더링하는 컨트롤러 함수들을 불러옴
const { 
    renderProfile, // 사용자 프로필 페이지 렌더링
    renderJoin,    // 회원 가입 페이지 렌더링
    renderMain,    // 메인 페이지 렌더링
    renderHashtag, // 해시태그 페이지 렌더링
} = require('../controllers/page');

const router = express.Router(); // express 라우터 객체 생성

// 모든 요청에 대해 공통적으로 수행할 작업을 정의하는 미들웨어 추가
router.use((req, res, next) => {
    // 사용자 정보를 로컬 변수에 설정
    res.locals.user = req.user; 
    // 사용자의 팔로워 수를 가져와 로컬 변수에 저장, 없으면 0으로 초기화
    res.locals.followerCount = req.user?.Followers?.length || 0;
    // 사용자의 팔로잉 수를 가져와 로컬 변수에 저장, 없으면 0으로 초기화
    res.locals.followingCount = req.user?.Followings?.length || 0; 
    // 사용자의 팔로잉 목록에서 각 팔로잉의 ID를 추출하여 배열로 저장
    // 사용자가 팔로잉이 없거나, req.user가 정의되지 않은 경우에는 빈 배열로 초기화
    res.locals.followingIdList = req.user?.Followings?.map(f => f.id) || []; 
    next(); // 다음 미들웨어 또는 라우터로 제어를 전달
});

// '/profile' 경로로 GET 요청이 들어오면 로그인 상태 확인 -> renderProfile 컨트롤러 실행
router.get('/profile', isLoggedIn, renderProfile); 
// '/join' 경로로 GET 요청이 들어오면 로그인되지 않은 상태 확인 -> renderJoin 컨트롤러 실행
router.get('/join', isNotLoggedIn, renderJoin);
// 루트 경로('/')로 GET 요청이 들어오면 renderMain 컨트롤러 실행
router.get('/', renderMain);
// '/hashtag' 경로로 GET 요청이 들어오면 renderHashtag 컨트롤러 실행
router.get('/hashtag', renderHashtag);

module.exports = router; // 라우터 객체를 모듈로 내보냄