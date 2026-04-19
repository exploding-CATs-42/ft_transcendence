import { useEffect } from "react";

import s from "./LoginPage.module.css";
import LoginForm from "components/LoginForm/LoginForm";

const LoginPage = () => {

	useEffect(() => {
		document.body.classList.add(s.background);

		return () => {
			document.body.classList.remove(s.background);
		}
	}, []);

	return (
		<div className={s.pageContainer}>
			<div className={s.title}>
				<span>Exploding <span className={s.kittensSpan}>kittens</span></span>
			</div>
			<div className={s.formBackground}>
				<LoginForm></LoginForm>
			</div>
		</div>

	)
}

export default LoginPage;