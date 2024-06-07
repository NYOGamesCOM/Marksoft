const Event = require("../../structures/Event");
const Logging = require("../../database/schemas/logging");
const discord = require("discord.js");
const Maintenance = require("../../database/schemas/maintenance");

//Function to convert RGB to hexadecimal
function makehex(rgb) {
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
}
// Exporting the class as a module
module.exports = class extends Event {
  // Defining the run function
  async run(oldRole, newRole) {
    // Check if newRole is not defined
    if (!newRole) return;
    // Check if newRole is managed by an external service
    if (newRole.managed) return;
    // Retrieve logging settings for the guild
    const logging = await Logging.findOne({ guildId: oldRole.guild.id });
    // Retrieve maintenance settings
    const maintenance = await Maintenance.findOne({
      maintenance: "maintenance",
    });
    // Check if maintenance mode is enabled
    if (maintenance && maintenance.toggle == "true") return;
    // Check if logging settings exist
    if (logging) {
      // Check if server events logging is enabled
      if (logging.server_events.toggle == "true") {
        // Get the channel for logging
        const channelEmbed = await newRole.guild.channels.cache.get(
          logging.server_events.channel
        );
        // Check if the logging channel exists
        if (channelEmbed) {
          // Get the color for the embed
          let color = logging.server_events.color;
          // Default color
          if (color == "#000000") color = newRole.client.color.green;
          // Create a new embed
          const embed = new discord.MessageEmbed()
            // Set embed description
            .setDescription(`:pencil: ***Role Updated:*** ${oldRole.name}`)
            // Set embed footer
            .setFooter({ text: `Role ID: ${newRole.id}` })
            // Set embed timestamp
            .setTimestamp()
            // Set embed color
            .setColor(color);

          // Check for name update
          if (oldRole.name !== newRole.name) {
            embed.addField("Name Update", `${oldRole.name} --> ${newRole.name}`, true);
          }

          // Check for color update
          if (oldRole.color !== newRole.color) {
            embed.addField(
              "Color Update",
              `#${makehex(oldRole.color)} --> #${makehex(newRole.color)}`,
              true
            );
          }

          // Check for mentionable update
          if (oldRole.mentionable !== newRole.mentionable) {
            embed.addField(
              "Mentionable",
              `${oldRole.mentionable} --> ${newRole.mentionable}`,
              true
            );
          }

          // Check for permission updates
          const oldPermissions = oldRole.permissions.toArray().sort();
          const newPermissions = newRole.permissions.toArray().sort();

          const addedPermissions = newPermissions.filter(permission => !oldPermissions.includes(permission));
          const removedPermissions = oldPermissions.filter(permission => !newPermissions.includes(permission));

          if (addedPermissions.length > 0) {
            embed.addField("Added Permissions", addedPermissions.join(", "), true);
          }

          if (removedPermissions.length > 0) {
            embed.addField("Removed Permissions", removedPermissions.join(", "), true);
          }

          // Send the embed if there are updates
          if (embed.fields.length > 0) {
            if (
              channelEmbed &&
              channelEmbed.viewable &&
              channelEmbed
                .permissionsFor(newRole.guild.me)
                .has(["SEND_MESSAGES", "EMBED_LINKS"])
            ) {
              channelEmbed.send({embeds: [embed]}).catch(() => {});
            }
          }
        }
      }
    }
  }
};
