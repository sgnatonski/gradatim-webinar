import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { BallPulse } from 'react-pure-loaders'
import schema from '@validation/client'

function Login(props) {
  const { register, handleSubmit, errors } = useForm({ validationSchema: schema.login });
  const [working, setWorking] = useState(false);

  const onSubmit = async data => {
    setWorking(true)
    try {
      var response = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      window.location.assign(await response.text())
    } catch (error) {
      console.log(error)
    }
    setWorking(false)
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Logowanie</h1>
        <fieldset disabled={working}>
          <label htmlFor="email">Email</label>
          <input name="email" type="text" ref={register} />
          {errors.email && <p className="err">{errors.email.message}</p>}

          <label htmlFor="password">Hasło</label>
          <input name="password" type="password" ref={register} />
          {errors.password && <p className="err">{errors.password.message}</p>}
          <a href="/reset">Nie pamiętam hasła</a>
        </fieldset>
        {working && (<button className="loading" type="submit" disabled={working}><BallPulse loading={working} color="white" height={18} width={50} /></button>)}
        {!working && <input type="submit" />}
      </form>
    </>
  );
}

export default Login