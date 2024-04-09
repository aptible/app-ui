import { DEFAULT_INSTANCE_CLASS } from "@app/deploy";
import {
  defaultDeployApp,
  defaultDeployDatabase,
  defaultDeployEndpoint,
  defaultDeployEnvironment,
  defaultDeployEnvironmentStats,
  defaultDeployOperation,
  defaultDeployService,
  defaultDeployStack,
} from "@app/schema";
import { useState } from "react";
import {
  AppHeader,
  DatabaseHeader,
  EnvHeader,
  OpHeader,
  StackHeader,
} from "../layouts";
import {
  AptibleLogo,
  Banner,
  Box,
  Breadcrumbs,
  Button,
  ButtonIcon,
  ButtonLink,
  CheckBox,
  FormGroup,
  Group,
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconBox,
  IconCertificate,
  IconCheck,
  IconCheckCircle,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconCloud,
  IconCopy,
  IconCreditCard,
  IconCylinder,
  IconDiff,
  IconDownload,
  IconEdit,
  IconEllipsis,
  IconEndpoint,
  IconExternalLink,
  IconEyeClosed,
  IconEyeOpen,
  IconFit,
  IconGitBranch,
  IconGithub,
  IconGlobe,
  IconHamburger,
  IconHeart,
  IconHome,
  IconInfo,
  IconKey,
  IconLayers,
  IconLock,
  IconLogout,
  IconMap,
  IconPlusCircle,
  IconRefresh,
  IconSearch,
  IconService,
  IconSettings,
  IconShield,
  IconThumbsUp,
  IconTrash,
  IconX,
  IconXCircle,
  Input,
  InputSearch,
  KeyValueGroup,
  LogViewerText,
  Pill,
  PreCode,
  Radio,
  RadioGroup,
  Secret,
  Select,
  SelectOption,
  TBody,
  THead,
  Table,
  Tabs,
  Td,
  TextArea,
  Th,
  Tooltip,
  Tr,
  listToTextColor,
  tokens,
} from "../shared";

const StylesWrapper = ({
  children,
  navigation,
}: { children: React.ReactNode; navigation: React.ReactNode }) => (
  <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white -mt-4 -ml-4 -mr-4">
    <div className="flex">
      <div className="w-[200px] py-6 px-6 fixed border-r border-black-100 h-full bg-off-white">
        {navigation}
      </div>
      <div className="ml-[200px] py-6 px-8 overflow-y-auto w-full mr-2 flex flex-col gap-6">
        {children}
      </div>
    </div>
  </div>
);

const StylesNavigation = () => (
  <nav className="flex flex-col gap-2">
    <div className="mb-4">
      <AptibleLogo />
    </div>
    <p>
      <b>STYLES</b>
    </p>
    {[
      { name: "Colors", to: "#colors" },
      { name: "Typography", to: "#typography" },
      { name: "Buttons", to: "#buttons" },
      { name: "Banners", to: "#banners" },
      { name: "Tables", to: "#tables" },
      { name: "Forms", to: "#forms" },
      { name: "Logs", to: "#logs" },
      { name: "Pills", to: "#pills" },
      { name: "Navigation", to: "#navigation" },
      { name: "Icons", to: "#icons" },
      { name: "Tooltips", to: "#tooltips" },
      { name: "Detail Boxes", to: "#detail-boxes" },
      { name: "Secrets", to: "#secrets" },
      { name: "Boxes", to: "#boxes" },
    ].map(({ name, to }) => (
      <a className={tokens.type["table link"]} href={to} key={to}>
        <div className="flex items-center">
          <div>{name}</div>
        </div>
      </a>
    ))}
  </nav>
);

const Banners = () => (
  <div className="pt-8 space-y-4">
    <h1 id="banners" className={tokens.type.h1}>
      Banners
    </h1>
    <Banner className="mt-2" variant="success">
      Success banner
    </Banner>
    <Banner className="mt-2" variant="progress">
      Progress banner
    </Banner>
    <Banner className="mt-2" variant="info">
      Info banner
    </Banner>
    <Banner className="mt-2" variant="warning">
      Warning banner
    </Banner>
    <Banner className="mt-2" variant="error">
      Error banner
    </Banner>
  </div>
);

