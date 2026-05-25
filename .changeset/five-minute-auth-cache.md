---
"@appwrite.io/react": minor
---

Refetch the cached auth user after five minutes instead of treating it as permanently fresh, expose `refresh()` from `useUser()` and `useAuth()` for manual auth state refreshes, make server helper `createSessionClient()` return a seamless node-appwrite session client, and expose client-side Appwrite services from `useAppwrite()`.
