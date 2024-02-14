#!/bin/bash

if [ -z "$GITHUB_HEAD_SHA" ]; then
	SHA=$(git log -1 --pretty=format:"%H")
else
	SHA=$GITHUB_HEAD_SHA
fi

echo "{\"sha\": \"${SHA}\"}"
