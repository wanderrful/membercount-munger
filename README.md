I wanted a way to figure out when the best times to schedule group events for me and my friends, so I made a Worker Dyno hosted by Heroku that will record onto a database the steam group member count numbers every hour.  After letting it run for about a month, I can analyze the data from the database to figure out the best times for us to get together and play!

---

More specifically, it periodically scrapes the given Steamcommunity.com group page, read from the GROUP\_NAME environment variable, for the current numbers of online group members.  It then records the data, along with a timestamp, into a PostgreSQL database for later analysis!  The frequency of scrapes is defined by the CHECK\_INTERVAL environment variable.

This repo works in conjunction with my own personal Heroku app so that it runs persistently.

---

To make this work for you:

- Set up a new Heroku app for yourself
- Add a database (I used the free Postgre one) to the new Heroku app you just made
- Fork this repo for yourself (or don't... I'm not a cop)
- Connect your forked repo to the Heroku app you just made
- Create the GROUP\_NAME environment variable in your Heroku Dashboard, which comes from the steamcommunity.com/id/{GROUP\_NAME} that you want to track
- Create the CHECK_INTERVAL environment variable in your Heroku Dashboard, which is just the number (in minutes) you want to check.  I used 60 so that it checks every hour.
- Manually deploy the Heroku app via your Dashboard.
- View your app's logs on the Heroku site to make sure that it is recording everything properly.
- Wait for a week or two
- Use the data accumulated in your Heroku database for whatever you need!

---

Technology used:

- TypeScript
- Node-Scrapy
- PostgreSQL