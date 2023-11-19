import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useLoader, useLoaderSuccess } from "saga-query/react";

import { CreateCertProps, createCertificate } from "@app/deploy";
import { environmentCertificatesUrl } from "@app/routes";

import { useValidator } from "../hooks";
import {
  BannerMessages,
  Box,
  ButtonCreate,
  FormGroup,
  TextArea,
} from "../shared";

const validators = {
  cert: (data: CreateCertProps) => {
    if (data.cert === "") {
      return "A certificate is required for custom HTTPS";
    }
  },
  privKey: (data: CreateCertProps) => {
    if (data.privKey === "") {
      return "A private key is required for custom HTTPS";
    }
  },
};

export const EnvironmentDetailCreateCertPage = () => {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cert, setCert] = useState("");
  const [privKey, setPrivKey] = useState("");
  const [errors, validate] = useValidator<CreateCertProps, typeof validators>(
    validators,
  );
  const formData = {
    envId: id,
    privKey,
    cert,
  };
  const action = createCertificate(formData);
  const loader = useLoader(action);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(formData)) return;
    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    navigate(environmentCertificatesUrl(id));
  });

  return (
    <Box>
      <h1 className="text-lg text-black font-semibold mb-4">
        Create Certificate
      </h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormGroup
          htmlFor="cert"
          label="Certificate"
          feedbackMessage={errors.cert}
          feedbackVariant={errors.cert ? "danger" : "info"}
          description={
            <>
              <p>
                Drag and drop your certificate file or paste its contents in the
                textarea below.
              </p>
              <p>
                If you have a bundled certificate chain, drag and drop all of
                the certificate files or paste their contents in the textarea
                below.
              </p>
            </>
          }
        >
          <TextArea
            id="cert"
            aria-label="cert"
            onChange={(e) => setCert(e.currentTarget.value)}
            value={cert}
          />
        </FormGroup>

        <FormGroup
          htmlFor="private-key"
          label="Private Key"
          description="Drag and drop your private key file or paste its contents in the textarea below."
          feedbackMessage={errors.privKey}
          feedbackVariant={errors.privKey ? "danger" : "info"}
        >
          <TextArea
            id="private-key"
            aria-label="private-key"
            onChange={(e) => setPrivKey(e.currentTarget.value)}
            value={privKey}
          />
        </FormGroup>

        <BannerMessages {...loader} />

        <ButtonCreate
          envId={id}
          isLoading={loader.isLoading}
          type="submit"
          className="w-[200px]"
        >
          Save Certificate
        </ButtonCreate>
      </form>
    </Box>
  );
};
