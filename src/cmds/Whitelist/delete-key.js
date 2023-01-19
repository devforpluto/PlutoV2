const { create_command } = require("../../handlers/commands");
const config = require("../../../config.json");
const { dkto } = require("dkto.js");
const { sep } = require("path");
const { EmbedBuilder, Formatters } = require("discord.js");
const { EMBED_COLORS, DEVELOPER_IDS } = require("../../constants");
const { deleteKey } = require("../../utils/luawl");

create_command(
  async function (interaction, api_key, role_id) {
    const error_embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setFooter({ text: `${config.version}` })
      .setTimestamp();
    const success_embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BASE)
      .setFooter({ text: `${config.version}` })
      .setTimestamp();

    if (DEVELOPER_IDS.indexOf(interaction.member.id) === -1) {
      if (!interaction.member.roles.cache.find((role) => role.id === role_id)) {
        return await interaction.followUp({
          embeds: [
            error_embed.setDescription(
              "**You do not have the required permissions**"
            ),
          ],
        });
      }
    }

    const member = interaction.options.getMember("member", true);

    if (!member)
      return await interaction.followUp({
        embeds: [
          error_embed.setDescription("**Couldn't find member in the server**"),
        ],
      });

    try {
      await deleteKey({
        discord_id: member.id,
        token: api_key,
      });

      await interaction.followUp({
        embeds: [
          success_embed.setDescription(
            `**Successfully deleted ${member.user.toString()}'s key || ${Formatters.bold(
              interaction.options.getString("reason", false) || "N/A"
            ).slice(2, -2)}**`
          ),
        ],
      });

      member.user
        .send({
          embeds: [
            success_embed
              .setDescription(Formatters.bold("Your key has been deleted"))
              .setAuthor({
                name: interaction.guild.name,
              })
              .addField(
                "Reason",
                interaction.options.getString("reason", false) || "N/A"
              ),
          ],
        })
        .catch(() => void -1);
    } catch (e) {
      interaction.followUp({
        embeds: [error_embed.setDescription(Formatters.bold(`${e}`))],
      });

      console.error(e);
    }
  },
  {
    name: __filename.split(".").shift().split(sep).pop(),
    category: __dirname.split(sep).pop(),
    description: "Delets the provided user's key",
    options: dkto.builder
      .command_options()
      .user({
        name: "member",
        description: "Fetch member by mention or user id",
        required: true,
      })
      .string({
        name: "reason",
        description: "Input a reason",
        required: false,
      })
      .toJSON(),
  }
);
