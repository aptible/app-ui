import { IconExternalLink } from "./icons";

export const Footer = () => {
  return (
    <div>
      <div className="flex border-t border-black-100 py-4 mt-7">
        <p className="grow text-gray-500 text-sm uppercase">
          Aptible, Inc. &copy; {new Date().getFullYear()}
        </p>
        <div className="flex md:flex-row flex-col">
          <a
            href="https://github.com/aptible/app-ui"
            target="_blank"
            className="flex-none text-gray-500 hover:text-indigo text-sm pl-4 uppercase hidden md:block"
            rel="noreferrer"
          >
            GitHub Repo{" "}
            <IconExternalLink className="inline h-4 -ml-1 -mt-1 opacity-60" />
          </a>
          <a
            href="https://www.aptible.com/changelog"
            target="_blank"
            className="flex-none text-gray-500 hover:text-indigo text-sm pl-4 uppercase hidden md:block"
            rel="noreferrer"
          >
            Changelog{" "}
            <IconExternalLink className="inline h-4 -ml-1 -mt-1 opacity-60" />
          </a>
          <a
            href="https://dashboard.aptible.com/login"
            target="_blank"
            className="flex-none text-gray-500 hover:text-indigo text-sm pl-4 uppercase hidden md:block"
            rel="noreferrer"
          >
            Legacy Dashboard{" "}
            <IconExternalLink className="inline h-4 -ml-1 -mt-1 opacity-60" />
          </a>
        </div>
      </div>
    </div>
  );
};
