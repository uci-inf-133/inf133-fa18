# uci-inf133-fa2018
Repository for UC Irvine Informatics Course 133, User Interaction Software, Fall 2018 Quarter.
This will continue to be updated over the course of the quarter.
Keep checking the [course website](http://inf133-fa18.depstein.net).

## Contributing
Small issues, like typos in assignments, can perhaps be corrected with GitHub's inline editor.
To edit, click on the "edit" button (pencil icon) in the appropriate file.
This will create a new branch of the repository in your name and generate a pull request for the course staff to review.

Larger edits, like feature additions, will require cloning the repository and running the website locally.

### Running the website locally

This page was built with [NodeJS](https://nodejs.org/en/).
Download Node before continuing and clone the repository.

Once Node is installed and the repository cloned, navigate to it in your terminal of choice.
Next, run `npm install` to install the packages this page depends on.
Use `npm start` to run the webpage locally.
To see the page rendered, go to [localhost:3000] in your browser.
`localhost` specifies the host (local!), while `:3000` designates what _port_ should be accessed.
By convention, many ports are [used for specific purposes](http://bandwidthcontroller.com/applicationPorts.html).
So when you're testing a new page locally, it's often typical to use a port which is _not_ already designated.

Make any edits in a new branch of the repository.
Once you've made your edits and your new feature is working, submit a pull request for the course staff to review.