export interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  variant?: "base" | "sm" | "lg";
  title?: string;
}

const IconStrokeBase = ({
  children,
  color = "#111920",
  variant = "base",
  title = "icon",
  ...rest
}: IconProps & { title: string }) => {
  const size = (() => {
    if (variant === "sm") return 16;
    if (variant === "lg") return 32;
    return 24;
  })();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      stroke={color}
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <title>{title}</title>
      {children}
    </svg>
  );
};

export const IconArrowRight = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Next">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </IconStrokeBase>
  );
};

export const IconArrowLeft = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Prev">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </IconStrokeBase>
  );
};

export const IconEdit = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Edit">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </IconStrokeBase>
  );
};

export const IconChevronUp = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Up">
      <polyline points="18 15 12 9 6 15" />
    </IconStrokeBase>
  );
};

export const IconChevronRight = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Right">
      <polyline points="9 18 15 12 9 6" />
    </IconStrokeBase>
  );
};

export const IconChevronDown = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Down">
      <polyline points="6 9 12 15 18 9" />
    </IconStrokeBase>
  );
};

export const IconCylinder = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Databases">
      <path d="M20.8846 5.94231C20.8846 8.39554 16.9065 10.3846 12 10.3846C7.09354 10.3846 3.11538 8.39554 3.11538 5.94231M20.8846 5.94231C20.8846 3.48908 16.9065 1.5 12 1.5C7.09354 1.5 3.11538 3.48908 3.11538 5.94231M20.8846 5.94231V18.0577C20.8846 20.5109 16.9065 22.5 12 22.5C7.09354 22.5 3.11538 20.5109 3.11538 18.0577V5.94231M20.8846 5.94231V9.98077M3.11538 5.94231V9.98077M20.8846 9.98077V14.0192C20.8846 16.4725 16.9065 18.4615 12 18.4615C7.09354 18.4615 3.11538 16.4725 3.11538 14.0192V9.98077M20.8846 9.98077C20.8846 12.434 16.9065 14.4231 12 14.4231C7.09354 14.4231 3.11538 12.434 3.11538 9.98077" />
    </IconStrokeBase>
  );
};

export const IconTrash = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Delete">
      <path d="M10 11V17M14 11V17M4 7H20M19 7L18.133 19.142C18.0971 19.6466 17.8713 20.1188 17.5011 20.4636C17.1309 20.8083 16.6439 21 16.138 21H7.862C7.35614 21 6.86907 20.8083 6.49889 20.4636C6.1287 20.1188 5.90292 19.6466 5.867 19.142L5 7H19ZM15 7V4C15 3.73478 14.8946 3.48043 14.7071 3.29289C14.5196 3.10536 14.2652 3 14 3H10C9.73478 3 9.48043 3.10536 9.29289 3.29289C9.10536 3.48043 9 3.73478 9 4V7H15Z" />
    </IconStrokeBase>
  );
};

export const IconBox = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Apps">
      <path d="M22.1538 6.92308L12 1L1.84615 6.92308M22.1538 6.92308L12 12.8462M22.1538 6.92308V17.0769L12 23M1.84615 6.92308L12 12.8462M1.84615 6.92308V17.0769L12 23M12 12.8462V23" />
    </IconStrokeBase>
  );
};

export const IconSettings = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Settings">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconStrokeBase>
  );
};

export const IconUserCircle = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Profile">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </IconStrokeBase>
  );
};

export const IconSearch = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Search">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </IconStrokeBase>
  );
};

export const IconCheck = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Check">
      <polyline points="20 6 9 17 4 12" />
    </IconStrokeBase>
  );
};

export const IconCheckCircle = (props: IconProps) => {
  return (
    <IconStrokeBase title="Check" {...props}>
      <path
        d="M8.17316 13L11.1667 15.8268L15.2612 8.5M22 12C22 13.3132 21.7413 14.6136 21.2388 15.8268C20.7362 17.0401 19.9996 18.1425 19.0711 19.0711C18.1425 19.9997 17.0401 20.7362 15.8268 21.2388C14.6136 21.7413 13.3132 22 12 22C10.6868 22 9.38642 21.7413 8.17316 21.2388C6.95991 20.7362 5.85751 19.9997 4.92893 19.0711C4.00034 18.1425 3.26375 17.0401 2.7612 15.8268C2.25865 14.6136 2 13.3132 2 12C2 9.34784 3.05356 6.8043 4.92893 4.92893C6.80429 3.05357 9.34783 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconPlusCircle = (props: IconProps) => {
  return (
    <IconStrokeBase title="New" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </IconStrokeBase>
  );
};

export const IconX = (props: IconProps) => {
  return (
    <IconStrokeBase title="Remove" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconStrokeBase>
  );
};

export const IconXCircle = (props: IconProps) => {
  return (
    <IconStrokeBase title="Remove" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </IconStrokeBase>
  );
};

export const IconAlertCircle = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Alert">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </IconStrokeBase>
  );
};

