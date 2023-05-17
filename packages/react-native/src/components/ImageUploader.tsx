import { type FileRouter } from "uploadthing/server";
import { useUploadThing } from "../useUploadThing";
import { type DANGEROUS__uploadFiles } from "uploadthing/client";
import { useEffect, useState } from "react";
import { View, Text, Image, Platform, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MediaTypeOptions } from "expo-image-picker";
import { Spinner } from "./Spinner";

export type EndpointHelper<TRouter extends void | FileRouter> =
  void extends TRouter
    ? "YOU FORGOT TO PASS THE GENERIC"
    : keyof TRouter extends string
    ? keyof TRouter
    : string;

/**
 * @example
 * <ImageUploader<OurFileRouter>
 *   endpoint="someEndpoint"
 *   onUploadComplete={(res) => console.log(res)}
 *   onUploadError={(err) => console.log(err)}
 * />
 */
export function ImageUploader<TRouter extends void | FileRouter = void>(props: {
  endpoint: EndpointHelper<TRouter>;
  multiple?: boolean;
  allowEditing?: boolean;
  showPreview?: boolean;
  onClientUploadComplete?: (
    res?: Awaited<
      ReturnType<typeof DANGEROUS__uploadFiles<EndpointHelper<TRouter>>>
    >
  ) => void;
  onUploadError?: (error: Error) => void;
  url?: string;
}) {
  const { startUpload, isUploading, permittedFileInfo } =
    useUploadThing<string>({
      endpoint: props.endpoint as string,
      onClientUploadComplete: props.onClientUploadComplete,
      onUploadError: props.onUploadError,
      url: props.url,
    });

  const { maxSize, fileTypes } = permittedFileInfo ?? {};

  useEffect(() => {
    if (fileTypes) {
      const imageFound = fileTypes.includes("image");
      const videoFound = fileTypes.includes("video");
      if (!imageFound && !videoFound) {
        console.warn(
          "[UT] Using image picker without permission for image or video types",
          fileTypes
        );
      } else if (
        fileTypes.filter(
          (fileType) => fileType !== "image" && fileType !== "video"
        ).length > 0
      ) {
        console.warn(
          "[UT] Using image picker on route with permission for non-image or non-video types",
          fileTypes
        );
      }
    }
  }, [fileTypes]);

  useEffect(() => {
    if (props.showPreview && props.multiple) {
      console.warn("[UT] Cannot show previews with multiple uploads enabled");
    }
  }, [props.showPreview, props.multiple]);

  useEffect(() => {
    if (
      Platform.OS === "ios" &&
      Platform.isPad &&
      props.allowEditing === false
    ) {
      console.warn(
        "[UT] Image picker requires editing on IPad to prevent bugs"
      );
    }
  }, [props.allowEditing]);

  const [uploadedUri, setUploadedUri] = useState<string | undefined>();

  const upload = async () => {
    try {
      const response = await ImagePicker.launchImageLibraryAsync({
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
          props.allowEditing ??
          (Platform.OS === "ios" && Platform.isPad ? true : false),
        allowsMultipleSelection: props.multiple ?? false,
      });

      if (!response.canceled) {
        void startUpload(
          response.assets.map((asset) => {
            const fileName = asset.fileName || asset.uri.split("/").pop()!;

            return {
              uri: asset.uri,
              type: `${asset.type}/${fileName.split(".").pop()}`,
              name: fileName,
            };
          })
        ).then((uploadedResponse) => {
          if (
            !props.multiple &&
            props.showPreview &&
            uploadedResponse &&
            response.assets[0].type === "image"
          ) {
            setUploadedUri(uploadedResponse[0].fileUrl);
          }
        });
      }
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <View>
      {props.showPreview && !props.multiple ? (
        <View
          style={{
            width: "100%",
            height: "100%",
            borderColor: "white",
            borderRadius: 8,
            borderWidth: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isUploading ? (
            <Spinner />
          ) : uploadedUri ? (
            <Image
              source={{
                uri: uploadedUri,
              }}
              alt={"Selected file"}
              style={{ width: 200, height: 200 }}
            />
          ) : fileTypes ? (
            <Text style={{ color: "white" }}>
              Choose{" "}
              {fileTypes
                ?.filter(
                  (fileType) => fileType === "image" || fileType === "video"
                )
                .join(" or ")}
            </Text>
          ) : (
            <Text style={{ color: "white" }}>Nothing selected</Text>
          )}
        </View>
      ) : null}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          void upload();
        }}
        style={{
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
        }}
      >
        {isUploading ? (
          <>
            <Spinner />
            <Text style={{ color: "white" }}> Uploading</Text>
          </>
        ) : (
          <Text style={{ color: "white" }}>Upload</Text>
        )}
      </TouchableOpacity>
      {fileTypes ? (
        <Text
          style={{
            fontSize: 12,
            marginTop: 8,
            width: "100%",
            textAlign: "center",
            color: "white",
          }}
        >
          {`${fileTypes
            .map(
              (fileType) =>
                `${fileType[0].toLocaleUpperCase()}${fileType.slice(1)}s`
            )
            .join(", ")}`}
          {maxSize && ` up to ${maxSize}`}
        </Text>
      ) : null}
    </View>
  );
}

ImageUploader.displayName = "ImageUploader";
