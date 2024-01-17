export interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  variant?: "base" | "sm" | "lg";
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
    <IconStrokeBase {...props} title="Check">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline
        xmlns="http://www.w3.org/2000/svg"
        points="22 4 12 14.01 9 11.01"
      />
    </IconStrokeBase>
  );
};

export const IconPlusCircle = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="New">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </IconStrokeBase>
  );
};

export const IconX = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Remove">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconStrokeBase>
  );
};

export const IconXCircle = (props: IconProps) => {
  return (
    <IconStrokeBase {...props} title="Remove">
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
