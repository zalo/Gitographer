var CreateGitographer = function (githubAccessToken, githubUser) {
    this.initialize = function(){
        console.log("Initializing Gitographer, access token:" +githubAccessToken + ", "+ JSON.stringify(githubUser));
        this.gh = new GitHub({
            token: githubAccessToken
        });

        console.log(this.gh);

        this.gh.getUser(githubUser.nickname).listRepos()
            .then(function({data: reposJson}) {
                console.log(githubUser.nickname+` has ${reposJson.length} repos!`);
            });
    }

    this.createRepository = function(){
        console.log("Create a Gitograpgher Repository and add files to it.");
    }

    this.initialize();
}
