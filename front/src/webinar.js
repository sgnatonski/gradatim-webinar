import React, { useState, useEffect } from "react";
import ReactPlayer from 'react-player'
import { BallPulse } from 'react-pure-loaders'

function Webinar({ token }) {
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState();
  const [noLink, setNoLink] = useState(false);

  useEffect(async () => {
    if (token) {
      var response = await fetch('/webinar', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      })
      if (response.status !== 204) {
        const result = await response.text();
        setLink(result);
      }
      else {
        setNoLink(true)
      }
    }
    setLoading(false)
  }, [token]);

  return (<div className="webinar">
    <div className="player">
      <BallPulse loading={loading} color="white" height={18} width={50} />
      {link && <ReactPlayer url={link} playing />}
      {noLink && <h4>W tej chwili żadne webinarium nie jest aktywne. Proszę zarejestrować się ponownie w poźniejszym czasie, gdy otrzymają Państwo informacje o uruchomieniu webinarium.</h4>}
    </div>
  </div>);
}

export default Webinar
