import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

const SpinnerSVG = ({ style }: { style: StyleProp<ViewStyle> }) => (
  <Svg
    style={[
      {
        zIndex: 10,
        height: 20,
        width: 20,
      },
      style,
    ]}
    fill="white"
  >
    <Path
      fill="white"
      d="M256 32C256 14.33 270.3 0 288 0C429.4 0 544 114.6 544 256C544 302.6 531.5 346.4 509.7 384C500.9 399.3 481.3 404.6 465.1 395.7C450.7 386.9 445.5 367.3 454.3 351.1C470.6 323.8 480 291 480 255.1C480 149.1 394 63.1 288 63.1C270.3 63.1 256 49.67 256 31.1V32z"
    />
  </Svg>
);

export const Spinner = (
  { style }: { style?: StyleProp<ViewStyle> } = { style: {} },
) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start(() => {
      spinAnim.setValue(0);
    });

    return () => {
      loop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        transform: [
          {
            rotate: spin,
          },
        ],
      }}
    >
      <SpinnerSVG style={style} />
    </Animated.View>
  );
};

Spinner.displayName = "Spinner";
