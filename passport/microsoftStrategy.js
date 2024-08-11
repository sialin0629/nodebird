const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;

const User = require('../models/user'); // User 모델 불러오기

module.exports = () => {
  passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID, // Microsoft 애플리케이션 클라이언트 ID
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET, // Microsoft 애플리케이션 클라이언트 비밀키
    callbackURL: '/auth/microsoft/callback', // 인증 후 Microsoft가 리디렉션할 URL
    scope: ['user.read'], // 권한 요청 범위
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('microsoft profile', profile); // Microsoft 프로필 정보를 콘솔에 출력
    try {
      const exUser = await User.findOne({ // 기존 사용자 찾기
        where: { snsId: profile.id.toString(), provider: 'microsoft' }, // snsId와 provider가 일치하는 사용자 찾기
      });
      if (exUser) { // 사용자가 이미 존재하면
        done(null, exUser); // 해당 사용자 정보를 반환
      } else { // 사용자가 존재하지 않으면
        const newUser = await User.create({ // 새로운 사용자 생성
          email: profile.emails[0].value, // 사용자 이메일 설정
          nick: profile.displayName, // 사용자 닉네임 설정
          snsId: profile.id, // snsId 설정
          provider: 'microsoft', // provider를 'microsoft'로 설정
        });
        done(null, newUser); // 새로 생성된 사용자 정보를 반환
      }
    } catch (error) { // 오류가 발생하면
      console.error(error); // 오류를 콘솔에 출력하고
      done(error); // 오류를 반환
    }
  }));
};
