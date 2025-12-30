# Appwrite React SDK

[![Discord](https://img.shields.io/discord/564160730845151244?label=discord&style=flat-square)](https://appwrite.io/discord)

Appwrite is an open-source backend as a service server that abstracts and simplifies complex and repetitive development tasks behind a very simple to use REST API. The Appwrite React SDK provides a set of React hooks that make it easy to interact with Appwrite services in your React applications.

![Appwrite](https://github.com/appwrite/appwrite/raw/main/public/images/github.png)

## Installation

```bash
npm install @appwrite.io/sdk-for-react
```

## Getting Started

### Add your Web Platform

To init your SDK and interact with Appwrite services, you need to add a web platform to your project. To add a new platform, go to your Appwrite console, choose the project you created in the step before and click the 'Add Platform' button.

From the options, choose to add a **Web** platform and add your client app hostname. By adding your hostname to your project platform, you are allowing cross-origin communication between your project and the Appwrite API, preventing CORS errors.

### Setup the Provider

Wrap your application with the `AppwriteProvider` component. This provides the Appwrite client context to all child components.

```tsx
import { AppwriteProvider } from "@appwrite.io/sdk-for-react";

function App() {
  return (
    <AppwriteProvider
      endpoint="https://cloud.appwrite.io/v1"
      projectId="your-project-id"
    >
      <YourApp />
    </AppwriteProvider>
  );
}
```

### Authentication

The SDK provides hooks for user authentication including sign-up, sign-in, sign-out, and OAuth.

#### Sign Up

```tsx
import { useSignUp } from "@appwrite.io/sdk-for-react";

function SignUpForm() {
  const { emailPassword, isPending } = useSignUp();

  const handleSignUp = () => {
    emailPassword({
      email: "user@example.com",
      password: "password123",
      onSuccess: () => console.log("Account created!"),
      onError: (error) => console.error(error),
    });
  };

  return (
    <button onClick={handleSignUp} disabled={isPending}>
      {isPending ? "Creating account..." : "Sign Up"}
    </button>
  );
}
```

#### Sign In

```tsx
import { useSignIn, OAuthProvider } from "@appwrite.io/sdk-for-react";

function SignInForm() {
  const { emailPassword, oAuth, isPending } = useSignIn();

  // Email/password sign in
  const handleEmailSignIn = () => {
    emailPassword({
      email: "user@example.com",
      password: "password123",
      onSuccess: () => console.log("Signed in!"),
      onError: (error) => console.error(error),
    });
  };

  // OAuth sign in
  const handleGoogleSignIn = () => {
    oAuth({
      provider: OAuthProvider.Google,
      successUrl: window.location.origin + "/dashboard",
      failureUrl: window.location.origin + "/login",
    });
  };

  return (
    <div>
      <button onClick={handleEmailSignIn} disabled={isPending}>
        Sign In with Email
      </button>
      <button onClick={handleGoogleSignIn}>
        Sign In with Google
      </button>
    </div>
  );
}
```

#### Sign Out

```tsx
import { useSignOut } from "@appwrite.io/sdk-for-react";

function SignOutButton() {
  const { signOut, isPending } = useSignOut();

  return (
    <button onClick={() => signOut()} disabled={isPending}>
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
```

#### Get Current User

```tsx
import { useUser } from "@appwrite.io/sdk-for-react";

function Profile() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### Combined Auth Hook

For convenience, you can use the `useAuth` hook which combines all authentication functionality:

```tsx
import { useAuth, OAuthProvider } from "@appwrite.io/sdk-for-react";

function AuthExample() {
  const { user, isLoading, signIn, signUp, signOut } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div>
        <button onClick={() => signIn.emailPassword({ email, password })}>
          Sign In
        </button>
        <button onClick={() => signIn.oAuth({ provider: OAuthProvider.Github })}>
          Sign In with GitHub
        </button>
        <button onClick={() => signUp.emailPassword({ email, password })}>
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={() => signOut.signOut()}>Sign Out</button>
    </div>
  );
}
```

## Learn More

You can use the following resources to learn more and get help:

- [Appwrite Docs](https://appwrite.io/docs)
- [Discord Community](https://appwrite.io/discord)

## License

Please see the [BSD-3-Clause license](https://raw.githubusercontent.com/appwrite/appwrite/master/LICENSE) file for more information.
