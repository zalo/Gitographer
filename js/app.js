// The primary Gitographer instance
var gitographer = null;

// Manage the login-flow and initializing the Gitographer instance
window.onload = async () => { 
  let isAuthenticated = false;
  let githubToken = null;
  if(window.location.hash){
    isAuthenticated = true;
    let hash = window.location.hash.substr(1);
    let result = hash.split('&').reduce(function (result, item) {
        var parts = item.split('=');
        result[parts[0]] = parts[1];
        return result;
    }, {});
    githubToken = result.access_token;
    
    // Hide the token from the URL
    //window.history.replaceState({}, "Gitographer Notes", "/");
  }

  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;
  
  // add logic to show/hide gated content after authentication
  if (isAuthenticated) {
    document.getElementById("logged-out").classList.add("hidden");
    document.getElementById("logged-in").classList.remove("hidden");

    gitographer = new CreateGitographer(githubToken);
  } else {
    document.getElementById("logged-in").classList.add("hidden");
    document.getElementById("logged-out").classList.remove("hidden");
  }
};

const login = async () => {
  window.location.assign('https://micro-github.zalo.now.sh/api/login');
};

const logout = () => {
  document.location.assign(window.location.origin);
};
