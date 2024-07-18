const User = require('../models/user'); // '../models/user' 파일 -> User 모델

exports.follow = async (req, res, next) => {
    try {
        // 팔로우할 사용자를 데이터베이스에서 조회
        // req.user.id -> followId
        // req.user.id에 해당하는 사용자 찾기
        const user = await User.findOne({ where: { id: req.user.id } });
        
        if(user) { 
            // 시퀄라이즈에서 추가한 addFollowing 메서드 -> 현재 로그인한 사용자와의 관계를 지정
            // req.params.id -> followingId
            // 사용자가 존재하면 팔로우할 사용자 ID를 가져오기 -> req.params.id를 정수로 변환
            await user.addFollowing(parseInt(req.params.id, 10));
            res.send('success'); // 팔로우가 성공 -> 'success' 메시지 전송
        } else {
            // 사용자가 존재하지 않으면 404 상태 코드와 'no user' 메시지 전송
            res.status(404).send('no user');
        }
    } catch(error) {
        // 에러가 발생하면 에러를 콘솔에 출력 -> 에러 처리 미들웨어로 전달
        console.error(error); // 에러를 콘솔에 출력
        next(error); // 에러를 다음 미들웨어로 전달
    }
};