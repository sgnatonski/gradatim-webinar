import React from "react";
import { withRouter } from 'react-router-dom';
import LinkButton from './LinkButton';

function Nav(props) {

  return (
    <div className="route-nav" >
      <div className="half">
        {props.location.pathname == '/join' && <>
          <div>Jeśli posiadają Państwo już konto</div>
          <span style={{ fontSize: 70 }}>&#8681;</span>
        </>}
        <LinkButton to="/login">Logowanie</LinkButton>
      </div>
      <div className="half">
        {props.location.pathname == '/join' && <>
          <div>Jeśli nie posiadają Państwo konta</div>
          <span style={{ fontSize: 70 }}>&#8681;</span>
        </>}
        <LinkButton to="/register">Rejestracja</LinkButton>
      </div>
    </div>
  );
}

export default withRouter(Nav)