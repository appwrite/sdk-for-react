---
"@appwrite.io/react": patch
---

Refetch the cached auth user after five minutes instead of treating it as permanently fresh, expose `refresh()` from `useUser()` and `useAuth()` for manual auth state refreshes, and make server helper `createSessionClient()` return a seamless node-appwrite session client.