const Tables = () => (
  <div className="pt-8 space-y-4">
    <h1 id="tables" className={tokens.type.h1}>
      Tables
    </h1>

    <Table>
      <THead>
        <Th>Header 1</Th>
        <Th>Header 2</Th>
        <Th>Header 3</Th>
        <Th>Header 4</Th>
        <Th>Header 5</Th>
        <Th>Header 6</Th>
        <Th>Header 7</Th>
        <Th>Header 8</Th>
        <Th>Header 9</Th>
        <Th>Header 10</Th>
      </THead>

      <TBody>
        <Tr>
          <Td>Row 1 Value 1</Td>
          <Td>Row 1 Value 2</Td>
          <Td>Row 1 Value 3</Td>
          <Td>Row 1 Value 4</Td>
          <Td>Row 1 Value 5</Td>
          <Td>Row 1 Value 6</Td>
          <Td>Row 1 Value 7</Td>
          <Td>Row 1 Value 8</Td>
          <Td>Row 1 Value 9</Td>
          <Td>Row 1 Value 10</Td>
        </Tr>
        <Tr>
          <Td>Row 2 Value 1</Td>
          <Td>Row 2 Value 2</Td>
          <Td>Row 2 Value 3</Td>
          <Td>Row 2 Value 4</Td>
          <Td>Row 2 Value 5</Td>
          <Td>Row 2 Value 6</Td>
          <Td>Row 2 Value 7</Td>
          <Td>Row 2 Value 8</Td>
          <Td>Row 2 Value 9</Td>
          <Td>Row 2 Value 10</Td>
        </Tr>
        <Tr>
          <Td>Row 3 Value 1</Td>
          <Td>Row 3 Value 2</Td>
          <Td>Row 3 Value 3</Td>
          <Td>Row 3 Value 4</Td>
          <Td>Row 3 Value 5</Td>
          <Td>Row 3 Value 6</Td>
          <Td>Row 3 Value 7</Td>
          <Td>Row 3 Value 8</Td>
          <Td>Row 3 Value 9</Td>
          <Td>Row 3 Value 10</Td>
        </Tr>
        <Tr>
          <Td>Row 4 Value 1</Td>
          <Td>Row 4 Value 2</Td>
          <Td>Row 4 Value 3</Td>
          <Td>Row 4 Value 4</Td>
          <Td>Row 4 Value 5</Td>
          <Td>Row 4 Value 6</Td>
          <Td>Row 4 Value 7</Td>
          <Td>Row 4 Value 8</Td>
          <Td>Row 4 Value 9</Td>
          <Td>Row 4 Value 10</Td>
        </Tr>
        <Tr>
          <Td>Row 5 Value 1</Td>
          <Td>Row 5 Value 2</Td>
          <Td>Row 5 Value 3</Td>
          <Td>Row 5 Value 4</Td>
          <Td>Row 5 Value 5</Td>
          <Td>Row 5 Value 6</Td>
          <Td>Row 5 Value 7</Td>
          <Td>Row 5 Value 8</Td>
          <Td>Row 5 Value 9</Td>
          <Td>Row 5 Value 10</Td>
        </Tr>
      </TBody>
    </Table>
  </div>
);

const Data = () => {
  return (
    <div className="pt-8 space-y-4">
      <h1 id="data" className={tokens.type.h1}>
        Data
      </h1>

      <div className="w-[300px]">
        <KeyValueGroup
          data={[
            { key: "Key1", value: "Value1" },
            { key: "Key2", value: "Value2" },
            { key: "Key3", value: "Value3" },
          ]}
        />
      </div>
    </div>
  );
};

