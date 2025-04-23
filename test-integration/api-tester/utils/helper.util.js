function getExpiresAtUtc(tokenExpiresIn) {
  const nowUtc = new Date(Date.now());

  return new Date(nowUtc.getTime() + parseInt(tokenExpiresIn, 10) * 1000);
}

function hideUUID(uuid) {
  return uuid.replace(/-/g, '');
}

function showUUID(hex) {
  return hex.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5');
}

module.exports = {
  getExpiresAtUtc,
  hideUUID,
  showUUID,
};
