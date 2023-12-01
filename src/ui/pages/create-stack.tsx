import {
  fetchActivePlans,
  fetchPlans,
  resetSupportTicket,
  selectFirstActivePlan,
  selectPlanByActiveId,
} from "@app/deploy";
import { createSupportTicket } from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useDispatch, useSelector } from "@app/react";
import { useLoader, useQuery } from "@app/react";
import { plansUrl, stacksUrl } from "@app/routes";
import { selectCurrentUser } from "@app/users";
import { stackNameRegexExplainer, stackNameValidator } from "@app/validator";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useValidator } from "../hooks";
import {
  Banner,
  BannerMessages,
  Box,
  Breadcrumbs,
  ButtonAnyOwner,
  CheckBox,
  ExternalLink,
  FormGroup,
  Group,
  Input,
  Select,
  SelectOption,
  tokens,
} from "../shared";

const regionOptions: SelectOption[] = [
  { label: "Select a Region", value: "none" },

  { label: "us-east-1 / US East (N. Virginia)", value: "us-east-1" },
  { label: "us-east-2 / US East (Ohio)", value: "us-east-2" },
  { label: "us-west-1 / US West (N. California)", value: "us-west-1" },
  { label: "us-west-2 / US West (Oregon)", value: "us-west-2" },

  { label: "ca-central-1 / Canada (Central)", value: "ca-central-1" },

  { label: "eu-west-1 / Europe (Ireland)", value: "eu-west-1" },
  { label: "eu-west-2 / Europe (London)", value: "eu-west-2" },
  { label: "eu-west-3 / Europe (Paris)", value: "eu-west-3" },
  { label: "eu-central-1 / Europe (Frankfurt)", value: "eu-central-1" },

  { label: "ap-south-1 / Asia Pacific (Mumbai)", value: "ap-south-1" },
  {
    label: "ap-southeast-1 / Asia Pacific (Singapore)",
    value: "ap-southeast-1",
  },
  { label: "ap-southeast-2 / Asia Pacific (Sydney)", value: "ap-southeast-2" },
  { label: "ap-northeast-1 / Asia Pacific (Tokyo)", value: "ap-northeast-1" },
  { label: "ap-northeast-2 / Asia Pacific (Seoul)", value: "ap-northeast-2" },

  { label: "sa-east-1 / South America (São Paulo)", value: "sa-east-1" },
];

interface StackData {
  stackName: string;
  region: string;
  dataTypes: string[];
}

const validators = {
  name: (d: StackData) => stackNameValidator(d.stackName),
  region: (d: StackData) => {
    if (d.region === "none") {
      return "must select an AWS region";
    }
  },
};

