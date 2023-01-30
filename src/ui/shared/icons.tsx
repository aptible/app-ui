import { ReactNode } from "react";

interface IconProps {
  color?: string;
  width?: string;
  height?: string;
  style?: object;
  path?: ReactNode;
  className?: string;
}

const IconStrokeBase = ({
  path,
  color = "#111920",
  style = {},
  className = "",
}: IconProps) => {
  return (
    <svg
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke={color}
      className={`${className} w-6 h-6`}
    >
      {path}
    </svg>
  );
};
const IconFillBase = ({
  path,
  color = "#111920",
  style = {},
  className = "",
}: IconProps) => {
  return (
    <svg
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      fill={color}
      className={`${className} w-6 h-6`}
    >
      {path}
    </svg>
  );
};

export interface Props extends React.SVGProps<SVGSVGElement> {
  color?: string;
  width?: string;
  height?: string;
  style?: object;
  className?: string;
}

export const IconSmallArrowUp = (props: Props) => {
  return (
    <IconStrokeBase
      path={<path d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />}
      {...props}
    />
  );
};

export const IconSmallArrowRight = (props: Props) => {
  return (
    <IconStrokeBase
      path={<path d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />}
      {...props}
    />
  );
};

export const IconArrowSmallDown = (props: Props) => {
  return (
    <IconStrokeBase
      path={<path d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />}
      {...props}
    />
  );
};

export const IconArrowSmallLeft = (props: Props) => {
  return (
    <IconStrokeBase
      path={<path d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />}
      {...props}
    />
  );
};

export const IconArrowsRightLeft = (props: Props) => {
  return (
    <IconStrokeBase
      path={
        <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      }
      {...props}
    />
  );
};

export const IconArrowsUpDown = (props: Props) => {
  return (
    <IconStrokeBase
      path={
        <path d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
      }
      {...props}
    />
  );
};

export const IconChevronUp = (props: Props) => {
  return (
    <IconStrokeBase
      fill-rule="evenodd"
      path={
        <path d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z" />
      }
      clip-rule="evenodd"
      {...props}
    />
  );
};

export const IconChevronRight = (props: Props) => {
  return (
    <IconStrokeBase
      fill-rule="evenodd"
      path={
        <path d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" />
      }
      clip-rule="evenodd"
      {...props}
    />
  );
};

export const IconChevronDown = (props: Props) => {
  return (
    //fill
    <IconStrokeBase
      fill-rule="evenodd"
      clip-rule="evenodd"
      {...props}
      path={
        <path d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" />
      }
    />
  );
};

export const IconChevronLeft = (props: Props) => {
  return (
    //fill
    <IconStrokeBase
      fill-rule="evenodd"
      clip-rule="evenodd"
      path={
        <path d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" />
      }
      {...props}
    />
  );
};

export const IconChevronDoubleRight = (props: Props) => {
  return (
    <IconStrokeBase
      path={<path d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />}
      {...props}
    />
  );
};

export const IconChevronDoubleLeft = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={<path d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />}
    />
  );
};

export const IconTrash = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      }
    />
  );
};

export const IconPencil = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
      }
    />
  );
};

export const IconDocumentSearch = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M10 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V9.414C18.9999 9.1488 18.8946 8.89449 18.707 8.707L13.293 3.293C13.1055 3.10545 12.8512 3.00006 12.586 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V16M5 21L9.879 16.121M9.879 16.121C10.1567 16.4033 10.4876 16.6279 10.8525 16.7817C11.2174 16.9355 11.6092 17.0156 12.0052 17.0173C12.4012 17.0189 12.7936 16.9421 13.1599 16.7914C13.5261 16.6406 13.8588 16.4188 14.1388 16.1388C14.4189 15.8588 14.6408 15.5262 14.7916 15.16C14.9425 14.7938 15.0193 14.4014 15.0177 14.0054C15.0162 13.6094 14.9362 13.2176 14.7825 12.8526C14.6287 12.4877 14.4043 12.1568 14.122 11.879C13.5579 11.3239 12.7973 11.0142 12.0059 11.0173C11.2145 11.0204 10.4564 11.3362 9.8967 11.8957C9.33702 12.4553 9.02111 13.2133 9.0178 14.0047C9.01448 14.7961 9.32402 15.5568 9.879 16.121Z" />
      }
    />
  );
};

