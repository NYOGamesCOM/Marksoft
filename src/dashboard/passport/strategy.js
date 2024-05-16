// Import required modules
var OAuth2Strategy = require("passport-oauth2"), // Import OAuth2Strategy from passport-oauth2 module
  InternalOAuthError = require("passport-oauth2").InternalOAuthError, // Import InternalOAuthError from passport-oauth2 module
  util = require("util"); // Import util module

// Define the Strategy constructor function
function Strategy(options, verify) {
  // Set default values for options if not provided
  options = options || {};
  options.authorizationURL = options.authorizationURL || "https://discord.com/api/oauth2/authorize";
  options.tokenURL = options.tokenURL || "https://discord.com/api/oauth2/token";
  options.scopeSeparator = options.scopeSeparator || " ";

  // Call the OAuth2Strategy constructor with the provided options and verify function
  OAuth2Strategy.call(this, options, verify);
  this.name = "discord"; // Set the name of the strategy to 'discord'
  this._oauth2.useAuthorizationHeaderforGET(true); // Use authorization header for GET requests
}

// Inherit from OAuth2Strategy
util.inherits(Strategy, OAuth2Strategy);

// Define the userProfile method of the Strategy
Strategy.prototype.userProfile = function (accessToken, done) {
  var self = this;
  // Make a GET request to fetch the user's profile from Discord API
  this._oauth2.get(
    "https://discord.com/api/users/@me",
    accessToken,
    function (err, body) {
      if (err) {
        // If an error occurs, call the 'done' callback with an InternalOAuthError
        return done(
          new InternalOAuthError("Failed to fetch the user profile.", err)
        );
      }

      try {
        // Parse the response body as JSON
        var parsedData = JSON.parse(body);
      } catch (e) {
        // If parsing fails, call the 'done' callback with an error
        return done(new Error("Failed to parse the user profile."));
      }

      var profile = parsedData; // Assign the parsed data to 'profile'
      profile.provider = "discord"; // Set the provider of the profile to 'discord'
      profile.accessToken = accessToken; // Assign the access token to 'accessToken'

      // Check for additional scopes and fetch associated data
      self.checkScope("connections", accessToken, function (errx, connections) {
        if (errx) done(errx); // If an error occurs, call the 'done' callback with the error
        if (connections) profile.connections = connections; // Assign connections to profile if available
        self.checkScope("guilds", accessToken, function (erry, guilds) {
          if (erry) done(erry); // If an error occurs, call the 'done' callback with the error
          if (guilds) profile.guilds = guilds; // Assign guilds to profile if available

          profile.fetchedAt = new Date(); // Record the time when the profile was fetched
          return done(null, profile); // Call the 'done' callback with the profile
        });
      });
    }
  );
};

// Define the checkScope method of the Strategy
Strategy.prototype.checkScope = function (scope, accessToken, cb) {
  // Check if the requested scope is present in the available scopes
  if (this._scope && this._scope.indexOf(scope) !== -1) {
    // If the scope is present, make a GET request to fetch associated data
    this._oauth2.get(
      "https://discord.com/api/users/@me/" + scope,
      accessToken,
      function (err, body) {
        if (err)
          // If an error occurs, call the 'cb' callback with an InternalOAuthError
          return cb(
            new InternalOAuthError("Failed to fetch user's " + scope, err)
          );
        try {
          // Parse the response body as JSON
          var json = JSON.parse(body);
        } catch (e) {
          // If parsing fails, call the 'cb' callback with an error
          return cb(new Error("Failed to parse user's " + scope));
        }
        cb(null, json); // Call the 'cb' callback with the fetched data
      }
    );
  } else {
    cb(null, null); // If the requested scope is not present, call the 'cb' callback with null
  }
};

// Define the authorizationParams method of the Strategy
Strategy.prototype.authorizationParams = function (options) {
  var params = {}; // Initialize an empty object for parameters
  if (typeof options.permissions !== "undefined") {
    // Check if 'permissions' option is provided
    params.permissions = options.permissions; // Add 'permissions' to the parameters
  }
  if (typeof options.prompt !== "undefined") {
    // Check if 'prompt' option is provided
    params.prompt = options.prompt; // Add 'prompt' to the parameters
  }
  return params; // Return the parameters
};

// Export the Strategy constructor function
module.exports = Strategy;
