import 'dotenv/config';

async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8'
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;
  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

const SUBMIT_HIGHSCORE = {
  name: 'submit',
  description: 'Submit a highscore for verification',
  options: [
    {
      type: 1,
      name: 'jak1',
      description: 'Submit a highscore for Jak 1',
      options: [
        {
          "name": "player-name",
          "description": "Name of the player (lowercase)",
          "type": 3,
          "required": true
        },
        {
          "name": "id",
          "description": "The relevant highscore identifier",
          "type": 4,
          "choices": [
            {
              "name": "Fish",
              "value": 1
            }
          ],
          "required": true
        },
        {
          "name": "score",
          "description": "The score you got",
          "type": 3,
          "required": true
        },
        {
          "name": "video-link",
          "description": "YouTube or Twitch URL to the video proof",
          "type": 3,
          "required": true
        }
      ],
    },
    {
      type: 1,
      name: 'jak2',
      description: 'Submit a highscore for Jak 2',
      options: [
        {
          "name": "player-name",
          "description": "Name of the player (lowercase)",
          "type": 3,
          "required": true
        },
        {
          "name": "id",
          "description": "The relevant highscore identifier",
          "type": 4,
          "choices": [
            {
              "name": "Scatter Gun Course",
              "value": 2
            },
            {
              "name": "Blaster Gun Course",
              "value": 3
            },
            {
              "name": "Vulcan Barrel Gun Course",
              "value": 4
            },
            {
              "name": "Peacemaker Gun Course",
              "value": 5
            },
            {
              "name": "Jetboard Challenge",
              "value": 6
            },
            {
              "name": "Onin's Game",
              "value": 7
            },
            {
              "name": "Metal Head Mash",
              "value": 8
            }
          ],
          "required": true
        },
        {
          "name": "score",
          "description": "The score you got",
          "type": 3,
          "required": true
        },
        {
          "name": "video-link",
          "description": "YouTube or Twitch URL to the video proof",
          "type": 3,
          "required": true
        }
      ],
    },
    {
      type: 1,
      name: 'jak3',
      description: 'Submit a highscore for Jak 3',
      options: [
        {
          "name": "player-name",
          "description": "Name of the player (lowercase)",
          "type": 3,
          "required": true
        },
        {
          "name": "id",
          "description": "The relevant highscore identifier",
          "type": 4,
          "choices": [
            {
              "name": "Satellite Game",
              "value": 9
            },
            {
              "name": "Single Hang Time Challenge",
              "value": 10
            },
            {
              "name": "Total Hang Time Challenge",
              "value": 11
            },
            {
              "name": "Single Distance Challenge",
              "value": 12
            },
            {
              "name": "Total Distance Challenge",
              "value": 13
            },
            {
              "name": "Roll Challenge",
              "value": 14
            },
            {
              "name": "Spargus Turret Game",
              "value": 15
            },
            {
              "name": "Jetboard Challenge",
              "value": 16
            },
            {
              "name": "Beam Reflexor Gun Course",
              "value": 17
            },
            {
              "name": "Wave Concussor Gun Course",
              "value": 18
            },
            {
              "name": "Ratchet Gun Course",
              "value": 19
            },
            {
              "name": "Clank Gun Course",
              "value": 20
            },
            {
              "name": "Eco Grid Game",
              "value": 21
            },
            {
              "name": "Marauders Challenge",
              "value": 22
            }
          ],
          "required": true
        },
        {
          "name": "score",
          "description": "The score you got",
          "type": 3,
          "required": true
        },
        {
          "name": "video-link",
          "description": "YouTube or Twitch URL to the video proof",
          "type": 3,
          "required": true
        }
      ],
    },
  ]
};

const VERIFY_HIGHSCORE = {
  name: '✅ Verify',
  description: '',
  type: 3,
};

const REJECT_HIGHSCORE = {
  name: '❌ Reject',
  description: '',
  type: 3,
};

await InstallGlobalCommands(process.env.DISCORD_APPLICATION_ID, [SUBMIT_HIGHSCORE, VERIFY_HIGHSCORE, REJECT_HIGHSCORE]);
