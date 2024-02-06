import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { MediaTypeOptions } from "expo-image-picker";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import type { ImageProps, TextProps, ViewProps } from "react-native";

import type { UploadthingComponentProps } from "@uploadthing/react-shared/types";
import {
  allowedContentTextLabelGenerator,
  generatePermittedFileTypes,
  resolveMaybeUrlArg,
} from "uploadthing/client";
import type { ErrorMessage, FileRouter } from "uploadthing/server";

import { INTERNAL_uploadthingHookGen } from "../useUploadThing";
import { Spinner } from "./Spinner";

type ImageUploaderTheme = {
  /**
   * Styling for the container of the uploader component
   */
  containerStyle?: ViewProps["style"];
  /**
   * Styling for the container of the image preview
   * Can be different for loading, idle, and all = both states
   */
  previewStyle?: {
    loading: ViewProps["style"];
    all: ViewProps["style"];
    idle: ViewProps["style"];
  };
  /**
   * Styling for the image of the preview
   */
  previewImageStyle?: ImageProps["style"];
  /**
   * Styling for the text of the preview shown when there is no image
   */
  previewTextStyle?: TextProps["style"];
  /**
   * Styling for the upload button
   * Can be different for loading, idle, and all = both states
   */
  uploadButtonStyle?: {
    loading: ViewProps["style"];
    all: ViewProps["style"];
    idle: ViewProps["style"];
  };
  /**
   * Styling for the text inside the upload button
   */
  uploadButtonTextStyle?: TextProps["style"];
  /**
   * Styling for the spinner inside the upload button and the preview
   */
  spinnerStyle?: ViewProps["style"];
  /**
   * Styling for the constraints text at the bottom of the uploader component
   */
  constraintsTextStyle?: TextProps["style"];
};

export type ImageUploaderProps<
  TRouter extends FileRouter,
  TEndpoint extends keyof TRouter,
> = UploadthingComponentProps<TRouter, TEndpoint> & {
  theme?: ImageUploaderTheme;
  allowEditing?: boolean;
  multiple?: boolean;
  config?: {
    mode?: "manual" | "auto" | undefined;
  };
};

/**
 * @example
 * <ImageUploader<OurFileRouter>
 *   endpoint="someEndpoint"
 *   onUploadComplete={(res) => console.log(res)}
 *   onUploadError={(err) => console.log(err)}
 * />
 */
export function ImageUploader<
  TRouter extends FileRouter,
  TEndpoint extends keyof TRouter,
