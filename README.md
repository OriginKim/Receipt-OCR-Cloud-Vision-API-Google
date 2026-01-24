# [프로젝트 명세서: Receipt AI Scanner]

## 1. 프로젝트 개요
본 프로젝트는 Google Cloud Vision API(OCR)를 활용하여 복잡한 영수증 이미지에서 결제 정보를 자동으로 추출하고 관리하는 풀스택 웹 서비스입니다. 정규표현식(Regex) 기반의 데이터 파싱 로직을 통해 사용자가 직접 입력하는 번거로움을 최소화하고 지출 내역을 시각화합니다.

## 2. 프로젝트 구조 (Project Structure)
```
root/
backend/ : Spring Boot 기반 REST API 서버
src/main/java : 비즈니스 로직, OCR 클라이언트, 엔티티 관리
src/main/resources : 공통 설정 및 보안 프로필 분리
frontend/ : React (Vite) 기반 Single Page Application
src/App.jsx : 통합 UI/UX 로직 및 상태 관리
src/index.css : 사용자 정의 스타일링 및 레이아웃
.gitignore : API 키 및 외부 라이브러리 유출 방지 설정
```

## 3. 데이터 흐름 및 API 명세 (Data Flow & API Spec)

### [데이터 흐름 및 상세 API 명세 문서]

#### 1. 데이터 흐름 (Data Flow)

사용자가 이미지를 업로드한 순간부터 화면에 결과가 출력되기까지의 데이터 이동 경로는 다음과 같습니다.

1. **Frontend (React)**: 사용자가 선택한 이미지를 FormData 객체에 담아 백엔드 업로드 API(/api/receipts/upload)로 POST 요청을 보냅니다.

2. **Backend (Spring Boot)**: 서버는 이미지를 바이너리 데이터로 변환하여 Google Cloud Vision API로 전송합니다.

3. **External API (Google)**: 이미지 내의 모든 텍스트를 추출하여 JSON 형태로 백엔드에 반환합니다.

4. **Backend (Logic)**: 반환된 수많은 텍스트 중 가맹점명, 날짜, 금액을 정규표현식(Regex)으로 파싱하여 Receipt 엔티티 객체를 생성합니다.

5. **Database (MariaDB)**: 생성된 객체를 테이블에 저장하고, 저장된 데이터를 프론트엔드에 응답값으로 보냅니다.

6. **Frontend (UI)**: 응답받은 데이터를 기반으로 목록을 갱신하고, 사용자에게 분석 완료 알림을 띄웁니다.

#### 2. 상세 API 명세 (API Specification)

백엔드와 프론트엔드 간의 통신 규칙은 다음과 같습니다.

**① 영수증 분석 및 업로드 (Upload & Analyze)**
- Endpoint: POST /api/receipts/upload
- Content-Type: multipart/form-data
- Request Parameter:
  - `file` (MultipartFile): 사용자가 선택한 영수증 이미지 파일 (PNG, JPG 등)
- Response (JSON):
```JSON
{
  "id": 1,
  "storeName": "크린토피아",
  "tradeDate": "2024-01-20",
  "totalAmount": 47700,
  "createdAt": "2026-01-25T05:00:00"
}
```

**② 분석 내역 전체 조회 (Get All Receipts)**
- Endpoint: GET /api/receipts
- Content-Type: application/json
- Description: 데이터베이스에 저장된 모든 영수증 분석 기록을 가져옵니다.
- Response (JSON Array):
```JSON
[
  {
    "id": 2,
    "storeName": "이마트",
    "totalAmount": 27600,
    "tradeDate": "2024-01-21"
  },
  {
    "id": 1,
    "storeName": "크린토피아",
    "totalAmount": 47700,
    "tradeDate": "2024-01-20"
  }
]
```

#### 3. 핵심 데이터 파싱 로직 (Data Extraction Logic)

백엔드에서 텍스트를 분류할 때 사용하는 주요 기준은 다음과 같습니다.

- **가맹점명 (Store Name)**: 추출된 텍스트 중 첫 번째 줄을 기본으로 하되, '영수증', '신용매출' 등 불필요한 단어가 포함된 줄은 제외하고 실제 상호명을 필터링합니다.

- **결제 금액 (Total Amount)**: '합계', '결제금액', '승인금액' 등의 키워드 뒤에 오는 숫자 패턴을 추적하여 콤마(,)를 제거한 후 정수형으로 변환합니다.

- **거래 일자 (Trade Date)**: YYYY-MM-DD 또는 YY/MM/DD 형식의 날짜 패턴을 정규식으로 찾아내어 추출합니다.

## 4. 설치 및 실행 방법 (Getting Started)

### [백엔드 - Backend]
1. Java 17 이상 버전 설치 여부를 확인합니다.
2. MariaDB에 접속하여 receipt_ocr_db 스키마를 생성합니다.
3. 아래 5번 항목의 보안 설정을 마친 후 ./gradlew bootRun을 실행합니다.

### [프론트엔드 - Frontend]
1. Node.js 환경에서 frontend 폴더로 진입합니다.
2. npm install 명령어로 필수 라이브러리를 설치합니다.
3. npm run dev를 실행하여 로컬 개발 서버(포트 5173)를 엽니다.

## 5. 보안 관리 및 시크릿 값 설정 (Secret Management)
보안 사고 방지를 위해 실제 키 값은 깃허브에 공유되지 않습니다. 로컬 환경에서 아래 파일을 반드시 수동 생성해야 합니다.

**파일 경로:** `backend/src/main/resources/application-secret.properties`

