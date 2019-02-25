# Digital-Nudge
Cornell Tech specialization project: Digital Nudge

## Cloning the project
Prerequisite: `Meteor` installed (instructions @meteor.com)

```
git clone https://github.com/WigoHunter/Digital-Nudge.git
cd Digital-Nudge
meteor npm install
meteor
```

## Deploy the project both locally and on the AWS server

Due to privacy issues, files containing credentials cannot be pushed to Github repository. These files can be retrieved from **Cornell Box**: https://cornell.app.box.com/folder/68315360095

After retrieving those files, they should be placed as below:  
*DigitalNudge.pem* should be placed under the same directory as the whole Digital-Nudge project folder. 
*keys.js* and *app-deploy* folder should be placed inside the Digital-Nudge project folder.

Always remember to check/install dependencies before deployment.
```
meteor npm install
```

*** 
- Run the project locally
```
cd Digital-Nudge
meteor run
```

- Deploy the project on AWS server  
Since we are using **Meteor Up** for deployment, we need to install mup first.
```
npm install --global mup
```
For deployment, run:
```
cd app-deploy
mup deploy
```
