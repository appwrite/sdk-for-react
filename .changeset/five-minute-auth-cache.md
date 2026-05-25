---
"@appwrite.io/react": patch
---

Refetch the cached auth user after five minutes instead of treating it as permanently fresh, and expose `refresh()` from `useUser()` and `useAuth()` for manual auth state refreshes.
