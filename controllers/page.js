//  '../models' 파일 -> User모델, Post 모델, Hashtag 모델 불러오기
const { User, Post, Hashtag } = require('../models'); 

// 프로필 페이지 렌더링 함수 정의
exports.renderProfile = (req, res) => {
    // 'profile' 템플릿 렌더링, 'title' 변수에 '내 정보 - NodeBird' 값 설정
    res.render('profile', { title: '내 정보 - NodeBird' });
};

// 회원 가입 페이지 렌더링 함수 정의
exports.renderJoin = (req, res) => {
    // 'join' 템플릿 렌더링, 'title' 변수에 '회원 가입 - NodeBird' 값 설정
    res.render('join', { title: '회원 가입 - NodeBird' });
};

// 메인 페이지 렌더링 함수 정의
exports.renderMain = async (req, res, next) => {
    try {
        // Post 모델에서 모든 포스트 찾기
        const posts = await Post.findAll({
            // User 모델을 포함하여 각 포스트 작성자의 id와 nick속성 가져오기
            include: {
                model: User,
                attributes: ['id', 'nick'],
            },
            // 생성시각(createdAt)을 기준으로 내림차순(DESC) 정렬
            order: [['createdAt', 'DESC']],
        });
         // 'main' 템플릿 렌더링, 'title' 변수에 'NodeBird' 값 설정
         // 'twits' 변수 -> 포스트 목록(posts) 설정
        res.render('main', {
            title: 'NodeBird', // 페이지 타이틀 설정
            twits: posts, // 트윗 목록 설정
        });
    } catch (err) {
        // 에러 발생 -> 콘솔에 에러 출력, 에러 처리 미들웨어로 전달
        console.error(err); // 에러를 콘솔에 출력
        next(err); // 에러를 다음 미들웨어에 전달
    }
}

// 해시태그 페이지 렌더링 함수 정의
exports.renderHashtag = async (req, res, next) => {
    const query = req.query.hashtag; // URL 쿼리에서 해시태그 가져오기
    if (!query) {
        return res.redirect('/'); // 해시태그가 없으면 루트로 리다이렉트
    }
    try {
        // 해시태그 제목으로 데이터베이스에서 해시태그 찾기
        const hashtag = await Hashtag.findOne({ where: { title: query } });
        let posts = []; // 포스트 목록 초기화
        if (hashtag) {
            // 해시태그가 존재하면 관련된 포스트 가져오기
            posts = await hashtag.getPosts({ include: [{ model: User }] });
        }

        // 'main' 템플릿 렌더링, 해시태그와 관련된 포스트 목록 설정
        return res.render('main', {
            title: `${query} | NodeBird`, // 페이지 타이틀에 해시태그 추가
            twits: posts, // 트윗 목록 설정
        });
    } catch (error) {
        console.error(error); // 에러를 콘솔에 출력
        return next(error); // 에러를 다음 미들웨어에 전달
    }
};