export const IconExternalLink = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      }
    />
  );
};

export const IconClock = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={<path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
    />
  );
};

export const IconCloud = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      }
    />
  );
};

export const IconCloudDownload = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
      }
    />
  );
};

export const IconCloudUpload = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
      }
    />
  );
};

export const IconGlobeAlt = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      }
    />
  );
};

export const IconShare = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      }
    />
  );
};

export const IconCode = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      }
    />
  );
};

export const IconCube = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      }
    />
  );
};

export const IconChartBarSquare = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M16 8V16M12 11V16M8 14V16M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" />
      }
    />
  );
};

export const IconBars3 = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={<path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
    />
  );
};

export const IconCogs8Tooth = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <>
          <path d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </>
      }
    />
  );
};

export const IconCalendar = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      }
    />
  );
};

export const IconUser = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      }
    />
  );
};

export const IconUserCircle = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
      }
    />
  );
};

export const IconEllipsisHorizontal = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      }
    />
  );
};

export const IconEllipsisHorizontalCircle = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      }
    />
  );
};

export const IconMagnifyingGlass = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      }
    />
  );
};

export const IconAdjustmentsVertical = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
      }
    />
  );
};

export const IconCheck = (props: Props) => {
  return (
    <IconFillBase
      {...props}
      path={
        <path
          fill-rule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clip-rule="evenodd"
        />
      }
    />
  );
};

export const IconCheckCircle = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      }
    />
  );
};

export const IconDocument = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      }
    />
  );
};

export const IconDuplicate = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M8 16H6C5.46957 16 4.96086 15.7893 4.58579 15.4142C4.21071 15.0391 4 14.5304 4 14V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H14C14.5304 4 15.0391 4.21071 15.4142 4.58579C15.7893 4.96086 16 5.46957 16 6V8M10 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V10C20 9.46957 19.7893 8.96086 19.4142 8.58579C19.0391 8.21071 18.5304 8 18 8H10C9.46957 8 8.96086 8.21071 8.58579 8.58579C8.21071 8.96086 8 9.46957 8 10V18C8 18.5304 8.21071 19.0391 8.58579 19.4142C8.96086 19.7893 9.46957 20 10 20Z" />
      }
    />
  );
};

export const IconPlus = (props: Props) => {
  return (
    <IconStrokeBase {...props} path={<path d="M12 4.5v15m7.5-7.5h-15" />} />
  );
};

export const IconPlusCircle = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={<path d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
    />
  );
};

export const IconXCircle = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      }
    />
  );
};

export const IconXMark = (props: Props) => {
  return <IconStrokeBase {...props} path={<path d="M6 18L18 6M6 6l12 12" />} />;
};

export const IconDownload = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      }
    />
  );
};

export const IconShieldCheck = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      }
    />
  );
};

export const IconExclamation = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      }
    />
  );
};

export const IconLockClosed = (props: Props) => {
  return (
    <IconFillBase
      {...props}
      path={
        <path
          fill-rule="evenodd"
          d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
          clip-rule="evenodd"
        />
      }
    />
  );
};

export const IconLink = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      }
    />
  );
};

export const IconCircleStack = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      }
    />
  );
};

export const IconLogout = (props: Props) => {
  return (
    <IconFillBase
      {...props}
      path={
        <g>
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
        </g>
      }
    />
  );
};

export const IconKey = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      }
    />
  );
};

export const IconGithub = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M9 19C4 20.5 4 16.5 2 16M16 22V18.13C16.0375 17.6532 15.9731 17.1738 15.811 16.7238C15.6489 16.2738 15.3929 15.8634 15.06 15.52C18.2 15.17 21.5 13.98 21.5 8.52C21.4997 7.12383 20.9627 5.7812 20 4.77C20.4559 3.54851 20.4236 2.19835 19.91 1C19.91 1 18.73 0.650001 16 2.48C13.708 1.85882 11.292 1.85882 9 2.48C6.27 0.650001 5.09 1 5.09 1C4.57638 2.19835 4.54414 3.54851 5 4.77C4.03013 5.7887 3.49252 7.14346 3.5 8.55C3.5 13.97 6.8 15.16 9.94 15.55C9.611 15.89 9.35726 16.2954 9.19531 16.7399C9.03335 17.1844 8.96681 17.6581 9 18.13V22" />
      }
    />
  );
};

