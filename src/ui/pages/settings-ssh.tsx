import { SshKeyResponse, fetchSSHKeys, rmSSHKey } from "@app/ssh-keys";
import { HalEmbedded } from "@app/types";
import { selectCurrentUser } from "@app/users";
import { useDispatch, useSelector } from "react-redux";
import { useCache, useLoader, useLoaderSuccess } from "saga-query/react";
import {
  AddSSHKeyForm,
  BannerMessages,
  Box,
  Button,
  Group,
  Loading,
  PreCode,
  tokens,
} from "../shared";

const SshItem = ({
  ssh,
  onDelete,
}: { ssh: SshKeyResponse; onDelete: (id: string) => void }) => {
  const dispatch = useDispatch();
  const action = rmSSHKey({ id: ssh.id });
  const loader = useLoader(action);
  const iDelete = () => {
    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    onDelete(ssh.id);
  });

  return (
    <Box size="md">
      <Group size="sm">
        <Group variant="horizontal" size="sm" className="items-center">
          <div className="font-bold">{ssh.name}</div>
          <Button
            size="xs"
            requireConfirm
            onClick={iDelete}
            variant="delete"
            isLoading={loader.isLoading}
          >
            Delete
          </Button>
        </Group>

        <PreCode
          allowCopy
          segments={[{ text: ssh.ssh_public_key, className: "text-lime" }]}
        />
      </Group>
    </Box>
  );
};

export const SSHSettingsPage = () => {
  const user = useSelector(selectCurrentUser);
  const loader = useCache<
    HalEmbedded<{
      ssh_keys: SshKeyResponse[];
    }>
  >(fetchSSHKeys({ userId: user.id }));
  const rmLoader = useLoader(rmSSHKey);

  return (
    <Group>
      <h1 className={tokens.type.h1}>SSH Settings</h1>

      <Box>
        <AddSSHKeyForm onSuccess={() => loader.trigger()} />
      </Box>

      <Group>
        <BannerMessages {...rmLoader} />
        {loader.isInitialLoading ? <Loading /> : null}
        {loader.data?._embedded?.ssh_keys.map((ssh) => {
          return (
            <div key={ssh.id}>
              <SshItem ssh={ssh} onDelete={() => loader.trigger()} />
            </div>
          );
        })}
      </Group>
    </Group>
  );
};
