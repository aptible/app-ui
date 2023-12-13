import { sourceDetailAppsUrl } from "@app/routes";
import { selectSourceById, updateSource } from "@app/source";
import { AppState } from "@app/types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router";
import { useLoader } from "starfx/react";
import {
  AppListBySource,
  BannerMessages,
  Box,
  ButtonOrgOwner,
  FormGroup,
  Group,
  Input,
} from "../shared";

export function SourceDetailPage() {
  const { id = "" } = useParams();
  return <Navigate to={sourceDetailAppsUrl(id)} replace />;
}

export function SourceDetailAppsPage() {
  const { id = "" } = useParams();
  return <AppListBySource sourceId={id} />;
}

export function SourceDetailSettingsPage() {
  const dispatch = useDispatch();
  const { id = "" } = useParams();
  const source = useSelector((s: AppState) => selectSourceById(s, { id }));
  const [gitBrowseUrl, setGitBrowseUrl] = useState(source.gitBrowseUrl);
  const loader = useLoader(updateSource);
  const isDisabled = gitBrowseUrl === source.gitBrowseUrl;

  useEffect(() => {
    setGitBrowseUrl(source.gitBrowseUrl);
  }, [source.gitBrowseUrl]);

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    dispatch(updateSource({ id: source.id, gitBrowseUrl }));
  };

  return (
    <Box>
      <Group>
        <BannerMessages {...loader} />

        <form onSubmit={onSubmit}>
          <Group>
            <FormGroup
              label="Git Browse URL"
              htmlFor="git-browse-url"
              description="All Apps that originate from this Source will display this link in their detail page"
            >
              <Input
                id="git-browse-url"
                name="git-browse-url"
                type="text"
                value={gitBrowseUrl}
                onChange={(ev) => setGitBrowseUrl(ev.currentTarget.value)}
              />
            </FormGroup>

            <div>
              <ButtonOrgOwner
                type="submit"
                isLoading={loader.isLoading}
                disabled={isDisabled}
              >
                Save
              </ButtonOrgOwner>
            </div>
          </Group>
        </form>
      </Group>
    </Box>
  );
}
