# Update Your AM Instance with urls in a github action

# Description

This is an action which adds accepted origins to a ForgeRock AM tenant via the rest api. It's helpful in scenarios where you may generate a url based on some dynamic values (like preview environments) and want to add that value to your tenants accepted origins for cors purposes. Cors requires exact matches when credentials are set.

# How to use

In order to make the request we need an admin user who can log into the tenant and edit the cors configuration settings. We strongly encourage you to pass all values in as secrets to the action.

Please view the action [action.yml](./action.yml) file for the api and required paramters

```
  - uses: @forgerock/update-am
    with:
      AM_URL: ${{ secrets.AM_URL }}
      username: ${{ secrets.AM_USERNAME }}
      password: ${{ secrets.AM_PASSWORD }}
      realm: ${{ secrets.AM_REALM }}
      origins: steps.output.myUrls # output from a previous step
      cookie_name: ${{ secrets.AM_COOKIE_NAME }} # cookie name from AM
      remove: false # optional
```
