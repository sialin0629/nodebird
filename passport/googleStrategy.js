const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

module.exports = () => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    console.log('google profile', profile);
    try {
      // 구글 로그인 시, snsId와 provider로 기존 사용자를 찾는다.
      let user = await User.findOne({
        where: { snsId: profile.id.toString(), provider: 'google' }
      });

      if (user) {
        // 기존 사용자가 있으면, 해당 사용자를 반환한다.
        done(null, user);
      } else {
        // 기존 사용자가 없으면, 이메일로 사용자 검색
        user = await User.findOne({
          where: { email: profile.emails[0].value }
        });

        if (user) {
          // 이메일이 중복되면, snsId와 provider를 업데이트
          user.snsId = profile.id;
          user.provider = 'google';
          await user.save();
          done(null, user);
        } else {
          // 사용자 생성
          const newUser = await User.create({
            email: profile.emails[0].value,
            nick: profile.displayName,
            snsId: profile.id,
            provider: 'google'
          });
          done(null, newUser);
        }
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};
