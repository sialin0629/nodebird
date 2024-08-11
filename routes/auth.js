const express = require('express'); // express 모듈 불러오기
const passport = require('passport'); // passport 모듈 불러오기

// 로그인 여부를 확인하는 미들웨어 불러오기
const {isLoggedIn, isNotLoggedIn} = require('../middlewares');
// 회원가입, 로그인, 로그아웃 컨트롤러 함수 불러오기
const {join, login, logout} = require('../controllers/auth');

const router = express.Router(); // express 라우터 객체 생성

// 회원 가입 요청을 처리하는 라우터
// POST /auth/join 경로로 들어오는 요청 처리
// 사용자가 로그인하지 않은 상태 -> 회원 가입 가능
router.post('/join', isNotLoggedIn, join);

// 로그인 요청을 처리하는 라우터
// POST /auth/login 경로로 들어오는 요청 처리
// 사용자가 로그인하지 않은 상태 -> 로그인 가능
router.post('/login', isNotLoggedIn, login);

// 로그아웃 요청을 처리하는 라우터
// CET /auth/logout 경로로 들어오는 요청 처리
// 사용자가 로그인한 상태 -> 로그아웃 가능
router.get('/logout', isLoggedIn, logout);

// 카카오 로그인 요청을 처리하는 라우터
// GET /auth/kakao 경로롤 들어오는 요청 처리
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백 요청을 처리하는 라우터
// GET /auth/kakao/callback 경로로 들어오는 요청 처리
router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/?error=카카오로그인 실패', // 로그인 실패 시 리다이렉트 경로 설정
  }), (req, res) => {
    res.redirect('/'); // 성공 시에는 메인 페이지(/)로 이동
});

// 네이버 로그인 요청 라우트
router.get('/naver', passport.authenticate('naver'));

// 네이버 로그인 콜백 라우트
router.get('/naver/callback', passport.authenticate('naver', {
  failureRedirect: '/?error=네이버로그인 실패', // 로그인 실패 시 리디렉션할 URL 설정
}), (req, res) => {
  res.redirect('/'); // 로그인 성공 시 리디렉션할 URL 설정
});

// 페이스북 로그인 요청 라우트
router.get('/facebook', passport.authenticate('facebook'));

// 페이스북 로그인 콜백 라우트
router.get('/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/?error=페이스북로그인 실패', // 로그인 실패 시 리디렉션할 URL 설정
}), (req, res) => {
  res.redirect('/'); // 로그인 성공 시 리디렉션할 URL 설정
});

// 구글 로그인 요청 라우트
router.get('/google', passport.authenticate('google'));

// 페이스북 로그인 콜백 라우트
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/?error=구글로그인 실패', // 로그인 실패 시 리디렉션할 URL 설정
}), (req, res) => {
  res.redirect('/'); // 로그인 성공 시 리디렉션할 URL 설정
});

// // 구글 로그인 요청 라우트
// router.get('/microsoft', passport.authenticate('microsoft'));

// // 페이스북 로그인 콜백 라우트
// router.get('/microsoft/callback', passport.authenticate('microsoft', {
//   failureRedirect: '/?error=마이크로소프트로그인 실패', // 로그인 실패 시 리디렉션할 URL 설정
// }), (req, res) => {
//   res.redirect('/'); // 로그인 성공 시 리디렉션할 URL 설정
// });

module.exports = router; // 라우터 객체를 모듈로 내보내기