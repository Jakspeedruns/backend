import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import { Env } from "../..";
import { approveHighscoreSubmission, insertNewHighscoreSubmission, rejectHighscoreSubmission } from "../../storage/d1";

function highscoreIdToName(highscoreId: number): string {
  switch (highscoreId) {
    case 1:
      return "Fish";
    case 2:
      return "Scatter Gun Course";
    case 3:
      return "Blaster Gun Course";
    case 4:
      return "Vulcan Barrel Gun Course";
    case 5:
      return "Peacemaker Gun Course";
    case 6:
      return "Jetboard Challenge";
    case 7:
      return "Onin's Game";
    case 8:
      return "Metal Head Mash";
    case 9:
      return "Satellite Game";
    case 10:
      return "Single Hang Time Challenge";
    case 11:
      return "Total Hang Time Challenge";
    case 12:
      return "Single Distance Challenge";
    case 13:
      return "Total Distance Challenge";
    case 14:
      return "Roll Challenge";
    case 15:
      return "Spargus T flock Game";
    case 16:
      return "Jetboard Challenge";
    case 17:
      return "Beam Reflexor Gun Course";
    case 18:
      return "Wave Concussor Gun Course";
    case 19:
      return "Ratchet Gun Course";
    case 20:
      return "Clank Gun Course";
    case 21:
      return "Eco Grid Game";
    case 22:
      return "Marauders Challenge";
    default:
      return "";
  }
}

function isValidDateFormat(inputString: string) {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  return datePattern.test(inputString);
}

export const SubmissionHandler = async (request: any, env: Env, ctx: ExecutionContext) => {
  // Verify the request
  const signature = request.headers.get("X-Signature-Ed25519");
  const timestamp = request.headers.get("X-Signature-Timestamp");
  if (signature === null || timestamp === null) {
    return new Response("invalid request", { status: 401 });
  }
  const requestBody = await request.text();
  const isValidRequest = verifyKey(requestBody, signature, timestamp, env.DISCORD_PUBLIC_KEY.toString());
  if (!isValidRequest) {
    return new Response("invalid request signature", { status: 401 });
  }

  // Valid request, do something with it, maybe
  const data = JSON.parse(requestBody);
  const { type } = data;
  const headers = { "Content-type": "application/json" };

  if (type === InteractionType.PING) {
    return new Response(JSON.stringify({ type: InteractionResponseType.PONG }), { headers });
  } else if (type === InteractionType.MODAL_SUBMIT) {
    const modalId = data.data.custom_id;
    if (modalId.startsWith("rm-")) {
      const submissionId = modalId.substring(3);
      console.log(submissionId);
      const reason = data.data.components[0].components[0].value;
      const resp = await rejectHighscoreSubmission(env.DB, submissionId, reason);
      // TODO - handle if it fails
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: resp === "" ? `Submission Rejected: **${reason}**` : resp,
            flags: resp === "" ? 0 : 64,
          },
        }),
        { headers },
      );
    }
  } else if (type === InteractionType.APPLICATION_COMMAND) {
    const commandName = data.data.name;
    if (commandName === "submit") {
      // Verify that - the video_link appears somewhat valid
      // If we're all good, then insert the submission into the database
      const inputs = data.data.options;
      if (
        inputs.length === 1 &&
        (inputs[0].name === "jak1" || inputs[0].name === "jak2" || inputs[0].name === "jak3")
      ) {
        let videoLink = "";
        let highscoreId = -1;
        let playerName = "";
        let score = -1;
        let timestamp = "";
        for (const input of inputs[0].options) {
          if (input.name === "video-link") {
            videoLink = input.value;
          } else if (input.name === "id") {
            highscoreId = parseInt(input.value);
          } else if (input.name === "player-name") {
            playerName = input.value;
          } else if (input.name === "score") {
            score = input.value;
          } else if (input.name === "date") {
            timestamp = input.value;
          }
        }
        if (!videoLink.startsWith("https://") && !videoLink.startsWith("http://")) {
          videoLink = "https://" + videoLink;
        }
        if (!videoLink.includes("youtube") && !videoLink.includes("youtu.be") && !videoLink.includes("twitch")) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `Video link doesn't appear to be a youtube or twitch URL`,
                flags: 64,
              },
            }),
            { headers },
          );
        }
        if (!isValidDateFormat(timestamp)) {
          return new Response(
            JSON.stringify({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `Not a valid date, must be YYYY-MM-DD`,
                flags: 64,
              },
            }),
            { headers },
          );
        }
        // TODO - make sure everything is set
        const submissionResp = await insertNewHighscoreSubmission(
          env.DB,
          highscoreId,
          videoLink,
          playerName,
          score,
          timestamp,
        );
        // TODO - handle null
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Submission looks good, wait for it to be verified by a moderator!\n**Game:** ${
                inputs[0].name
              }\n**Highscore:** ${highscoreIdToName(
                highscoreId,
              )}\n**Score:** ${score}\n**Proof:** [Video Link](${videoLink})\n**Existing Player?:** ${!submissionResp?.isNewPlayer} (${playerName})\n**Submission ID:** \`${submissionResp?.submissionId}\``,
            },
          }),
          { headers },
        );
      }
    } else if (commandName === "❌ Reject") {
      const messages = data.data.resolved.messages;
      let submissionId = "";
      for (const [messageId, messageData] of Object.entries(messages)) {
        if (messageData.content.includes("**Submission ID:**")) {
          submissionId = messageData.content.split("**Submission ID:**")[1].trim().replaceAll("`", "");
        }
      }
      if (submissionId !== "") {
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.MODAL,
            data: {
              title: "Rejection Confirmation",
              custom_id: `rm-${submissionId}`,
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 4,
                      custom_id: "reason",
                      style: 1,
                      label: "Reason",
                      min_length: 1,
                      max_length: 200,
                      required: true,
                    },
                  ],
                },
              ],
            },
          }),
          { headers },
        );
      }
    } else if (commandName === "✅ Verify") {
      const messages = data.data.resolved.messages;
      let submissionId = "";
      for (const [messageId, messageData] of Object.entries(messages)) {
        if (messageData.content.includes("**Submission ID:**")) {
          submissionId = messageData.content.split("**Submission ID:**")[1].trim().replaceAll("`", "");
        }
      }
      const msg = await approveHighscoreSubmission(env.DB, submissionId);
      // TODO - handle if it fails
      if (submissionId !== "") {
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: msg === "" ? "Submission Approved!" : msg,
              flags: msg === "" ? 0 : 64,
            },
          }),
          { headers },
        );
      }
    }
  }
};
