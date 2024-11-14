import { useDispatch, useLoader, useSelector } from "@app/react";
import { securitySettingsUrl } from "@app/routes";
import { selectCurrentUser, updateUserName } from "@app/users";
import { existValidator, nameValidator, sanitizeInput } from "@app/validator";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useValidator } from "../hooks";
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
  const validators = {
    name: (props: UpdateNameForm) =>
      existValidator(props.name, "Name") || nameValidator(props.name),
  };
  const [errors, validate] = useValidator<UpdateNameForm, typeof validators>(
    validators,
  );
  const isDisabled = name === user.name || !!errors.name;

  interface UpdateNameForm {
    name: string;
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isDisabled) {
      return;
    }

    if (!validate(data)) return;
    dispatch(action);
  };

  useEffect(() => {
    setName(user.name);
  }, [user.name]);

  return (
    <Group>
      <h2 className={tokens.type.h2}>Profile</h2>
      <Box>
        <Group size="sm" variant="horizontal">
          <Group size="sm" className="w-[180px] font-bold">
            <div>Name</div>
            <div>ID</div>
            <div>Email</div>
            <div>Password</div>
            <div>2-Factor Authentication</div>
            <div>Security Keys</div>
            <div>Log out other sessions</div>
          </Group>

          <Group size="sm">
            <div>{user.name}</div>
            <CopyText text={user.id} />
            <div className="flex items-center gap-2">
              <CopyText text={user.email} />
              <Link to={securitySettingsUrl()}>Edit</Link>
            </div>
            <Link to={securitySettingsUrl()}>Edit</Link>
            <Link to={securitySettingsUrl()}>Edit</Link>
            <Link to={securitySettingsUrl()}>Edit</Link>
            <Link to={securitySettingsUrl()}>Edit</Link>
          </Group>
        </Group>
      </Box>
      <Box>
        <form onSubmit={onSubmit}>
          <Group>
            <BannerMessages {...loader} />

            <FormGroup
              label="Name"
              htmlFor="name"
              feedbackMessage={errors.name}
              feedbackVariant={errors.name ? "danger" : "info"}
            >
              <Input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(sanitizeInput(e.currentTarget.value));
                  validate({
                    name: sanitizeInput(e.currentTarget.value),
                  });
                }}
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
