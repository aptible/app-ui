import { configEnvToStr, selectAppConfigById } from "@app/deploy";
import { useSelector } from "@app/react";
import { useState } from "react";
import { ButtonFullVisibility } from "../button";
import { Group } from "../group";
import { PreBox } from "../pre-code";

export const AppConfigView = ({
  configId,
  envId,
}: { configId: string; envId: string }) => {
  const [isVisible, setVisible] = useState(false);
  const config = useSelector((s) => selectAppConfigById(s, { id: configId }));
  const envStr = configEnvToStr(config.env);

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
          <PreBox
            allowCopy
            segments={[{ text: envStr, className: "text-white" }]}
          />
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
