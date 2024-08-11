const express = require('express'); // express 모듈 가져오기

const { isLoggedIn } = require('../middlewares'); // '../middlewares' 파일 -> isLoggedIn 미들웨어
const { follow } = require('../controllers/user'); // '../controllers/user' 파일 -> follow 컨트롤러
const User = require('../models/user');

const router = express.Router(); // 새로운 라우터 객체 생성

// POST /user/:id/follow
// 사용자 ID를 받아서 팔로우 요청 처리
// isLoggedIn 미들웨어 사용 -> 로그인 여부 확인
// follow 컨트롤러 호출 -> 팔로우 요청 처리
router.post('/:id/follow', isLoggedIn, follow);
router.post('/:id/followCancle', isLoggedIn, async(req, res, next) => {
  try {
    console.log(req.user.id, req.params.id);
    const user = await User.findOne({ where: { nick: req.params.id } });
    await user.removeFollower(parseInt(req.user.id));
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/:nick', isLoggedIn, async(req, res, next) => {
  try {
    console.log(req.user.id, req.params.id);
    const user = await User.update({ nick: req.params.nick }, { where: {id: req.user.id } });
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router; // 라우터 객체를 모듈로 내보냄