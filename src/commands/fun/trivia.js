const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { incrementCommandCounter } = require("../../utils/utils.js");
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: "trivia",
            description: "Start a trivia game",
            category: "fun",
            usage: "",
            guildOnly: true,
            cooldown: 3,
        });
    }
    async run(message) {
        // Path to the trivia questions file
        const triviaPath = path.join(__dirname, '..', '..', '..', 'src', 'assets', 'json', 'trivia.json');

        
        // Load trivia questions from file
        let triviaQuestions = [];
        try {
            const data = fs.readFileSync(triviaPath, "utf8");
            triviaQuestions = JSON.parse(data);
        } catch (error) {
            console.error("Error loading trivia questions:", error);
            return message.channel.send("Could not load trivia questions. Please try again later.");
        }

        if (triviaQuestions.length === 0) {
            return message.channel.send("No trivia questions available.");
        }

        // Pick a random question
        const questionIndex = Math.floor(Math.random() * triviaQuestions.length);
        const question = triviaQuestions[questionIndex];

        let options = '';
        question.options.forEach((option, index) => {
            options += `${index + 1}. ${option}\n`;
        });

        // Send the question and options
        const embed = new MessageEmbed()
            .setTitle("Trivia Time!")
            .setDescription(`**${question.question}**\n\n${options}`)
            .setColor("RANDOM");

        message.channel.send({ embeds: [embed] }).then(() => {
            const filter = response => {
                return question.options.some((option, index) => {
                    return option.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id;
                });
            };

            // Await the user's answer
            message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] })
                .then(collected => {
                    const response = collected.first();
                    if (response.content.toLowerCase() === question.answer.toLowerCase()) {
                        message.channel.send(`Correct, ${message.author}! 🎉`);
                    } else {
                        message.channel.send(`Incorrect, ${message.author}. The correct answer is **${question.answer}**.`);
                    }
                })
                .catch(() => {
                    message.channel.send(`Time's up! The correct answer was **${question.answer}**.`);
                });
        });
    }
};
