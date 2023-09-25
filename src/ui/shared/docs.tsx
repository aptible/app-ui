/* interface BaseComponents {
    h1?: {
        children: JSX.Element;
    };
    h2?: {
        children: JSX.Element;
    };
    h3?: {
        children: JSX.Element;
    };
    h4?: {
        children: JSX.Element;
    };
    h5?: {
        children: JSX.Element;
    };
    h6?: {
        children: JSX.Element;
    };
    p?: {
        children: JSX.Element;
    };
    a?: {
        url: string;
        children: JSX.Element;
    };
    italic?: {
        children: JSX.Element;
    };
    bold?: {
        children: JSX.Element;
    };
    strikethrough?: {
        children: JSX.Element;
    };
    underline?: {
        children: JSX.Element;
    };
    code?: {
        children: JSX.Element;
    };
    text?: {
        children: string;
    };
    ul?: {
        children: JSX.Element;
    };
    ol?: {
        children: JSX.Element;
    };
    li?: {
        children: JSX.Element;
    };
    lic?: {
        children: JSX.Element;
    };
    block_quote?: {
        children: JSX.Element;
    };
    code_block?: {
        lang?: string;
        value: string;
    };
    img?: {
        url: string;
        caption?: string;
        alt?: string;
    };
    hr?: {};
    break?: {};
    maybe_mdx?: {
        children: JSX.Element;
    };
    html?: {
        value: string;
    };
    html_inline?: {
        value: string;
    };
    component_missing?: {
        name: string;
    };
};*/

import { tokens } from "./tokens";

interface BaseNodeProps {
  type:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "p"
    | "italic"
    | "bold"
    | "strikethrough"
    | "underline"
    | "code"
    | "ul"
    | "ol"
    | "li"
    | "lic"
    | "block_quote"
    | "code_block";
  children: ChildProps[];
}

interface TextNodeProps {
  type: "text";
  text: string;
}

interface LinkNodeProps {
  type: "a";
  url: string;
  children: TextNodeProps[];
}

interface ImageNodeProps {
  type: "img";
  url: string;
  caption: string;
  alt: string;
}

type ChildProps =
  | BaseNodeProps
  | TextNodeProps
  | LinkNodeProps
  | ImageNodeProps;

interface BodyProps {
  type: "root";
  children: ChildProps[];
}

interface DocProps {
  Body: BodyProps;
  Title: string;
}

export interface DocsResponse {
  data: {
    docsArticles: DocProps;
  };
}

const DocRenderText = (props: TextNodeProps) => {
  return props.text;
};

const DocRenderNode = (props: ChildProps) => {
  if (props.type === "text") {
    return <DocRenderText {...props} />;
  }

  if (props.type === "a") {
    return (
      <a href={`https://aptible.com${props.url}`}>
        {props.children.map((c) => (
          <DocRenderText key={c.text} {...c} />
        ))}
      </a>
    );
  }

  if (props.type === "img") {
    return (
      <figure>
        <img src={props.url} alt={props.alt} />
        <figcaption>{props.caption}</figcaption>
      </figure>
    );
  }

  const children = props.children.map((c, idx) => (
    <DocRenderNode key={`${c.type}-${idx}`} {...c} />
  ));

  if (props.type === "h1") {
    return <h2 className={tokens.type.h2}>{children}</h2>;
  }

  if (props.type === "h2") {
    return <h3 className={tokens.type.h3}>{children}</h3>;
  }

  if (props.type === "h3") {
    return <h4 className={tokens.type.h4}>{children}</h4>;
  }

  if (props.type === "h4") {
    return <h5 className={tokens.type.h4}>{children}</h5>;
  }

  if (props.type === "h5") {
    return <h6 className={tokens.type.h4}>{children}</h6>;
  }

  if (props.type === "h6") {
    return <h6 className={tokens.type.h4}>{children}</h6>;
  }

  if (props.type === "p") {
    return <p>{children}</p>;
  }

  if (props.type === "italic") {
    return <span className="font-italic">{children}</span>;
  }

  if (props.type === "bold") {
    return <span className="font-bold">{children}</span>;
  }

  if (props.type === "strikethrough") {
    return <span className="line-through">{children}</span>;
  }

  if (props.type === "underline") {
    return <span className="underline">{children}</span>;
  }

  if (props.type === "ul") {
    return <ul className="list-disc list-inside">{children}</ul>;
  }

  if (props.type === "ol") {
    return <ol className="list-decimal list-inside">{children}</ol>;
  }

  if (props.type === "li") {
    return <li>{children}</li>;
  }

  if (props.type === "lic") {
    return <span>{children}</span>;
  }

  if (props.type === "code") {
    return <code>{children}</code>;
  }

  if (props.type === "code_block") {
    return <pre>{children}</pre>;
  }

  if (props.type === "block_quote") {
    return <blockquote>{children}</blockquote>;
  }

  return (
    <div>cannot render "{props.type}" because we don't know about it.</div>
  );
};

const emptyDocs: DocProps = { Title: "", Body: { type: "root", children: [] } };

export const DocsRender = ({ data }: DocsResponse) => {
  const { docsArticles = emptyDocs } = data;
  const { Title, Body } = docsArticles;
  return (
    <div className="flex flex-col gap-2">
      <h1 className={tokens.type.h1}>{Title}</h1>

      {Body.children.map((child, idx) => {
        return <DocRenderNode key={`${child.type}-${idx}`} {...child} />;
      })}
    </div>
  );
};
