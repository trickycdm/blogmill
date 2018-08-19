#!/usr/bin/env bash

# Variables
SSH_DEPLOY_URL="node@YOUR-IP-HERE"
SSH_DEPLOY_DIR="/home/node/apps/YOUR-APP-DIR"
PM2_APP_NAME="YOUR-APP-NAME__stage"

# Output files we have available in this build for debugging
echo "Files to sync:"
ls -la

# Double check what is on the current remote
echo "Current files on remote server:"
ssh $SSH_DEPLOY_URL ls -la $SSH_DEPLOY_DIR

# rsync flags:
# -a, --archive this is equivalent to -rlptgoD. It is a quick way of saying you want recursion and want to preserve almost everything.
# -v verbose output, it is silent by default
# -e use ssh instead of the default rsh (more secure with ssh)
# -z add gzip compression
# --delete remove files form the remote that are not on the sender, note ignore is honored here, i.e it will not delete any ignored files
rsync -avz --delete -e ssh ./ --exclude-from "$BITBUCKET_CLONE_DIR/.ci/stage/excludes.txt" $SSH_DEPLOY_URL:$SSH_DEPLOY_DIR

# Install our new dependencies (if any)
echo "Installing dependencies:"
ssh $SSH_DEPLOY_URL "cd $SSH_DEPLOY_DIR; npm install"

# check if the app is running or not, the -c grep flag returns the number of lines it found, s0 0 will start the app on initial deployment
if ssh $SSH_DEPLOY_URL "pm2 ls | grep -c $PM2_APP_NAME"; then
    ssh $SSH_DEPLOY_URL pm2 restart $PM2_APP_NAME
else
    ssh $SSH_DEPLOY_URL pm2 start $PM2_APP_NAME
fi
