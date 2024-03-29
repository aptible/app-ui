import { selectRolesEditable } from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import {
    useQuery,
    useSelector,
} from "@app/react";
import { fetchRoles } from "@app/roles";
import { useState } from "react";

import {
    Group, Box, Button, Select, Code, CopyText,
} from "../shared"

export const TeamsScimPage = () => {
    const orgId = useSelector(selectOrganizationSelectedId);
    useQuery(fetchRoles({ orgId }));
    const roles = useSelector((s) => selectRolesEditable(s, { orgId }));
    const options = [
        { value: "", label: "Select a Role" },
        ...roles.map((role) => {
            return { value: role.id, label: role.name };
        }),
    ];
    const [roleId, setRole] = useState("");
    return <Group>
        <h2>
            SCIMITAR!
        </h2>

        <Box>
            <Group>
                <h2>Scim Provisioning</h2>
                <div>
                    This section enables SCIM user provisioning.... TODO: write rest of this
                    <Button>
                        Enable
                    </Button>
                </div>

                <div>

                    Support SCIM Version
                    <br />
                    <Code>
                        2.0
                    </Code>
                </div>

                <div>
                    Supported Features:
                    <ol>
                        <li>- Create Users</li>
                        <li>- Update Users</li>
                    </ol>
                </div>

                <div>
                    SCIM Connector Base URL <br />
                    <CopyText text="https://auth.aptible.com/scim_v2"/>
                </div>

                <div>
                    Unique Identifier
                    <CopyText text="email"/>
                </div>
                <div>
                    Default Aptible Role <br />
                    <Select
                        options={options}
                        onSelect={(opt) => setRole(opt.value)}
                        value={roleId}
                    />
                </div>
                <div>
                    SCIM Token <br />
                    Generate a new token and expire the old one<br />

                    <Button>Generate Token</Button>
                </div>
            </Group>
        </Box>
    </Group>
}