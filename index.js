// Import .env file
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
  format: ":date(yyyy/mm/dd HH:MM:ss)",
});
// End Logging Stuff

// Sub Rosa Stuff
const getServers = require("sub-rosa-servers");
// End Sub Rosa Stuff

// Pteroly Stuff
const pteroly = require("pteroly");
const { mainModule } = require("process");
const client = pteroly.Client;
const restartServer = pteroly.Client.restartServer;
const sendCommand = pteroly.Client.sendCommand;

async function PterolyLogin() {
  await client.login(
    process.env.PteroPanelURL,
    process.env.PteroAPIKey,
    (loggedIn, errorMsg) => {
      // fail message if loggedIn is false and errorMsg is not null or undefined and success message if loggedIn is true
      if (!loggedIn) {
        LogErrorFunction(`Pterodactyl Login Failed. ${errorMsg}`);
      } else {
        LogFunction(`Pterodactyl Login Successful`);
        main();
      }
    }
  );
}
// End Pteroly Stuff

// Log Function
async function LogFunction(message) {
  if (process.env.LogToConsole) {
    console.log(message);
  }
  if (process.env.LogToFile) {
    {
      Logger.log(message);
    }
  }
}
async function LogErrorFunction(message) {
  if (process.env.LogToConsole) {
    console.error(message);
  }
  if (process.env.LogToFile) {
    {
      Logger.error(message);
    }
  }
}

// End Log Function

// Main Function
async function main() {
  let servers = await getServers();
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let server = servers.find(
    (server) =>
      server.address == process.env.SubRosaServerIP &&
      server.port == process.env.SubRosaServerPort
  );
  if (server) {
    if (server.latency < process.env.MaxPing) {
      LogFunction(
        `Server ${server.name} with IP ${server.address}:${server.port} and latency ${server.latency} is online.`
      );
    } else {
      LogFunction(
        `Server ${server.name} with IP ${server.address}:${server.port} and latency ${server.latency} has a high ping.`
      );
      if (process.env.ResetServer) {
        await delay(process.env.ResetServerDelay * 1000);

        LogFunction(
          `Resetting Server ${server.name} with IP ${server.address}:${server.port} and latency ${server.latency}.`
        );
        sendCommand(process.env.PteroServerID, process.env.ResetCommand);
        await delay(process.env.WaitAfterServerDelay * 1000);
        // TODO: Update the server list and ping after the server has been reset
        // servers;
        // server = servers.find(
        //   (server) =>
        //     server.address == process.env.SubRosaServerIP &&
        //     server.port == process.env.SubRosaServerPort
        // );
        // }
        // TODO: Add an option to restart the server if the ping is too high and the server is not resetting
        // if (process.env.RestartServer) {
        //   await delay(process.env.RestartServerDelay * 1000);
        //   LogFunction(
        //     `Restarting Server ${server.name} with IP ${server.address}:${server.port} and latency ${server.latency}.`
        //   );
        //   restartServer(process.env.PteroServerID);
        // }
      }
    }
  } else {
    LogFunction(
      `Server ${process.env.SubRosaServerIP}:${process.env.SubRosaServerPort} is offline.`
    );
    if (process.env.RestartServer) {
      await delay(process.env.RestartServerDelay * 1000);
      LogFunction(
        `Restarting Server ${process.env.SubRosaServerIP}:${process.env.SubRosaServerPort}.`
      );
      restartServer(process.env.PteroServerID);
    }
  }
  // Delay next run
  await delay(process.env.CheckDelay * 1000);
  // Loop forever
  main();
}
// End Main Function

// Start by logging into Pterodactyl
PterolyLogin();
