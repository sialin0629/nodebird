const passport = require('passport'); // passport 모듈 불러오기
const FacebookStrategy = require('passport-facebook').Strategy; // passport-facebook 모듈에서 FacebookStrategy 불러오기

const User = require('../models/user'); // User 모델 불러오기

module.exports = () => { // 모듈을 내보내는 함수
  passport.use(new FacebookStrategy({ // passport에 새로운 FacebookStrategy 설정
    clientID: process.env.FACEBOOK_ID, // Facebook 애플리케이션의 클라이언트 ID 설정
    clientSecret: process.env.FACEBOOK_SECRET, // Facebook 애플리케이션의 클라이언트 시크릿 설정
    callbackURL: '/auth/facebook/callback', // 인증 후 Facebook이 리디렉션할 URL 설정
    profileFields: ['id', 'emails', 'name'] // Facebook 프로필에서 가져올 필드 설정
  }, async (accessToken, refreshToken, profile, done) => { // FacebookStrategy 인증 콜백 함수
    console.log('facebook profile', profile); // Facebook 프로필 정보를 콘솔에 출력
    try {
      const exUser = await User.findOne({ // 기존 사용자 찾기
        where: { snsId: profile.id, provider: 'facebook' }, // snsId와 provider가 일치하는 사용자 찾기
      });
      if (exUser) { // 사용자가 이미 존재하면
        done(null, exUser); // 해당 사용자 정보를 반환
      } else { // 사용자가 존재하지 않으면
        const newUser = await User.create({ // 새로운 사용자 생성
          email: profile.emails?.[0]?.value, // 사용자 이메일 설정
          nick: `${profile.name.givenName} ${profile.name.familyName}`, // 사용자 닉네임 설정
          snsId: profile.id, // snsId 설정
          provider: 'facebook', // provider를 'facebook'으로 설정
        });
        done(null, newUser); // 새로 생성된 사용자 정보를 반환
      }
    } catch (error) { // 오류가 발생하면
      console.error(error); // 오류를 콘솔에 출력하고
      done(error); // 오류를 반환
    }
  }));
};
