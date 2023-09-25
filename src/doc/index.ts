import { tinaApi } from "@app/api";

const query = `
query docsArticles($relativePath: String!) {
  docsArticles(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...DocsArticlesParts
  }
}

fragment DocsArticlesParts on DocsArticles {
  Title
  Category {
    ... on DocsCategories {
      Title
      Order
      Hidden
    }
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
  }
  Parent {
    ... on DocsArticles {
      Title
      Category {
        ... on DocsCategories {
          Title
          Order
          Hidden
        }
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
      }
      Parent {
        ... on DocsArticles {
          Title
          Order
          Body
        }
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
      }
      Order
      Body
    }
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
  }
  Order
  Body
}
`;

type DocPaths = "apps/apps.mdx" | "databases/databases.mdx";

export const fetchDoc = tinaApi.post<{ relativePath: DocPaths }>(
  "docs",
  function* (ctx, next) {
    ctx.cache = true;
    const { relativePath } = ctx.payload;
    const body = {
      query,
      variables: {
        relativePath,
      },
    };
    ctx.request = ctx.req({
      body: JSON.stringify(body),
    });
    yield* next();
  },
);
