import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props: any) => (
  <Svg
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    {...props}
  >
    <Path
      fill="#4285F4"
      d="M22.35 12.24c0-.72-.06-1.43-.18-2.13H12v4.04h5.7c-.23 1.13-.91 2.09-1.94 2.73v2.26h3.13c1.83-1.68 2.89-4.16 2.89-6.9z"
    />
    <Path
      fill="#34A853"
      d="M12 22c2.61 0 4.8-.86 6.4-2.34l-3.13-2.26c-.86.58-1.96.92-3.27.92-2.51 0-4.64-1.7-5.4-3.98H3.47v2.33C5.12 19.62 8.37 22 12 22z"
    />
    <Path
      fill="#FBBC04"
      d="M6.6 13.34c-.2-.58-.31-1.2-.31-1.84s.11-1.26.31-1.84V7.33H3.47C2.53 8.78 2 10.38 2 12s.53 3.22 1.47 4.67l3.13-2.33z"
    />
    <Path
      fill="#EA4335"
      d="M12 6.58c1.42 0 2.69.49 3.69 1.44l2.76-2.76C16.8 3.79 14.61 2.75 12 2.75 8.37 2.75 5.12 5.13 3.47 8.33l3.13 2.33c.76-2.28 2.89-3.98 5.4-3.98z"
    />
  </Svg>
);
export default SVGComponent;
