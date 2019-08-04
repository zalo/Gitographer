var gitographer = null;
let auth0 = null;
const fetchAuthConfig = () => fetch("/auth_config.json");
const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();
  
    auth0 = await createAuth0Client({
      domain: config.domain,
      client_id: config.clientId
    });
};

window.onload = async () => {
    await configureClient();
    // update the UI state
    updateUI();
    const isAuthenticated = await auth0.isAuthenticated();
    if (isAuthenticated) { return; }
    // check for the code and state parameters
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      // Process the login state
      await auth0.handleRedirectCallback();
      updateUI();
      // Use replaceState to redirect the user away and remove the querystring parameters
      window.history.replaceState({}, document.title, "/");
    }
};

const updateUI = async () => { 
  const isAuthenticated = await auth0.isAuthenticated();

  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;
  
  // NEW - add logic to show/hide gated content after authentication
  if (isAuthenticated) {
    document.getElementById("logged-out").classList.add("hidden");
    document.getElementById("logged-in").classList.remove("hidden");

    let accessToken = await auth0.getTokenSilently();
    let user = await auth0.getUser();
    gitographer = new CreateGitographer(accessToken, user);
    //document.getElementById("ipt-access-token").innerHTML = accessToken;
    //document.getElementById("ipt-user-profile").innerHTML = JSON.stringify(await auth0.getUser());
  } else {
    document.getElementById("logged-in").classList.add("hidden");
    document.getElementById("logged-out").classList.remove("hidden");
  }
};

const login = async () => {
    await auth0.loginWithRedirect({
      redirect_uri: window.location.origin
    });
};

const logout = () => {
    auth0.logout({
      returnTo: window.location.origin
    });
};
