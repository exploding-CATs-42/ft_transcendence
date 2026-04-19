import { Button, EmailInput, Icon, LinkButton, PasswordInput } from "components";
import s from "./LoginForm.module.css"

const LoginForm = () => {
	return (
		<>
			<div className={s.formTitleContainer}>
				<span>Sign in</span>
				<Icon name="paw" width={50} height={50} fill={"#fcf8ee"}></Icon>
			</div>
			<form className={s.formInputContainer}>
				<EmailInput></EmailInput>
				<PasswordInput></PasswordInput>
			</form>
			<Button className={s.signIn} onClick={()=>{}}>Sign in</Button>
			<span className={s.signUp}> Don’t have an account? {" "}
				<LinkButton className={s.signUpLink} to={"/register"}>Sign Up </LinkButton>
			</span>
		</>
	)
}

export default LoginForm;