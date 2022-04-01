import { Helmet } from 'react-helmet';

interface PageTitleProps {
  title: string;
  parentTitle?: string;
}

export const PageTitle = ({ title, parentTitle }: PageTitleProps) => (
  <Helmet title={`${title}${parentTitle ? ` - ${parentTitle}` : ''}`} />
);
