import React from "react";

import { useParams } from "react-router-dom";
import { logEvent } from "../api/logger";

function Redirection() {
  const { payload } = useParams();

  try {
    const data = JSON.parse(payload);
    const { link, id, ...rest } = data;

    logEvent("email_suggestion_click", id, rest, () => {
      window.location.replace(link);
    });
  } catch (e) {
    // Testing or default environment
    console.log(payload);

    logEvent("email_suggestion_click", "something_went_wrong", {}, () => {
      window.location.replace("https://www.smalldata.io");
    });
  }

  return <div />;
}

export default Redirection;
