# AI-COOKER 🍳  
AI 레시피 추천 & 요리 도우미 (Gemini 기반)

> 냉장고 속 재료를 효율적으로 관리하고, 보유 재료/상황에 맞는 요리 3가지를 추천받아  
> 레시피 상세 + 단계별 요리 모드(타이머 포함)로 바로 따라 할 수 있는 서비스

---

## 브랜치 안내 (중요!!)
이 프로젝트는 **프론트/백엔드가 브랜치로 분리**되어 있습니다.

- **Backend:** `feat/backend-init`
- **Frontend:** `front-end`
> 실행/개발 시 반드시 해당 브랜치로 ```git checkout``` 해주세요.

---
## 실행 방법 (로컬)

### 0) 공통 요구사항
- Node.js (권장: LTS)
- PostgreSQL

### 1) Backend 실행 (feat/backend-init)
```bash
git clone <REPO_URL> ai-cooker-backend
cd ai-cooker-backend
git checkout feat/backend-init

cd backend
npm install
```

### 1-1) .env 설정 (backend/.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=cookuser
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=cook_db

JWT_SECRET=YOUR_JWT_SECRET
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 1-2) 서버 실행
```bash
npm run dev
```
> 서버 실행 시 DB 테이블이 자동 생성되도록 구성되어 있습니다.(프로젝트 설정에 따라 schema.sql로 초기화할 수도 있습니다.)

### 2) Frontend 실행 (front-end)
```bash
git clone <REPO_URL> ai-cooker-frontend
cd ai-cooker-frontend
git checkout front-end

cd frontend
npm install
npm run dev
```

---
## 주요 기능
### 1) 회원 서비스 (Auth)
- 회원가입/로그인
- 로그인 성공 시 JWT 기반 인증 유지(토큰 발급/검증)

### 2) 나의 냉장고 (My Fridge)
- 내 재료 목록 조회 / 추가 / 수정 / 삭제
- 카테고리에 따른 입력 UI 최적화(예: 육류 g, 채소 개, 양념 단위 없음)
- 목록 조회는 **유통기한 임박순(expiry_date ASC) 기본 정렬** 

### 3) AI 셰프 채팅 (AI Chat)
- Mode A: 냉장고 재료 기반 추천(냉장고 털기)
- Mode B: 자유 채팅 기반 추천
- AI가 **요리 3가지**(이름+간단 설명) 추천 → 선택 시 레시피 상세로 이동

### 4) 레시피 상세 & 요리하기 모드
- 레시피 기본 정보(난이도/시간/설명), 재료(보유/미보유), 전체 과정 표시
- 단계별 카드/캐러셀 형태 요리 모드 + **timer_sec 기반 스마트 타이머 자동 표시**

### 5) 커뮤니티(레시피 공유, 추가 확장기능)
- AI가 생성한 레시피를 공유 글로 변환해 게시 가능
- 게시글 CRUD, 댓글, 좋아요 토글, 정렬(최신/인기)

### 6) 마이페이지
- 내 정보 조회/수정(닉네임, 비밀번호 등)
- 북마크 목록/검색(확장) 및 회원 탈퇴 

---

## 기술 스택
### Backend (`feat/backend-init`)
- Node.js / Express
- PostgreSQL
- JWT 인증 (auth middleware)
- Gemini API 연동(레시피 생성/추천)

### Frontend (`front-end`)
- React
- Context 기반 상태관리(Auth/Fridge/Notification)
- 페이지: 냉장고/채팅/커뮤니티/로그인/회원가입/마이페이지등

---

