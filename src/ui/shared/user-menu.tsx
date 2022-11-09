import { useNavigate } from "react-router";

import { logoutUrl, securitySettingsUrl, sshSettingsUrl } from "@app/routes";

import { useCurrentUser } from "../hooks";

import { tokens } from "./tokens";
import { Menu, MenuButton, MenuList, MenuItem } from "./menu-button";

export const UserMenu = () => {
	const { user, isLoading } = useCurrentUser();
	const navigate = useNavigate();

	if (isLoading || !user) {
		return <>Loading...</>;
	}

	return (
		<Menu>
			<MenuButton>
				<div className="flex-1">{user.name}</div>
			</MenuButton>
			<MenuList>
				<div className="px-4 py-2">
					<p className={tokens.type["small semibold darker"]}>{user.name}</p>
					<p className={tokens.type["small lighter"]}>{user.email}</p>
				</div>
				<MenuItem onSelect={() => navigate(sshSettingsUrl())}>
					SSH Keys
				</MenuItem>
				<MenuItem onSelect={() => navigate(securitySettingsUrl())}>
					Security Settings
				</MenuItem>
				<MenuItem onSelect={() => navigate(logoutUrl())}>Logout</MenuItem>
			</MenuList>
		</Menu>
	);
};
