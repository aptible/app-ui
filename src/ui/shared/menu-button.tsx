import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{}>;

export const Menu = (props: Props) => <div>{props.children}</div>;

export const MenuList = (props: Props) => <div>{props.children}</div>;

export const MenuButton = (props: Props) => {
  return <div>{props.children}</div>;
};

export const MenuItem = (props: Props & { onSelect: () => any }) => {
  return <div>{props.children}</div>;
};