export const IconAlertTriangle = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Alert">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconStrokeBase>
  );
};

export const IconLayers = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Stacks">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </IconStrokeBase>
  );
};

export const IconLogout = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Logout">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </IconStrokeBase>
  );
};

export const IconGitBranch = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Git Branch">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </IconStrokeBase>
  );
};

export const IconInfo = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Info">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </IconStrokeBase>
  );
};

export const IconCreditCard = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Billing">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </IconStrokeBase>
  );
};

export const IconGlobe = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Environments">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </IconStrokeBase>
  );
};

export const IconEllipsis = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="More">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </IconStrokeBase>
  );
};

export const IconExternalLink = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="External Link">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </IconStrokeBase>
  );
};

export const IconCopy = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Copy">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </IconStrokeBase>
  );
};

export const IconDownload = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Download">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </IconStrokeBase>
  );
};

export const IconThumbsUp = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Thumbs Up">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </IconStrokeBase>
  );
};

export const IconRefresh = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Refresh">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </IconStrokeBase>
  );
};

export const IconHeart = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Activity">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </IconStrokeBase>
  );
};

export const IconCloud = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Deployments">
      <path d="M12.006 16.6069V8.97256M12.006 8.97256L15.3908 12.3656M12.006 8.97256L8.62126 12.3656M6.08268 20C4.87481 20.0013 3.70603 19.5709 2.78625 18.7861C1.86647 18.0012 1.25594 16.9134 1.06431 15.7179C0.872685 14.5224 1.11251 13.2975 1.74072 12.2634C2.36892 11.2292 3.34435 10.4534 4.49184 10.0753C4.19703 8.56106 4.50172 6.99124 5.3414 5.69827C6.18108 4.40531 7.48981 3.49073 8.99044 3.1482C10.4911 2.80568 12.0658 3.06211 13.3811 3.86319C14.6964 4.66428 15.6491 5.9471 16.0373 7.44003C16.6375 7.24433 17.2804 7.22079 17.8933 7.37205C18.5062 7.52331 19.0647 7.84335 19.5057 8.29603C19.9467 8.7487 20.2527 9.31597 20.389 9.93377C20.5254 10.5516 20.4867 11.1953 20.2773 11.7922C21.2009 12.1459 21.972 12.8125 22.4566 13.6764C22.9412 14.5403 23.1089 15.5471 22.9305 16.522C22.7522 17.4969 22.239 18.3784 21.4801 19.0137C20.7211 19.649 19.7643 19.9979 18.7756 20H6.08268Z" />
    </IconStrokeBase>
  );
};

export const IconHamburger = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Menu">
      <path d="M3.75 6.75H20.25M3.75 12H20.25M3.75 17.25H20.25" />
    </IconStrokeBase>
  );
};

export const IconWorkplace = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Organization">
      <path d="M3.75 21H20.25M4.5 3H19.5M5.25 3V21M18.75 3V21M9 6.75H10.5M9 9.75H10.5M9 12.75H10.5M13.5 6.75H15M13.5 9.75H15M13.5 12.75H15M9 21V17.625C9 17.004 9.504 16.5 10.125 16.5H13.875C14.496 16.5 15 17.004 15 17.625V21" />
    </IconStrokeBase>
  );
};

export const IconMetrics = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Metrics">
      <path d="M16 8V16M12 11V16M8 14V16M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" />
    </IconStrokeBase>
  );
};

