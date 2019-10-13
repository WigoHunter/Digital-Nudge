import React, { useEffect } from "react";

import { useParams } from "react-router-dom";
import { logEvent } from "../api/logger";

function Redirection() {
  const { payload } = useParams();

  useEffect(() => {
    try {
      const data = JSON.parse(
        // eslint-disable-next-line quotes
        decodeURIComponent(payload.replace(new RegExp("&quot;", "g"), '"'))
      );
      const { link, id, ...rest } = data;
      const target = decodeURIComponent(link);

      logEvent("email_suggestion_click", id, rest, () => {
        window.location.replace(target);
      });
    } catch (e) {
      console.log(
        // eslint-disable-next-line quotes
        decodeURIComponent(payload)
      );
      console.log(e);
    }
  }, [payload]);

  return <div />;
}

export default Redirection;
