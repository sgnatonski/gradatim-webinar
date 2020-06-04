import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from "react-router-dom";
import { AnimatedRoute } from 'react-router-transition';
import Login from './login'
import Register from './register'
import Reset from './reset'
import Password from './password'
import Nav from './nav'

import "./styles.css";
import "./ToggleSwitch.css";

function App() {
  return (
    <div className="webinar">
      <div className="nav">
        <div className="logo">
          <a href="/"><img src="/gradatim-webinarium_.png" alt="Gradatim logo" /></a>
        </div>
        <div className="circle"></div>
      </div>
      <h3 style={{ textAlign: "center", paddingTop: 26 }}>Proszę wybrać odpowiednią dla Państwa metodę dostępu</h3>
      <Router>
          <PrivateRoute path="/" exact={true} />
          <Route path="/join" />
          <Nav />
          <AnimatedRoute
            path="/login"
            component={Login}
            atEnter={{ offset: -1000 }}
            atLeave={{ offset: 1200 }}
            atActive={{ offset: 0 }}
            className="route-wrapper"
            mapStyles={(styles) => ({
              transform: `translateX(${styles.offset}%)`,
            })}
          />
          <AnimatedRoute
            path="/register"
            component={Register}
            atEnter={{ offset: -1000 }}
            atLeave={{ offset: 1200 }}
            atActive={{ offset: 0 }}
            className="route-wrapper"
            mapStyles={(styles) => ({
              transform: `translateX(${styles.offset}%)`,
            })}
          />
          <AnimatedRoute
            path="/reset"
            component={Reset}
            atEnter={{ offset: -1000 }}
            atLeave={{ offset: 1200 }}
            atActive={{ offset: 0 }}
            className="route-wrapper"
            mapStyles={(styles) => ({
              transform: `translateX(${styles.offset}%)`,
            })}
          />
          <AnimatedRoute
            path="/password"
            component={Password}
            atEnter={{ offset: -1000 }}
            atLeave={{ offset: 1200 }}
            atActive={{ offset: 0 }}
            className="route-wrapper"
            mapStyles={(styles) => ({
              transform: `translateX(${styles.offset}%)`,
            })}
          />
      </Router>
    </div>
  );
}

function PrivateRoute({ token, children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        token ? (
          children
        ) : (
            <Redirect
              to={{
                pathname: "/join",
                state: { from: location }
              }}
            />
          )
      }
    />
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
