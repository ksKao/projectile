"use client";
import React, { useState } from "react";

export default function SignUp() {
	const [userInfo, setUserInfo] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const signUp: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		console.log(userInfo);
	};

	return (
		<>
			<h1 className="font-bold text-2xl text-center min-w-full">
				Sign Up
			</h1>
			<form onSubmit={signUp}>
				<label htmlFor="username">Username</label>
				<input
					type="text"
					id="username"
					placeholder="Username"
					value={userInfo.username}
					onChange={(e) =>
						setUserInfo({
							...userInfo,
							username: e.target.value,
						})
					}
				/>
				<button>Register</button>
			</form>
		</>
	);
}