export const CreateStackPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const orgId = useSelector(selectOrganizationSelectedId);
  const activePlan = useSelector(selectFirstActivePlan);

  useQuery(fetchPlans());
  useQuery(fetchActivePlans({ orgId }));

  const selectedPlan = useSelector((s) =>
    selectPlanByActiveId(s, { id: activePlan.planId }),
  );
  // must have a non-starter active plan or,
  // an empty active plan (empty active plan means legacy enterprise)
  const canRequestStack = ["growth", "scale", "enterprise"].includes(
    selectedPlan.name,
  );

  const [stackName, setStackName] = useState("");
  const [region, setRegion] = useState("none");
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);
  const [errors, validate] = useValidator<StackData, typeof validators>(
    validators,
  );
  const data = {
    stackName,
    region,
    dataTypes,
  };
  const loader = useLoader(createSupportTicket);

  const addDataType = (name: string) => {
    const idx = dataTypes.findIndex((dt) => dt === name);
    if (idx === -1) {
      setDataTypes([...dataTypes, name]);
    }
  };

  const rmDataType = (name: string) => {
    const idx = dataTypes.findIndex((dt) => dt === name);
    if (idx === -1) {
      return;
    }

    const nextDt = [...dataTypes];
    nextDt.splice(idx);
    setDataTypes(nextDt);
  };

  const updateDataTypes =
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget.checked) return addDataType(name);
      return rmDataType(name);
    };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(data)) {
      return;
    }

    dispatch(
      createSupportTicket({
        email: user.email,
        name: user.name,
        subject: `Dedicated Stack Request - ${stackName} on ${region}`,
        priority: "high",
        attachments: [],
        description: [
          `Org ID: ${orgId}`,
          `Stack Name: ${stackName}`,
          `Region: ${region}`,
          `Data Types: ${dataTypes.join(", ")}`,
          `Current plan: ${selectedPlan.name}`,
        ].join("\n"),
      }),
    );
  };

  useEffect(() => {
    return () => {
      // reset loader when component is unmounted because we have multiple
      // pages that use this same loader id
      dispatch(resetSupportTicket());
    };
  }, []);

  return (
    <Group>
      <Breadcrumbs
        crumbs={[
          { name: "Stacks", to: stacksUrl() },
          { name: "Request Dedicated Stack", to: null },
        ]}
      />
      <Box>
        <form onSubmit={onSubmit}>
          <Group>
            <p>
              <ExternalLink
                variant="info"
                href="https://www.aptible.com/docs/stacks#dedicated-stacks"
              >
                Dedicated Stacks
              </ExternalLink>{" "}
              are built for production environments, are dedicated to a single
              organization, and provide four significant benefits: Isolated
              Tenancy, SLA Availability, Regulatory (HIPAA, GDPR), and
              Connectivity (VPNs, VPC Peering).
            </p>

            <Banner variant="info">
              Fill out this form and Aptible Support will be in contact with you
              shortly.
            </Banner>

            {selectedPlan.id === "" || canRequestStack ? null : (
              <Banner variant="info">
                Dedicated stacks are only available for{" "}
                <strong>Growth, Scale, and Enterprise</strong> plans &mdash;{" "}
                <Link to={plansUrl()}>Upgrade your plan for access.</Link>
              </Banner>
            )}

            <BannerMessages {...loader} />

            <FormGroup
              label="Stack Name"
              description={stackNameRegexExplainer}
              htmlFor="stack"
              feedbackMessage={errors.name}
              feedbackVariant={errors.name ? "danger" : "info"}
            >
              <Input
                id="stack"
                name="stack"
                value={stackName}
                onChange={(e) => setStackName(e.currentTarget.value)}
              />
            </FormGroup>

            <FormGroup
              label="Region"
              description="Stack will be created in this AWS Region"
              htmlFor="region"
              feedbackMessage={errors.region}
              feedbackVariant={errors.region ? "danger" : "info"}
            >
              <Select
                options={regionOptions}
                value={region}
                onSelect={(opt) => setRegion(opt.value)}
              />
            </FormGroup>

            <FormGroup
              label="What types of data will this Stack process?"
              description="Select all that apply"
              htmlFor="data-type"
            >
              <Group size="sm">
                <CheckBox
                  label="Protected Health Information (PHI)"
                  onChange={updateDataTypes("phi")}
                />
                <CheckBox
                  label="Sensitive Data"
                  onChange={updateDataTypes("sensitive")}
                />
                <CheckBox
                  label="Financial Data"
                  onChange={updateDataTypes("financial")}
                />
                <CheckBox label="Other" onChange={updateDataTypes("other")} />
              </Group>
            </FormGroup>

            <div>
              <h4 className={tokens.type.h4}>Monthly Cost</h4>
              <p className="text-lg text-green-400">$499</p>
            </div>

            <hr />

            <Group
              variant="horizontal"
              size="sm"
              className="items-center gap-4"
            >
              <ButtonAnyOwner
                type="submit"
                disabled={!terms || !canRequestStack}
                isLoading={loader.isLoading}
              >
                Request Dedicated Stack
              </ButtonAnyOwner>
              <CheckBox
                onChange={(e) => setTerms(e.currentTarget.checked)}
                label={
                  <>
                    <span>I agree to the </span>
                    <ExternalLink
                      variant="info"
                      href="https://www.aptible.com/legal/terms-of-service"
                    >
                      terms and conditions
                    </ExternalLink>
                  </>
                }
              />
            </Group>
          </Group>
        </form>
      </Box>
    </Group>
  );
};
