const { Post, Hashtag } = require('../models'); // Sequelize 모델 -> POst, Hashtag 가져오기

// 이미지 업로드 후 처리를 담당하는 함수
exports.afterUploadImage = (req, res) => {
  console.log(req.file); // 업로드된 파일 객체의 정보 -> 콘솔에 출력
  // 업로드된 파일의 경로를 JSON 응답으로 클라이언트에 전송
  res.json({ url: `/img/${req.file.filename}` });
};

// 게시물 업로드를 처리하는 비동기 함수
exports.uploadPost = async(req, res, next) => {
  try {
    // 데이터베이스에 새로운 게시물 생성
    const post = await Post.create({
      content: req.body.content, // 요청 본문에서 게시물 내용을 가져와 설정
      img: req.body.url, // 요청 본문에서 이미지 URL을 가져와 설정
      UserId: req.user.id, // 현재 로그인한 사용자의 ID를 가져와 설정
    });
    
    // 게시물 내용에서 해시태그를 정규표현식을 이용해 추출
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) { // 추출된 해시태그가 있을 경우에만 처리함
      // 해시태그 배열을 순회하며 데이터베이스에 저장
      const result = await Promise.all(
        hashtags.map(tag => {
          // 해시태그를 소문자로 변환하여 데이터베이스에 저장
          return Hashtag.findOrCreate({
            // 해시태그에서 #을 제거하고 소문자로 변환하여 저장
            where: { title: tag.slice(1).toLowerCase() },
          });
        }),
      );
      // 생성된 게시물과 해시태그를 연결
      // findOrCreate의 결과는 [instance, created] 형태이므로, instance만 가져옴
      await post.addHashtags(result.map(r => r[0]));
    } 

    res.redirect('/'); // 모든 작업이 완료되면 홈 페이지로 리디렉션
  } catch (err) {
    console.error(err); // 오류가 발생하면 콘솔에 출력
    next(err); // 오류를 다음 미들웨어로 전달 -> 오류 처리기를 실행
  }
};


// 정규표현식 `/#[^\s#]*/g` 설명
// - /: 정규표현식의 시작을 나타냅니다.
// - #: 해시태그 기호를 찾습니다
// - [^\s#] : 공백 문자(`\s`)나 또 다른 해시태그 기호(`#`)가 아닌 모든 문자와 일치합니다.
// - [^ ... ]: 대괄호 안에 있는 문자를 제외한 문자와 일치합니다.
// - \s: 공백 문자를 의미합니다. (스페이스, 탭, 줄바꿈 등)
// - *: 앞의 표현식이 0번 이상 반복되는 것과 일치합니다.
// - 예를 들어, [^\s#]*는 공백이나 해시태그 기호가 나타나기 전까지의 모든 문자를 포함합니다.
// - /: 정규표현식의 끝을 나타냅니다.
// - g: 전역 플래그로, 문자열 내에서 일치하는 모든 부분을 찾습니다.

// 따라서 /#[^\s#]*/g는 해시태그 기호(#)로 시작하고, 공백이나 또 다른 해시태그 기호가 나타나기 전까지의 모든 문자를 매칭합니다.
// 예를 들어, "#example #test"라는 물자열에서 이 정규표현식은 ["#example", "#test"]를 추출합니다. 
