window.AuthCheckMain = window.AuthCheckMain || {};

window.AuthCheckMain.initBasicAuthCheck = function () {
  if (window.AuthValidators && window.AuthValidators.basicTokenCheck) {
    window.AuthValidators.basicTokenCheck();
  } else {
    console.warn("AuthValidators.basicTokenCheck não está disponível");
  }
};

window.AuthCheckMain.initAdvancedAuthCheck = async function () {
  if (window.AuthValidators && window.AuthValidators.advancedTokenCheck) {
    await window.AuthValidators.advancedTokenCheck();
  } else {
    console.warn("AuthValidators.advancedTokenCheck não está disponível");
  }
};

window.AuthCheckMain.initAuthCheck = function () {
  const currentPath = window.location.pathname;

  if (currentPath === "/" || currentPath.includes("login")) {
    return;
  } else {
    window.AuthCheckMain.initBasicAuthCheck();
  }
};

window.LoginCheckMain = window.AuthCheckMain;
