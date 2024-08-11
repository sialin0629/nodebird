const express = require('express');

const { isLoggedIn } = require('../middlewares');
const { User, Post } = require('../models');

const router = express.Router();

router.post('/cancle/:postId', isLoggedIn, async(req, res, next) => {
  try {
    const user = await User.findOne({ where: { id:req.user.id } });
    await user.removeLikedPost(parseInt(req.params.postId, 10));
    res.send('success');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/add/:postId', isLoggedIn, async(req, res, next) => {
  try {
    const user = await User.findOne({ where: { id:req.user.id } });
    await user.addLikedPost(parseInt(req.params.postId, 10));
    res.send('success');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router; // 라우터 객체를 모듈로 내보냄