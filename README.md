# Appwrite React SDK

[![Discord](https://img.shields.io/discord/564160730845151244?label=discord&style=flat-square)](https://appwrite.io/discord)

Appwrite is an open-source backend as a service that abstracts common application features behind simple APIs. The Appwrite React SDK provides React hooks and framework adapters for Appwrite authentication in client-rendered and server-rendered React apps.

![Appwrite](https://github.com/appwrite/appwrite/raw/main/public/images/github.png)

## Features

- React provider and hooks for sign-up, sign-in, sign-out, OAuth, and current user state
- Client-side auth for Vite and other non-SSR React apps
- SSR auth handlers for Next.js and TanStack Start
- Server helpers for reading the current user/session from HTTP-only cookies
- Server-context session clients and admin clients

## Installation

For client-rendered React apps:

```sh
pnpm add @appwrite.io/react appwrite @tanstack/react-query
```

For SSR apps that use the server handlers or admin client, also install `node-appwrite`:

```sh
pnpm add @appwrite.io/react appwrite node-appwrite @tanstack/react-query
```

Framework packages such as `next`, `@tanstack/react-start`, `react`, and `react-dom` should come from your app scaffold.

## Non-SSR React Apps

Use this setup for Vite or any app where auth is handled directly in the browser.

```tsx
import { AppwriteProvider } from "@appwrite.io/react";

export function Root() {
  return (
    <AppwriteProvider
      endpoint={import.meta.env.VITE_APPWRITE_ENDPOINT}
      projectId={import.meta.env.VITE_APPWRITE_PROJECT_ID}
    >
      <App />
    </AppwriteProvider>
  );
}
```

Then, for authentication:

```tsx
import { useAuth } from "@appwrite.io/react";

export function AuthPanel() {
  const { user, isLoading, signIn, signUp, signOut } = useAuth();

  if (isLoading) return <p>Loading...</p>;

  if (!user) {
    return (
      <>
        <button
          onClick={() =>
            signIn.emailPassword({
              email: "user@example.com",
              password: "password123",
            })
          }
        >
          Sign in
        </button>
        <button
          onClick={() =>
            signUp.emailPassword({
              email: "user@example.com",
              password: "password123",
              name: "Jane Doe",
            })
          }
        >
          Sign up
        </button>
      </>
    );
  }

  return (
    <>
      <p>Signed in as {user.email}</p>
      <button onClick={() => signOut.signOut()}>Sign out</button>
    </>
  );
}
```

## Next.js App Router SSR

Set public Appwrite values and keep only the API key private:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=PROJECT_ID
APPWRITE_API_KEY=SERVER_ONLY_API_KEY
```

Create the Appwrite auth handler route:

```ts
// app/api/appwrite/[...appwrite]/route.ts
import { createAppwriteHandlers } from "@appwrite.io/react/handlers/next";

export const { GET, POST } = createAppwriteHandlers({
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  apiKey: process.env.APPWRITE_API_KEY!,
  basePath: "/api/appwrite",
});
```

Pass the server session into the client provider:

```tsx
// app/providers.tsx
"use client";

import { AppwriteProvider } from "@appwrite.io/react";

export function Providers({
  session,
  children,
}: {
  session?: string | null;
  children: React.ReactNode;
}) {
  return (
    <AppwriteProvider
      endpoint={process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!}
      projectId={process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!}
      ssr={{ session, basePath: "/api/appwrite" }}
    >
      {children}
    </AppwriteProvider>
  );
}
```

```tsx
// app/layout.tsx
import { createNextServerHelpers } from "@appwrite.io/react/server/next";
import { Providers } from "./providers";

const appwrite = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const helpers = createNextServerHelpers(appwrite);
  const session = await helpers.readSessionCookie();

  return (
    <html lang="en">
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
```

Read SSR auth state and create server-context clients:

```tsx
// app/page.tsx
import { createAdminClient } from "@appwrite.io/react/server";
import { createNextServerHelpers } from "@appwrite.io/react/server/next";

const appwrite = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
};

export default async function Page() {
  const helpers = createNextServerHelpers(appwrite);

  const user = await helpers.getLoggedInUser();
  const sessionClient = await helpers.createSessionClient();

  const adminClient = createAdminClient({
    ...appwrite,
    apiKey: process.env.APPWRITE_API_KEY!,
  });

  return (
    <main>
      <p>SSR user: {user?.email ?? "signed out"}</p>
      <p>Session client: {sessionClient ? "available" : "none"}</p>
      <p>Admin client: {adminClient.client ? "available" : "none"}</p>
    </main>
  );
}
```

In client components, use the same hooks. Refresh the router after auth mutations when server-rendered state should update.

```tsx
// app/auth-panel.tsx
"use client";

import { useAuth } from "@appwrite.io/react";
import { useRouter } from "next/navigation";

export function AuthPanel() {
  const { user, isLoading, signIn, signOut } = useAuth();
  const router = useRouter();

  if (isLoading) return <p>Loading...</p>;

  if (!user) {
    return (
      <button
        onClick={() =>
          signIn.emailPassword({
            email: "user@example.com",
            password: "password123",
            onSuccess: () => router.refresh(),
          })
        }
      >
        Sign in
      </button>
    );
  }

  return (
    <button
      onClick={() => signOut.signOut({ onSuccess: () => router.refresh() })}
    >
      Sign out
    </button>
  );
}
```

## TanStack Start SSR

Set public Appwrite values and keep only the API key private:

```env
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=PROJECT_ID
APPWRITE_API_KEY=SERVER_ONLY_API_KEY
```

Create the Appwrite auth handler route:

```ts
// src/routes/api/appwrite/$.ts
import { createFileRoute } from "@tanstack/react-router";
import { createAppwriteHandlers } from "@appwrite.io/react/handlers/tanstack";

export const Route = createFileRoute("/api/appwrite/$")({
  server: {
    handlers: createAppwriteHandlers({
      endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
      projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
      apiKey: process.env.APPWRITE_API_KEY!,
      basePath: "/api/appwrite",
    }),
  },
});
```

Read SSR auth state in a server function and pass the session into the provider:

```tsx
// src/routes/index.tsx
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AppwriteProvider, useAuth } from "@appwrite.io/react";
import {
  createAdminClient,
  createTanStackServerHelpers,
} from "@appwrite.io/react/server/tanstack";

const getAuthSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  const appwrite = {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  };

  const helpers = createTanStackServerHelpers(appwrite);
  const user = await helpers.getLoggedInUser();
  const sessionClient = await helpers.createSessionClient();
  const adminClient = createAdminClient({
    ...appwrite,
    apiKey: process.env.APPWRITE_API_KEY!,
  });

  return {
    session: helpers.readSessionCookie() ?? null,
    user,
    hasSessionClient: Boolean(sessionClient),
    hasAdminClient: Boolean(adminClient.client),
  };
});

