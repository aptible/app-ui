import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useLoader, useLoaderSuccess } from "saga-query/react";

import { verifyEmail } from "@app/auth";
import { selectJWTToken } from "@app/token";
import { createOrgUrl } from "@app/routes";

import { Loading, Progress, ResendVerificationEmail } from "../shared";

export const VerifyEmailPage = () => {
	const dispatch = useDispatch();
	const user = useSelector(selectJWTToken);
	const params = useParams();
	const navigate = useNavigate();
	const verifyEmailLoader = useLoader(verifyEmail);

	useEffect(() => {
		if (params.verificationCode && params.verificationId && user.id) {
			dispatch(
				verifyEmail({
					challengeId: params.verificationId,
					verificationCode: params.verificationCode,
				}),
			);
		}
	}, [params.verificationId, params.verificationCode, user.id]);

	useLoaderSuccess(verifyEmailLoader, () => {
		navigate(createOrgUrl());
	});

	if (verifyEmailLoader.isLoading) {
		return (
			<div className="flex h-screen w-screen bg-gray-900 text-gray-400 items-center justify-center">
				<Loading className="text-brandGreen-400" />
			</div>
		);
	}

	if (verifyEmailLoader.isError) {
		return (
			<div>
				<Progress steps={3} currentStep={2} />
				<p className="text-h3 text-gray-500 leading-normal">
					Failed to verify your email, the token may have expired. Resend the
					verification email and try again.
				</p>
				<p>{verifyEmailLoader.message}</p>

				<ResendVerificationEmail />
			</div>
		);
	}

	return (
		<div>
			<Progress steps={3} currentStep={2} />
			<p className="text-h3 text-gray-500 leading-normal">
				Before you can continue setting up your Aptible account, you&apos;ll
				need to verify your email address. Find our verification email sent to{" "}
				{user.email} and click on the included link to proceed.
			</p>
			<ResendVerificationEmail />
		</div>
	);
};