export const IconGitlab = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M22.65 14.39L12 22.13L1.35001 14.39C1.20723 14.285 1.10133 14.1375 1.04744 13.9687C0.993557 13.7999 0.994455 13.6183 1.05001 13.45L2.27001 9.67L4.71001 2.16C4.73367 2.09881 4.77135 2.04401 4.82001 2C4.89925 1.92762 5.00269 1.88749 5.11001 1.88749C5.21733 1.88749 5.32077 1.92762 5.40001 2C5.45139 2.04966 5.48925 2.11162 5.51001 2.18L7.95001 9.67H16.05L18.49 2.16C18.5137 2.09881 18.5513 2.04401 18.6 2C18.6792 1.92762 18.7827 1.88749 18.89 1.88749C18.9973 1.88749 19.1008 1.92762 19.18 2C19.2314 2.04966 19.2693 2.11162 19.29 2.18L21.73 9.69L23 13.45C23.0505 13.6235 23.0438 13.8086 22.9807 13.978C22.9177 14.1473 22.8017 14.2918 22.65 14.39V14.39Z" />
      }
    />
  );
};

export const IconBitbucket = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <>
          <path d="M1.79259 2.00007C1.67825 1.99851 1.56496 2.02262 1.46071 2.07069C1.35646 2.11876 1.26378 2.18962 1.18921 2.27829C1.11463 2.36696 1.05997 2.47127 1.02908 2.58388C0.998189 2.69649 0.991815 2.81466 1.01041 2.93007L4.848 21.09C4.93356 21.6112 5.37353 21.995 5.88929 22H18.1109C18.2988 22.0019 18.4812 21.9351 18.6251 21.8115C18.769 21.688 18.8649 21.5158 18.8956 21.3262L22.9898 2.93882C23.0082 2.82345 23.0017 2.70536 22.9707 2.59285C22.9397 2.48033 22.885 2.37611 22.8105 2.2875C22.736 2.19888 22.6434 2.12802 22.5392 2.07988C22.4351 2.03173 22.3219 2.00748 22.2076 2.00882L1.79259 2.00007V2.00007Z" />
          <path d="M14.6667 16H9.33333L8 8H16L14.6667 16Z" />
        </>
      }
    />
  );
};

export const IconEnvelope = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <path d="M21.75 6.75V17.25C21.75 17.8467 21.5129 18.419 21.091 18.841C20.669 19.2629 20.0967 19.5 19.5 19.5H4.5C3.90326 19.5 3.33097 19.2629 2.90901 18.841C2.48705 18.419 2.25 17.8467 2.25 17.25V6.75M21.75 6.75C21.75 6.15326 21.5129 5.58097 21.091 5.15901C20.669 4.73705 20.0967 4.5 19.5 4.5H4.5C3.90326 4.5 3.33097 4.73705 2.90901 5.15901C2.48705 5.58097 2.25 6.15326 2.25 6.75M21.75 6.75V6.993C21.75 7.37715 21.6517 7.75491 21.4644 8.0903C21.2771 8.42569 21.0071 8.70754 20.68 8.909L13.18 13.524C12.8252 13.7425 12.4167 13.8582 12 13.8582C11.5833 13.8582 11.1748 13.7425 10.82 13.524L3.32 8.91C2.99292 8.70854 2.72287 8.42669 2.53557 8.0913C2.34827 7.75591 2.24996 7.37815 2.25 6.994V6.75" />
      }
    />
  );
};

export const IconGitBranch = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <>
          <path d="M6 3V15" />
          <path d="M18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 7.65685 16.3431 9 18 9Z" />
          <path d="M6 21C7.65685 21 9 19.6569 9 18C9 16.3431 7.65685 15 6 15C4.34315 15 3 16.3431 3 18C3 19.6569 4.34315 21 6 21Z" />
          <path d="M18 9C18 11.3869 17.0518 13.6761 15.364 15.364C13.6761 17.0518 11.3869 18 9 18" />
        </>
      }
    />
  );
};

export const IconGitCommit = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <>
          <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" />
          <path d="M1.05 12H7" />
          <path d="M17.01 12H22.96" />
        </>
      }
    />
  );
};

export const IconInfo = (props: Props) => {
  return (
    <IconStrokeBase
      {...props}
      path={
        <>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
          <path d="M12 16V12" />
          <path d="M12 8H12.01" />
        </>
      }
    />
  );
};
