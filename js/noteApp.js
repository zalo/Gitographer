var CreateGitographer = function (githubAccessToken) {
    this.initialize = function(){
        console.log("Initializing Gitographer, access token:" + githubAccessToken);
        this.gh = new GitHub({token: githubAccessToken});

        console.log(this.gh);
        let githubUser = this.gh.getUser("zalo");
        console.log(githubUser);

        githubUser.listRepos()
            .then(function({data: reposJson}) {
                console.log(githubUser.nickname+` has ${reposJson.length} repos!`);
            });
    }

    this.createRepository = function(){
        console.log("Create a Gitograpgher Repository and add files to it.");
    }

    this.initialize();
}
