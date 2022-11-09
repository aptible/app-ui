export const ExternalLink = ({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) => {
	return (
		<a target="_blank" href={href}>
			{children}
		</a>
	);
};
