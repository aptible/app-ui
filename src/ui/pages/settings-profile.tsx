import { useLoader } from "@app/fx";
import { selectCurrentUser, updateUserName } from "@app/users";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BannerMessages,
  Box,
  Button,
  CopyText,
  FormGroup,
  Group,
  Input,
  tokens,
} from "../shared";

export function SettingsProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [name, setName] = useState(user.name);
  const loader = useLoader(updateUserName);
  const data = {
    userId: user.id,
    name,
  };
  const action = updateUserName(data);
  const isDisabled = name === user.name;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isDisabled) {
      return;
    }

    dispatch(action);
  };

  useEffect(() => {
    setName(user.name);
  }, [user.name]);

  return (
    <Group>
      <h1 className={tokens.type.h1}>Profile</h1>
      <Box>
        <Group size="sm" variant="horizontal">
          <Group size="sm" className="w-[100px] font-bold">
            <div>ID</div>
            <div>Email</div>
            <div>Name</div>
          </Group>

          <Group size="sm">
            <CopyText text={user.id} />
            <CopyText text={user.email} />
            <div>{user.name}</div>
          </Group>
        </Group>
      </Box>

      <Box>
        <form onSubmit={onSubmit}>
          <Group>
            <BannerMessages {...loader} />

            <FormGroup label="Name" htmlFor="name">
              <Input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </FormGroup>

            <div>
              <Button
                type="submit"
                isLoading={loader.isLoading}
                disabled={isDisabled}
              >
                Save Changes
              </Button>
            </div>
          </Group>
        </form>
      </Box>
    </Group>
  );
}
