import {
  createSupportTicket,
  queryAlgoliaApi,
  uploadAttachment,
} from "@app/deploy/support";
import { useLoader, useQuery } from "@app/fx";
import { selectCurrentUser } from "@app/users";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppSidebarLayout } from "../layouts";
import {
  BannerMessages,
  Box,
  Button,
  FormGroup,
  Input,
  Radio,
  RadioGroup,
  ResourceHeader,
  TextArea,
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
    name: user.name || "",
    description: "",
    subject: "",
    attachments: [],
    priority: "",
  });
  const [subjectTyping, setSubjectTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentObject[]>([]);

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

  // Loader for algolia query
  const algoliaLoader = useQuery(
    queryAlgoliaApi({ query: formState.subject, debounce: subjectTyping }),
  );

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
        name: user.name,
      }));
    }
  }, [user.email, user.name]);

  // useEffect to allow the algolia api query to fire, once the user is done typing in the subject field, `subjectTyping` will retrun to false and allow the call to be made
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSubjectTyping(false);
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [subjectTyping]);

  // fucntion for final submission of form
  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const attachments = attachedFiles.map((file) => file.token);
    dispatch(createSupportTicket({ ...formState, attachments: attachments }));
    setFormState({
      email: user.email || "",
      name: user.name || "",
      description: "",
      subject: "",
      attachments: [],
      priority: "",
    });
    setAttachedFiles([]);
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

  return (
    <AppSidebarLayout>
      <ResourceHeader title="Submit Support Request" />
      <div className="flex flex-row gap-10">
        <Box className="-mt-4 w-full">
          <div className="mb-4">
            Please enter the details of your request. A member of our support
            staff will respond as soon as possible. Be sure to include relevant
            information such as app handles or timestamps, and{" "}
            <b>omit sensitive information </b>
            like passwords.
          </div>
          <BannerMessages className="my-2" {...loader} />
          <form onSubmit={onSubmitForm}>
            <div className="mb-4">
              {user.email !== formState.email ? (
                <>
                  <FormGroup
                    description=""
                    htmlFor="email"
                    label="Email"
                    className="mt-5"
                  >
                    <Input
                      className="flex w-full"
                      name="email"
                      type="string"
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

                  <FormGroup
                    description=""
                    htmlFor="name"
                    label="name"
                    className="mt-5"
                  >
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
              <FormGroup
                description=""
                htmlFor="subject"
                label="Subject"
                className={user.email !== formState.email ? "mt-5" : ""}
              >
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
                    setSubjectTyping(true);
                  }}
                  data-testid="subject"
                  id="subject"
                />
              </FormGroup>

              {algoliaLoader?.meta?.hits?.length ? (
                <div
                  style={{ backgroundColor: "#FDF8F0" }}
                  className="mt-5 rounded-lg"
                >
                  <div className="pl-5 pt-3 font-semibold">
                    Related Articles
                  </div>
                  <ul className="pl-5 pt-2 pb-3">
                    {algoliaLoader.meta.hits.map((hit: any, key: number) => {
                      return (
                        <li key={key + 1}>
                          <div>
                            <a href={hit.url}>{hit.title}</a>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              <FormGroup
                description=""
                htmlFor="message"
                label="Message"
                className="mt-5"
              >
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
                className="mt-5"
                description=""
                htmlFor="attachments"
                label="Upload Attachments"
              >
                <div>
                  {attachedFiles?.map((file) => {
                    return (
                      <div key={file.token}>
                        {file.filename}
                        <span
                          className="ml-1 cursor-pointer"
                          style={{ color: "#AD1A1A" }}
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
                </div>
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
                  <div className="flex justify-center items-center h-16">
                    <span
                      style={{
                        color: "#4361FF",
                        marginRight: "0.3em",
                      }}
                    >
                      Add Files
                    </span>{" "}
                    or Drop Files
                  </div>
                </label>
                <Input
                  // className="flex w-full"
                  style={{ visibility: "hidden", height: "0px" }}
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
              </FormGroup>

              <FormGroup
                className="-mt-2"
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
                        <span className="text-sm text-slate-500 ml-2">
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
                        <span className="text-sm text-slate-500 ml-2">
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
                        <span className="text-sm text-slate-500 ml-2">
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
                        <span className="text-sm text-slate-500 ml-2">
                          (Your business is significantly impacted. Important
                          functions of your production application are
                          unavailable.)
                        </span>
                      </p>
                    </div>
                  </Radio>
                </RadioGroup>
              </FormGroup>
            </div>
            <Button className="w-40 flex font-semibold" type="submit">
              Submit Request
            </Button>
          </form>
        </Box>
      </div>
    </AppSidebarLayout>
  );
};
