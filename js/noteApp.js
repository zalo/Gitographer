var CreateGitographer = function (githubAccessToken) {
    this.githubAccessToken = githubAccessToken;

    this.initialize = function(){
        console.log("Initializing Gitographer, access token:" + this.githubAccessToken);

        this.ghGet("user", (userData)=>{
            this.githubUser = userData;
            console.log(this.githubUser);

            // Check to see if this user already has a Gitographer-Notes repo
            this.ghGet("repos/"+this.githubUser.login+"/gitographer-notes", 
                (repoData) => {
                    // Hooray!  Begin setting up the app with data downloaded from the repo...
                    this.repo = repoData; 
                    console.log(repoData); 
                },
                (error) => {
                    this.repo = null;
                    if(error.message === "Not Found") {
                        console.log("You don't have a Gitographer repository yet!!!");
                    } else {
                        console.log("Something broke in an unexpected manner...");
                        console.log(error);
                    }
                });
        });
    }

    this.createRepository = function(){
        console.log("Create a Gitographer Repository and add files to it.");
        let repositorySettings = {
          "name": "gitographer-notes",
          "description": "Your private Gitographer storage space",
          "homepage": "https://gitographer.com",
          "private": true,
          "has_issues": false,
          "has_projects": false,
          "has_wiki": false
        };

        this.ghPost('user/repos', repositorySettings, (repoInfo)=>{
            console.log(repoInfo);
        });
    }

    this.ghGet = function(endpoint, callback, errorCallback){
        fetch('https://api.github.com/'+endpoint, {
            method: 'GET', headers: { 'Authorization': 'token '+this.githubAccessToken }
        }).then((response) => {
            response.json().then((parsedData)=>{
                callback(parsedData);
            });
        }).catch((error) => errorCallback(error));
    }

    this.ghPost = function(endpoint, data, callback, errorCallback){
        return fetch('https://api.github.com/'+endpoint, {
            method: 'POST',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                'Authorization': 'token '+this.githubAccessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        }).then((response) => {
            response.json().then((parsedData)=>{
                callback(parsedData);
            });
        }).catch((error) => errorCallback(error));
    }

    this.initialize();
}
