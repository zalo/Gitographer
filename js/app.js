var gitographer = null;

window.onload = async () => {
    updateUI();
};

const updateUI = async () => {
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
  }

  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;
  
  // NEW - add logic to show/hide gated content after authentication
  if (isAuthenticated) {
    document.getElementById("logged-out").classList.add("hidden");
    document.getElementById("logged-in").classList.remove("hidden");

    gitographer = new CreateGitographer(githubToken);
    //document.getElementById("ipt-access-token").innerHTML = accessToken;
    //document.getElementById("ipt-user-profile").innerHTML = JSON.stringify(await auth0.getUser());
  } else {
    document.getElementById("logged-in").classList.add("hidden");
    document.getElementById("logged-out").classList.remove("hidden");
  }
};

const login = async () => {
  window.location.assign('https://micro-github.zalo.now.sh/api/login');
  /*var url = 'https://micro-github.zalo.now.sh/api/login';
  var data = { redirect_uri: window.location.origin };
  fetch(url, {
    method: 'POST', // or 'PUT'
    body: JSON.stringify(data), // data can be `string` or {object}!
    headers:{
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    crossdomain: true
  }).then(res => res.json())
  .then(response => console.log('Success:', JSON.stringify(response)))
  .catch(error => console.error('Error:', error));*/
};

const logout = () => {
  document.location.assign(window.location.origin);
};
