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
                    document.getElementById("found-repository").classList.remove("hidden"); 
                },
                (error) => {
                    this.repo = null;
                    if(error.message === "Not Found") {
                        console.log("You don't have a Gitographer repository yet!!!");
                        document.getElementById("no-repository").classList.remove("hidden");
                    } else {
                        this.reportError("Something broke while trying to get to the repository...", error);
                    }
                });
        }, (error)=>{
            this.reportError("Something broke while trying to get to the current user...", error);
        });
    }

    this.createRepository = function(){
        console.log("Create a Gitographer Repository and add files to it.");

        // Define the settings for the gitographer-notes repo
        let repositorySettings = {
          "name": "gitographer-notes",
          "description": "Your private Gitographer storage space",
          "homepage": "https://gitographer.com",
          "private": true,
          "has_issues": false,
          "has_projects": false,
          "has_wiki": false
        };

        // Create the gitographer-notes repo
        this.ghPost('user/repos', repositorySettings, 
            (repoInfo)=>{
                console.log("Repo created successfully!");
                console.log(repoInfo);

                // Define the settings for the initial Notes.json file
                let initialNotesContent = {
                    title: "Notes",
                    notes: []
                };
                let initialNotesCommit = {
                  "message": "Initial Gitographer Commit",
                  "committer": {
                    "name": this.githubUser.login + " via Gitographer",
                    "email": this.githubUser.email
                  },
                  "content": btoa(JSON.stringify(initialNotesContent, null, 2))
                };

                // Create the initial Notes.json file
                let filename = (initialNotesContent.title).toLowerCase()+'.json';
                this.ghPost('repos/'+this.githubUser.login+'/'+repositorySettings.name+'/contents/'+filename, 
                    initialNotesCommit, 
                    (noteInfo)=>{
                        console.log("Created "+filename);
                        console.log(noteInfo);
                        document.getElementById("no-repository").classList.add("hidden"); 
                        document.getElementById("found-repository").classList.remove("hidden"); 
                    },
                    (error)=>{
                        this.reportError("Something broke while trying to commit the initial notes.json file...", error);
                    }, 'PUT');
            },
            (error)=>{
                this.reportError("Something broke while trying to create the repository...", error);
            });
    }

    this.ghGet = function(endpoint, callback, errorCallback){
        fetch('https://api.github.com/'+endpoint, {
            method: 'GET', headers: { 'Authorization': 'token ' + this.githubAccessToken }
        }).then((response) => {
            if(response.status >= 400){
                response.json().then((parsedData)=>{
                    errorCallback(parsedData);
                });
            }else{
                response.json().then((parsedData)=>{
                    callback(parsedData);
                });
            }
        }).catch((error) => errorCallback(error));
    }

    this.ghPost = function(endpoint, data, callback, errorCallback, method = 'POST'){
        return fetch('https://api.github.com/'+endpoint, {
            method: method,
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                'Authorization': 'token ' + this.githubAccessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        }).then((response) => {
            if(response.status >= 400){
                response.json().then((parsedData)=>{
                    errorCallback(parsedData);
                });
            }else{
                response.json().then((parsedData)=>{
                    callback(parsedData);
                });
            }
        }).catch((error) => errorCallback(error));
    }

    this.reportError = function(friendlyMessage, error){
        console.log(friendlyMessage);
        console.log(error);
        document.getElementById("error-container").classList.remove("hidden");
        document.getElementById("error-friendly-msg").innerHTML = friendlyMessage;
        document.getElementById("error-msg").innerHTML = JSON.stringify(error, null, 2);
    }

    this.btoaUTF16 = function (sString) {
        var aUTF16CodeUnits = new Uint16Array(sString.length);
        Array.prototype.forEach.call(aUTF16CodeUnits, function (el, idx, arr) { arr[idx] = sString.charCodeAt(idx); });
        return btoa(String.fromCharCode.apply(null, new Uint8Array(aUTF16CodeUnits.buffer)));
    }
    
    this.atobUTF16 = function (sBase64) {
        var sBinaryString = atob(sBase64), aBinaryView = new Uint8Array(sBinaryString.length);
        Array.prototype.forEach.call(aBinaryView, function (el, idx, arr) { arr[idx] = sBinaryString.charCodeAt(idx); });
        return String.fromCharCode.apply(null, new Uint16Array(aBinaryView.buffer));
    }

    this.initialize();
}