export const IconShield = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Security & Compliance">
      <path d="M8.66667 12.2455L10.8889 14.5082L15.3333 9.9828M21.5756 5.4393C18.0623 5.62927 14.6186 4.39237 12 2C9.38141 4.39237 5.93767 5.62927 2.42445 5.4393C2.14171 6.55381 1.99909 7.70036 2 8.85145C2 15.1768 6.24889 20.493 12 22C17.7511 20.493 22 15.178 22 8.85145C22 7.67259 21.8522 6.52992 21.5756 5.4393Z" />
    </IconStrokeBase>
  );
};

export const IconEndpoint = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Endpoints">
      <path d="M21.1538 12.9231C21.1538 17.9786 17.0555 22.0769 12 22.0769C6.94447 22.0769 2.84615 17.9786 2.84615 12.9231C2.84615 7.86754 6.94447 3.76923 12 3.76923C17.0555 3.76923 21.1538 7.86754 21.1538 12.9231Z" />
      <circle cx="12" cy="3.69231" r="2.69231" fill="white" />
      <circle cx="20.3077" cy="17.5385" r="2.69231" fill="white" />
      <circle cx="3.69231" cy="17.5385" r="2.69231" fill="white" />
    </IconStrokeBase>
  );
};

export const IconService = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Services">
      <path d="M10.3636 22.3636L1.63637 13.6364C1.20238 13.2024 0.958566 12.6138 0.958566 12C0.958567 11.3862 1.20238 10.7976 1.63637 10.3636L10.3636 1.63636C10.7976 1.20237 11.3863 0.95856 12 0.95856C12.6138 0.95856 13.2024 1.20237 13.6364 1.63636L22.3636 10.3636C22.7976 10.7976 23.0414 11.3862 23.0414 12C23.0414 12.6138 22.7976 13.2024 22.3636 13.6364L13.6364 22.3636C13.2024 22.7976 12.6138 23.0414 12 23.0414C11.3863 23.0414 10.7976 22.7976 10.3636 22.3636Z" />
      <path d="M14.2145 9.2182L17.4545 11.9455L14.2145 14.6727M9.78546 14.6727L6.54546 11.9455L9.78546 9.2182" />
    </IconStrokeBase>
  );
};

