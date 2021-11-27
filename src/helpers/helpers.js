export async function alertIfErrorsExist(res, alert) {
  if (res.status < 200 || res.status > 299) {
    const errorBody = await res.json();
    const errors = (errorBody).errors;
    errors.forEach(err => alert.error(err));
    return true
  }
  return false;
}