>(
  props: FileRouter extends TRouter
    ? ErrorMessage<"You forgot to pass the generic">
    : ImageUploaderProps<TRouter, TEndpoint>,
) {
  const $props = props as unknown as ImageUploaderProps<TRouter, TEndpoint> & {
    // props not exposed on public type
    // Allow to set internal state for testing
    __internal_state?: "readying" | "ready" | "uploading";
    // Allow to set upload progress for testing
    __internal_upload_progress?: number;
    // Allow to set ready explicitly and independently of internal state
    __internal_ready?: boolean;
    // Allow to disable the button
    __internal_button_disabled?: boolean;
  };

  const useUploadThing = INTERNAL_uploadthingHookGen<TRouter>({
    url: resolveMaybeUrlArg($props.url),
  });

  const [uploadProgressState, setUploadProgress] = useState(
    $props.__internal_upload_progress ?? 0,
  );
  const uploadProgress =
    $props.__internal_upload_progress ?? uploadProgressState;

  const [files, setFiles] = useState<File[]>([]);
  const [isManualTriggerDisplayed, setIsManualTriggerDisplayed] =
    useState(false);

  const { startUpload, isUploading, permittedFileInfo } = useUploadThing(
    $props.endpoint,
    {
      onClientUploadComplete: (res) => {
        setFiles([]);
        setIsManualTriggerDisplayed(false);
        $props.onClientUploadComplete?.(res);
        setUploadProgress(0);
      },
      onUploadProgress: (p) => {
        setUploadProgress(p);
        $props.onUploadProgress?.(p);
      },
      onUploadError: $props.onUploadError,
      onUploadBegin: $props.onUploadBegin,
      onBeforeUploadBegin: $props.onBeforeUploadBegin,
    },
  );

  const { fileTypes, multiple } = generatePermittedFileTypes(
    permittedFileInfo?.config,
  );

  useEffect(() => {
    if (fileTypes) {
      const imageFound = fileTypes.includes("image");
      const videoFound = fileTypes.includes("video");
      if (!imageFound && !videoFound) {
        console.warn(
          "[UT] Using image picker without permission for image or video types",
          fileTypes,
        );
      } else if (
        fileTypes.filter(
          (fileType) => fileType !== "image" && fileType !== "video",
        ).length > 0
      ) {
        console.warn(
          "[UT] Using image picker on route with permission for non-image or non-video types",
          fileTypes,
        );
      }
    }
  }, [fileTypes]);

  useEffect(() => {
    if ($props.multiple && !multiple) {
      console.warn(
        "[UT] Multiple asset upload allowed on client-side, but disabled on backend",
      );
    }
  }, [$props.multiple, multiple]);

  useEffect(() => {
    if (
      Platform.OS === "ios" &&
      Platform.isPad &&
      $props.allowEditing === false
    ) {
      console.warn(
        "[UT] Image picker requires editing on IPad to prevent bugs",
      );
    }
  }, [$props.allowEditing]);

  const mode = $props.config?.mode ?? "auto";

  const getUploadButtonText = (fileTypes: string[]) => {
    if (isManualTriggerDisplayed)
      return `Upload ${files.length} file${files.length === 1 ? "" : "s"}`;
    if (fileTypes.length === 0) return "Loading...";
    return `Choose File${multiple ? `(s)` : ``}`;
  };

  const ready =
    $props.__internal_ready ??
    ($props.__internal_state === "ready" || fileTypes.length > 0);

  const disabled = $props.__internal_button_disabled ?? !ready;

  const state = (() => {
    if ($props.__internal_state) return $props.__internal_state;
    if (!ready) return "readying";
    if (ready && !isUploading) return "ready";

    return "uploading";
  })();

  const getUploadButtonContents = (fileTypes: string[]) => {
    if (state !== "uploading") {
      return <Text>{getUploadButtonText(fileTypes)}</Text>;
    }
    if (uploadProgress === 100) {
      return <Spinner style={$props.theme?.spinnerStyle ?? {}} />;
    }
    return <Text>{`${uploadProgress}%`}</Text>;
  };

  const renderClearButton = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          setFiles([]);
          setIsManualTriggerDisplayed(false);
        }}
        style={{
          height: 20,
          borderRadius: 4,
          backgroundColor: "transparent",
        }}
        accessibilityRole="button"
      >
        <Text style={{ color: "#71717A" }}>Clear</Text>
      </TouchableOpacity>
    );
  };

  const renderAllowedContent = () => {
    return (
      <Text
        style={{
          height: 20,
          fontSize: 12,
          lineHeight: 20,
          color: "rgb(82, 82, 91)",
        }}
      >
        {allowedContentTextLabelGenerator(permittedFileInfo?.config)}
      </Text>
    );
  };

  const upload = async () => {
    let response!: ImagePicker.ImagePickerResult;

    try {
      response = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        mediaTypes: fileTypes
          ? fileTypes.includes("image")
            ? fileTypes.includes("video")
              ? MediaTypeOptions.All
              : MediaTypeOptions.Images
            : MediaTypeOptions.Videos
          : MediaTypeOptions.All,
        // NOTE: Enabling editing because of bug on IPad Pros
        allowsEditing:
          $props.allowEditing ??
          (Platform.OS === "ios" && Platform.isPad ? true : false),
        allowsMultipleSelection: $props.multiple ?? false,
      });
    } catch (error) {
      console.warn(error);
      return;
    }

    if (!response.canceled) {
      const selectedFiles = await Promise.all(
        response.assets.map(async (asset) => {
          const fileName = asset.fileName ?? asset.uri.split("/").pop()!;

          return new File(
            [await fetch(asset.uri).then((res) => res.blob())],
            fileName,
            {
              type:
                asset.mimeType ??
                (asset.uri.split(".").length
                  ? `${asset.type ?? "image"}/${asset.uri.split(".").pop()}`
                  : ""),
            },
          );
        }),
      );

      if (mode === "manual") {
        setFiles(selectedFiles);
        setIsManualTriggerDisplayed(true);
        return;
      }

      const input = "input" in $props ? $props.input : undefined;
      void startUpload(selectedFiles, input);
    }
  };

  return (
    <View style={$props.theme?.containerStyle ?? {}}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (disabled) return;
          void upload();
        }}
        style={[
          {
            backgroundColor: "blue",
            width: "100%",
            marginTop: 12,
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            justifyContent: "center",
            alignItems: "center",
            padding: 8,
            borderRadius: 8,
            columnGap: 4,
          },
          $props.theme?.uploadButtonStyle?.all ?? {},
          isUploading
            ? $props.theme?.uploadButtonStyle?.loading ?? {}
            : $props.theme?.uploadButtonStyle?.idle ?? {},
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {getUploadButtonContents(fileTypes)}
      </TouchableOpacity>
      {mode === "manual" && files.length > 0
        ? renderClearButton()
        : renderAllowedContent()}
    </View>
  );
}

ImageUploader.displayName = "ImageUploader";
