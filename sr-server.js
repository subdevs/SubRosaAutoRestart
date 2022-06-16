require("dotenv").config();

// Logging Stuff
const fs = require("fs");
const output = fs.createWriteStream(process.env.InfoLogFile, {
  flags: "a",
});
const errorOutput = fs.createWriteStream(process.env.ErrorLogFile, {
  flags: "a",
});
const Logger = new console.Console(output, errorOutput);

require("console-stamp")(Logger, {
  stdout: output,
  stderr: errorOutput,
});
// End Logging Stuff

const getServers = require("sub-rosa-servers");

// Pteroly Stuff
const pteroly = require("pteroly");
const client = pteroly.Client;
const restartServer = pteroly.Client.RestartServer;
// End Pteroly Stuff

async function main() {
  client.login(
    process.env.PteroPanelURL,
    process.env.PteroAPIKey,
    (loggedIn, errorMsg) => {
      if (!loggedIn) Logger.error(errorMsg);
    }
  );
  const servers = await getServers();
  for (let i = 0; i < servers.length; i++) {
    if (
      servers[i].address == process.env.SubRosaServerIP &&
      servers[i].port == process.env.SubRosaServerPort
    ) {
      if (servers[i].latency > 150) {
        if (!process.env.RestartServer) {
          Logger.log(
            "Server latency is " +
              servers[i].latency +
              "ms, not restarting server..."
          );
        }
        if (process.env.RestartServer) {
          Logger.log(
            "Server latency is " +
              servers[i].latency +
              "ms, restarting server..."
          );
          restartServer(process.env.PteroServerID);
        }
        break;
      } else
        Logger.log(
          "Server is online and responding. Latency: " + servers[i].latency
        );
      break;
    } else if (i == servers.length - 1) {
      Logger.log("Server is offline");
      if (!process.env.RestartServer) {
        Logger.log("Not restarting server...");
      }
      if (process.env.RestartServer) {
        Logger.log("Restarting server...");
        restartServer(process.env.PteroServerID);
      }
      break;
    }
  }
}
main();
