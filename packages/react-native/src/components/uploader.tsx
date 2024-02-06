import type { UploadthingComponentProps } from "@uploadthing/react-shared/types";
import type { ErrorMessage, FileRouter } from "uploadthing/server";

import { UploadButton } from "./button";

export function Uploader<
  TRouter extends FileRouter,
  TEndpoint extends keyof TRouter,
>(
  props: FileRouter extends TRouter
    ? ErrorMessage<"You forgot to pass the generic">
    : UploadthingComponentProps<TRouter, TEndpoint>,
) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <span className="text-center text-4xl font-bold">
        {`Upload a file using a button:`}
      </span>
      {/* @ts-expect-error - this is validated above */}
      <UploadButton<TRouter> {...props} />
    </div>
  );
}
