const { validate1, validate2, validate3 } = require('./pwz')
const yup = require("yup");

yup.setLocale({
    mixed: {
        required: 'Pole jest wymagane',
        pwz: 'Numer PWZ jest nieprawidłowy',
        onetimecode: 'Kod dostępu jest nieprawidłowy',
        uniquemail: 'Adres email isnieje już w systemie'
    },
    string: {
        min: 'Wymagana długość pola to ${min} znaków',
    },
});

yup.addMethod(yup.mixed, 'pwz', function (anyArgsYouNeed) {
    const { message } = (anyArgsYouNeed || {});
    return this.test('pwz', message, function (value) {
        const { path, createError, parent } = this;

        var result = false
        switch (parent.occupation) {
            case 'lekarz': result = validate1(value); break;
            case 'pielegniarka': result = validate2(value); break;
            case 'farmaceuta': result = validate3(value); break;
            default: result = false;
        }

        return result || createError({ path, message: 'Numer PWZ jest nieprawidłowy' });
    });
});

yup.addMethod(yup.mixed, 'onetimecode', function (anyArgsYouNeed) {
    const { message } = (anyArgsYouNeed || {});
    return this.test('onetimecode', message, async function (value) {
        const { path, createError, parent } = this;

        var result = parent.regType !== 'code' || (await this.options.context.isCodeValid(value))

        return result || createError({ path, message: 'Kod dostępu jest nieprawidłowy' });
    });
});

yup.addMethod(yup.mixed, 'uniquemail', function (anyArgsYouNeed) {
    const { message } = (anyArgsYouNeed || {});
    return this.test('uniquemail', message, async function (value) {
        const { path, createError, parent } = this;

        var result = await this.options.context.isMailUnique(value)

        return result || createError({ path, message: 'Adres email isnieje już w systemie' });
    });
});

const loginSchema = yup.object().shape({
    email: yup.string().required().email(),
    password: yup.string().required().min(6)
});

const resetSchema = yup.object().shape({
    email: yup.string().required().email()
});

const newPasswordSchema = yup.object().shape({
    password: yup.string().required().min(6),
    confirmPassword: yup.string().required().oneOf([yup.ref('password'), null], "Hasła muszą być takie same"),
});

const registerSchema = yup.object().shape({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    regType: yup.string().required(),
    onetimecode: yup.string().when('regType',
        (regType, schema) => regType === 'code'
            ? schema.required().onetimecode()
            : schema.notRequired()),
    email: yup.string().required().email().uniquemail(),
    occupation: yup.string().when('regType',
        (regType, schema) => regType === 'pwz'
            ? schema.required()
            : schema.notRequired()),
    pwz: yup.string().when('regType',
        (regType, schema) => regType === 'pwz'
            ? schema.required().pwz()
            : schema.notRequired()),
    password: yup.string().required().min(6),
    confirmPassword: yup.string().required().oneOf([yup.ref('password'), null], "Hasła muszą być takie same"),
    statute: yup.bool().required().oneOf([true], 'Akceptacja regulaminu jest wymagana'),
    marketingConsent: yup.bool().notRequired()
});

module.exports = {
    login: loginSchema,
    register: registerSchema,
    reset: resetSchema,
    newPassword: newPasswordSchema
}