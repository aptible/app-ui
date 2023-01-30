import {
  createProjectAddKeyUrl,
  createProjectGitPushUrl,
  createProjectGitSettingsUrl,
  createProjectGitStatusUrl,
} from "@app/routes";
import { Outlet } from "react-router";
import { Link } from "react-router-dom";
import { ListingPageLayout } from "../layouts";
import { tokens, Box, Input, Button, Loading } from "../shared";

export const CreateProjectGitLayout = () => {
  return (
    <ListingPageLayout>
      <div className="flex justify-center container">
        <div style={{ width: 700 }}>
          <Outlet />
        </div>
      </div>
    </ListingPageLayout>
  );
};

export const CreateProjectGitPage = () => {
  return <CreateProjectAddKeyPage />;
};

const FormNav = ({
  prev = "",
  next = "",
}: {
  prev?: string;
  next?: string;
}) => {
  return (
    <div>
      <Link aria-disabled={!prev} to={prev} className="pr-2">
        Prev
      </Link>
      <Link aria-disabled={!next} to={next}>
        Next
      </Link>
    </div>
  );
};

export const CreateProjectAddKeyPage = () => {
  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploy your code</h1>
        <p className="my-4 text-gray-600">
          Add your SSH key to deploy code to Aptible.
        </p>
      </div>

      <FormNav next={createProjectGitPushUrl()} />
      <Box>
        <h2 className={tokens.type.h3}>Public SSH Key</h2>
        <p className="text-gray-600 mb-2">
          Copy the contents of the file <code>$HOME/.ssh/id_rsa.pub</code> then
          paste here. Need Help? View Docs
        </p>
        <textarea className={tokens.type.textarea} />
        <Button className="w-full mt-2" disabled>
          Save Key
        </Button>
      </Box>
    </div>
  );
};

const PreCode = ({ children }: { children: React.ReactNode }) => {
  return <pre className="p-4 bg-black rounded text-white">{children}</pre>;
};

export const CreateProjectGitPushPage = () => {
  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploy your code</h1>
        <p className="my-4 text-gray-600">Git push your code to continue.</p>
      </div>

      <FormNav
        prev={createProjectAddKeyUrl()}
        next={createProjectGitSettingsUrl()}
      />
      <Box>
        <h2 className={tokens.type.h3}>Project Name</h2>
        <Input className="w-full" />
        <hr className="my-4" />
        <div>
          <h2 className={tokens.type.h3}>Add Aptible's Git Server</h2>
          <PreCode>
            git remote add aptible git@beta.aptible.com:[ENV]/[APP].git
          </PreCode>
        </div>
        <div className="mt-4">
          <h2 className={tokens.type.h3}>Push your code</h2>
          <PreCode>git push aptible main</PreCode>
        </div>
        <hr className="my-4" />
        <Loading text="Waiting for git push ..." />
      </Box>
    </div>
  );
};

export const CreateProjectGitSettingsPage = () => {
  const envs = ["STRIPE_SECRET_KEY=1234"].join("\n");
  const commands = [
    "http:web=bundle exec rails server",
    "worker=bundle exec sidekiq",
  ].join("\n");

  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploy your code</h1>
        <p className="my-4 text-gray-600">
          Review settings and click deploy to finish.
        </p>
      </div>

      <FormNav
        prev={createProjectGitPushUrl()}
        next={createProjectGitStatusUrl()}
      />
      <Box>
        <div>
          <h2 className={tokens.type.h3}>Databases</h2>
          <p>
            Add new databases with generated keys or connect to existing
            databases.
          </p>
          <Input className="w-full" />
          <p>
            Check all applicable environment variables for Aptible to generate
            in the environment variables section.
          </p>
        </div>

        <hr className="my-4" />

        <div>
          <h2 className={tokens.type.h3}>Environment variables</h2>
          <p>
            Environment Variables (each line is a separate variable in format:{" "}
            <code>ENV_VAR=VALUE</code>).
          </p>
          <textarea className={tokens.type.textarea} value={envs} />
        </div>

        <hr className="my-4" />

        <div>
          <h2 className={tokens.type.h3}>Services and commands</h2>
          <p>
            Each line is separated by a service command in format:{" "}
            <code>NAME=COMMAND</code>.
          </p>
          <p>
            Prefix <code>NAME</code> with <code>http:</code> if the service
            requires an endpoint. (e.g. <code>http:web=rails server</code>)
          </p>
          <textarea className={tokens.type.textarea} value={commands} />
        </div>

        <hr className="my-4" />
      </Box>
    </div>
  );
};

export const CreateProjectGitStatusPage = () => {
  return (
    <div>
      <div className="text-center">
        <h1 className={tokens.type.h1}>Deploying your code</h1>
        <p className="my-4 text-gray-600">Estimated wait time is 5 minutes.</p>
      </div>

      <FormNav prev={createProjectGitSettingsUrl()} />
      <Box>
        <Loading text="Provisioning resources ..." />
      </Box>
    </div>
  );
};
