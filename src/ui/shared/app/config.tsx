import { selectAppConfigById } from "@app/deploy";
import { useSelector } from "@app/react";
import { useState } from "react";
import { ButtonFullVisibility } from "../button";
import { Group } from "../group";
import { PreBox, TextSegment } from "../pre-code";

export const AppConfigView = ({
  configId,
  envId,
}: { configId: string; envId: string }) => {
  const [isVisible, setVisible] = useState(false);
  const config = useSelector((s) => selectAppConfigById(s, { id: configId }));
  const envs: TextSegment[] = [];
  Object.keys(config.env).forEach((key) => {
    envs.push(
      { text: `${key}=`, className: "text-lime" },
      { text: `${config.env[key]}`, className: "text-white" },
      { text: "\n", className: "" },
    );
  });

  return (
    <>
      {isVisible ? (
        <Group size="sm">
          <div>
            <ButtonFullVisibility
              envId={envId}
              variant="white"
              onClick={() => setVisible(false)}
            >
              Hide
            </ButtonFullVisibility>
          </div>
          <PreBox allowCopy segments={envs} />
        </Group>
      ) : (
        <div>
          <ButtonFullVisibility
            envId={envId}
            variant="white"
            onClick={() => setVisible(true)}
          >
            Show
          </ButtonFullVisibility>
        </div>
      )}
    </>
  );
};
