import type { ComponentProps, JSXElementConstructor } from "react";

import type { GenerateTypedHelpersOptions } from "@uploadthing/react-shared/types";
import { resolveMaybeUrlArg } from "uploadthing/client";
import type { FileRouter } from "uploadthing/server";

import { UploadButton } from "./button";
import { UploadDropzone } from "./dropzone";
import { Uploader } from "./uploader";

export { UploadButton, UploadDropzone, Uploader };

type OmitInitOpts<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
> = Omit<ComponentProps<T>, keyof GenerateTypedHelpersOptions>;

export const generateUploadButton = <TRouter extends FileRouter>(
  opts?: GenerateTypedHelpersOptions,
) => {
  const url = resolveMaybeUrlArg(opts?.url);

  const TypedButton = <TEndpoint extends keyof TRouter>(
    props: OmitInitOpts<typeof UploadButton<TRouter, TEndpoint>>,
  ) => <UploadButton<TRouter, TEndpoint> {...(props as any)} url={url} />;
  return TypedButton;
};

export const generateUploadDropzone = <TRouter extends FileRouter>(
  opts?: GenerateTypedHelpersOptions,
) => {
  const url = resolveMaybeUrlArg(opts?.url);

  const TypedDropzone = <TEndpoint extends keyof TRouter>(
    props: OmitInitOpts<typeof UploadDropzone<TRouter, TEndpoint>>,
  ) => <UploadDropzone<TRouter, TEndpoint> {...(props as any)} url={url} />;
  return TypedDropzone;
};

export const generateUploader = <TRouter extends FileRouter>(
  opts?: GenerateTypedHelpersOptions,
) => {
  const url = resolveMaybeUrlArg(opts?.url);

  const TypedUploader = <TEndpoint extends keyof TRouter>(
    props: OmitInitOpts<typeof Uploader<TRouter, TEndpoint>>,
  ) => <Uploader<TRouter, TEndpoint> {...(props as any)} url={url} />;
  return TypedUploader;
};

/**
 * @deprecated - use {@link generateUploadButton}, {@link generateUploadDropzone}, and {@link generateUploader} instead
 */
export function generateComponents<TRouter extends FileRouter>(
  initOpts?: GenerateTypedHelpersOptions,
) {
  return {
    UploadButton: generateUploadButton<TRouter>(initOpts),
    UploadDropzone: generateUploadDropzone<TRouter>(initOpts),
    Uploader: generateUploader<TRouter>(initOpts),
  };
}
