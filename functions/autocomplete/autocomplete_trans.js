const { AutocompleteInteraction } = require('discord.js');
const translate = require('@iamtraction/google-translate');

module.exports.data = {
  name: 'translate',
  type: 'autocomplete',
};

/**
 * @param { AutocompleteInteraction } interaction
 */
module.exports.execute = async (interaction, lang) => {
  try {
    const text = interaction.options.getString('text', true);
    const langTo = lang?.name || 'en';
    const translated = await translate(text, { to: langTo });
    const transtext = translated.from?.text?.value;
    if (!transtext) return;
    await interaction.respond([
      {
        name: transtext,
        value: transtext.replace(/[\[\]]/g, ''),
      },
    ]);
    return;
  } catch (e) {
    console.error(e);
  }
};
