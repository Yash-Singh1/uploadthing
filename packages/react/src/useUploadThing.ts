import {
  generateReactHelpersBuilder,
  INTERNAL_uploadthingHookGenBuilder,
} from "@uploadthing/react-shared";

export const INTERNAL_uploadthingHookGen: ReturnType<
  typeof INTERNAL_uploadthingHookGenBuilder
> = INTERNAL_uploadthingHookGenBuilder("@uploadthing/react");

export const generateReactHelpers: ReturnType<
  typeof generateReactHelpersBuilder
> = generateReactHelpersBuilder("@uploadthing/react");
