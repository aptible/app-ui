import {
  useCache,
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "@app/react";
import { SshKeyResponse, fetchSSHKeys, rmSSHKey } from "@app/ssh-keys";
import { selectCurrentUser } from "@app/users";
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
    <Box>
      <Group size="sm">
        <h4 className={tokens.type.h4}>{ssh.name}</h4>

        <PreCode
          allowCopy
          segments={[{ text: ssh.ssh_public_key, className: "text-lime" }]}
        />

        <div>
          <Button
            requireConfirm
            onClick={iDelete}
            variant="delete"
            isLoading={loader.isLoading}
          >
            Delete
          </Button>
        </div>
      </Group>
    </Box>
  );
};

const sortDate = (a: { created_at: string }, b: { created_at: string }) => {
  const aDate = new Date(a.created_at).getTime();
  const bDate = new Date(b.created_at).getTime();
  return bDate - aDate;
};

export const SSHSettingsPage = () => {
  const user = useSelector(selectCurrentUser);
  const loader = useCache(fetchSSHKeys({ userId: user.id }));
  const rmLoader = useLoader(rmSSHKey);
  const sshKeys = loader.data?._embedded?.ssh_keys || [];

  return (
    <Group>
      <h2 className={tokens.type.h2}>SSH Keys</h2>

      <Box>
        <AddSSHKeyForm onSuccess={() => loader.trigger()} />
      </Box>

      <Group>
        <BannerMessages {...rmLoader} />
        {loader.isInitialLoading ? <Loading /> : null}
        {[...sshKeys].sort(sortDate).map((ssh) => {
          return (
            <SshItem key={ssh.id} ssh={ssh} onDelete={() => loader.trigger()} />
          );
        })}
      </Group>
    </Group>
  );
};
