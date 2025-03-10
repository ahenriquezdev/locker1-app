import React, { PropsWithChildren } from "react";

import "./common.css";

export default function CommonLayout({ children }: PropsWithChildren) {
  return <div>{children}</div>;
}
