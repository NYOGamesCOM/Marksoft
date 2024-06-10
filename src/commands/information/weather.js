const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "weather",
      description: "Displays the current weather for a specified location.",
      category: "Information",
      usage: "!weather <location>",
      guildOnly: false, // Set to true if you want to restrict it to guilds only
    });
  }

  async run(message, args) {
    try {
      // Extracting the location from the command arguments
      const location = args.join(" ");
      if (!location) {
        return message.channel.send("Please provide a location.");
      }

      // Replace 'YOUR_WEATHERAPI_KEY' with your actual WeatherAPI key
      const apiKey = '90a8fed4bc9e40dc868132803241006';

      // Making a request to WeatherAPI to get the weather data
      const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`);
      const data = await response.json();

      if (response.status !== 200) {
        // Handle API error
        return message.channel.send(`Error: ${data.error.message}`);
      }

      // Extracting relevant information from the response
      const locationName = `${data.location.name}, ${data.location.country}`;
      const temperature = data.current.temp_c;
      const feelsLike = data.current.feelslike_c;
      const humidity = data.current.humidity;
      const windSpeed = data.current.wind_kph;
      const windDirection = data.current.wind_dir;
      const pressure = data.current.pressure_mb;
      const cloudiness = data.current.cloud;
      const weather = data.current.condition.text;
      const weatherIcon = data.current.condition.icon;
      const visibility = data.current.vis_km;
      const uvIndex = data.current.uv;
      const lastUpdated = data.current.last_updated;

      // Constructing the response message
      const embed = new MessageEmbed()
        .setColor("#1E90FF")
        .setTitle(`Weather in ${locationName}`)
        .setDescription(weather)
        .setThumbnail(`http:${weatherIcon}`)
        .addField("Temperature", `${temperature}°C`, true)
        .addField("Feels Like", `${feelsLike}°C`, true)
        .addField("Humidity", `${humidity}%`, true)
        .addField("Wind Speed", `${windSpeed} kph`, true)
        .addField("Wind Direction", windDirection, true)
        .addField("Pressure", `${pressure} mb`, true)
        .addField("Cloudiness", `${cloudiness}%`, true)
        .addField("Visibility", `${visibility} km`, true)
        .addField("UV Index", uvIndex.toString(), true)
        .addField("Last Updated", lastUpdated, true)
        .setFooter({
          text: `Requested by ${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return message.channel.send('An error occurred while fetching weather data.');
    }
  }
};
