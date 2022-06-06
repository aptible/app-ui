#!/bin/bash
set -o errexit
set -o nounset

# TODO: Warn if there are any changes, require -f

# Extract a meaningful tag for this image using the branch, fallback to a
# commit otherwise.
BRANCH="$(
  git symbolic-ref --short HEAD 2>/dev/null ||
  git rev-parse --verify "HEAD^{commit}"
)"

TAG="$BRANCH"
if [[ "$BRANCH" = "master" ]]; then
  TAG="latest"
fi

NAME="cloud-ui"
IMG="quay.io/aptible/${NAME}:${TAG}"

{
  REL_HERE=$(dirname "${BASH_SOURCE}")
  HERE=$(cd "${REL_HERE}"; pwd)

  WORK="$(mktemp -d)"
  trap 'rm -rf "$WORK"' EXIT

  PROJECT="${WORK}/${NAME}"

  git clone --recurse-submodules "$HERE" "$PROJECT"
  git -C "$PROJECT" checkout "$BRANCH"

  # Extract build commit
  COMMIT="$(git rev-parse --verify "${BRANCH}^{commit}")"

  docker build -t "$IMG" "$@" "$PROJECT"
} 1>&2

echo "$IMG"
