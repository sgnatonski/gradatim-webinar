import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { BallPulse } from 'react-pure-loaders'
import schema from '@validation/client'

function Reset(props) {
  const { register, handleSubmit, errors, clearError } = useForm({ validationSchema: schema.reset });
  const [working, setWorking] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const onSubmit = async data => {
    setWorking(true)
    try {
      await fetch('/reset', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      setResetDone(true)
    } catch (error) {
      console.log(error)
    }
    setWorking(false)
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Reset hasła</h1>
        <fieldset disabled={working}>
          <label htmlFor="email">Email</label>
          <input name="email" type="text" ref={register} />
          {errors.email && <p className="err">{errors.email.message}</p>}

          {resetDone && <label>Na podany adres email wysłany został link umozliwiający zresetowanie hasła. Prosze sprawdzić swoją skrzynkę pocztową (uwaga - wiadomość może pojawić sie po kilku minutach)</label>}
        </fieldset>
        {working && (<button className="loading" type="submit" disabled={working}><BallPulse loading={working} color="white" height={18} width={50} /></button>)}
        {!working && <input type="submit" />}
      </form>
    </>
  );
}

export default Reset