export const IconCertificate = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Certificates">
      <path
        d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconKey = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="CLI SSO Token">
      <path
        d="M15.75 5.25C16.5456 5.25 17.3087 5.56607 17.8713 6.12868C18.4339 6.69129 18.75 7.45435 18.75 8.25M21.75 8.25C21.7501 9.12511 21.5588 9.98966 21.1895 10.783C20.8202 11.5764 20.2818 12.2794 19.6121 12.8427C18.9424 13.406 18.1575 13.8159 17.3126 14.0438C16.4677 14.2718 15.5831 14.3121 14.721 14.162C14.158 14.065 13.562 14.188 13.158 14.592L10.5 17.25H8.25V19.5H6V21.75H2.25V18.932C2.25 18.335 2.487 17.762 2.909 17.341L9.408 10.842C9.812 10.438 9.935 9.842 9.838 9.279C9.6962 8.46017 9.72604 7.6208 9.92563 6.81411C10.1252 6.00741 10.4902 5.25097 10.9975 4.59273C11.5047 3.93448 12.1432 3.38879 12.8724 2.99024C13.6016 2.59168 14.4057 2.34895 15.2336 2.27743C16.0616 2.20591 16.8953 2.30716 17.6821 2.57476C18.4688 2.84236 19.1914 3.27048 19.8041 3.83198C20.4167 4.39348 20.906 5.07613 21.241 5.83665C21.5759 6.59717 21.7493 7.41898 21.75 8.25V8.25Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconLock = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Restricted">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconGithub = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="GitHub">
      <path
        d="M9 19C4 20.5 4 16.5 2 16M16 22V18.13C16.0375 17.6532 15.9731 17.1738 15.811 16.7238C15.6489 16.2738 15.3929 15.8634 15.06 15.52C18.2 15.17 21.5 13.98 21.5 8.52C21.4997 7.12383 20.9627 5.7812 20 4.77C20.4559 3.54851 20.4236 2.19835 19.91 1C19.91 1 18.73 0.650001 16 2.48C13.708 1.85882 11.292 1.85882 9 2.48C6.27 0.650001 5.09 1 5.09 1C4.57638 2.19835 4.54414 3.54851 5 4.77C4.03013 5.7887 3.49252 7.14346 3.5 8.55C3.5 13.97 6.8 15.16 9.94 15.55C9.611 15.89 9.35726 16.2954 9.19531 16.7399C9.03335 17.1844 8.96681 17.6581 9 18.13V22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconSource = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Source">
      <path
        d="M16.24 7.75999C16.7979 8.31723 17.2404 8.97896 17.5424 9.70735C17.8443 10.4357 17.9997 11.2165 17.9997 12.005C17.9997 12.7935 17.8443 13.5742 17.5424 14.3026C17.2404 15.031 16.7979 15.6928 16.24 16.25M7.76 16.24C7.20214 15.6828 6.75959 15.021 6.45764 14.2926C6.1557 13.5642 6.00028 12.7835 6.00028 11.995C6.00028 11.2065 6.1557 10.4257 6.45764 9.69735C6.75959 8.96896 7.20214 8.30723 7.76 7.74999M19.07 4.92999C20.9447 6.80527 21.9979 9.34835 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07M4.93 19.07C3.05529 17.1947 2.00214 14.6516 2.00214 12C2.00214 9.34835 3.05529 6.80527 4.93 4.92999M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconDiff = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Diff">
      <path
        d="M3 3.25L3 20.75C3 21.44 3.6048 22 4.35 22L19.65 22C20.3952 22 21 21.44 21 20.75L21 3.25C21 2.56 20.3952 2 19.65 2L4.35 2C3.6048 2 3 2.56 3 3.25Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.25 9.25L8.75 9.25M12 12.5L12 6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 17L15.25 17"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconMap = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Map">
      <path
        d="M1 6V22L8 18L16 22L23 18V2L16 6L8 2L1 6Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 2V18"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 6V22"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconHome = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Home">
      <path
        d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 22V12H15V22"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconFit = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Zoom to Fit">
      <path
        d="M8 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V8M21 8V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H16M16 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V16M3 16V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconEyeOpen = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Show">
      <path
        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconEyeClosed = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Hide">
      <path
        d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06003M9.9 4.24002C10.5883 4.0789 11.2931 3.99836 12 4.00003C19 4.00003 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2219 9.18488 10.8539C9.34884 10.4859 9.58525 10.1547 9.88 9.88003"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 3L21 21"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconTarget = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Center">
      <path
        d="M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12H18"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 12H3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6V3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 21V18"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.25 12C14.25 13.2426 13.2426 14.25 12 14.25C10.7574 14.25 9.75 13.2426 9.75 12C9.75 10.7574 10.7574 9.75 12 9.75C13.2426 9.75 14.25 10.7574 14.25 12Z"
        fill="#111920"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconCommit = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Commit">
      <path
        d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.05 12H7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.01 12H22.96"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconExternalResource = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="External Resource">
      <path d="M4 7L20 7L20 3L4 3L4 7Z" strokeLinejoin="round" />
      <path d="M8 14L16 14L16 10L8 10L8 14Z" strokeLinejoin="round" />
      <path d="M10 21L14 21L14 17L10 17L10 21Z" strokeLinejoin="round" />
      <path d="M12 10L12 7" strokeLinejoin="round" />
      <path d="M12 17L12 14" strokeLinejoin="round" />
    </IconStrokeBase>
  );
};

