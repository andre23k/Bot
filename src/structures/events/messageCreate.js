import { SaphireClient as client, Experience, Database, AfkManager, ChestManager, SpamManager } from '../../classes/index.js';
import { DiscordPermissons } from '../../util/Constants.js';
import { ChannelType } from 'discord.js';
import { Emojis as e } from '../../util/util.js';
import { socket } from '../../websocket/websocket.js';
import registerSlashCommandsRequest from './functions/registerSlashCommands.js';

client.on('messageCreate', async message => {
    client.messages++
    if (socket?.connected) socket?.send({ type: "addMessage" })

    if (!message || !message.id || !message.channel) return

    if (
        message.content == `<@${client.user.id}> register global slash commands`
        && client.admins.includes(message.author.id)
    ) return registerSlashCommandsRequest(message, "global")

    if (
        message.content.includes(`<@${client.user.id}> delete global slash commands`)
        && client.admins.includes(message.author.id)
    ) return registerSlashCommandsRequest(message, "delete_global", message.content.split(" ")[5])

    if (
        message.content.includes(`<@${client.user.id}> register global slash commands`)
        && client.admins.includes(message.author.id)
    ) return registerSlashCommandsRequest(message, "register_global", message.content.split(" ")[5])

    if (
        message.content == `<@${client.user.id}> register admin slash commands`
        && client.admins.includes(message.author.id)
    ) return registerSlashCommandsRequest(message, "put")

    if (
        message.content == `<@${client.user.id}> delete admin slash commands`
        && client.admins.includes(message.author.id)
    ) return registerSlashCommandsRequest(message, "delete")

    if (
        message.content == `<@${client.user.id}> register linked roles`
        && client.admins.includes(message.author.id)
    ) return client.linkedRolesLoad(message)

    // Ideia original dada por André - 648389538703736833
    if (message.channel.type === ChannelType.GuildAnnouncement) {
        const guildData = await Database.getGuild(message.guildId)
        const isChannelCrosspostable = guildData?.announce?.crosspost

        if (isChannelCrosspostable && message.guild.members.me.permissions.has(DiscordPermissons.Administrator))
            await message.crosspost().then(() => message.react('📨')).catch(() => { })
    }

    if (message?.author?.bot || !message.guild || message.webhookId) return
    Experience.add(message.author.id, 1)
    ChestManager.add(message.guildId, message.channelId)
    AfkManager.check(message)
    SpamManager.check(message)

    if (message.content === `<@${client.user.id}>`) {
        const helpCommandId = client.application.commands.cache.find(c => c.name === "help")?.id;
        return message.reply({ content: `${e.saphirePolicial} | Opa, tudo bem? Meus comandos estão 100% em /slashCommand. Veja alguns deles usando ${helpCommandId ? `</help:${helpCommandId}>` : "`/help`"}` }).catch(() => { })
    }
    return
})
