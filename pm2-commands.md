# PM2 Management Commands for Flotilla Sumud Scheduler

## View Status
```bash
pm2 list                    # Show all processes
pm2 show flotilla-scheduler # Detailed info
pm2 monit                   # Real-time monitoring
```

## View Logs
```bash
pm2 logs flotilla-scheduler        # Stream all logs
pm2 logs flotilla-scheduler --lines 100  # Last 100 lines
pm2 logs flotilla-scheduler --err  # Error logs only
```

## Control Process
```bash
pm2 restart flotilla-scheduler  # Restart the scheduler
pm2 stop flotilla-scheduler     # Stop the scheduler
pm2 start flotilla-scheduler    # Start if stopped
pm2 delete flotilla-scheduler   # Remove from PM2
```

## Auto-Startup (Optional)
To make the scheduler start automatically on system reboot, run:
```bash
sudo env PATH=$PATH:/Users/azmi/.nvm/versions/node/v22.11.0/bin /Users/azmi/.nvm/versions/node/v22.11.0/lib/node_modules/pm2/bin/pm2 startup launchd -u azmi --hp /Users/azmi
```

## Current Status
✅ Scheduler is running
⏰ Will execute at minute 0 of every hour (e.g., 2:00 PM, 3:00 PM, 4:00 PM)
📧 Sends hourly reports to azmi@aga.my
🌏 Timezone: Malaysia Time (UTC+8)

## Next Scheduled Run
The scheduler will run at the top of the next hour (XX:00).

## Manual Execution
To run the workflow immediately without waiting:
```bash
npm run schedule:now
```

## Monitoring
Check logs in real-time:
```bash
tail -f logs/scheduler.log
```
