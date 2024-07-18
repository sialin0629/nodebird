const passport = require('passport'); // passport 모듈 불러오기
const local = require('./localStrategy'); // 로컬 인증 전략 불러오기
const kakao = require('./kakaoStrategy'); // 카카오 인증 전략 불러오기
const User = require('../models/user'); // User 모델 불러오기

module.exports = () => {
  // 사용자 정보를 세션에 저장 -> 사용자 인증 시 호출
  passport.serializeUser((user, done) => {
    done(null, user.id); // 로그인 시 실행 -> 사용자 ID를 세션에 저장
    // null -> 에러가 발생할 때 사용
    // user.id 저장하고 싶은 데이터(사용자ID)
  });

  // 세션에 저장된 사용자 ID를 통해 사용자 정보를 복원 -> 매 요청 시 호출
  passport.deserializeUser((id, done) => {
    // id -> serializeUser 메서드 안의 user.id
    User.findOne({ where: { id } }) // ID를 사용해 사용자 정보 검색
      .then(user => done(null, user)) // 검색된 사용자 정보를 반환 -> req.user에 저장
      .catch(err => done(err)); // 오류 발생 시 에러 변환
  });

  local(); // 로컬 인증 전략 설정
  kakao(); // 카카오 인증 전략 설정
}