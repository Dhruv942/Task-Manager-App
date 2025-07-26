import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props: any) => (
  <Svg
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 240.608 240.608"
    style={{
      enableBackground: "new 0 0 240.608 240.608",
    }}
    xmlSpace="preserve"
    {...props}
  >
    <Path
      style={{
        fill: "#020202",
      }}
      d="M208.789,29.972l31.819,31.82L91.763,210.637L0,118.876l31.819-31.82l59.944,59.942L208.789,29.972z"
    />
  </Svg>
);
export default SVGComponent;
