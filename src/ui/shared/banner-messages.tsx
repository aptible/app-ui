export const BannerMessages = (loader: {
	isSuccess: boolean;
	isError: boolean;
	message: string;
}) => {
	return (
		<div>
			{loader.isSuccess ? <div>Success! {loader.message}</div> : null}
			{loader.isError ? <div>{loader.message}</div> : null}
		</div>
	);
};