const Forms = () => {
  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const [choice, setChoice] = useState<string>("");
  const [formInput, setFormInput] = useState("");
  const selectOption = (option: SelectOption) => {
    setChoice(option.value);
  };
  const options: SelectOption[] = Array(8)
    .fill(0)
    .map((_, idx) => ({
      label: `Select Menu Option ${idx + 1}`,
      value: `option_${idx + 1}`,
    }));
  const selectedOption = [].find(
    (option: SelectOption) => option.value === choice,
  );

  return (
    <div className="pt-8 flex flex-col gap-2 w-1/3">
      <h1 id="forms" className={tokens.type.h1}>
        Forms
      </h1>
      <InputSearch
        className="mt-4"
        placeholder="Search field..."
        search={search}
        onChange={onChange}
      />
      <Input
        className="mt-4"
        name="app-handle"
        type="text"
        value={formInput}
        onChange={(e) => setFormInput(e.currentTarget.value)}
        autoComplete="name"
        data-testid="input-name"
        id="input-name"
        placeholder="Input"
      />
      <Input
        className="mt-4"
        name="app-handle"
        type="text"
        value={formInput}
        onChange={(e) => setFormInput(e.currentTarget.value)}
        disabled
        autoComplete="name"
        data-testid="input-name"
        id="input-name"
        placeholder="Disabled input"
      />
      <Select
        className="mt-4"
        onSelect={selectOption}
        value={selectedOption}
        options={options}
      />
      <div className="mt-4">
        <RadioGroup name="service" selected="cmd" onSelect={() => {}}>
          <Radio value="unchecked">Radio unchecked</Radio>
          <Radio value="cmd">Radio checked</Radio>
          <Radio value="disabled" disabled={true}>
            Radio disabled
          </Radio>
        </RadioGroup>
      </div>

      <div className="mt-4">
        <CheckBox checked label="Some label" />
      </div>

      <TextArea
        className={`${tokens.type.textarea} mt-4`}
        defaultValue="Editable textarea"
      />

      <div className="my-4">
        <h3 className={tokens.type.h3}>Form Groups</h3>
      </div>

      <FormGroup htmlFor="input - name" label="Label">
        <Input
          name="app-handle"
          type="text"
          value={formInput}
          onChange={(e) => setFormInput(e.currentTarget.value)}
          autoComplete="name"
          data-testid="input-name"
          id="input-name"
          placeholder="Input"
        />
      </FormGroup>
    </div>
  );
};

const Colors = () => (
  <div className="space-y-4">
    <h1 id="colors" className={tokens.type.h1}>
      Colors
    </h1>

    <h3 className={tokens.type.h3}>Main Colors</h3>
    <div className="flex my-2">
      <div className="rounded-full bg-black w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Black</p>
    </div>
    <div className="flex my-2">
      <div className="rounded-full bg-white border-solid border border-black w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">White</p>
    </div>
    <div className="flex my-2">
      <div className="rounded-full bg-indigo w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Indigo</p>
    </div>
    <div className="flex my-2">
      <div className="rounded-full bg-yellow w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Yellow</p>
    </div>
    <div className="flex my-2">
      <div className="rounded-full bg-gold w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Gold</p>
    </div>
    <div className="flex my-2">
      <div className="rounded-full bg-forest w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Forest</p>
    </div>
    <div className="flex my-2">
      <div className="rounded-full bg-red w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Red</p>
    </div>
    <h3 className={tokens.type.h3}>Misc. Colors</h3>
    <div className="flex my-2">
      <div className="rounded-full bg-off-white border-solid border border-black w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Off-White</p>
    </div>
    <div className="flex my-2">
      <div className="rounded-full bg-lime w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Lime</p>
    </div>
    <div className="flex my-2">
      <div className="rounded-full bg-cyan w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Cyan</p>
    </div>
    <div className="flex my-2">
      <div className="rounded-full bg-brown w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Brown</p>
    </div>
    <div className="flex my-2">
      <div className="rounded-full bg-lavender w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Lavender</p>
    </div>
    <div className="flex my-2">
      <div className="rounded-full bg-plum w-[32px] h-[32px] block mr-2" />
      <p className="leading-8">Plum</p>
    </div>
  </div>
);

