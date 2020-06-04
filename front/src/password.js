import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { BallPulse } from 'react-pure-loaders'
import { useHistory } from "react-router-dom";

import schema from '@validation/client'

function Password(props) {
  const { register, handleSubmit, errors, clearError } = useForm({ validationSchema: schema.newPassword });
  const [working, setWorking] = useState(false);
  let history = useHistory();

  const onSubmit = async data => {
    setWorking(true)
    try {
      await fetch(history.location.pathname + history.location.search, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      history.push("/login");
    } catch (error) {
      console.log(error)
    }
    setWorking(false)
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Nowe hasło</h1>
        <fieldset disabled={working}>
        <label htmlFor="password">Hasło</label>
          <input name="password" type="password" ref={register} />
          {errors.password && <p className="err">{errors.password.message}</p>}

          <label htmlFor="confirmPassword">Powtórz hasło</label>
          <input name="confirmPassword" type="password" ref={register} />
          {errors.confirmPassword && <p className="err">{errors.confirmPassword.message}</p>}
        </fieldset>
        {working && (<button className="loading" type="submit" disabled={working}><BallPulse loading={working} color="white" height={18} width={50} /></button>)}
        {!working && <input type="submit" />}
      </form>
    </>
  );
}

export default Password