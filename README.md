# Dutyfree - 근무표 작성 도우미

It is a service developed to help mothers, who are head nurses, write an efficient work schedule.
수간호사 어머님들의 효율적인 근무표 작성을 도와주기 위해 개발된 서비스입니다.

## 기술 스택

This project is built with React + Vite and provides a minimal setup with HMR and ESLint rules.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## 주요 기능

- 근무자 정보 관리
- 근무표 자동 생성
- 엑셀 파일 가져오기/내보내기
- 근무 규칙 설정

## 개발 환경 설정

```bash
npm install
npm run dev
```

## ESLint 설정 확장

프로덕션 애플리케이션을 개발하는 경우, TypeScript와 type-aware lint 규칙을 사용하는 것을 권장합니다. TypeScript와 [`typescript-eslint`](https://typescript-eslint.io)를 프로젝트에 통합하는 방법에 대한 정보는 [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)을 확인하세요.
