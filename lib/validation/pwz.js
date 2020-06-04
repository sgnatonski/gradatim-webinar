function validate1(val) {
    if (!isNaN(val)) {
        var digits = val.split("").map(function (t) { return parseInt(t) });
        var chk = 0;
        for (var i = 1; i < digits.length; i++) {
            chk += digits[i] * i;
        }

        if (digits.length === 7 && digits[0] === chk % 11)
            return true;
    }
    return false
}
function validate2(val) {
    var digits = val.split("");
    if (digits.length === 8 && (digits[7] === 'P' || digits[7] === 'A')) {
        return true;
    }
    return false
}
function validate3(val) {
    var digits = val.split("");
    if (digits.length === 8) {
        return true;
    }
    return false
}

module.exports = { validate1, validate2, validate3 }