const Typography = () => (
  <div className="pt-8 space-y-4">
    <h1 id="typography" className={tokens.type.h1}>
      Typography
    </h1>

    <h1 className={tokens.type.h1}>H1 Heading</h1>
    <h2 className={tokens.type.h2}>H2 Heading</h2>
    <h3 className={tokens.type.h3}>H3 Heading</h3>
    <h4 className={tokens.type.h4}>H4 Heading</h4>
    <p>Paragraph text</p>

    <p>
      <a href="/">Link Text (Unstyled)</a>
    </p>
    <p>
      <a className={tokens.type.link} href="/">
        Link Text (Styled as tokens.type.link)
      </a>
    </p>

    <p>Paragraph variants</p>
    <p className={tokens.type["small semibold darker"]}>
      Small semibold darker
    </p>
    <p className={tokens.type["small normal darker"]}>Small normal darker</p>
    <p className={tokens.type["small normal lighter"]}>Small normal lighter</p>
    <p className={tokens.type["medium label"]}>Medium label</p>

    <p className={tokens.type.textarea}>Textarea format</p>

    <PreCode
      segments={listToTextColor(["git", "push", "origin", "main"])}
      allowCopy
    />
  </div>
);

const Buttons = () => (
  <div className="pt-8 space-y-4">
    <h1 id="buttons" className={tokens.type.h1}>
      Buttons
    </h1>

    <h3 className={tokens.type.h3}>Button Variants</h3>
    <Button className="mt-2">Button Default</Button>
    <Button className="mt-2" variant="primary">
      Primary Button
    </Button>
    <Button className="mt-2" variant="delete">
      Delete Button
    </Button>
    <Button className="mt-2" variant="secondary">
      Secondary Button
    </Button>
    <Button className="mt-2" variant="success">
      Success Button
    </Button>
    <Button className="mt-2" variant="white">
      White Button
    </Button>

    <ButtonIcon icon={<IconPlusCircle />}>Button Icon</ButtonIcon>

    <ButtonLink className="w-fit" to="#">
      Button Link
    </ButtonLink>

    <h3 className={tokens.type.h3}>Button Sizes</h3>
    <Button className="mt-2" size="xs">
      Extra Small
    </Button>
    <Button className="mt-2" size="sm">
      Small
    </Button>
    <Button className="mt-2" size="md">
      Medium
    </Button>
    <Button className="mt-2" size="lg">
      Large
    </Button>
    <Button className="mt-2" size="xl">
      Extra Large
    </Button>

    <h3 className={tokens.type.h3}>Button States</h3>
    <Button className="mt-2" disabled>
      Button Disabled
    </Button>
    <Button className="mt-2" isLoading />
  </div>
);

const Logs = () => {
  const log = `2023-06-14 16:45:39 +0000 INFO -- : Starting Database backup operation with ID: 3946
2023-06-14 16:45:39 +0000 INFO -- : Obtaining dependency information for asgiref==3.7.2 from https://files.pythonhosted.org/packages/9b/80/b9051a4a07ad231558fcd8ffc89232711b4e618c15cb7a392a17384bbeef/asgiref-3.7.2-py3-none-any.whl.metadata
2023-06-14 16:45:39 +0000 INFO -- : STARTING: Snapshot EBS volume
2023-06-14 16:45:40 +0000 WARN -- : WAITING FOR: Snapshot EBS volume
2023-06-14 16:45:52 +0000 INFO -- : WAITING FOR: Snapshot EBS volume
2023-06-14 16:46:04 +0000 INFO -- : WAITING FOR: Snapshot EBS volume
2023-06-14 16:46:16 +0000 ERROR -- : WAITING FOR: Snapshot EBS volume
2023-06-14 16:46:29 +0000 INFO -- : WAITING FOR: Snapshot EBS volume
2023-06-14 16:46:41 +0000 INFO -- : WAITING FOR: Snapshot EBS volume
2023-06-14 16:46:45 +0000 INFO -- : COMPLETED (after 65.95s): Snapshot EBS volume
2023-06-14 16:46:45 +0000 INFO -- : STARTING: Commit Backup in API
2023-06-14 16:46:46 +0000 INFO -- : COMPLETED (after 0.2s): Commit Backup in API
`;
  return (
    <div className="pt-8 space-y-4 w-[500px]">
      <h1 id="logs" className={tokens.type.h1}>
        Logs
      </h1>
      <LogViewerText text={log} />
    </div>
  );
};

