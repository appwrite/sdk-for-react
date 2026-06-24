# @appwrite.io/react

## 0.1.0

### Minor Changes

- 5f2954e: Refetch the cached auth user after five minutes instead of treating it as permanently fresh, expose `refresh()` from `useUser()` and `useAuth()` for manual auth state refreshes, make server helper `createSessionClient()` return a seamless node-appwrite session client, and expose client-side Appwrite services from `useAppwrite()`.
- c9f2ab3: Add `error` to `useAuth()`. Cookies now are `appwrite-session-<PROJECT_ID>`. `readSessionCookie` is now destructured from the server helpers.
- 6dab54e: React library to interact with Appwrite. This library contains useful helpers so that Appwrite Auth with SSR becomes a breeze to work with.

### Patch Changes

- deefb5d: Expose configured admin clients from server helpers and align the optional `node-appwrite` peer with v26.

## 0.1.0-rc.3

### Patch Changes

- deefb5d: Expose configured admin clients from server helpers and align the optional `node-appwrite` peer with v26.

## 0.1.0-rc.2

### Minor Changes

- 5f2954e: Refetch the cached auth user after five minutes instead of treating it as permanently fresh, expose `refresh()` from `useUser()` and `useAuth()` for manual auth state refreshes, make server helper `createSessionClient()` return a seamless node-appwrite session client, and expose client-side Appwrite services from `useAppwrite()`.

## 0.1.0-rc.1

### Minor Changes

- c9f2ab3: Add `error` to `useAuth()`. Cookies now are `appwrite-session-<PROJECT_ID>`. `readSessionCookie` is now destructured from the server helpers.

## 0.1.0-rc.0

### Minor Changes

- 6dab54e: React library to interact with Appwrite. This library contains useful helpers so that Appwrite Auth with SSR becomes a breeze to work with.
