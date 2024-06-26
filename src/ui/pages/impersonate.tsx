import { type ExchangeToken, exchangeToken } from "@app/auth";
import { selectOrganizationSelected } from "@app/organizations";
import { useDispatch, useLoader, useSelector } from "@app/react";
import { homeUrl } from "@app/routes";
import { selectAccessToken, selectIsImpersonated } from "@app/token";
import { selectCanImpersonate, selectCurrentUser } from "@app/users";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AppSidebarLayout } from "../layouts";
import { BannerMessages, Button, CheckBox, FormGroup, Input } from "../shared";

function prepSubject(
  email = "",
  org = "",
  sso = false,
): Pick<
  ExchangeToken,
  "subjectToken" | "subjectTokenType" | "ssoOrganization"
> {
  const orgHref = org.match(/^http/)
    ? org
    : `https://auth.aptible.com/organizations/${org}`;

  if (sso) {
    return {
      subjectToken: email,
      subjectTokenType: "aptible:user:email",
      ssoOrganization: orgHref,
    };
  }

  if (email !== "") {
    return {
      subjectToken: email,
      subjectTokenType: "aptible:user:email",
    };
  }

  if (org !== "") {
    return {
      subjectToken: orgHref,
      subjectTokenType: "aptible:organization:href",
    };
  }

  return {
    subjectToken: "",
    subjectTokenType: "",
  };
}

export const ImpersonatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const curOrg = useSelector(selectOrganizationSelected);
  const loader = useLoader(exchangeToken);
  const canImpersonate = useSelector(selectCanImpersonate);
  const isImpersonated = useSelector(selectIsImpersonated);
  const actorToken = useSelector(selectAccessToken);
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [writePerm, setWritePerm] = useState(false);
  const [sso, setSSO] = useState(false);
  const hasBothInputs = email !== "" && org !== "";
  const missingInputs = email === "" && org === "";
  const disableSubmit =
    loader.isLoading ||
    missingInputs ||
    (sso && !hasBothInputs) ||
    isImpersonated;

  useEffect(() => {
    if (user.id === "") return;
    // if the current token is being impersonated by a user then
    // we let them stay on this screen
    if (canImpersonate || isImpersonated) {
      return;
    }
    navigate(homeUrl());
  }, [canImpersonate, isImpersonated, user.id]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disableSubmit) {
      return;
    }

    dispatch(
      exchangeToken({
        actorToken,
        scope: writePerm ? "manage" : "read",
        ...prepSubject(email, org, sso),
      }),
    );
  };

  return (
    <AppSidebarLayout>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <BannerMessages {...loader} />

        <FormGroup label="User Email" htmlFor="email">
          <Input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            className="w-full"
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </FormGroup>

        <FormGroup label="Organization ID/HREF" htmlFor="org">
          <Input
            type="text"
            id="org"
            name="org"
            className="w-full"
            onChange={(e) => setOrg(e.currentTarget.value)}
          />
        </FormGroup>

        {user.superuser ? (
          <FormGroup label="Write Access" htmlFor="write-access">
            <CheckBox
              label=""
              id="write-access"
              name="write-access"
              onChange={(e) => setWritePerm(e.currentTarget.checked)}
            />
          </FormGroup>
        ) : null}

        <FormGroup
          label="Simulate SSO login for user in organization"
          htmlFor="sso"
          description="To simulate an SSO login, check here and enter both fields. This is always read only."
        >
          <CheckBox
            label=""
            id="sso"
            name="sso"
            onChange={(e) => setSSO(e.currentTarget.checked)}
          />
        </FormGroup>

        <Button type="submit" disabled={disableSubmit}>
          Impersonate
        </Button>

        <div className="flex gap-2 items-center">
          <div className="font-bold w-1/5">Current User</div>
          <div className="flex-1">{user.email}</div>
          <div className="text-black-500">{user.id}</div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="font-bold w-1/5">Current Organization</div>
          <div className="flex-1">{curOrg.name}</div>
          <div className="text-black-500">{curOrg.id}</div>
        </div>
      </form>
    </AppSidebarLayout>
  );
};
