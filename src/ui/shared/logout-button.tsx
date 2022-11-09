import { useDispatch, useSelector } from "react-redux";

import { selectJWTToken } from "@app/token";
import { logout } from "@app/auth";

import { Button } from "../shared";

export const LogoutButton = () => {
	const dispatch = useDispatch();
	const user = useSelector(selectJWTToken);
	const onLogout = () => dispatch(logout());
	return (
		<div className="text-center w-full pt-5">
			<div className="w-full mx-auto">
				<div className="mb-5">
					Currently logged in as {user.email}.{" "}
					<Button onClick={onLogout}>Logout</Button>
				</div>
			</div>
		</div>
	);
};