export const Route = createFileRoute("/")({
  loader: () => getAuthSnapshot(),
  component: Page,
});

function Page() {
  const { session, user, hasSessionClient, hasAdminClient } =
    Route.useLoaderData();

  return (
    <AppwriteProvider
      endpoint={import.meta.env.VITE_APPWRITE_ENDPOINT}
      projectId={import.meta.env.VITE_APPWRITE_PROJECT_ID}
      ssr={{ session, basePath: "/api/appwrite" }}
    >
      <main>
        <p>SSR user: {user?.email ?? "signed out"}</p>
        <p>Session client: {hasSessionClient ? "available" : "none"}</p>
        <p>Admin client: {hasAdminClient ? "available" : "none"}</p>
        <AuthPanel />
      </main>
    </AppwriteProvider>
  );
}

function AuthPanel() {
  const { user, isLoading, signIn, signOut } = useAuth();
  const router = useRouter();

  if (isLoading) return <p>Loading...</p>;

  if (!user) {
    return (
      <button
        onClick={() =>
          signIn.emailPassword({
            email: "user@example.com",
            password: "password123",
            onSuccess: () => router.invalidate(),
          })
        }
      >
        Sign in
      </button>
    );
  }

  return (
    <button
      onClick={() => signOut.signOut({ onSuccess: () => router.invalidate() })}
    >
      Sign out
    </button>
  );
}
```

## API Overview

Client entrypoint:

```ts
import {
  AppwriteProvider,
  OAuthProvider,
  useAuth,
  useSignIn,
  useSignOut,
  useSignUp,
  useUser,
} from "@appwrite.io/react";
```

Server entrypoints:

```ts
import { createAppwriteHandlers as createNextAppwriteHandlers } from "@appwrite.io/react/handlers/next";
import { createAppwriteHandlers as createTanStackAppwriteHandlers } from "@appwrite.io/react/handlers/tanstack";

import {
  createAdminClient,
  createSessionClient,
} from "@appwrite.io/react/server";
import { createNextServerHelpers } from "@appwrite.io/react/server/next";
import { createTanStackServerHelpers } from "@appwrite.io/react/server/tanstack";
```

Do not import server entrypoints from client components or browser-only code.

## Learn More

- [Appwrite Docs](https://appwrite.io/docs)
- [Discord Community](https://appwrite.io/discord)

## License

Please see the [MIT license](./LICENSE) file for more information.
