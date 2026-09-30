# 미니 방명록(Guestbook) 요구사항

- 개발자: 윤채원 (학번 202404261)
- 프로젝트 이름(GitHub / Vercel / Neon 공통): `guestbook-202404261`

## 기능
이름, 메시지, 작성 시각이 함께 쌓이는 미니 방명록. 회원가입/로그인 없이, 글을 쓸 때 함께 입력하는 비밀번호로 본인 글의 수정·삭제 권한만 확인한다.

- 작성(Create): 누구나 이름, 메시지, 비밀번호를 입력해 새 글을 남길 수 있다.
- 조회(Read): 누구나 전체 글 목록을 볼 수 있다. 목록은 최신 작성 순으로 정렬된다.
- 수정(Update): 글쓴이는 비밀번호를 입력해 자신이 쓴 글의 메시지 내용을 수정할 수 있다. 비밀번호가 일치하지 않으면 수정이 거부되고, 그 사실이 표시/안내되어야 한다.
- 삭제(Delete): 글쓴이는 비밀번호를 입력해 자신이 쓴 글을 삭제할 수 있다. 비밀번호가 일치하지 않으면 삭제가 거부되고, 그 사실이 표시/안내되어야 한다.
- UI에 개발자 이름(윤채원)과 학번(202404261)을 표시한다.

## 기술 스택
- Next.js (App Router) + TypeScript
- DB: Neon Postgres (`@neondatabase/serverless`, 환경변수 `DATABASE_URL`)
- 배포: Vercel
- 비밀번호는 bcryptjs로 해시해 저장 (평문 저장 금지, 응답에 해시 노출 금지)

## 개발 흐름 (SDD)
/grill-with-docs → /to-spec → /to-tickets → /implement → /code-review
