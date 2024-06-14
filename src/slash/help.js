module.exports = {
  name: "help",
  description: "Display the bot commands!",
  category: "information",
  slash: "true",
  global: true,
  error: async () => {},
  run: async (data) => {
    data.interaction.editReply({
      content: `We are still working on our slash commands, come back later!!`,
    });
  },
};