const Pills = () => (
  <div className="pt-8 space-y-4">
    <h1 id="pills" className={tokens.type.h1}>
      Pills
    </h1>
    <div className="mt-4">
      <h3 className={tokens.type.h3}>Customizable pill with icon</h3>
      <div className="mt-4">
        <Pill icon={<IconGitBranch variant="sm" />} key="test">
          Basic Icon With Pill
        </Pill>
      </div>
      <div className="mt-4">
        <Pill variant="error">Error Pill</Pill>
      </div>
      <div className="mt-4">
        <Pill variant="pending">Pending Pill</Pill>
      </div>
      <div className="mt-4">
        <Pill variant="progress">Progress Pill</Pill>
      </div>
      <div className="mt-4">
        <Pill variant="success">Success Pill</Pill>
      </div>
    </div>
  </div>
);

const Navigation = () => (
  <div className="pt-8 space-y-4">
    <h1 id="navigation" className={tokens.type.h1}>
      Navigation
    </h1>
    <div className="mt-4">
      <h3 className={tokens.type.h3}>Tabs</h3>
      <div className="mt-4">
        <Tabs
          tabs={[
            { name: "Tab 1", current: true, href: "#" },
            { name: "Tab 2", current: false, href: "/" },
            { name: "Tab 3", current: false, href: "/" },
            { name: "Tab 4", current: false, href: "/" },
            { name: "Tab 5", current: false, href: "/" },
            { name: "Tab 6", current: false, href: "/" },
          ]}
        />
      </div>
    </div>
    <div className="mt-4">
      <h3 className={tokens.type.h3}>Breadcrumbs</h3>
      <div className="mt-4">
        <Breadcrumbs
          crumbs={[
            { to: "/", name: "Crumb 1" },
            { to: "/", name: "Crumb 2" },
            { to: "/", name: "Crumb 3" },
            { to: "/", name: "Crumb 4" },
            { to: "/styles", name: "Crumb 5" },
          ]}
        />
      </div>
    </div>
  </div>
);

const Icons = () => (
  <div className="pt-8 space-y-4">
    <h1 id="icons" className={tokens.type.h1}>
      Icons
    </h1>
    <div className="mt-4 space-y-4">
      {[
        ["IconArrowRight", <IconArrowRight />],
        ["IconArrowLeft", <IconArrowLeft />],
        ["IconEdit", <IconEdit />],
        ["IconChevronUp", <IconChevronUp />],
        ["IconChevronRight", <IconChevronRight />],
        ["IconChevronDown", <IconChevronDown />],
        ["IconCylinder", <IconCylinder />],
        ["IconTrash", <IconTrash />],
        ["IconBox", <IconBox />],
        ["IconEndpoint", <IconEndpoint />],
        ["IconService", <IconService />],
        ["IconSettings", <IconSettings />],
        ["IconSearch", <IconSearch />],
        ["IconShield", <IconShield />],
        ["IconCheck", <IconCheck />],
        ["IconCheckCircle", <IconCheckCircle />],
        ["IconPlusCircle", <IconPlusCircle />],
        ["IconX", <IconX />],
        ["IconXCircle", <IconXCircle />],
        ["IconAlertTriangle", <IconAlertTriangle />],
        ["IconLayers", <IconLayers />],
        ["IconLogout", <IconLogout />],
        ["IconGitBranch", <IconGitBranch />],
        ["IconInfo", <IconInfo />],
        ["IconCreditCard", <IconCreditCard />],
        ["IconGlobe", <IconGlobe />],
        ["IconEllipsis", <IconEllipsis />],
        ["IconExternalLink", <IconExternalLink />],
        ["IconCopy", <IconCopy />],
        ["IconDownload", <IconDownload />],
        ["IconThumbsUp", <IconThumbsUp />],
        ["IconRefresh", <IconRefresh />],
        ["IconHeart", <IconHeart />],
        ["IconCloud", <IconCloud />],
        ["IconHamburger", <IconHamburger />],
        ["IconCertificate", <IconCertificate />],
        ["IconKey", <IconKey />],
        ["IconLock", <IconLock />],
        ["IconGithub", <IconGithub />],
        ["IconDiff", <IconDiff />],
        ["IconMap", <IconMap />],
        ["IconHome", <IconHome />],
        ["IconFit", <IconFit />],
        ["IconEyeOpen", <IconEyeOpen />],
        ["IconEyeClosed", <IconEyeClosed />],
      ].map(([title, icon]) => (
        <div key={title as string}>
          <div className="inline-block -mb-1">{icon}</div>{" "}
          <span>
            <pre className="inline">{title}</pre>
          </span>
        </div>
      ))}
    </div>
  </div>
);

