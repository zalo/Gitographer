var CreateGitographer = function (githubAccessToken) {
    this.githubAccessToken = githubAccessToken;
    this.notes = null;
    this.noteElements = [];

    this.initialize = function(){
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
                    this.pullNotes();
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

    this.updateNoteDom = function(){
        let noteContainer = document.getElementById("note-container");
        // Remove all elements
        while (noteContainer.firstChild) { noteContainer.removeChild(noteContainer.lastChild); }
        this.noteElements = [];

        this.notes.notes.forEach((note) => {
            let noteElement = document.createElement('div');
            noteElement.innerHTML = note.content;
            noteElement.contentEditable = true;
            noteElement.spellcheck = false;
            noteElement.classList.add("note");
            noteContainer.appendChild(noteElement);
            this.noteElements.push(noteElement);
        });
    }

    this.pullNotes = function() {
        if(document.getElementById("edit-box").innerHTML){
            document.getElementById("edit-box").innerHTML = "";
        }
        this.ghGet("repos/"+this.githubUser.login+"/gitographer-notes/contents/notes.json", 
            (noteData) => {
                console.log("Received notes!");
                console.log(noteData);
                this.notes = JSON.parse(atob(noteData.content));
                console.log(this.notes);
                this.noteSha = noteData.sha;

                // Update the listed notes...
                this.updateNoteDom();
            },
            (error) => {
                if(error.message === "This repository is empty." && !this.triedToCreateNotesOnce){
                    this.triedToCreateNotesOnce = true;
                    this.reportError("No notes.json exists, attempting to create it...", error);
                    this.createNotes();
                }else{
                    this.notes = null;
                    this.reportError("Something broke while trying to get your notes...", error);
                }
            });
    }

    this.pushNotes = function() {
        let dirty = false;
        if(document.getElementById("edit-box").innerHTML){
            dirty = true;
            this.notes.notes.push({
                id: parseInt(Math.random()*1000000000, 10),
                content: document.getElementById("edit-box").innerHTML
            });
        }
        this.noteElements.forEach((noteElement, i) => {
            if(this.notes.notes[i].content !== noteElement.innerHTML){
                dirty = true;
                this.notes.notes[i].content = noteElement.innerHTML;
            }
        });

        if (dirty) {
            let notesCommit = {
                "message": "Gitographer Update",
                "committer": {
                "name": this.githubUser.login + " via Gitographer",
                "email": this.githubUser.email
                },
                "content": btoa(JSON.stringify(this.notes, null, 2)),
                "sha": this.noteSha
            };
            let filename = (this.notes.title).toLowerCase()+'.json';
            this.ghPost('repos/'+this.githubUser.login+'/gitographer-notes/contents/'+filename, 
                notesCommit, 
                (noteInfo)=>{
                    console.log("Updated "+filename);
                    console.log(noteInfo);
                    this.pullNotes();
                },
                (error)=>{
                    this.reportError("Something broke while trying to commit the notes .json file...", error);
                }, 'PUT');
        } else{
            console.log("Nothing has changed, aborting commit...")
        }
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
                this.createNotes();
            },
            (error)=>{
                this.reportError("Something broke while trying to create the repository...", error);
            });
    }

    this.createNotes = function(){
        // Define the settings for the initial Notes.json file
        let initialNotesContent = {
            title: "Notes",
            notes: []
        };
        let initialNotesCommit = {
          "message": "Initial Gitographer Commit",
          "committer": {
            "name": this.githubUser.login + " via Gitographer",
            "email": (this.githubUser.email) ? this.githubUser.email : "api@gitographer.com"
          },
          "content": btoa(JSON.stringify(initialNotesContent, null, 2))
        };
        // Create the initial Notes.json file
        let filename = (initialNotesContent.title).toLowerCase()+'.json';
        this.ghPost('repos/'+this.githubUser.login+'/gitographer-notes/contents/'+filename, 
            initialNotesCommit, 
            (noteInfo)=>{
                console.log("Created "+filename);
                console.log(noteInfo);
                document.getElementById("no-repository").classList.add("hidden"); 
                document.getElementById("found-repository").classList.remove("hidden");
                document.getElementById("error-container").classList.add("hidden");
                this.pullNotes();
            },
            (error)=>{
                this.reportError("Something broke while trying to commit the initial notes.json file...", error);
            }, 'PUT');
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
