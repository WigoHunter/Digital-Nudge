- research similar product

todo:
- fix svg (cloudinary solution?)
- build config page?
- Average earliest

known_bugs:
- lastSuggestion gets reset on login
- past 7 days hours structure { day: "4/12", hours: 1.5 }

TODOs:
- 8 - 12
- how many days we look back into (3 days v.s. 28 days. Does it matter? Does the model matter? ML v.s. simple average model)
- Find how model performs by testing schedule() with users

- ***** Come up with the survey by Sunday ******

Double check:
- how early email read (listener)
- Check users with Google search

:->
"get a proxy of how early a user wake up"
Google Fit
Health Keep for Apple

## To update:
- Add basic security to configuration setting. Only four of us can upload configuration.json now (Frontend hides the button + Server rejects the request).
- Quick fix of a few bugs detected (data updates too slow for first-time user - too many requests were made. Solved by restructuring the code into using JavaScript Promises)
- Deploy the updates in the past 2 weeks to live server (old accounts all deleted).
- Recruited 5



Get a set of users to test different models from different models to see if the interest we predict makes sense.
- Less accurate v.s. not useful

- 10%~ of randomness
- randomization in time
- Timeful app report
- no fixed time for events! Potentially do it this way, just suggest event without time.