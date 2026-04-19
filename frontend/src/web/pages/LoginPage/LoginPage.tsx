import { EmailInput, PasswordInput, AuthForm, AuthPage } from "components";

const LoginPage = () => {
  return (
	<AuthPage>
        <AuthForm
          title="Sign in"
          redirectMessage="Don't have an account?"
          redirectTitle="Sign up"
          redirectLink="/register"
        >
          <EmailInput></EmailInput>
          <PasswordInput></PasswordInput>
        </AuthForm>
    </AuthPage>
  );
};

export default LoginPage;
