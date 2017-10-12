# Actions SDK sample app for Google's Assistant 

This project is a sample app for the Google Assistant that makes use of [Google's Actions SDK](https://developers.google.com/actions/sdk/).

The project was described in detail in the blog post [Using the Actions SDK to Develop for the Google Assistant](https://www.grokkingandroid.com/using-the-actions-sdk/).

## Getting Started

After cloning the project you should make sure to create all node dependencies. For this switch to the `functions` folder and enter

```
npm install
```

This will install all necessary libraries into the folder `node_modules`. Since I lock the versions of the libraries with a `package-lock.json` file you should be using the same versions of all libraries that I use.

Afterwards go back to the root folder of the project and follow the instructions of my two blog posts for 
- [setting up Cloud Functions for Firebase](https://www.grokkingandroid.com/primer-cloud-functions-for-firebase/#setup)
- [setting up the Actions SDK](https://www.grokkingandroid.com/using-the-actions-sdk/)

You should then be able to deploy your project to the [Actions Console](https://console.actions.google.com/) by using

```
gactions update --action_package action.json --project actionConsoleProjectId
```

And you can start testing the assistant app by issuing

```
gactions test --action_package action.json --project actionConsoleProjectId
```

### Prerequisites

You need to have node.js and npm installed. 

You also need to install mocha and nyc globally:

```
npm install -g mocha
npm install -g nyc
```

You also need to have access to the [Actions Console](https://console.actions.google.com/). Create a project with any name you like.

You also need to use Cloud Functions for Firebase. Read my post about how to [setup Cloud Functions for Firebase projects](https://www.grokkingandroid.com/primer-cloud-functions-for-firebase/) to prepare a cloud functions project.

**Note:** I make outbound http calls in this project. For this to work your project must not be on the Spark plan (that's the free plan). So be warned. You might want to either replace the outbound call - which you can find in api/api.js - or switch to another solution or switch to the blaze plan. It's up to you!

Finally you should download the [`gactions` command line tool](https://developers.google.com/actions/tools/gactions-cli) and make it executable and accessible in your PATH.


## Running the tests

The project comes with a set of tests and code coverage. To run all tests and get a code coverage report on the console, simply issue

```
npm test
```

You can find an html version of the coverage report in `.nyc_output/coverage`.

Tests are written using [mocha](https://mochajs.org/) and use BDD assertions by [chai](http://chaijs.com/). For spies and stubs I use [sinonjs](http://sinonjs.org/). 

For code coverage [istanbul](https://istanbul.js.org/) and it's [nyc](https://github.com/istanbuljs/nyc) command line interface are used.


## Authors

* **Wolfram Rittmeyer** - *Initial work* - [Homepage](http://www.wolfram-rittmeyer.de) -- [Grokking Android](https://www.grokkingandroid.com)

## License

This project is licensed under the Apache License, v2 - see the [LICENSE](LICENSE) file for details

