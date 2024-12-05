import { selectEnv } from "@app/config";
import {
  createSupportTicket,
  resetSupportTicket,
  uploadAttachment,
} from "@app/deploy/support";
import { useDispatch, useLoader, useSelector } from "@app/react";
import { tunaEvent } from "@app/tuna";
import { selectCurrentUser } from "@app/users";
import { MintlifyWidget } from "@mintlify/widget-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { AppSidebarLayout } from "../layouts";
import {
  Banner,
  BannerMessages,
  Box,
  Button,
  FormGroup,
  Group,
  Input,
  Radio,
  RadioGroup,
  TextArea,
  TitleBar,
} from "../shared";

interface SupportForm {
  email: string;
  description: string;
  subject: string;
  attachments: Array<any>;
  priority: string;
  name: string;
}
interface AttachmentObject {
  token: string;
  filename: string;
}

export const SupportPage = () => {
  // required for dispatching actions
  const dispatch = useDispatch();
  // fetching current user
  const user = useSelector(selectCurrentUser);

  // Local State
  const [formState, setFormState] = useState<SupportForm>({
    email: user.email || "",
    name: user.name ? (user.name === "Aptible" ? "" : user.name) : "",
    description: "",
    subject: "",
    attachments: [],
    priority: "normal",
  });
  const isDisabled = formState.subject === "" || formState.description === "";
  const [attachedFiles, setAttachedFiles] = useState<AttachmentObject[]>([]);
  const [viewedSuggestion, setViewedSuggestion] = useState(false);

  // Drag and Drop reference hook and functions
  const drop = useRef(null);
  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const { files } = e.dataTransfer;

    if (files?.length) {
      onAttachmentUpload(files);
    }
  };

  // Loader for submitting the ticket
  const loader = useLoader(createSupportTicket);
  const attachmentLoader = useLoader(uploadAttachment);

  // useEffect hook for supplying the user information [email, name] to local state once it loads
  useEffect(() => {
    if (user.email) {
      setFormState((prevFormState) => ({
        ...prevFormState,
        email: user.email,
      }));
    }
    if (user.name) {
      setFormState((prevFormState) => ({
        ...prevFormState,
        name: user.name === "Aptible" ? "" : user.name,
      }));
    }
  }, [user.email, user.name]);

  // fucntion for final submission of form
  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const attachments = attachedFiles.map((file) => file.token);
    dispatch(createSupportTicket({ ...formState, attachments: attachments }));
    tunaEvent(
      "submittedAppUiSupportForm",
      `{ "viewedDocs": "${viewedSuggestion}", "email": "${user.email}" }`,
    );
    setFormState({
      email: user.email || "",
      name: user.name ? (user.name === "Aptible" ? "" : user.name) : "",
      description: "",
      subject: "",
      attachments: [],
      priority: "",
    });
    setAttachedFiles([]);
    setViewedSuggestion(false);
  };

  const assignAttachment = (attachment: AttachmentObject) => {
    setAttachedFiles([
      ...attachedFiles,
      { token: attachment.token, filename: attachment.filename },
    ]);
  };

  // function for calling api to attach file to zendesk then returns a token to to local state
  const onAttachmentUpload = async (attachments: Array<any>) => {
    for (const attachment of attachments) {
      dispatch(uploadAttachment({ attachment, callback: assignAttachment }));
    }
  };

  const env = useSelector(selectEnv);

  useEffect(() => {
    return () => {
      // reset loader when component is unmounted because we have multiple
      // pages that use this same loader id
      dispatch(resetSupportTicket());
    };
  }, []);

  return (
    <AppSidebarLayout>
      <TitleBar description="Get Support from the Aptible team">
        Support
      </TitleBar>

      <div className="flex flex-col gap-6">
        <Box className="w-full border-gold !bg-off-white">
          <div className="text-lg font-semibold text-black mb-2">
            Get Answers Now: Ask Chatbot
          </div>
          <MintlifyWidget
            connection={{
              apiKey: env.mintlifyChatKey,
            }}
            display={{
              trigger: {
                type: "input",
                label: "Get Answers",
              },
              isDarkMode: false,
              colors: {
                primary: "#111920",
              },
            }}
          />
        </Box>
        <Box className="w-full">
          <div className="text-lg font-semibold text-black mb-2">
            Submit Support Ticket
          </div>
          <div className="mb-4">
            Please enter the details of your request. A member of our support
            staff will respond as soon as possible. Be sure to include relevant
            information such as app handles or timestamps, and{" "}
            <b>omit sensitive information </b>
            like passwords.
          </div>

          <BannerMessages className="my-2" {...loader} />

          <form onSubmit={onSubmitForm}>
            <Group>
              {!user.email ? (
                <>
                  <FormGroup description="" htmlFor="email" label="Email">
                    <Input
                      className="flex w-full"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          email: e.currentTarget.value,
                        })
                      }
                      data-testid="email"
                      id="email"
                    />
                  </FormGroup>

                  <FormGroup description="" htmlFor="name" label="Name">
                    <Input
                      className="flex w-full"
                      name="name"
                      type="string"
                      value={formState.name}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          name: e.currentTarget.value,
                        })
                      }
                      data-testid="name"
                      id="name"
                    />
                  </FormGroup>
                </>
              ) : null}

              <FormGroup description="" htmlFor="subject" label="Subject">
                <Input
                  className="flex w-full"
                  name="subject"
                  type="string"
                  value={formState.subject}
                  onChange={(e) => {
                    setFormState({
                      ...formState,
                      subject: e.currentTarget.value,
                    });
                  }}
                  data-testid="subject"
                  id="subject"
                />
              </FormGroup>

              <FormGroup description="" htmlFor="message" label="Message">
                <TextArea
                  className="flex min-h-1000 pt-100 text-red-800"
                  name="message"
                  value={formState.description}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      description: e.currentTarget.value,
                    })
                  }
                  data-testid="message"
                  id="message"
                />
              </FormGroup>

              <FormGroup
                description=""
                htmlFor="attachments"
                label="Upload Attachments"
              >
                <Group size="sm">
                  {attachmentLoader.isLoading ? (
                    <Banner>Uploading attachment ...</Banner>
                  ) : null}

                  {attachedFiles?.map((file) => {
                    return (
                      <div className="last:pb-2" key={file.token}>
                        {file.filename}
                        <span
                          className="ml-1 cursor-pointer hover:underline"
                          style={{ color: "#AD1A1A" }}
                          onClick={() => {
                            const newFiles = attachedFiles.filter(
                              (f) => file.token !== f.token,
                            );
                            setAttachedFiles(newFiles);
                          }}
                          onKeyUp={() => {
                            const newFiles = attachedFiles.filter(
                              (f) => file.token !== f.token,
                            );
                            setAttachedFiles(newFiles);
                          }}
                        >
                          Remove
                        </span>
                      </div>
                    );
                  })}

                  <label
                    htmlFor="attachments"
                    className="flex w-full h-full justify-center items-center cursor-pointer rounded-lg"
                    style={{
                      backgroundColor: "#FAFAFA",
                      border: "2px dashed #E7E8E8",
                    }}
                    ref={drop}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <div className="flex justify-center items-center h-16 gap-1">
                      <span
                        style={{
                          color: "#4361FF",
                        }}
                      >
                        Add Files
                      </span>{" "}
                      or Drop Files
                    </div>
                  </label>

                  <Input
                    style={{
                      visibility: "hidden",
                      height: "0px",
                      padding: "0px",
                    }}
                    name="attachments"
                    type="file"
                    value=""
                    onChange={(e) => {
                      const chosenFiles = Array.prototype.slice.call(
                        e.target.files,
                      );
                      onAttachmentUpload(chosenFiles);
                    }}
                    data-testid="attachments"
                    id="attachments"
                  />
                </Group>
              </FormGroup>

              <FormGroup
                description=""
                htmlFor="priority"
                label="Choose Priority"
              >
                <RadioGroup
                  name="priority"
                  selected={formState.priority}
                  onSelect={(e) => {
                    setFormState({ ...formState, priority: e });
                  }}
                >
                  <Radio value="low">
                    <div className="ml-2">
                      <p>
                        Low
                        <span className="text-base text-gray-500 ml-2">
                          (You have a general development question, or want to
                          request a feature.)
                        </span>
                      </p>
                    </div>
                  </Radio>
                  <Radio value="normal">
                    <div className="ml-2">
                      <p>
                        Normal
                        <span className="text-base text-gray-500 ml-2">
                          (Non-critical functions of your application are
                          behaving abnormally, or you have a time-sensitive
                          development question.)
                        </span>
                      </p>
                    </div>
                  </Radio>
                  <Radio value="high">
                    <div className="ml-2">
                      <p>
                        High
                        <span className="text-base text-gray-500 ml-2">
                          (Important functions of your production application
                          are impaired or degraded.)
                        </span>
                      </p>
                    </div>
                  </Radio>
                  <Radio value="urgent">
                    <div className="ml-2">
                      <p>
                        Urgent
                        <span className="text-base text-gray-500 ml-2">
                          (Your business is significantly impacted. Important
                          functions of your production application are
                          unavailable.)
                        </span>
                      </p>
                    </div>
                  </Radio>
                </RadioGroup>
              </FormGroup>

              <Button
                className="w-40 flex font-semibold"
                type="submit"
                isLoading={loader.isLoading}
                disabled={isDisabled}
              >
                Submit Request
              </Button>
            </Group>
          </form>
        </Box>
      </div>
    </AppSidebarLayout>
  );
};
