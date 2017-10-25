Periodically scrapes the given Steamcommunity.com group page, read from the GROUP\_NAME environment variable, for the current numbers of online group members.  It then records the data, along with a timestamp, into a PostgreSQL database for later analysis!  The frequency of scrapes is defined by the CHECK\_INTERVAL environment variable.

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