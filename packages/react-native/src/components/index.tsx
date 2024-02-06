import type { ComponentProps, JSXElementConstructor } from "react";

import type { GenerateTypedHelpersOptions } from "@uploadthing/react-shared/types";
import { resolveMaybeUrlArg } from "uploadthing/client";
import type { FileRouter } from "uploadthing/server";

import { ImageUploader } from "./ImageUploader";

export { ImageUploader } from "./ImageUploader";

type OmitInitOpts<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
> = Omit<ComponentProps<T>, keyof GenerateTypedHelpersOptions>;

export const generateImageUploader = <TRouter extends FileRouter>(
  opts?: GenerateTypedHelpersOptions,
) => {
  const url = resolveMaybeUrlArg(opts?.url);

  const TypedUploader = <TEndpoint extends keyof TRouter>(
    props: OmitInitOpts<typeof ImageUploader<TRouter, TEndpoint>>,
  ) => <ImageUploader<TRouter, TEndpoint> {...(props as any)} url={url} />;
  return TypedUploader;
};