export const IconScaleDown = (props: IconProps) => {
  return (
    <IconStrokeBase
      {...props}
      title="Scale Down"
      width="16"
      height="16"
      viewBox="0 0 16 16"
    >
      <path
        d="M12.6663 9.33333L7.99967 14M7.99967 14L3.33301 9.33333M7.99967 14V2"
        stroke="#4361FF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconScaleUp = (props: IconProps) => {
  return (
    <IconStrokeBase
      {...props}
      title="Scale Up"
      width="16"
      height="16"
      viewBox="0 0 16 16"
    >
      <path
        d="M3.33301 6.66667L7.99967 2M7.99967 2L12.6663 6.66667M7.99967 2V14"
        stroke="#AD1A1A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconAutoscale = (props: IconProps) => {
  return (
    <IconStrokeBase
      {...props}
      title="Autoscale"
      width="16"
      height="16"
      viewBox="0 0 16 16"
    >
      <path
        d="M10.25 9.58824L8 5L5.75 9.58824M10.25 9.58824L11 11M10.25 9.58824H5.75M5.75 9.58824L5 11M3.5 14H12.5C12.8978 14 13.2794 13.842 13.5607 13.5607C13.842 13.2794 14 12.8978 14 12.5V3.5C14 3.10218 13.842 2.72064 13.5607 2.43934C13.2794 2.15804 12.8978 2 12.5 2H3.5C3.10218 2 2.72064 2.15804 2.43934 2.43934C2.15804 2.72064 2 3.10218 2 3.5V12.5C2 12.8978 2.15804 13.2794 2.43934 13.5607C2.72064 13.842 3.10218 14 3.5 14Z"
        stroke="#111920"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconScaleCheck = (props: IconProps) => {
  return (
    <IconStrokeBase
      {...props}
      title="Scale Check"
      width="16"
      height="16"
      viewBox="0 0 16 16"
    >
      <path
        d="M3 8.5L7 12.5L13 3.5"
        stroke="#111920"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconDiagnostics = (props: IconProps) => {
  return (
    <IconStrokeBase
      {...props}
      title="Diagnostics"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        d="M16.5 7.5V16.5M12 10.875V16.5M7.5 14.25V16.5M5.25 21H18.75C19.3467 21 19.919 20.7629 20.341 20.341C20.7629 19.919 21 19.3467 21 18.75V5.25C21 4.65326 20.7629 4.08097 20.341 3.65901C19.919 3.23705 19.3467 3 18.75 3H5.25C4.65326 3 4.08097 3.23705 3.65901 3.65901C3.23705 4.08097 3 4.65326 3 5.25V18.75C3 19.3467 3.23705 19.919 3.65901 20.341C4.08097 20.7629 4.65326 21 5.25 21Z"
        stroke="#111920"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconStrokeBase>
  );
};

export const IconAI = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="AI">
      <path
        d="M9.813 15.904L9 18.75L8.187 15.904C7.97687 15.1689 7.5829 14.4994 7.04226 13.9587C6.50162 13.4181 5.83214 13.0241 5.097 12.814L2.25 12L5.096 11.187C5.83114 10.9769 6.50062 10.5829 7.04126 10.0423C7.5819 9.50162 7.97587 8.83214 8.186 8.097L9 5.25L9.813 8.096C10.0231 8.83114 10.4171 9.50062 10.9577 10.0413C11.4984 10.5819 12.1679 10.9759 12.903 11.186L15.75 12L12.904 12.813C12.1689 13.0231 11.4994 13.4171 10.9587 13.9577C10.4181 14.4984 10.0241 15.1679 9.814 15.903L9.813 15.904Z"
        fill="#111920"
        stroke="#111920"
        stroke-width="0.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M18.259 8.715L18 9.75L17.741 8.715C17.5927 8.12159 17.286 7.57962 16.8536 7.14703C16.4212 6.71444 15.8794 6.40749 15.286 6.259L14.25 6L15.286 5.741C15.8794 5.59251 16.4212 5.28556 16.8536 4.85297C17.286 4.42038 17.5927 3.87841 17.741 3.285L18 2.25L18.259 3.285C18.4073 3.87854 18.7142 4.42059 19.1468 4.85319C19.5794 5.28579 20.1215 5.59267 20.715 5.741L21.75 6L20.715 6.259C20.1215 6.40733 19.5794 6.71421 19.1468 7.14681C18.7142 7.57941 18.4073 8.12147 18.259 8.715Z"
        fill="#111920"
        stroke="#111920"
        stroke-width="0.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M16.894 20.567L16.5 21.75L16.106 20.567C15.9955 20.2356 15.8094 19.9345 15.5625 19.6875C15.3155 19.4406 15.0144 19.2545 14.683 19.144L13.5 18.75L14.683 18.356C15.0144 18.2455 15.3155 18.0594 15.5625 17.8125C15.8094 17.5655 15.9955 17.2644 16.106 16.933L16.5 15.75L16.894 16.933C17.0045 17.2644 17.1906 17.5655 17.4375 17.8125C17.6845 18.0594 17.9856 18.2455 18.317 18.356L19.5 18.75L18.317 19.144C17.9856 19.2545 17.6845 19.4406 17.4375 19.6875C17.1906 19.9345 17.0045 20.2356 16.894 20.567Z"
        fill="#111920"
        stroke="#111920"
        stroke-width="0.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </IconStrokeBase>
  );
};
