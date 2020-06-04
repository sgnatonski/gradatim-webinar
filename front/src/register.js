import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { BallPulse } from 'react-pure-loaders'
import ToggleSwitch from './ToggleSwitch'
import schema from '@validation/client'

var lastCode = undefined
var lastMail = undefined

function Register(props) {
  const isCodeValid = async (code) => {
    try {
      var result = code === lastCode || await fetch('/validcode?code=' + code)
      return result.ok
    } catch (error) {
      console.log(error)
    }
    finally{ 
      lastCode = code
    }
  }
  const isMailUnique = async (mail) => {
    try {
      var result = mail === lastMail || await fetch('/validmail?mail=' + mail)
      return result.ok
    } catch (error) {
      console.log(error)
    }
    finally{ 
      lastMail = mail
    }
  }
  const { register, handleSubmit, errors, watch } = useForm({
    validationSchema: schema.register,
    validationContext: { isCodeValid: isCodeValid, isMailUnique: isMailUnique },
    defaultValues: { regType: 'pwz' }
  });
  const [working, setWorking] = useState(false);

  const onSubmit = async data => {
    setWorking(true)
    try {
      var response = await fetch('/register', {
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

  const regType = watch("regType");

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={working}>
          <h1>Rejestracja - wybór dostępu</h1>
          <label className="radioBtn">
            Numer PWZ <label>(jeśli posiadają Państwo numer Prawa Wykonywania Zawodu)</label>
              <input name="regType" ref={register} type="radio" value="pwz" />
            <span class="checkmark"></span>
          </label>
          <label className="radioBtn">
            Kod dostępu <label>(jeśli otrzymali Państwo jednorazowy kod dostępu do wydarzenia, a nie posiadają numeru PWZ)</label>
              <input name="regType" ref={register} type="radio" value="code" />
            <span class="checkmark"></span>
          </label>

          {regType === 'code' && <><label htmlFor="onetimecode">Kod dostępu</label>
            <input name="onetimecode" ref={register} />
            {errors.onetimecode && <p className="err">{errors.onetimecode.message}</p>}
          </>}

          {regType === 'pwz' && <><label htmlFor="occupation">Zawód</label>
            <select name="occupation" ref={register}>
              <option ></option>
              <option value="lekarz">Lekarz</option>
              <option value="pielegniarka">Pielęgniarka</option>
              <option value="farmaceuta">Farmaceuta</option>
            </select>
            {errors.occupation && <p className="err">{errors.occupation.message}</p>}

            <label htmlFor="pwz">Numer Prawa Wykonywania Zawodu</label>
            <input name="pwz" ref={register} />
            {errors.pwz && <p className="err">{errors.pwz.message}</p>}
          </>}

          <h1>Rejestracja - dane uczestnika</h1>
          <label htmlFor="firstName">Imię</label>
          <input name="firstName" ref={register} />
          {errors.firstName && <p className="err">{errors.firstName.message}</p>}

          <label htmlFor="lastName">Nazwisko</label>
          <input name="lastName" ref={register} />
          {errors.lastName && <p className="err">{errors.lastName.message}</p>}

          <label htmlFor="email">Email</label>
          <input name="email" type="text" ref={register} />
          {errors.email && <p className="err">{errors.email.message}</p>}

          <label htmlFor="password">Hasło</label>
          <input name="password" type="password" ref={register} />
          {errors.password && <p className="err">{errors.password.message}</p>}

          <label htmlFor="confirmPassword">Powtórz hasło</label>
          <input name="confirmPassword" type="password" ref={register} />
          {errors.confirmPassword && <p className="err">{errors.confirmPassword.message}</p>}

          <label htmlFor="statute" style={{ fontWeight: 600 }}>Akceptuję <a href="/Regulamin Webinarium.pdf" target="_blank">regulamin</a></label>
          <ToggleSwitch id="statute" Name="statute" Ref={register} Text={["Tak", "Nie"]} />
          {errors.statute && <p className="err">{errors.statute.message}</p>}

          <label htmlFor="marketingConsent">
            <span style={{ fontWeight: 600 }}>Przesyłanie informacji handlowych</span>
            <br />
          Wyrażam zgodę na przetwarzanie moich danych osobowych w celach marketingowych związanych z informowaniem o wydarzeniach organizowanych przez Organizatora za pomocą poczty elektronicznej, na podany adres e-mail
        </label>
          <ToggleSwitch id="marketingConsent" Name="marketingConsent" Ref={register} Text={["Tak", "Nie"]} />
          {errors.marketingConsent && <p className="err">{errors.marketingConsent.message}</p>}
        </fieldset>

        {working && (<button className="loading" type="submit" disabled={working}><BallPulse loading={working} color="white" height={18} width={50} /></button>)}
        {!working && <input type="submit" />}
      </form>
    </>
  );
}

export default Register