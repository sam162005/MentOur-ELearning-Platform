# Fix API 500 Errors (caused by auth/DB/token issues)

## Steps:
- [x] 1. Improve server/middlewares/isAuth.js: Proper try-catch, null user checks, send 401/403 instead of 500
- [x] 2. Update frontend/src/context/UserContext.jsx: Conditional fetchUser if token exists
- [x] 3. Update frontend/src/context/CourseContext.jsx: Conditional fetchMyCourse if token exists
- [ ] 4. User: Setup server/.env (DB, JWT_Sec, etc.), run MongoDB, clear browser localStorage, restart server (`cd server && npm run dev`)
- [ ] 5. Test endpoints, complete

All code fixes complete. Follow step 4 (setup .env/DB), restart servers, clear storage, test no 500s.