**입력 필수 항목:**
```Properties
# 구글 클라우드 콘솔에서 발급받은 API 키
google.vision.api-key=YOUR_GOOGLE_API_KEY
# 데이터베이스 접근 권한
spring.datasource.username=YOUR_DB_ID
spring.datasource.password=YOUR_DB_PASSWORD
```

**보안 전략:** 해당 파일은 .gitignore에 등록되어 원격 저장소 노출을 차단하며, application.properties의 spring.profiles.include=secret 설정을 통해 로컬에서만 값을 주입받습니다.

## 6. 커밋 컨벤션 (Commit Convention)
- :sparkles: feat: 새로운 기능 개발
- :bug: fix: 버그 수정
- :wrench: chore: 빌드, 패키지 매니저, 설정 파일 수정
- :memo: docs: 문서 작업 및 README 수정
- :lock: security: 보안 강화 및 비밀 정보 관리

## 7. 핵심 기술 고찰 (Core Logic Details)
단순히 "분석한다"는 설명보다, 어떻게 분석했는지 기술적인 디테일을 한 줄씩만 더해주는 섹션입니다.

**정규표현식(Regex) 전략:**
- 상호명: 텍스트의 첫 줄을 기준으로 하되, '영수증', '신용매출' 등 불필요한 키워드를 제외한 유효한 문자열 필터링.
- 금액: '합계', '금액', 'TOTAL' 등의 키워드와 인접한 숫자 패턴([0-9,]+)을 추적하여 파싱.
- 성능 최적화: WebClient의 Buffer 크기를 늘려 대용량 JSON 응답(Google API 결과값)을 안정적으로 처리하도록 설정.

## 8. 트러블슈팅 (Troubleshooting)
개발 중 겪었던 어려움과 해결 과정을 적으면 실무 능력을 증명하기 좋습니다.

**Issue: Google API 응답 지연 및 버퍼 초과**
- Problem: Vision API에서 반환하는 결과값이 매우 길어(rawText) 백엔드 메모리 버퍼를 초과하는 문제 발생.
- Solution: WebClientConfig를 통해 메모리 내 버퍼 크기를 10MB로 확장하여 해결.

**Issue: 보안 사고 예방(Git History)**
- Problem: 초기 커밋 기록에 API 키가 포함되어 보안 위협 발생.
- Solution: git reset을 통한 기록 초기화와 spring.profiles.include를 이용한 프로필 분리 기법 적용

### 8.3 모바일 디바이스 연동 및 네트워크 트러블슈팅 (Mobile & Network)

**Issue: 모바일 기기 접속 시 Network Error 및 데이터 통신 실패**

**현상:** 맥북에서 실행 중인 웹페이지에 핸드폰으로 접속(IP 주소 이용)은 가능하나, 사진 업로드나 분석 내역 조회 시 Network Error 발생.

**원인 분석:**

1. **Vite Host 미개방**: 프론트엔드 서버(Vite)가 기본적으로 로컬호스트(localhost) 접속만 허용하고 있어 외부 기기(모바일)의 접근을 차단함.

2. **API Endpoint 오류**: 프론트엔드 코드 내 API 호출 주소가 localhost:8080으로 고정되어 있어, 모바일 기기가 자기 자신(핸드폰)의 8080 포트를 호출함.

3. **CORS(Cross-Origin Resource Sharing) 정책**: 백엔드 서버가 허용한 출처(Origin)에 모바일 기기의 IP가 포함되지 않아 보안상 요청을 거부함.

**해결 방법:**

1. **Vite 서버 개방**: package.json의 실행 스크립트에 --host 옵션을 추가하여 로컬 네트워크 내 모든 기기의 접속을 허용함. (vite --host)

2. **API Base URL 동적 설정**: 프론트엔드 내 모든 API 호출 주소를 맥북의 실제 로컬 IP(192.168.x.x)로 변경하여 모바일 기기가 서버 위치를 정확히 인지하도록 함.

3. **CORS 설정 확장**: 백엔드 ReceiptController에 @CrossOrigin(origins = "*") 설정을 적용하여 외부 IP를 가진 모바일 기기와의 통신을 허용함.

## 9. 모바일 테스트 가이드 (How to Test on Mobile)

본 프로젝트를 모바일 환경에서 실시간 테스트하기 위한 설정 가이드입니다.

### 1) 네트워크 환경 확인

맥북과 모바일 기기가 **동일한 와이파이(Wi-Fi)**에 연결되어 있어야 합니다.

맥북 터미널에서 ifconfig 명령어를 통해 할당된 IP 주소(예: 192.168.0.61)를 확인합니다.

### 2) 프론트엔드 설정 (Frontend)

**package.json 수정:**
```json
"scripts": {
  "dev": "vite --host"
}
```

**App.jsx 또는 API 관리 파일 수정:**
```javascript
// 기존 localhost 주소를 맥북 IP로 변경
const API_BASE_URL = "http://192.168.0.61:8080/api/receipts";
```

### 3) 백엔드 설정 (Backend)

**ReceiptController.java 수정:**
```java
@CrossOrigin(origins = "*") // 테스트를 위해 모든 접속 허용
@RestController
```

### 4) 접속 및 실행

맥북에서 서버 실행 후, 모바일 브라우저 주소창에 http://[맥북IP]:5173을 입력하여 접속합니다.

## 10. 보안 및 환경 설정 유의사항 (Security & Environment)

**보안 파일 관리**: API 키 등 민감한 정보가 담긴 application-secret.properties는 .gitignore에 등록하여 깃허브 노출을 원천 차단함.

**데이터베이스 호환성**: 맥북 환경(MariaDB)에서 대용량 텍스트 처리를 위해 raw_text 컬럼 타입을 LONGTEXT로 설정하여 영수증 데이터 유실을 방지함.
