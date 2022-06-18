# SubRosaAutoRestart

Automatically restart a server that is hanging or has soft crashed

## systemd service

```ini
[Unit]
Description=Sub Rosa Auto Restart

[Service]
ExecStart=/usr/bin/yarn start

WorkingDirectory=/opt/SubRosaAutoRestart
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=sr-autorestart
User=user
Group=user

[Install]
WantedBy=multi-user.target
```