## 디렉터리 구조 (요약)
```text
AI-COOKER
├── backend/                           # Node.js Server
│   ├── controllers/                   # 비즈니스 로직 (요청 처리 핵심)
│   │   ├── authController.js          # 로그인, 회원가입, 로그아웃 처리
│   │   ├── fridgeController.js        # 냉장고 재료 추가/수정/삭제 (CRUD) 로직
│   │   ├── chatController.js          # Gemini API 연동 및 AI 요리 추천 로직
│   │   ├── recipeController.js        # 레시피 상세 조회 및 저장 로직
│   │   └── bookmarkController.js      # 즐겨찾기(북마크) 추가 및 삭제 로직
│   ├── db/
│   │   └── connection.js              # PostgreSQL 데이터베이스 연결 설정
│   ├── middlewares/
│   │   └── authMiddleware.js          # JWT 토큰 검증 및 보안 미들웨어
│   ├── routes/                        # API 엔드포인트 라우팅
│   │   ├── authRouters.js             # /api/auth 관련 경로 설정
│   │   ├── bookmarkRouters.js         # /api/bookmark
│   │   ├── chatRouters.js             # /api/chat
│   │   ├── fridgeRouters.js           # /api/fridge
│   │   └── recipeRouter.js            # /api/recipe
│   ├── server.js                      # Express 서버 실행 및 설정 진입점
│   ├── schema.sql                     # DB 테이블 생성 스키마 (초기화용)
│   └── package.json                   # 백엔드 의존성 및 스크립트 관리
│
└── frontend/                          # React Client
    ├── src/
    │   ├── utils/
    │   │   └── api.js
    │   ├── components/
    │   │   ├── Notifications.js
    │   │   ├── SideNavleft.js
    │   │   └── SideNavRight.js
    │   ├── pages/
    │   │   ├── AddIngredients.js
    │   │   ├── Chatting.js
    │   │   ├── Community.js
    │   │   ├── Editingredient.js
    │   │   ├── Fridge.js
    │   │   ├── FridgeList.js
    │   │   ├── Login.js
    │   │   ├── Mypage.js
    │   │   └── Register.js
    │   ├── style/
    │   │   ├── Chatting.css
    │   │   ├── Fridge.css
    │   │   ├── Login.css
    │   │   └── Navbar.css
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   ├── FridgeContext.js
    │   │   └── NotificationContext.js
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── README.md
```
---

## 인증/연동 규칙 (프론트 구현 시 중요)

- 냉장고 API는 verifyToken 미들웨어 적용 → 요청 헤더에 토큰 필수
  ```Authorization: Bearer <Access_Token>``` 

- 재료 목록(GET /ingredients)은 서버에서 유통기한 임박순 정렬 

- AI 채팅 Mode A로 재료를 보낼 때는 수량 포함 문자열로 변환 권장
  
  ex) ```["대파(1단)", "계란(3개)", "삼겹살(600g)"]``` 

- 레시피 상세 응답에는

  - 재료별 ```is_owned``` (기본 양념은 자동 true 처리)

 - 단계별 ```timer_sec``` (0이면 타이머 없음) 

- 에러 처리 가이드

- 500 발생 시: “일시적인 오류입니다. 다시 시도해주세요.” 
---

## DB 테이블 (요약)

- ```user```: id, email, password_hash, nickname, age, gender

- ```ingredient```: id, user_id, name, category, quantity, expiry_date

- ```recipes```: id, title, ingredients_key, content, view_count, created_at

- ```bookmarks```: id, user_id, recipe_id, created_at

- ```chat_history```: id, user_id, recipe_id, user_prompt

- ```community_posts```: id, user_id, recipe_id, title, content, view_count, created_at

- ```community_comments```: id, post_id, user_id, content, created_at

- ```community_likes```: post_id, user_id, created_at 
---

## API 명세 (요약)
## Auth

- ```POST /auth/signup```

- ```POST /auth/login```

- ```GET /auth/my```

- ```PUT /auth/my```

- ```DELETE /auth/withdraw``` 

## Fridge

- ```GET /ingredients```

- ```POST /ingredients```

- ```PUT /ingredients/:id```

- ```DELETE /ingredients/:id``` 

## AI Chat & Recipes

- ```POST /chat``` (mode: fridge | chat)

- ```GET /recipes/:id``

- ```GET /chat/history``` (확장기능) 

## Bookmarks

- ```POST /bookmarks```

- ```GET /bookmarks```

- ```DELETE /bookmarks/:recipeId``` 

## Community

- ```GET /community/:id```

- ```POST /community```

- ```POST /community/:id/comments```

- ```POST /community/:id/like```

- ```PUT /community/:id```

- ```DELETE /community/:id```

## 팀 역할
- Backend(HongSangEun): Node.js/Express, PostgreSQL, JWT, Gemini 연동, API/DB 설계

- Frontend(HeoSubin):  React UI/UX, Context 상태관리, 페이지 구성 및 API 연동