const Info = () => (
  <div className="pt-8 space-y-4">
    <h1 id="tooltips" className={tokens.type.h1}>
      Tooltips
    </h1>
    <Tooltip text="Here is some help text!">
      <div>Here is a tooltip hover top</div>
    </Tooltip>
    <Tooltip text="Here is some help text! Here is some help text! Here is some help text! Here is some help text! Here is some help text!">
      <div>Here is a tooltip hover top long</div>
    </Tooltip>
  </div>
);

const DetailBoxes = () => {
  const appId = "222";
  const op = defaultDeployOperation({
    createdAt: new Date("2023-06-25").toISOString(),
    userName: "Aptible Bot",
    type: "deploy",
    resourceType: "app",
    resourceId: appId,
    status: "succeeded",
  });
  const app = defaultDeployApp({
    id: appId,
    handle: "My App",
    gitRepo: "some.git@repo.com",
  });

  const db = defaultDeployDatabase({
    id: "222",
    type: "postgresql",
  });
  const service = defaultDeployService({
    instanceClass: DEFAULT_INSTANCE_CLASS,
    containerMemoryLimitMb: 4096,
  });
  const stack = defaultDeployStack({
    id: "222",
    name: "Primary stack",
    organizationId: "123",
    region: "us-east-1",
    outboundIpAddresses: ["192.168.1.1", "192.168.1.2", "192.168.1.3"],
  });
  const env = defaultDeployEnvironment({
    id: "123",
    stackId: stack.id,
    totalAppCount: 4,
    totalDatabaseCount: 10,
  });
  const ept = defaultDeployEndpoint({
    id: "333",
    virtualDomain: "https://something.great",
  });
  const stats = defaultDeployEnvironmentStats({
    containerCount: 1,
    domainCount: 2,
    totalDiskSize: 3,
    appContainerCount: 4,
    databaseContainerCount: 5,
    totalBackupSize: 6,
  });

  return (
    <div className="flex flex-col gap-3 pt-8">
      <h1 id="detail-boxes" className={tokens.type.h1}>
        Detail Boxes
      </h1>

      <StackHeader stack={stack} isLoading={false} />
      <EnvHeader
        stack={stack}
        environment={env}
        endpoints={[ept]}
        stats={stats}
        isLoading={false}
      />
      <AppHeader app={app} isLoading={false} />
      <DatabaseHeader database={db} service={service} isLoading={false} />
      <OpHeader op={op} resourceHandle={app.handle} isLoading={false} />
    </div>
  );
};

const Secrets = () => {
  const env = defaultDeployEnvironment({
    id: "123",
    stackId: "444",
  });
  return (
    <div className="flex flex-col gap-3 pt-8">
      <h1 id="secrets" className={tokens.type.h1}>
        Secrets
      </h1>
      <Secret secret="secret-value-hidden-by-default" envId={env.id} />
    </div>
  );
};

const NegativeSpace = () => {
  return (
    <Group>
      <div className="pt-8">
        <h1 id="boxes" className={tokens.type.h1}>
          Box
        </h1>
        <Box>A simple box</Box>
      </div>

      <div className="pt-8">
        <h1 className={tokens.type.h1}>Box Group</h1>
        <div>
          <Group>
            <Box>One</Box>
            <Box>Two</Box>
            <Box>Three</Box>
          </Group>
        </div>

        <div className="pt-8">
          <h2 className={tokens.type.h2}>Box Group Horizontal</h2>
          <Group variant="horizontal">
            <Box>One</Box>
            <Box>Two</Box>
            <Box>Three</Box>
          </Group>
        </div>
      </div>
    </Group>
  );
};

export const StylesPage = () => (
  <div className="px-4 py-4">
    <StylesWrapper navigation={<StylesNavigation />}>
      <Colors />
      <Typography />
      <Buttons />
      <Banners />
      <Tables />
      <Data />
      <Forms />
      <Logs />
      <Pills />
      <Navigation />
      <Icons />
      <Info />
      <DetailBoxes />
      <Secrets />
      <NegativeSpace />
    </StylesWrapper>
  </div>
);
