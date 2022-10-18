# 🤖 🐦 eAmusement Maintenance Bot

eAmusement Maintenance Bot is an [Express](https://expressjs.com/) application that serves vigilant maintenance warnings as Tweets on the Twitter account, [@eAmuse_schedule](https://twitter.com/eAmuse_schedule). 

## 🎯 Target Problem & Solution

During eAmusement's Maintenance periods, players cannot use an eAmusement pass to log into certain games, limiting many of its in-game features. The Extended Maintenance, which falls on the third Tuesday of every month from 02:00 - 07:00 JST, is of particular concern for the following reasons:

* ❌ All eAmusement branded games are put offline for maintenance
* ❌ Third Tuesdays from 02:00 - 07:00 JST falls on the prior Monday from 13:00 - 18:00 ET, where the Western player base remains awake
* ❌ Some players unfortunately make trips to the arcade without knowing Extended Maintenance is taking place

With a predictable schedule, we can create an automated application that interfaces with the Twitter API, posting Extended Maintenance warnings prior to scheduled service. 

*An example of a warning Tweet, seen below*

![An example of a warning Tweet](/assets/tweet_example.png)

## 📅 Tweet Schedules
In order to accomodate for differing Twitter timeline behavior, it is critical to send out scheduled tweets in multiple intervals.

Currently, Tweets are scheduled to post as follows:
* Three days before Extended Maintenance day
* One day before Extended Maintenance day
* Two hours before Extended Maintenance
* Once Extended Maintenance begins

Additionally, sending out Tweets that provide the user with information regarding Extended Maintenance conclusion is expected to help players plan their trips better: 

* One hour before Extended Maintenance ends
* Once Extended Maintenance ends

## ⚡ Installation
This project uses [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) as its package manager.

### Getting environment variables
A Twitter Developer account with elevated access is required to interface with Twitter API and its v1 endpoint, which allows our Express instance to post Tweets. Read more [here](https://developer.twitter.com/en/docs/twitter-api/getting-started/about-twitter-api#v2-access-leve). 

### ⚠️⚠️ Important Authentication Requirement
For the purposes of this project, the account you are automating tweets from MUST be the same account you are using for developer purposes. In other words, it is necessary to create a separate Twitter account for this project. This separate Twitter account must also have developer Elevated Access. If you are interested in performing actions on behalf of another Twitter account, [check out Twitter's 3-legged OAuth flow](https://developer.twitter.com/en/docs/authentication/oauth-1-0a/obtaining-user-access-tokens).

After creating an account and getting approved for elevated access, [enter the developer portal](https://developer.twitter.com/en/portal/projects-and-apps) and [create a new project](https://developer.twitter.com/en/portal/apps/new). 

Take note of your API Key and API Key Secret. They will be used to authenticate your Express client to use the v1 endpoint.

Click on the "Keys and tokens" tab and generate your Access Token and Secret.
![Access Token and Secret Location](/assets/twitter_auth_keys.png)

You should have 2 Keys and 2 Secrets now, which will allow us to authenticate with the Twitter API v1 endpoint.

After cloning the repository, change directory into the project's root and create a `.env`. You will be storing your Twitter API keys & secrets here.

```bash
cd twitter-eamuse-warn
touch .env
```

Inside your `.env`, add your Twitter keys 

```
TWITTER_ACCESS_TOKEN = YOUR_TWITTER_ACCESS_TOKEN_HERE
TWITTER_ACCESS_TOKEN_SECRET = YOUR_TWITTER_ACCESS_TOKEN_SECRET_HERE
TWITTER_API_KEY = YOUR_TWITTER_API_KEY_HERE
TWITTER_API_SECRET = YOUR_TWITTER_API_SECRET_HERE
```

Install dependencies 

```bash
npm i
```

Start the development server

```bash
node server.js
```


## 🛣️ Roadmap
### Recently Released
* Core functionality implemented (Extended Maintenance scheduled tweets)
* Alpha release testing to a small group of users. Awaiting the next scheduled Extended Maintenance which is happening on 10/17/2022 @ 13:00 ET
### In Progress
* Qualitative survey (as of 10/17)
### Next Up
* Weekday maintenance warning implementation

## 🤝 Contributing 
PRs are welcome! Please directly DM the [@eAmuse_schedule](https://twitter.com/eAmuse_schedule) account with suggestions, comments, or concerns. 

Additionally, feel free to log new issues with sufficient details regarding your concerns.
